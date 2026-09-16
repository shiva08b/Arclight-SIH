import json
import os
import re
from typing import Any


# ============================================================
# Load Rules
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RULES_PATH = os.path.join(BASE_DIR, "rules.json")


def load_rules() -> dict:
    """Load compliance rules from rules.json."""

    try:
        with open(RULES_PATH, "r", encoding="utf-8") as file:
            return json.load(file)

    except Exception as e:
        print(f"Could not load rules.json: {e}")
        return {
            "version": "unknown",
            "framework": "Legal Metrology",
            "checks": []
        }


RULES = load_rules()


# ============================================================
# Text Normalization
# ============================================================

def normalize_text(text: str) -> str:
    """
    Normalize OCR text while keeping the original text
    available as evidence.
    """

    if not text:
        return ""

    text = text.strip()

    # Normalize multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text


def normalize_all_ocr(ocr_results: list[dict]) -> list[dict]:
    """
    Normalize all OCR blocks.
    """

    normalized = []

    for item in ocr_results:

        text = normalize_text(item.get("text", ""))

        if not text:
            continue

        normalized.append({
            "text": text,
            "bbox": item.get("bbox", []),
            "confidence": float(item.get("confidence", 0))
        })

    return normalized


# ============================================================
# Helpers
# ============================================================

def all_text(ocr_results: list[dict]) -> str:
    """
    Combine OCR blocks into one searchable text string.
    """

    return " ".join(
        item["text"]
        for item in ocr_results
        if item.get("text")
    )


def find_matching_blocks(
    ocr_results: list[dict],
    pattern: str
) -> list[dict]:
    """
    Find OCR blocks matching a regex pattern.
    """

    matches = []

    regex = re.compile(pattern, re.IGNORECASE)

    for item in ocr_results:

        text = item.get("text", "")

        if regex.search(text):
            matches.append(item)

    return matches


def make_evidence(block: dict) -> dict:
    """
    Preserve OCR evidence for frontend highlighting.
    """

    return {
        "text": block.get("text", ""),
        "bbox": block.get("bbox", []),
        "confidence": block.get("confidence", 0)
    }


# ============================================================
# Field Extraction
# ============================================================

def extract_net_quantity(ocr_blocks):
    """
    Extract net quantity using:
    1. Explicit quantity labels such as 'Net Weight' / 'Net Qty'
    2. Quantity patterns such as 250 g, 1 kg, 500 ml, etc.
    3. Spatial proximity between the label and quantity.
    """

    quantity_pattern = re.compile(
        r"\b(\d+(?:\.\d+)?)\s*(kg|g|mg|l|ml|cl)\b",
        re.IGNORECASE
    )

    label_patterns = [
        "net weight",
        "net qty",
        "net quantity",
        "quantity",
        "net wt"
    ]

    candidates = []

    # ---------------------------------------------------------
    # STEP 1: Find all quantity candidates
    # ---------------------------------------------------------
    for block in ocr_blocks:
        text = normalize_text(block.get("text", ""))
        confidence = float(block.get("confidence", 0))
        bbox = block.get("bbox", [])

        match = quantity_pattern.search(text)

        if match:
            value = match.group(1)
            unit = match.group(2).lower()

            # Normalize units
            if unit == "kg":
                display_unit = "kg"
            elif unit == "mg":
                display_unit = "mg"
            elif unit == "ml":
                display_unit = "ml"
            elif unit == "cl":
                display_unit = "cl"
            elif unit == "l":
                display_unit = "L"
            else:
                display_unit = "g"

            center_x = 0
            center_y = 0

            if bbox:
                xs = [point[0] for point in bbox]
                ys = [point[1] for point in bbox]

                center_x = sum(xs) / len(xs)
                center_y = sum(ys) / len(ys)

            candidates.append({
                "text": text,
                "value": f"{value} {display_unit}",
                "confidence": confidence,
                "bbox": bbox,
                "center_x": center_x,
                "center_y": center_y
            })

    if not candidates:
        return None

    # ---------------------------------------------------------
    # STEP 2: Find net-quantity labels
    # ---------------------------------------------------------
    labels = []

    for block in ocr_blocks:
        text = normalize_text(block.get("text", ""))
        bbox = block.get("bbox", [])

        if any(label in text for label in label_patterns):

            center_x = 0
            center_y = 0

            if bbox:
                xs = [point[0] for point in bbox]
                ys = [point[1] for point in bbox]

                center_x = sum(xs) / len(xs)
                center_y = sum(ys) / len(ys)

            labels.append({
                "text": text,
                "bbox": bbox,
                "center_x": center_x,
                "center_y": center_y
            })

    # ---------------------------------------------------------
    # STEP 3: Match quantity to nearest label
    # ---------------------------------------------------------
    if labels:

        best_candidate = None
        best_distance = float("inf")

        for label in labels:

            for candidate in candidates:

                distance = (
                    (candidate["center_x"] - label["center_x"]) ** 2 +
                    (candidate["center_y"] - label["center_y"]) ** 2
                ) ** 0.5

                if distance < best_distance:
                    best_distance = distance
                    best_candidate = candidate

        if best_candidate:

            return {
                "value": best_candidate["value"],
                "status": "FOUND",
                "confidence": best_candidate["confidence"],
                "evidence": make_evidence({
                    "text": best_candidate["text"],
                    "bbox": best_candidate["bbox"],
                    "confidence": best_candidate["confidence"]
                })
            }

    # ---------------------------------------------------------
    # STEP 4: Fallback to highest-confidence quantity
    # ---------------------------------------------------------
    best_candidate = max(
        candidates,
        key=lambda x: x["confidence"]
    )

    return {
        "value": best_candidate["value"],
        "status": "FOUND",
        "confidence": best_candidate["confidence"],
        "evidence": make_evidence({
            "text": best_candidate["text"],
            "bbox": best_candidate["bbox"],
            "confidence": best_candidate["confidence"]
        })
    }
