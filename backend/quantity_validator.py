"""
Quantity and Standard Package Validator

Phase 1B:
- Normalizes quantity units
- Checks commodities against the Second Schedule
- Supports explicit standard quantities
- Supports "thereafter in multiples of X" rules
- Returns PASS / REVIEW / NOT_APPLICABLE

This is a screening aid, not a definitive legal determination.
"""

import re
from typing import Any, Dict, Optional


# -------------------------------------------------------------------
# SECOND SCHEDULE
# -------------------------------------------------------------------
# Source: Legal Metrology (Packaged Commodities) Rules, 2011
#
# Biscuits:
# 25g, 50g, 75g, 100g, 150g, 200g, 250g, 300g
# and thereafter in multiples of 100g up to 1kg.
# -------------------------------------------------------------------

SECOND_SCHEDULE = {
    "biscuits": {
        "display_name": "Biscuits",
        "unit": "g",
        "allowed": [
            25,
            50,
            75,
            100,
            150,
            200,
            250,
            300,
        ],
        "multiple_after": 300,
        "multiple_step": 100,
        "maximum": 1000,
    }
}


# -------------------------------------------------------------------
# UNIT NORMALIZATION
# -------------------------------------------------------------------

UNIT_ALIASES = {
    "g": "g",
    "gm": "g",
    "gms": "g",
    "gram": "g",
    "grams": "g",

    "kg": "kg",
    "kgs": "kg",
    "kilogram": "kg",
    "kilograms": "kg",

    "ml": "ml",
    "millilitre": "ml",
    "millilitres": "ml",
    "milliliter": "ml",
    "milliliters": "ml",

    "l": "l",
    "ltr": "l",
    "litre": "l",
    "litres": "l",
    "liter": "l",
    "liters": "l",

    "pcs": "number",
    "pc": "number",
    "piece": "number",
    "pieces": "number",
    "nos": "number",
    "no": "number",
    "number": "number",
}


def normalize_unit(unit: Any) -> Optional[str]:
    """
    Convert common unit variants to a canonical unit.
    """

    if unit is None:
        return None

    value = str(unit).strip().lower()

    return UNIT_ALIASES.get(value)


# -------------------------------------------------------------------
# QUANTITY PARSING
# -------------------------------------------------------------------

def parse_quantity(value: Any, unit: Any = None) -> Optional[Dict[str, Any]]:
    """
    Parse quantity from either:
        value=250, unit='g'

    or:
        value='250 g'

    Returns:
        {
            'value': 250.0,
            'unit': 'g'
        }
    """

    if value is None:
        return None

    # Case 1:
    # value already contains unit
    if isinstance(value, str):
        text = value.strip().lower()

        # Example: "250 g"
        match = re.search(
            r"(\d+(?:\.\d+)?)\s*([a-zA-Z]+)",
            text
        )

        if match:
            numeric_value = float(match.group(1))
            detected_unit = normalize_unit(match.group(2))

            if detected_unit:
                return {
                    "value": numeric_value,
                    "unit": detected_unit,
                    "raw": value,
                }

        # Example: "250"
        numeric_match = re.fullmatch(
            r"\s*(\d+(?:\.\d+)?)\s*",
            text
        )

        if numeric_match:
            numeric_value = float(numeric_match.group(1))

            normalized_unit = normalize_unit(unit)

            if normalized_unit:
                return {
                    "value": numeric_value,
                    "unit": normalized_unit,
                    "raw": value,
                }

        return None

    # Case 2:
    # numeric value + separate unit
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return None

    normalized_unit = normalize_unit(unit)

    if not normalized_unit:
        return None

    return {
        "value": numeric_value,
        "unit": normalized_unit,
        "raw": value,
    }


# -------------------------------------------------------------------
# COMMODITY NORMALIZATION
# -------------------------------------------------------------------

