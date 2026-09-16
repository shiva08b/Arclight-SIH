import os
import easyocr


# ============================================================
# EasyOCR Singleton
# ============================================================
# The OCR reader is created ONCE when this module is imported.
# It will be reused for every OCR request.
#
# English only
# GPU disabled for easier local/hackathon setup.
# If your machine has a properly configured CUDA environment,
# you can later change gpu=False to gpu=True.
# ============================================================

reader = easyocr.Reader(["en"], gpu=False)


# ============================================================
# OCR Extraction Function
# ============================================================

def extract_text(image_path: str) -> list[dict]:
    """
    Extract text from an image using EasyOCR.

    Args:
        image_path (str): Path to the image file.

    Returns:
        list[dict]:
        [
            {
                "text": "Net Weight 500 g",
                "bbox": [
                    [x1, y1],
                    [x2, y2],
                    [x3, y3],
                    [x4, y4]
                ],
                "confidence": 96.42
            }
        ]

        Confidence is normalized from EasyOCR's 0-1 range
        to a 0-100 percentage.

        Returns [] if:
        - Image doesn't exist
        - Image cannot be read
        - No text is detected
        - OCR encounters an error
    """

    # --------------------------------------------------------
    # Check whether the image exists
    # --------------------------------------------------------

    if not image_path:
        return []

    if not os.path.isfile(image_path):
        print(f"Image not found: {image_path}")
        return []

    # --------------------------------------------------------
    # Run OCR
    # --------------------------------------------------------

    try:
        results = reader.readtext(image_path)

    except Exception as e:
        print(f"OCR failed: {e}")
        return []

    # --------------------------------------------------------
    # No text detected
    # --------------------------------------------------------

    if not results:
        return []

    # --------------------------------------------------------
    # Clean and format OCR results
    # --------------------------------------------------------

    extracted_text = []

    for bbox, text, confidence in results:

        # Remove unnecessary whitespace
        text = text.strip()

        # Skip empty detections
        if not text:
            continue

        # Convert EasyOCR / NumPy coordinates into
        # normal Python integers so FastAPI can serialize them.
        clean_bbox = [
            [int(point[0]), int(point[1])]
            for point in bbox
        ]

        extracted_text.append(
            {
                "text": text,
                "bbox": clean_bbox,
                "confidence": round(float(confidence) * 100, 2),
            }
        )
        

    return extracted_text


# ============================================================
# Standalone Terminal Test
# ============================================================

if __name__ == "__main__":

    import sys

    # --------------------------------------------------------
    # Check command-line argument
    # --------------------------------------------------------

    if len(sys.argv) < 2:
        print()
        print("Usage:")
        print("    python ocr_service.py <image_path>")
        print()
        print("Example:")
        print("    python ocr_service.py sample.jpg")
        print()
        sys.exit(1)

    image_path = sys.argv[1]

    # --------------------------------------------------------
    # Run OCR
    # --------------------------------------------------------

    print()
    print("Running OCR...")
    print(f"Image: {image_path}")
    print()

    results = extract_text(image_path)

    # --------------------------------------------------------
    # Display results
    # --------------------------------------------------------

    if not results:

        print("No text detected.")
        print()

    else:

        print("=" * 60)
        print("OCR RESULTS")
        print("=" * 60)

        for index, item in enumerate(results, start=1):

            print()
            print(f"Text Block #{index}")
            print("-" * 40)

            print(f"Text       : {item['text']}")
            print(f"Confidence : {item['confidence']}%")
            print(f"BBox       : {item['bbox']}")

        print()
        print("=" * 60)
        print(f"Total text blocks: {len(results)}")
        print("=" * 60)
        print()
        