# ------------------------------------------------------------
# MRP
# ------------------------------------------------------------

def extract_mrp(ocr_blocks):
    """
    Extract MRP using semantic + spatial association.

    Handles:
    - MRP ₹50.00
    - MRP Rs. 50.00
    - MRP: 50.00
    - MRP block followed by price block

    Rejects:
    - quantities such as 225 g
    - dates
    - phone numbers
    - PIN codes
    - license numbers
    - batch numbers
    """

    price_pattern = re.compile(
        r"(?:₹|rs\.?|inr)?\s*"
        r"(\d+(?:,\d{3})*(?:\.\d{1,2})?)",
        re.IGNORECASE
    )

    quantity_pattern = re.compile(
        r"\b\d+(?:\.\d+)?\s*(?:mg|g|kg|ml|cl|l)\b",
        re.IGNORECASE
    )

    date_pattern = re.compile(
        r"\b\d{1,2}\s*[/-]\s*(?:\d{1,2}\s*[/-]\s*)?\d{2,4}\b"
    )

    def center(bbox):
        if not bbox:
            return 0, 0

        xs = [p[0] for p in bbox]
        ys = [p[1] for p in bbox]

        return (
            sum(xs) / len(xs),
            sum(ys) / len(ys)
        )

    # ---------------------------------------------------------
    # STEP 1: Find MRP labels
    # ---------------------------------------------------------

    labels = []

    for item in ocr_blocks:
        text = normalize_text(item.get("text", ""))

        if re.search(r"\bmrp\b", text, re.IGNORECASE):

            cx, cy = center(item.get("bbox", []))

            labels.append({
                "item": item,
                "center_x": cx,
                "center_y": cy
            })

    if not labels:
        return None

    # ---------------------------------------------------------
    # STEP 2: Find price candidates
    # ---------------------------------------------------------

    candidates = []

    for item in ocr_blocks:

        text = normalize_text(item.get("text", ""))

        if not text:
            continue

        # Reject quantity blocks.
        if quantity_pattern.search(text):
            continue

        # Reject dates.
        if date_pattern.search(text):
            continue

        # Reject phone numbers.
        if re.search(
            r"\b(?:1[ -]?800[ -]?\d{3}[ -]?\d{4}|"
            r"(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5})\b",
            text
        ):
            continue

        # Reject PIN codes.
        if re.search(r"\b\d{6}\b", text):
            continue

        # Reject long registration/license numbers.
        if re.search(r"\b\d{10,}\b", text):
            continue

        # Don't treat obvious non-price text as MRP.
        if re.search(
            r"(fssai|lic\.?\s*no|batch|lot|"
            r"manufactur|mfg|best\s*before|use\s*by|"
            r"consumer|phone|call|email|address|"
            r"sector|india|foods|industries)",
            text,
            re.IGNORECASE
        ):
            continue

        matches = list(price_pattern.finditer(text))

        if not matches:
            continue

        for match in matches:

            value = match.group(1).replace(",", "")

            try:
                numeric_value = float(value)
            except ValueError:
                continue

            if numeric_value <= 0:
                continue

            cx, cy = center(item.get("bbox", []))

            # Semantic clues.
            has_currency = bool(
                re.search(r"(₹|rs\.?|inr)", text, re.IGNORECASE)
            )

            has_tax_phrase = bool(
                re.search(
                    r"incl\.?\s*of\s*all\s*taxes|"
                    r"including\s*all\s*taxes",
                    text,
                    re.IGNORECASE
                )
            )

            has_decimal = "." in value

            # If this block itself contains MRP, that's very strong.
            contains_mrp = bool(
                re.search(r"\bmrp\b", text, re.IGNORECASE)
            )

            candidates.append({
                "item": item,
                "text": text,
                "value": numeric_value,
                "center_x": cx,
                "center_y": cy,
                "confidence": float(
                    item.get("confidence", 0)
                ),
                "has_currency": has_currency,
                "has_tax_phrase": has_tax_phrase,
                "has_decimal": has_decimal,
                "contains_mrp": contains_mrp
            })

    if not candidates:
        return None

    # ---------------------------------------------------------
    # STEP 3: Score candidates
    # ---------------------------------------------------------

    best = None
    best_score = float("-inf")

    for label in labels:

        lx = label["center_x"]
        ly = label["center_y"]

        for candidate in candidates:

            cx = candidate["center_x"]
            cy = candidate["center_y"]

            dx = cx - lx
            dy = cy - ly

            distance = (dx ** 2 + dy ** 2) ** 0.5

            score = candidate["confidence"]

            # Same OCR block containing MRP is extremely strong.
            if candidate["contains_mrp"]:
                score += 100

            if candidate["has_currency"]:
                score += 40

            if candidate["has_tax_phrase"]:
                score += 50

            if candidate["has_decimal"]:
                score += 15

            # Usually price is to the right of MRP.
            if dx >= 0 and abs(dy) < 80:
                score += 30

            # Or directly below.
            if dy >= 0 and abs(dx) < 200:
                score += 20

            score -= distance * 0.05

            if score > best_score:
                best_score = score
                best = candidate

    if not best:
        return None

    return {
        "value": f"₹{best['value']:.2f}",
        "status": "FOUND",
        "confidence": best["confidence"],
        "evidence": make_evidence(best["item"])
    }


