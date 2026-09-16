"""
Arclight / LabelLens
Stage 2 — Image Preprocessing

Mild preprocessing optimized for OCR on packaged-product labels.
"""

import os
import cv2
import numpy as np


MAX_IMAGE_WIDTH = 2000


def resize_image(image):
    """Resize very large images while preserving aspect ratio."""

    height, width = image.shape[:2]

    if width <= MAX_IMAGE_WIDTH:
        return image

    scale = MAX_IMAGE_WIDTH / width

    new_width = int(width * scale)
    new_height = int(height * scale)

    return cv2.resize(
        image,
        (new_width, new_height),
        interpolation=cv2.INTER_AREA
    )


def enhance_contrast(gray):
    """Mild CLAHE-based local contrast enhancement."""

    clahe = cv2.createCLAHE(
        clipLimit=1.5,
        tileGridSize=(8, 8)
    )

    return clahe.apply(gray)


def denoise_image(gray):
    """Light denoising while preserving text edges."""

    return cv2.fastNlMeansDenoising(
        gray,
        None,
        h=5,
        templateWindowSize=7,
        searchWindowSize=21
    )


def preprocess_image(image_path: str, output_path: str | None = None) -> str:
    """
    Perform mild preprocessing for OCR.
    """

    if not os.path.exists(image_path):
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(
            f"Unable to read image: {image_path}"
        )

    # 1. Resize very large images
    image = resize_image(image)

    # 2. Convert to grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # 3. Mild contrast enhancement
    enhanced = enhance_contrast(gray)

    # 4. Light denoising
    processed = denoise_image(enhanced)

    # NOTE:
    # We intentionally removed aggressive sharpening.
    # It was causing OCR confidence to decrease on some fields.

    if output_path is None:

        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)

        name, ext = os.path.splitext(filename)

        output_path = os.path.join(
            directory,
            f"{name}_preprocessed{ext}"
        )

    success = cv2.imwrite(
        output_path,
        processed
    )

    if not success:
        raise IOError(
            f"Unable to save processed image: {output_path}"
        )

    return output_path


if __name__ == "__main__":

    input_image = "sample.jpg"

    try:

        result = preprocess_image(input_image)

        print("Preprocessing successful!")
        print(f"Input : {input_image}")
        print(f"Output: {result}")

    except Exception as e:

        print("Preprocessing failed:")
        print(str(e))