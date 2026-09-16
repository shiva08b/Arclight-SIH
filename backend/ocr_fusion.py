"""
Arclight / LabelLens
Stage 2-4 — Dual OCR Evidence Fusion

Combines:
    1. OCR from original image
    2. OCR from preprocessed image

The fusion layer:
    - removes duplicate detections
    - compares overlapping OCR blocks
    - prefers stronger OCR confidence
    - gives additional weight to recognizable declaration patterns
    - preserves bounding boxes
    - keeps source information for explainability

This is deterministic logic.
No additional ML model is used.
"""

import re
from difflib import SequenceMatcher
from typing import List, Dict, Any


# ---------------------------------------------------------
# Text normalization
# ---------------------------------------------------------

def normalize_text(text: str) -> str:
    """Normalize text for comparison."""

    text = str(text or "").strip().lower()

    text = re.sub(r"\s+", " ", text)

    return text


# ---------------------------------------------------------
# Bounding box utilities
# ---------------------------------------------------------

def bbox_to_rect(bbox):
    """
    Convert four-point OCR bbox into:

        x1, y1, x2, y2
    """

    if not bbox or len(bbox) < 4:
        return None

    xs = [int(point[0]) for point in bbox]
    ys = [int(point[1]) for point in bbox]

    return (
        min(xs),
        min(ys),
        max(xs),
        max(ys)
    )


def calculate_iou(bbox1, bbox2):
    """Calculate Intersection over Union between two boxes."""

    rect1 = bbox_to_rect(bbox1)
    rect2 = bbox_to_rect(bbox2)

    if rect1 is None or rect2 is None:
        return 0.0

    x1 = max(rect1[0], rect2[0])
    y1 = max(rect1[1], rect2[1])

    x2 = min(rect1[2], rect2[2])
    y2 = min(rect1[3], rect2[3])

    intersection_width = max(0, x2 - x1)
    intersection_height = max(0, y2 - y1)

    intersection = (
        intersection_width *
        intersection_height
    )

    area1 = max(0, rect1[2] - rect1[0]) * max(
        0,
        rect1[3] - rect1[1]
    )

    area2 = max(0, rect2[2] - rect2[0]) * max(
        0,
        rect2[3] - rect2[1]
    )

    union = area1 + area2 - intersection

    if union <= 0:
        return 0.0

    return intersection / union


# ---------------------------------------------------------
# Text similarity
# ---------------------------------------------------------

def text_similarity(text1: str, text2: str) -> float:
    """Calculate normalized text similarity."""

    a = normalize_text(text1)
    b = normalize_text(text2)

    if not a or not b:
        return 0.0

    return SequenceMatcher(
        None,
        a,
        b
    ).ratio()


# ---------------------------------------------------------
# Declaration pattern strength
# ---------------------------------------------------------

def declaration_pattern_score(text: str) -> float:
    """
    Give deterministic bonus points when OCR text resembles
    an important packaged-commodity declaration.

    This does NOT decide compliance.
    It only helps select better OCR evidence.
    """

    text = normalize_text(text)

    score = 0.0

    patterns = [

        # Net quantity
        (
            r"\b(net\s*weight|net\s*qty|net\s*quantity)\b",
            0.20
        ),

        # MRP
        (
            r"\bmrp\b",
            0.20
        ),

        # Manufacturing date
        (
            r"\b(mfg|mfd|manufactured|manufacturing)\b",
            0.15
        ),

        # Best before
        (
            r"\bbest\s*before\b",
            0.15
        ),

        # Manufacturer / packer
        (
            r"\b(manufactured|marketed|packed|packer|imported)\s*by\b",
            0.15
        ),

        # Consumer care
        (
            r"\b(consumer|complaints?|feedback|care)\b",
            0.10
        ),

        # Batch
        (
            r"\b(batch|lot)\s*(no|number)?\b",
            0.10
        ),

        # Money
        (
            r"(₹|rs\.?|inr)",
            0.15
        ),

        # Weight / volume units
        (
            r"\b\d+(\.\d+)?\s*(g|kg|mg|ml|l|litre|liter)\b",
            0.15
        ),

        # Date-like values
        (
            r"\b\d{1,2}[/-]\d{4}\b",
            0.15
        ),

        # Email
        (
            r"\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b",
            0.15
        ),

        # Indian toll-free / phone-like number
        (
            r"\b1[0-9]{3}\s*[0-9]{3}\s*[0-9]{4}\b",
            0.15
        )
    ]

    for pattern, bonus in patterns:

        if re.search(pattern, text, re.IGNORECASE):
            score += bonus

    return min(score, 0.50)


# ---------------------------------------------------------
# Evidence score
# ---------------------------------------------------------

def calculate_evidence_score(
    block: Dict[str, Any],
    source_bonus: float = 0.0
) -> float:
    """
    Calculate a score used only for OCR evidence selection.

    Main component:
        OCR confidence

    Additional components:
        recognizable declaration pattern
        source preference

    Score range:
        0-100
    """

    confidence = float(
        block.get("confidence", 0)
    )

    pattern_bonus = declaration_pattern_score(
        block.get("text", "")
    )

    score = confidence + (
        pattern_bonus * 100
    ) + source_bonus

    return min(score, 100.0)


# ---------------------------------------------------------
# Find matching OCR blocks
# ---------------------------------------------------------