# ------------------------------------------------------------
# Consumer Care
# ------------------------------------------------------------

def extract_consumer_care(
    ocr_results: list[dict]
) -> dict | None:
    """
    Extract consumer-care / complaint contact information.

    Looks for:
    - Consumer Care
    - Consumer Complaints
    - Customer Care
    - Customer Service
    - Complaint Cell
    - Feedback
    - Toll-free phone numbers
    - Email addresses
    """

    consumer_label_pattern = re.compile(
        r"\b("
        r"consumer\s*care|"
        r"consumer\s*complaints?|"
        r"customer\s*care|"
        r"customer\s*service|"
        r"complaint\s*cell|"
        r"care\s*cell|"
        r"feedback"
        r")\b",
        re.IGNORECASE
    )

    phone_pattern = re.compile(
        r"\b(?:"
        r"1800[\s-]?\d{3}[\s-]?\d{4}|"
        r"\+91[\s-]?\d{10}|"
        r"[6-9]\d{4}[\s-]?\d{5}"
        r")\b"
    )

    email_pattern = re.compile(
        r"\b[A-Za-z0-9._%+-]+@"
        r"[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    )

    # ---------------------------------------------------------
    # STEP 1: Explicit consumer-care label
    # ---------------------------------------------------------

    for item in ocr_results:

        text = normalize_text(
            item.get("text", "")
        )

        if not text:
            continue

        if consumer_label_pattern.search(text):

            return {
                "value": text,
                "status": "FOUND",
                "confidence": float(
                    item.get("confidence", 0)
                ),
                "evidence": [
                    make_evidence(item)
                ]
            }

    # ---------------------------------------------------------
    # STEP 2: Phone number
    # ---------------------------------------------------------

    for item in ocr_results:

        text = normalize_text(
            item.get("text", "")
        )

        if not text:
            continue

        if phone_pattern.search(text):

            return {
                "value": text,
                "status": "FOUND",
                "confidence": float(
                    item.get("confidence", 0)
                ),
                "evidence": [
                    make_evidence(item)
                ]
            }

    # ---------------------------------------------------------
    # STEP 3: Email
    # ---------------------------------------------------------

    for item in ocr_results:

        text = normalize_text(
            item.get("text", "")
        )

        if not text:
            continue

        if email_pattern.search(text):

            return {
                "value": text,
                "status": "FOUND",
                "confidence": float(
                    item.get("confidence", 0)
                ),
                "evidence": [
                    make_evidence(item)
                ]
            }

    return None


# ------------------------------------------------------------
# Manufacturing Date
# ------------------------------------------------------------

def extract_manufacturing_date(
    ocr_results: list[dict]
) -> dict | None:

    patterns = [

        # Mfg Date: 12/2024
        r"(?:mfg|manufactur(?:ed|ing)|packed|packing|import)"
        r".{0,20}?"
        r"(\d{1,2}[\/\-]\d{4})",

        # Mfg Date: Dec 2024
        r"(?:mfg|manufactur(?:ed|ing)|packed|packing|import)"
        r".{0,20}?"
        r"([A-Za-z]{3,9}\s+\d{4})"
    ]

    for item in ocr_results:

        for pattern in patterns:

            match = re.search(
                pattern,
                item["text"],
                re.IGNORECASE
            )

            if match:

                return {
                    "value": match.group(1),
                    "status": "FOUND",
                    "confidence": item["confidence"],
                    "evidence": [make_evidence(item)]
                }

    # Handle split OCR:
    # Mfg. Date:
    # 12/2024

    for i, item in enumerate(ocr_results):

        if re.search(
            r"(mfg|manufactur|packed|packing|import)",
            item["text"],
            re.IGNORECASE
        ):

            for next_item in ocr_results[i + 1:i + 4]:

                match = re.search(
                    r"\b(\d{1,2}[\/\-]\d{4})\b",
                    next_item["text"]
                )

                if match:

                    return {
                        "value": match.group(1),
                        "status": "FOUND",
                        "confidence": next_item["confidence"],
                        "evidence": [
                            make_evidence(item),
                            make_evidence(next_item)
                        ]
                    }

    return None


# ------------------------------------------------------------
# Manufacturer
# ------------------------------------------------------------

def extract_manufacturer(
    ocr_results: list[dict]
) -> dict | None:
    """
    Extract manufacturer / packer / importer details.

    Uses:
    1. Explicit manufacturer/packer/importer label.
    2. Spatial proximity.
    3. Semantic filtering to avoid quantities, dates, batch numbers,
       MRP, phone numbers, license numbers, etc.
    """

    manufacturer_keywords = re.compile(
        r"(manufactured\s*(?:&|and)?\s*marketed\s*by|"
        r"manufactured\s*by|"
        r"packed\s*by|"
        r"marketed\s*by|"
        r"imported\s*by)",
        re.IGNORECASE
    )

    invalid_patterns = re.compile(
        r"(mrp|net\s*(?:weight|wt|qty|quantity)|"
        r"batch|lot|best\s*before|use\s*by|"
        r"mfg|manufactur(?:ing|ed)?\s*date|"
        r"consumer|complaint|feedback|call|phone|"
        r"email|fssai|lic\.?\s*no|"
        r"\b\d{1,2}[/-]\d{4}\b|"
        r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|"
        r"\b\d+(?:\.\d+)?\s*(?:mg|g|kg|ml|cl|l)\b|"
        r"\b\d{6}\b|"
        r"\b\d{10,}\b)",
        re.IGNORECASE
    )

    def center(bbox):
        if not bbox:
            return 0, 0

        xs = [p[0] for p in bbox]
        ys = [p[1] for p in bbox]

        return (
            sum(xs) / len(xs),
            sum(ys) / len(ys)
        )

    labels = []

    for item in ocr_results:
        text = normalize_text(item.get("text", ""))

        if manufacturer_keywords.search(text):
            cx, cy = center(item.get("bbox", []))

            labels.append({
                "item": item,
                "center_x": cx,
                "center_y": cy
            })

    if not labels:
        return None

    candidates = []

    for item in ocr_results:
        text = normalize_text(item.get("text", ""))

        if not text:
            continue

        if manufacturer_keywords.search(text):
            continue

        # Reject obvious non-company fields.
        if invalid_patterns.search(text):
            continue

        # Manufacturer names normally contain letters.
        if not re.search(r"[A-Za-z]{3,}", text):
            continue

        cx, cy = center(item.get("bbox", []))

        # Reject extremely long OCR blocks that are probably
        # addresses / paragraphs rather than the company name.
        if len(text) > 120:
            continue

        candidates.append({
            "item": item,
            "text": text,
            "center_x": cx,
            "center_y": cy
        })

    if not candidates:
        return None

    best = None
    best_score = float("-inf")

    for label in labels:

        lx = label["center_x"]
        ly = label["center_y"]

        for candidate in candidates:

            cx = candidate["center_x"]
            cy = candidate["center_y"]

            dx = cx - lx
            dy = cy - ly

            distance = (dx ** 2 + dy ** 2) ** 0.5

            score = float(
                candidate["item"].get("confidence", 0)
            )

            # Company name is normally below the label.
            if dy >= 0 and dy < 150:
                score += 35

            # Or immediately to the right.
            if dx >= 0 and abs(dy) < 70:
                score += 30

            # Strong preference for reasonably close text.
            score -= distance * 0.08

            # Company-name clues.
            if re.search(
                r"\b(pvt|private|ltd|limited|industries|"
                r"foods|food|products|company|co\.?)\b",
                candidate["text"],
                re.IGNORECASE
            ):
                score += 25

            if score > best_score:
                best_score = score
                best = candidate

    if not best:
        return None

    item = best["item"]

    return {
        "value": best["text"],
        "status": "FOUND",
        "confidence": float(item.get("confidence", 0)),
        "evidence": [
            make_evidence(labels[0]["item"]),
            make_evidence(item)
        ]
    }


# ------------------------------------------------------------
# Generic Name
# ------------------------------------------------------------

def extract_generic_name(
    ocr_results: list[dict]
) -> dict | None:

    # --------------------------------------------------------
    # Known commodity terms for the MVP.
    #
    # This can later be expanded or moved into rules.json.
    # --------------------------------------------------------

    commodity_words = {
        "biscuit": "Biscuit",
        "biscuits": "Biscuits",
        "soap": "Soap",
        "detergent": "Detergent",
        "shampoo": "Shampoo",
        "toothpaste": "Toothpaste",
        "rice": "Rice",
        "flour": "Flour",
        "atta": "Atta",
        "sugar": "Sugar",
        "salt": "Salt",
        "tea": "Tea",
        "coffee": "Coffee",
        "oil": "Oil",
        "noodles": "Noodles",
        "snacks": "Snacks",
        "cookies": "Cookies",
        "juice": "Juice",
        "drink": "Drink"
    }

    # --------------------------------------------------------
    # First: normal exact matching
    # --------------------------------------------------------

    for item in ocr_results:

        text = item["text"]

        text_lower = text.lower()

        for keyword, display_name in commodity_words.items():

            if re.search(
                rf"\b{re.escape(keyword)}\b",
                text_lower
            ):

                return {
                    "value": display_name,
                    "status": "FOUND",
                    "confidence": item["confidence"],
                    "evidence": [
                        make_evidence(item)
                    ]
                }

    # --------------------------------------------------------
    # Second: handle common OCR corruption.
    #
    # Example:
    #
    # B / S C U /TS
    #
    # becomes approximately:
    #
    # BSCUTS
    #
    # which is close enough to BISCUITS for a
    # low-confidence REVIEW result.
    # --------------------------------------------------------

    for item in ocr_results:

        text = item["text"]

        # Remove spaces and OCR punctuation
        compact = re.sub(
            r"[^a-zA-Z]",
            "",
            text
        ).lower()

        # OCR corruption specifically resembling BISCUITS
        if (
            "bscuts" in compact
            or "bscuits" in compact
            or "bscuts" in compact
            or "biscuts" in compact
            or "biscts" in compact
        ):

            return {
                "value": "Biscuits",
                "status": "REVIEW",
                "confidence": item["confidence"],
                "evidence": [
                    make_evidence(item)
                ],
                "message": (
                    "Possible generic name detected after "
                    "OCR normalization. Manual verification "
                    "recommended because OCR confidence is low."
                )
            }

    return None


# ------------------------------------------------------------
# Batch Number
# ------------------------------------------------------------

def extract_batch_number(
    ocr_results: list[dict]
) -> dict | None:

    batch_pattern = re.compile(
        r"\b(?:batch|lot)\s*(?:no\.?|number)?"
        r"\s*[:\-]+\s*"
        r"([A-Za-z0-9][A-Za-z0-9\-\/]{2,20})",
        re.IGNORECASE
    )

    label_pattern = re.compile(
        r"\b(?:batch|lot)\s*(?:no\.?|number)?\s*[:\-]*$",
        re.IGNORECASE
    )

    invalid_candidates = re.compile(
        r"^(?:fssai|mrp|net|quantity|"
        r"best|before|use|by|mfg|date|"
        r"manufactured|consumer|call|phone|"
        r"email|lic|license)$",
        re.IGNORECASE
    )

    def center(bbox):
        if not bbox:
            return 0, 0

        xs = [p[0] for p in bbox]
        ys = [p[1] for p in bbox]

        return (
            sum(xs) / len(xs),
            sum(ys) / len(ys)
        )

    # ---------------------------------------------------------
    # Case 1: Batch No: ABC123
    # ---------------------------------------------------------

    for item in ocr_results:

        text = normalize_text(item.get("text", ""))

        match = batch_pattern.search(text)

        if match:

            value = match.group(1).strip()

            return {
                "value": value,
                "status": "FOUND",
                "confidence": float(
                    item.get("confidence", 0)
                ),
                "evidence": [
                    make_evidence(item)
                ]
            }

    # ---------------------------------------------------------
    # Case 2: Batch No: + separate OCR block
    # ---------------------------------------------------------

    labels = []

    for item in ocr_results:

        text = normalize_text(item.get("text", ""))

        if label_pattern.search(text):

            cx, cy = center(item.get("bbox", []))

            labels.append({
                "item": item,
                "center_x": cx,
                "center_y": cy
            })

    if not labels:
        return None

    candidates = []

    for item in ocr_results:

        text = normalize_text(item.get("text", "")).strip()

        if not text:
            continue

        if invalid_candidates.fullmatch(text):
            continue

        # Batch codes should generally be compact.
        if len(text) < 3 or len(text) > 25:
            continue

        # Don't accept quantities.
        if re.fullmatch(
            r"\d+(?:\.\d+)?\s*(?:mg|g|kg|ml|cl|l)",
            text,
            re.IGNORECASE
        ):
            continue

        # Don't accept dates.
        if re.fullmatch(
            r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}",
            text
        ):
            continue

        if re.fullmatch(
            r"\d{1,2}[/-]\d{4}",
            text
        ):
            continue

        # Don't accept phone/PIN/license numbers.
        if re.fullmatch(r"\d{6}", text):
            continue

        if re.fullmatch(r"\d{10,}", text):
            continue

        # Batch should be alphanumeric.
        if not re.fullmatch(
            r"[A-Za-z0-9][A-Za-z0-9\-\/]{2,20}",
            text
        ):
            continue

        cx, cy = center(item.get("bbox", []))

        candidates.append({
            "item": item,
            "text": text,
            "center_x": cx,
            "center_y": cy
        })

    if not candidates:
        return None

    best = None
    best_score = float("-inf")

    for label in labels:

        lx = label["center_x"]
        ly = label["center_y"]

        for candidate in candidates:

            dx = candidate["center_x"] - lx
            dy = candidate["center_y"] - ly

            distance = (dx ** 2 + dy ** 2) ** 0.5

            score = float(
                candidate["item"].get("confidence", 0)
            )

            # Batch value usually appears to the right.
            if dx >= 0 and abs(dy) < 80:
                score += 45

            # Or immediately below.
            if dy >= 0 and abs(dx) < 200 and dy < 150:
                score += 35

            score -= distance * 0.08

            # Batch codes containing letters are useful evidence.
            if re.search(r"[A-Za-z]", candidate["text"]):
                score += 10

            if score > best_score:
                best_score = score
                best = candidate

    if not best:
        return None

    return {
        "value": best["text"],
        "status": "FOUND",
        "confidence": float(
            best["item"].get("confidence", 0)
        ),
        "evidence": [
            make_evidence(labels[0]["item"]),
            make_evidence(best["item"])
        ]
    }

