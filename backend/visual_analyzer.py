"""
Arclight / LabelLens
Visual Analyzer

Uses OCR bounding boxes to perform visual/readability screening.
This is a screening layer, NOT a legal font-size measurement system.
"""

from typing import List, Dict, Any


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

def get_bbox_dimensions(bbox: List[List[int]]) -> Dict[str, int]:
    """Calculate width and height from an OCR bounding box."""

    if not bbox or len(bbox) < 4:
        return {
            "width": 0,
            "height": 0
        }

    xs = [point[0] for point in bbox]
    ys = [point[1] for point in bbox]

    width = max(xs) - min(xs)
    height = max(ys) - min(ys)

    return {
        "width": int(width),
        "height": int(height)
    }


def get_bbox_center(bbox: List[List[int]]) -> Dict[str, float]:
    """Calculate the center point of a bounding box."""

    if not bbox or len(bbox) < 4:
        return {
            "x": 0,
            "y": 0
        }

    xs = [point[0] for point in bbox]
    ys = [point[1] for point in bbox]

    return {
        "x": round((min(xs) + max(xs)) / 2, 2),
        "y": round((min(ys) + max(ys)) / 2, 2)
    }


# ---------------------------------------------------------
# Text readability screening
# ---------------------------------------------------------

def classify_text_height(height: int) -> str:
    """
    Classify OCR text height for visual screening.

    IMPORTANT:
    These thresholds are heuristic pixel thresholds.
    They do NOT establish statutory font-size compliance.
    """

    if height <= 0:
        return "UNKNOWN"

    if height < 12:
        return "VERY_SMALL"

    if height < 20:
        return "SMALL"

    if height < 35:
        return "NORMAL"

    return "LARGE"


def calculate_readability(
    height: int,
    confidence: float
) -> Dict[str, Any]:
    """
    Generate a simple readability screening result.
    """

    size_class = classify_text_height(height)

    warnings = []

    if size_class in ["VERY_SMALL", "SMALL"]:
        warnings.append(
            "Text appears visually small and should be manually verified."
        )

    if confidence < 60:
        warnings.append(
            "OCR confidence is low; manual verification is recommended."
        )

    if not warnings:
        status = "PASS"
    else:
        status = "REVIEW"

    return {
        "status": status,
        "size_class": size_class,
        "warnings": warnings
    }


# ---------------------------------------------------------
# OCR block analysis
# ---------------------------------------------------------

def analyze_ocr_blocks(
    ocr_blocks: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Analyze every OCR block.

    Expected input:

    [
        {
            "text": "...",
            "bbox": [[x,y], ...],
            "confidence": 95.2
        }
    ]
    """

    analyzed = []

    for block in ocr_blocks:

        text = block.get("text", "")
        bbox = block.get("bbox", [])
        confidence = float(block.get("confidence", 0))

        dimensions = get_bbox_dimensions(bbox)
        center = get_bbox_center(bbox)

        readability = calculate_readability(
            dimensions["height"],
            confidence
        )

        analyzed.append({
            "text": text,
            "bbox": bbox,
            "center": center,
            "width": dimensions["width"],
            "height": dimensions["height"],
            "confidence": confidence,
            "size_class": readability["size_class"],
            "readability_status": readability["status"],
            "warnings": readability["warnings"]
        })

    return analyzed


# ---------------------------------------------------------
# Relative placement
# ---------------------------------------------------------

def classify_position(
    center: Dict[str, float],
    image_width: int,
    image_height: int
) -> str:
    """
    Classify the approximate location of text on the package.
    """

    if image_width <= 0 or image_height <= 0:
        return "UNKNOWN"

    x = center["x"]
    y = center["y"]

    horizontal = "LEFT" if x < image_width / 3 else (
        "RIGHT" if x > (image_width * 2 / 3)
        else "CENTER"
    )

    vertical = "TOP" if y < image_height / 3 else (
        "BOTTOM" if y > (image_height * 2 / 3)
        else "MIDDLE"
    )

    return f"{vertical}_{horizontal}"


def add_relative_positions(
    analyzed_blocks: List[Dict[str, Any]],
    image_width: int,
    image_height: int
) -> List[Dict[str, Any]]:
    """Add approximate package position to each OCR block."""

    for block in analyzed_blocks:

        block["relative_position"] = classify_position(
            block["center"],
            image_width,
            image_height
        )

    return analyzed_blocks


# ---------------------------------------------------------
# Required declaration visibility
# ---------------------------------------------------------

def check_field_visibility(
    field_data: Dict[str, Any],
    analyzed_blocks: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Check whether a detected declaration has usable OCR evidence.

    This does NOT prove legal placement compliance.
    """

    if not field_data:
        return {
            "visible": False,
            "status": "MISSING"
        }

    evidence = field_data.get("evidence", [])

    if not evidence:
        return {
            "visible": False,
            "status": "REVIEW"
        }

    return {
        "visible": True,
        "status": "FOUND"
    }


# ---------------------------------------------------------
# Highlight coordinates
# ---------------------------------------------------------

def create_highlights(
    analyzed_blocks: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Create frontend-friendly highlight objects.
    """

    highlights = []

    for block in analyzed_blocks:

        if not block.get("bbox"):
            continue

        highlights.append({
            "text": block["text"],
            "bbox": block["bbox"],
            "confidence": block["confidence"],
            "status": block["readability_status"],
            "warnings": block["warnings"]
        })

    return highlights


# ---------------------------------------------------------
# Main Visual Analyzer
# ---------------------------------------------------------

def analyze_visual(
    ocr_blocks: List[Dict[str, Any]],
    image_width: int = 0,
    image_height: int = 0
) -> Dict[str, Any]:
    """
    Main visual analysis function.
    """

    analyzed_blocks = analyze_ocr_blocks(ocr_blocks)

    analyzed_blocks = add_relative_positions(
        analyzed_blocks,
        image_width,
        image_height
    )

    readability_reviews = [
        block
        for block in analyzed_blocks
        if block["readability_status"] == "REVIEW"
    ]

    highlights = create_highlights(analyzed_blocks)

    if readability_reviews:
        overall_status = "REVIEW_REQUIRED"
    else:
        overall_status = "PASS"

    return {
        "status": overall_status,
        "image": {
            "width": image_width,
            "height": image_height
        },
        "total_ocr_blocks": len(analyzed_blocks),
        "blocks_requiring_review": len(readability_reviews),
        "blocks": analyzed_blocks,
        "highlights": highlights
    }


# ---------------------------------------------------------
# Standalone test
# ---------------------------------------------------------

if __name__ == "__main__":

    sample_ocr = [
        {
            "text": "Net Weight:",
            "bbox": [
                [100, 200],
                [250, 200],
                [250, 225],
                [100, 225]
            ],
            "confidence": 99.2
        },
        {
            "text": "250 g",
            "bbox": [
                [260, 200],
                [340, 200],
                [340, 225],
                [260, 225]
            ],
            "confidence": 98.5
        },
        {
            "text": "Small Text",
            "bbox": [
                [100, 400],
                [170, 400],
                [170, 410],
                [100, 410]
            ],
            "confidence": 92
        }
    ]

    result = analyze_visual(
        sample_ocr,
        image_width=1000,
        image_height=1000
    )

    import json

    print(
        json.dumps(
            result,
            indent=2
        )
    )