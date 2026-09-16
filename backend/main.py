from multiprocessing import context

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse

import os
import uuid
import tempfile
import cv2

from ocr_service import extract_text
from preprocessor import preprocess_image
from ocr_fusion import run_ocr_fusion
from rule_engine import analyze_compliance
from visual_analyzer import analyze_visual
from context_engine import build_compliance_context
from quantity_validator import validate_quantity, parse_quantity

# ============================================================
# ARCLIGHT - LABELLENS
# FastAPI Application
# ============================================================

app = FastAPI(
    title="Arclight - LabelLens",
    description="Legal Metrology Packaged Commodity Compliance Tool",
    version="1.0.0"
)


# ============================================================
# Temporary Upload Directory
# ============================================================

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ============================================================
# Health Check
# ============================================================

@app.get("/")
def root():

    return {
        "application": "Arclight - LabelLens",
        "status": "running",
        "message": "Legal Metrology compliance backend is online"
    }


# ============================================================
# OCR ENDPOINT
# ============================================================

@app.post("/ocr")
async def ocr_endpoint(
    file: UploadFile = File(...)
):

    if not file.filename:

        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": "No image file provided."
            }
        )

    extension = os.path.splitext(
        file.filename
    )[1]

    filename = (
        f"{uuid.uuid4()}{extension}"
    )

    image_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    try:

        # ----------------------------------------------------
        # Save uploaded image
        # ----------------------------------------------------

        contents = await file.read()

        with open(
            image_path,
            "wb"
        ) as buffer:

            buffer.write(contents)

        # ----------------------------------------------------
        # Original OCR
        # ----------------------------------------------------

        ocr_results = extract_text(
            image_path
        )

        return {
            "success": True,
            "filename": file.filename,
            "count": len(ocr_results),
            "text_blocks": ocr_results
        }

    except Exception as e:

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": f"OCR processing failed: {str(e)}"
            }
        )

    finally:

        # Delete temporary image
        if os.path.exists(image_path):

            os.remove(
                image_path
            )


# ============================================================
# COMPLETE LABEL ANALYSIS
# ============================================================

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),

    package_type: str = Form("retail"),
    consumer_type: str = Form("retail"),
    commodity_category: str = Form(""),
    net_quantity_value: float | None = Form(None),
    net_quantity_unit: str = Form(""),
    is_imported: bool = Form(False),
    is_export_package: bool = Form(False),
    sold_in_india: bool = Form(True),
):
    temp_original = None
    temp_preprocessed = None

    try:
        # ---------------------------------------------------------
        # 1. Save uploaded image
        # ---------------------------------------------------------
        suffix = os.path.splitext(file.filename or "")[1] or ".jpg"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp:
            temp.write(await file.read())
            temp_original = temp.name

        # ---------------------------------------------------------
        # 2. ORIGINAL OCR
        # ---------------------------------------------------------
        original_ocr = extract_text(temp_original)

        # ---------------------------------------------------------
        # 3. PREPROCESS IMAGE
        # ---------------------------------------------------------
        temp_preprocessed = preprocess_image(temp_original)

        # ---------------------------------------------------------
        # 4. PREPROCESSED OCR
        # ---------------------------------------------------------
        preprocessed_ocr = extract_text(temp_preprocessed)

        # ---------------------------------------------------------
        # 5. OCR FUSION
        # ---------------------------------------------------------
        fused_ocr = run_ocr_fusion(
            original_ocr,
            preprocessed_ocr
        )

        # ---------------------------------------------------------
        # 6. BUILD PACKAGE CONTEXT
        # ---------------------------------------------------------
        metadata = {
            "package_type": package_type,
            "consumer_type": consumer_type,
            "commodity_category": commodity_category,
            "net_quantity_value": net_quantity_value,
            "net_quantity_unit": net_quantity_unit,
            "is_imported": is_imported,
            "is_export_package": is_export_package,
            "sold_in_india": sold_in_india,
        }

        compliance_context = build_compliance_context(metadata)

        # ---------------------------------------------------------
        # 7. COMPLIANCE RULE ENGINE
        # ---------------------------------------------------------
        compliance = analyze_compliance(fused_ocr)
        # ---------------------------------------------------------
        # AUTOMATIC QUANTITY VALIDATION FROM OCR
        # ---------------------------------------------------------

        net_quantity_result = (
            compliance.get("fields", {})
            .get("net_quantity", {})
        )

        ocr_quantity = net_quantity_result.get("value")

        quantity_value_for_validation = net_quantity_value
        quantity_unit_for_validation = net_quantity_unit

        # If officer did not manually provide quantity,
        # use the quantity detected by OCR.
        if (
            quantity_value_for_validation in [None, ""]
            and ocr_quantity
        ):
            parsed_quantity = parse_quantity(ocr_quantity)

            if parsed_quantity:
                quantity_value_for_validation = parsed_quantity["value"]
                quantity_unit_for_validation = parsed_quantity["unit"]



        # Run Second Schedule validation
        quantity_validation = validate_quantity(
            commodity=commodity_category,
            quantity_value=quantity_value_for_validation,
            quantity_unit=quantity_unit_for_validation,
        )

        compliance_context["applicability"]["standard_package_check"] = (
            quantity_validation["status"]
        )

        # ---------------------------------------------------------
        # 8. IMAGE DIMENSIONS
        # ---------------------------------------------------------
        image = cv2.imread(temp_original)

        if image is None:
            raise ValueError("Unable to read uploaded image")

        height, width = image.shape[:2]

        # ---------------------------------------------------------
        # 9. VISUAL ANALYSIS
        # ---------------------------------------------------------
        visual_analysis = analyze_visual(
            fused_ocr,
            width,
            height
        )

        # ---------------------------------------------------------
        # 10. FINAL RESPONSE
        # ---------------------------------------------------------
        return {
            "success": True,
            "quantity_validation": quantity_validation,
            "filename": file.filename,

            "context": compliance_context,

            "ocr": {
                "original_count": len(original_ocr),
                "preprocessed_count": len(preprocessed_ocr),
                "fused_count": len(fused_ocr),
                "blocks": fused_ocr,
            },

            "compliance": compliance,

            "visual_analysis": visual_analysis,
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e),
        }

    finally:

        # ---------------------------------------------------------
        # CLEANUP TEMP FILES
        # ---------------------------------------------------------
        if temp_original and os.path.exists(temp_original):
            os.remove(temp_original)

        if temp_preprocessed and os.path.exists(temp_preprocessed):
            os.remove(temp_preprocessed)