# ------------------------------------------------------------
# Best Before
# ------------------------------------------------------------

def extract_best_before(
    ocr_results: list[dict]
) -> dict | None:

    label_pattern = re.compile(
        r"\b(best\s*before|use\s*by)\b",
        re.IGNORECASE
    )

    value_pattern = re.compile(
        r"("
        r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}"
        r"|"
        r"\d{1,2}[/-]\d{4}"
        r"|"
        r"\d+\s*(?:days?|months?|years?)"
        r"(?:\s*(?:from|after)\s+[A-Za-z0-9 .,-]+)?"
        r")",
        re.IGNORECASE
    )

    def center(bbox):
        if not bbox:
            return 0, 0

        xs = [p[0] for p in bbox]
        ys = [p[1] for p in bbox]

        return (
            sum(xs) / len(xs),
            sum(ys) / len(ys)
        )

    # ---------------------------------------------------------
    # STEP 1: Same-block extraction
    # ---------------------------------------------------------

    for item in ocr_results:

        text = normalize_text(item.get("text", ""))

        match = label_pattern.search(text)

        if not match:
            continue

        # Only inspect the text AFTER the label.
        remaining = text[match.end():]

        # Remove punctuation between label and value.
        remaining = re.sub(
            r"^[\s:;\-]+",
            "",
            remaining
        ).strip()

        if not remaining:
            continue

        value_match = value_pattern.search(remaining)

        if value_match:

            value = value_match.group(1).strip()

            return {
                "value": value,
                "status": "FOUND",
                "confidence": float(
                    item.get("confidence", 0)
                ),
                "evidence": [
                    make_evidence(item)
                ]
            }

    # ---------------------------------------------------------
    # STEP 2: Split OCR blocks
    # ---------------------------------------------------------

    labels = []

    for item in ocr_results:

        text = normalize_text(item.get("text", ""))

        if label_pattern.search(text):

            cx, cy = center(item.get("bbox", []))

            labels.append({
                "item": item,
                "center_x": cx,
                "center_y": cy
            })

    if not labels:
        return None

    candidates = []

    for item in ocr_results:

        text = normalize_text(item.get("text", ""))

        if not text:
            continue

        match = value_pattern.search(text)

        if not match:
            continue

        value = match.group(1).strip()

        # Don't accept the label itself.
        if label_pattern.search(text):
            continue

        cx, cy = center(item.get("bbox", []))

        candidates.append({
            "item": item,
            "text": text,
            "value": value,
            "center_x": cx,
            "center_y": cy
        })

    if not candidates:
        return None

    best = None
    best_score = float("-inf")

    for label in labels:

        lx = label["center_x"]
        ly = label["center_y"]

        for candidate in candidates:

            dx = candidate["center_x"] - lx
            dy = candidate["center_y"] - ly

            distance = (dx ** 2 + dy ** 2) ** 0.5

            score = float(
                candidate["item"].get("confidence", 0)
            )

            # Best-before value normally follows label.
            if dx >= 0 and abs(dy) < 80:
                score += 40

            # Or appears directly underneath.
            if dy >= 0 and abs(dx) < 250 and dy < 150:
                score += 35

            score -= distance * 0.08

            # Prefer meaningful duration expressions.
            if re.search(
                r"\b(days?|months?|years?)\b",
                candidate["text"],
                re.IGNORECASE
            ):
                score += 20

            if score > best_score:
                best_score = score
                best = candidate

    if not best:
        return None

    return {
        "value": best["value"],
        "status": "FOUND",
        "confidence": float(
            best["item"].get("confidence", 0)
        ),
        "evidence": [
            make_evidence(labels[0]["item"]),
            make_evidence(best["item"])
        ]
    }