def normalize_commodity(commodity: Any) -> Optional[str]:
    if commodity is None:
        return None

    text = str(commodity).strip().lower()

    if not text:
        return None

    # Direct match
    if text in SECOND_SCHEDULE:
        return text

    # Common OCR / metadata variations
    aliases = {
        "biscuit": "biscuits",
        "biscuits": "biscuits",
        "cookies": "biscuits",
        "cookie": "biscuits",
    }

    if text in aliases:
        return aliases[text]

    # Semantic fallback
    if "biscuit" in text or "cookie" in text:
        return "biscuits"

    return None


# -------------------------------------------------------------------
# SECOND SCHEDULE CHECK
# -------------------------------------------------------------------

def check_standard_quantity(
    commodity: Any,
    quantity_value: Any,
    quantity_unit: Any
) -> Dict[str, Any]:
    """
    Check whether a declared quantity matches the configured
    Second Schedule entry for the commodity.
    """

    normalized_commodity = normalize_commodity(commodity)

    if not normalized_commodity:
        return {
            "status": "REVIEW_REQUIRED",
            "commodity": commodity,
            "declared_quantity": quantity_value,
            "unit": normalize_unit(quantity_unit),
            "standard_package": None,
            "reason": (
                "Commodity could not be confidently matched to a "
                "configured Second Schedule entry."
            ),
        }

    rule = SECOND_SCHEDULE[normalized_commodity]

    parsed = parse_quantity(quantity_value, quantity_unit)

    if not parsed:
        return {
            "status": "REVIEW_REQUIRED",
            "commodity": rule["display_name"],
            "declared_quantity": quantity_value,
            "unit": normalize_unit(quantity_unit),
            "standard_package": None,
            "reason": "Quantity or unit could not be parsed confidently.",
        }

    value = parsed["value"]
    unit = parsed["unit"]

    # Unit mismatch
    if unit != rule["unit"]:
        return {
            "status": "REVIEW_REQUIRED",
            "commodity": rule["display_name"],
            "declared_quantity": value,
            "unit": unit,
            "standard_package": False,
            "reason": (
                f"The configured standard quantities for "
                f"{rule['display_name']} are expressed in {rule['unit']}."
            ),
        }

    # Explicit quantities
    if value in rule["allowed"]:
        return {
            "status": "PASS",
            "commodity": rule["display_name"],
            "declared_quantity": value,
            "unit": unit,
            "standard_package": True,
            "rule_basis": "Second Schedule / Rule 5",
            "reason": (
                f"{value:g} {unit} is a specified standard quantity "
                f"for {rule['display_name']}."
            ),
        }

    # Thereafter multiples
    if (
        value > rule["multiple_after"]
        and value <= rule["maximum"]
        and (
            (value - rule["multiple_after"])
            % rule["multiple_step"]
            == 0
        )
    ):
        return {
            "status": "PASS",
            "commodity": rule["display_name"],
            "declared_quantity": value,
            "unit": unit,
            "standard_package": True,
            "rule_basis": "Second Schedule / Rule 5",
            "reason": (
                f"{value:g} {unit} follows the configured "
                f"multiples-of-{rule['multiple_step']} rule "
                f"up to {rule['maximum']} {unit}."
            ),
        }

    # Outside configured standard sizes
    return {
        "status": "REVIEW_REQUIRED",
        "commodity": rule["display_name"],
        "declared_quantity": value,
        "unit": unit,
        "standard_package": False,
        "rule_basis": "Second Schedule / Rule 5",
        "reason": (
            f"{value:g} {unit} does not match the configured "
            f"standard quantities for {rule['display_name']}."
        ),
    }


# -------------------------------------------------------------------
# HIGH-LEVEL FUNCTION
# -------------------------------------------------------------------

def validate_quantity(
    commodity: Any,
    quantity_value: Any,
    quantity_unit: Any
) -> Dict[str, Any]:
    """
    Public API for the quantity validator.
    """

    return check_standard_quantity(
        commodity=commodity,
        quantity_value=quantity_value,
        quantity_unit=quantity_unit,
    )