def blocks_match(
    block1: Dict[str, Any],
    block2: Dict[str, Any]
) -> bool:
    """
    Determine whether two OCR blocks probably refer
    to the same text region.
    """

    iou = calculate_iou(
        block1.get("bbox", []),
        block2.get("bbox", [])
    )

    similarity = text_similarity(
        block1.get("text", ""),
        block2.get("text", "")
    )

    # Strong spatial overlap
    if iou >= 0.30:
        return True

    # Similar text even if OCR boxes differ slightly
    if similarity >= 0.75:
        return True

    return False


# ---------------------------------------------------------
# Merge two matching blocks
# ---------------------------------------------------------

def choose_better_block(
    original_block: Dict[str, Any],
    preprocessed_block: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Choose the stronger OCR evidence between two
    overlapping detections.
    """

    original_score = calculate_evidence_score(
        original_block,
        source_bonus=0
    )

    preprocessed_score = calculate_evidence_score(
        preprocessed_block,
        source_bonus=0
    )

    if preprocessed_score > original_score:

        selected = dict(preprocessed_block)
        selected["source"] = "preprocessed"

    else:

        selected = dict(original_block)
        selected["source"] = "original"

    selected["fusion_score"] = round(
        max(
            original_score,
            preprocessed_score
        ),
        2
    )

    selected["original_confidence"] = round(
        float(original_block.get("confidence", 0)),
        2
    )

    selected["preprocessed_confidence"] = round(
        float(preprocessed_block.get("confidence", 0)),
        2
    )

    return selected


# ---------------------------------------------------------
# Main fusion
# ---------------------------------------------------------

def fuse_ocr_results(
    original_ocr: List[Dict[str, Any]],
    preprocessed_ocr: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Combine OCR results from original and preprocessed images.

    Returns one deduplicated OCR list.
    """

    fused = []

    used_preprocessed = set()

    # -----------------------------------------------------
    # Compare every original block with preprocessed blocks
    # -----------------------------------------------------

    for original_block in original_ocr:

        matching_index = None

        for index, preprocessed_block in enumerate(
            preprocessed_ocr
        ):

            if index in used_preprocessed:
                continue

            if blocks_match(
                original_block,
                preprocessed_block
            ):

                matching_index = index
                break

        # -------------------------------------------------
        # Matching block found
        # -------------------------------------------------

        if matching_index is not None:

            preprocessed_block = preprocessed_ocr[
                matching_index
            ]

            selected = choose_better_block(
                original_block,
                preprocessed_block
            )

            fused.append(selected)

            used_preprocessed.add(
                matching_index
            )

        # -------------------------------------------------
        # Original-only detection
        # -------------------------------------------------

        else:

            selected = dict(original_block)

            selected["source"] = "original"

            selected["fusion_score"] = round(
                calculate_evidence_score(
                    original_block
                ),
                2
            )

            selected["original_confidence"] = round(
                float(
                    original_block.get(
                        "confidence",
                        0
                    )
                ),
                2
            )

            selected["preprocessed_confidence"] = None

            fused.append(selected)

    # -----------------------------------------------------
    # Add preprocessed-only detections
    # -----------------------------------------------------

    for index, preprocessed_block in enumerate(
        preprocessed_ocr
    ):

        if index in used_preprocessed:
            continue

        selected = dict(preprocessed_block)

        selected["source"] = "preprocessed"

        selected["fusion_score"] = round(
            calculate_evidence_score(
                preprocessed_block
            ),
            2
        )

        selected["original_confidence"] = None

        selected["preprocessed_confidence"] = round(
            float(
                preprocessed_block.get(
                    "confidence",
                    0
                )
            ),
            2
        )

        fused.append(selected)

    return fused


# ---------------------------------------------------------
# Sort results spatially
# ---------------------------------------------------------

def sort_ocr_results(
    blocks: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Sort OCR blocks top-to-bottom and left-to-right.
    """

    def sort_key(block):

        bbox = block.get("bbox", [])

        rect = bbox_to_rect(bbox)

        if rect is None:
            return (999999, 999999)

        return (
            rect[1],
            rect[0]
        )

    return sorted(
        blocks,
        key=sort_key
    )


# ---------------------------------------------------------
# Complete pipeline
# ---------------------------------------------------------

def run_ocr_fusion(
    original_ocr: List[Dict[str, Any]],
    preprocessed_ocr: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Complete OCR fusion pipeline.
    """

    fused = fuse_ocr_results(
        original_ocr,
        preprocessed_ocr
    )

    fused = sort_ocr_results(
        fused
    )

    return fused


# ---------------------------------------------------------
# Standalone test
# ---------------------------------------------------------

if __name__ == "__main__":

    original = [
        {
            "text": "MRP",
            "bbox": [
                [100, 100],
                [180, 100],
                [180, 130],
                [100, 130]
            ],
            "confidence": 100
        },
        {
            "text": "₹ 50.00 (Incl. of all taxes)",
            "bbox": [
                [190, 100],
                [450, 100],
                [450, 140],
                [190, 140]
            ],
            "confidence": 73.47
        }
    ]

    preprocessed = [
        {
            "text": "MRP",
            "bbox": [
                [101, 101],
                [181, 101],
                [181, 131],
                [101, 131]
            ],
            "confidence": 100
        },
        {
            "text": "? 50.00 (Incl: of all taxes)",
            "bbox": [
                [191, 101],
                [451, 101],
                [451, 141],
                [191, 141]
            ],
            "confidence": 33.29
        }
    ]

    result = run_ocr_fusion(
        original,
        preprocessed
    )

    import json

    print(
        json.dumps(
            result,
            indent=2
        )
    )