# ============================================================
# Extract All Fields
# ============================================================

def extract_declarations(
    ocr_results: list[dict]
) -> dict:

    fields = {}

    extractors = {
        "manufacturer": extract_manufacturer,
        "generic_name": extract_generic_name,
        "net_quantity": extract_net_quantity,
        "manufacturing_date": extract_manufacturing_date,
        "mrp": extract_mrp,
        "consumer_care": extract_consumer_care,
        "batch_number": extract_batch_number,
        "best_before": extract_best_before
    }

    for field, extractor in extractors.items():

        try:
            result = extractor(ocr_results)

            if result:
                fields[field] = result

        except Exception as e:

            print(
                f"Error extracting {field}: {e}"
            )

    return fields


# ============================================================
# Rule Evaluation
# ============================================================

def evaluate_rules(fields: dict) -> list[dict]:

    results = []

    for rule in RULES.get("checks", []):

        field = rule["field"]
        found = field in fields

        result = {
            "rule_id": rule["id"],
            "rule": rule["rule"],
            "field": field,
            "name": rule["name"],
            "mandatory": rule["mandatory"],
            "status": "FOUND" if found else "MISSING"
        }

        # ====================================================
        # FIELD WAS DETECTED
        # ====================================================

        if found:

            field_data = fields[field]

            result["confidence"] = field_data.get(
                "confidence",
                0
            )

            # Extractor explicitly marked it for review
            if field_data.get("status") == "REVIEW":

                result["status"] = "REVIEW"

                result["message"] = field_data.get(
                    "message",
                    "Declaration detected with low OCR confidence. "
                    "Manual verification is recommended."
                )

            # Automatically review very low-confidence OCR
            elif result["confidence"] < 60:

                result["status"] = "REVIEW"

                result["message"] = (
                    "Declaration detected, but OCR confidence "
                    "is low and manual verification is recommended."
                )

            else:

                result["status"] = "FOUND"

                result["message"] = (
                    "Declaration detected."
                )

        # ====================================================
        # FIELD WAS NOT DETECTED
        # ====================================================

        else:

            if rule["mandatory"]:

                result["status"] = "MISSING"

                result["message"] = (
                    "Mandatory declaration was not detected "
                    "in the scanned image."
                )

            else:

                result["status"] = "NOT_DETECTED"

                result["message"] = (
                    "Optional or category-dependent declaration "
                    "was not detected."
                )

        results.append(result)

    return results


# ============================================================
# Compliance Score
# ============================================================

def calculate_score(rule_results: list[dict]) -> int:

    mandatory_rules = [
        result
        for result in rule_results
        if result["mandatory"]
    ]

    if not mandatory_rules:
        return 0

    points = 0

    for result in mandatory_rules:

        if result["status"] == "FOUND":
            points += 1

        elif result["status"] == "REVIEW":
            points += 0.5

    score = (
        points / len(mandatory_rules)
    ) * 100

    return round(score)


# ============================================================
# Violations / Warnings
# ============================================================

def get_violations(
    rule_results: list[dict]
) -> list[dict]:

    violations = []

    for result in rule_results:

        if (
            result["mandatory"]
            and result["status"] == "MISSING"
        ):

            violations.append({
                "rule_id": result["rule_id"],
                "rule": result["rule"],
                "field": result["field"],
                "title": result["name"],
                "message": result["message"],
                "severity": "HIGH"
            })

    return violations


def get_warnings(
    rule_results: list[dict]
) -> list[dict]:

    warnings = []

    for result in rule_results:

        if result["status"] == "REVIEW":

            warnings.append({
                "rule_id": result["rule_id"],
                "field": result["field"],
                "title": result["name"],
                "message": result["message"],
                "severity": "MEDIUM"
            })

    return warnings


# ============================================================
# Main Compliance Function
# ============================================================

def analyze_compliance(
    ocr_results: list[dict]
) -> dict:

    # --------------------------------------------------------
    # 1. Normalize OCR
    # --------------------------------------------------------

    normalized_ocr = normalize_all_ocr(
        ocr_results
    )

    # --------------------------------------------------------
    # 2. Extract declarations
    # --------------------------------------------------------

    fields = extract_declarations(
        normalized_ocr
    )

    # --------------------------------------------------------
    # 3. Evaluate rules
    # --------------------------------------------------------

    rule_results = evaluate_rules(
        fields
    )

    # --------------------------------------------------------
    # 4. Score
    # --------------------------------------------------------

    score = calculate_score(
        rule_results
    )

    # --------------------------------------------------------
    # 5. Violations
    # --------------------------------------------------------

    violations = get_violations(
        rule_results
    )

    # --------------------------------------------------------
    # 6. Warnings
    # --------------------------------------------------------

    warnings = get_warnings(
        rule_results
    )

    # --------------------------------------------------------
    # 7. Overall status
    # --------------------------------------------------------

    if violations:

        status = "NON_COMPLIANT"

    elif warnings:

        status = "REVIEW_REQUIRED"

    else:

        status = "NO_MISSING_DECLARATIONS"

    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {
        "status": status,

        "score": score,

        "fields": fields,

        "rules": rule_results,

        "violations": violations,

        "warnings": warnings,

        "ocr_block_count": len(normalized_ocr),

        "framework": RULES.get(
            "framework",
            "Legal Metrology"
        ),

        "rules_version": RULES.get(
            "version",
            "unknown"
        )
    }


# ============================================================
# Standalone Test
# ============================================================

if __name__ == "__main__":

    # Example OCR data for testing.
    test_ocr = [
        {
            "text": "Marie Gold",
            "bbox": [[219, 352], [792, 352], [792, 487], [219, 487]],
            "confidence": 56.03
        },
        {
            "text": "BISCUITS",
            "bbox": [[336, 478], [656, 478], [656, 532], [336, 532]],
            "confidence": 90
        },
        {
            "text": "Net Weight:",
            "bbox": [[211, 642], [371, 642], [371, 686], [211, 686]],
            "confidence": 99.29
        },
        {
            "text": "250 g",
            "bbox": [[385, 641], [475, 641], [475, 683], [385, 683]],
            "confidence": 99.15
        },
        {
            "text": "MRP",
            "bbox": [[212, 692], [276, 692], [276, 724], [212, 724]],
            "confidence": 100
        },
        {
            "text": "50.00 (Incl. of all taxes)",
            "bbox": [[331, 689], [601, 689], [601, 727], [331, 727]],
            "confidence": 73.47
        },
        {
            "text": "Mfg. Date:",
            "bbox": [[211, 733], [343, 733], [343, 771], [211, 771]],
            "confidence": 62.85
        },
        {
            "text": "12/2024",
            "bbox": [[357, 733], [473, 733], [473, 769], [357, 769]],
            "confidence": 99.94
        },
        {
            "text": "Manufactured & Marketed by:",
            "bbox": [[713, 643], [982, 643], [982, 672], [713, 672]],
            "confidence": 79.05
        },
        {
            "text": "Sunbite Foods Pvt. Ltd.",
            "bbox": [[712, 672], [948, 672], [948, 704], [712, 704]],
            "confidence": 79.11
        },
        {
            "text": "Batch No::",
            "bbox": [[210, 818], [344, 818], [344, 850], [210, 850]],
            "confidence": 97.1
        },
        {
            "text": "SB1247",
            "bbox": [[365, 818], [469, 818], [469, 850], [365, 850]],
            "confidence": 99.99
        },
        {
            "text": "Call: 1800 123 4567 (Toll Free)",
            "bbox": [[712, 806], [1022, 806], [1022, 838], [712, 838]],
            "confidence": 83.11
        },
        {
            "text": "Email: care@sunbitefoods com",
            "bbox": [[712, 834], [1020, 834], [1020, 862], [712, 862]],
            "confidence": 91.45
        }
    ]

    result = analyze_compliance(test_ocr)

    print(
        json.dumps(
            result,
            indent=2,
            ensure_ascii=False
        )
    )