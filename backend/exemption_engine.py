"""
LabelLens - Phase 1: Exemption Engine

Implements the explicit package exemptions from Rule 26 of the uploaded
Legal Metrology (Packaged Commodities) Rules, 2011 reference.

Conservative behavior:
- NOT_APPLICABLE only when supplied facts establish an exemption.
- REVIEW_REQUIRED when a special category may apply but the available
  information is insufficient.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any


@dataclass
class ExemptionResult:
    exempt: bool
    status: str
    exemption_code: str | None
    reason: str
    affected_declarations: list[str]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _norm(value: Any) -> str:
    return str(value or "").strip().lower().replace("-", "_").replace(" ", "_")


def _num(value: Any) -> float | None:
    try:
        if value is None or value == "":
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def check_exemptions(metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    """
    Check Rule 26 exemptions.

    Expected optional metadata:
        net_quantity_value
        net_quantity_unit
        restaurant_fast_food
        scheduled_drug
        non_scheduled_drug
        agricultural_produce
        package_type
        commodity_category
        is_imported
        exemption_override   (optional explicit human-reviewed flag)

    The supplied reference states:
      - 10 g / 10 ml or less: exemption, with a stated proviso for
        MRP/net-quantity declarations on 10g–20g or 10ml–20ml.
      - fast food packed by a restaurant/hotel and the like
      - scheduled/non-scheduled formulations covered by the cited DPCO
      - agricultural farm produce above 50 kg

    We do not infer a drug or agricultural status from OCR alone.
    """
    m = metadata or {}

    qty = _num(m.get("net_quantity_value"))
    unit = _norm(m.get("net_quantity_unit"))
    category = _norm(m.get("commodity_category"))

    # Rule 26(a): <=10 g or <=10 ml.
    if qty is not None and unit in {"g", "gram", "grams"} and qty <= 10:
        return ExemptionResult(
            True,
            "NOT_APPLICABLE",
            "R26_A_SMALL_WEIGHT",
            "Package contains 10 g or less.",
            ["manufacturer", "generic_name", "net_quantity", "manufacturing_date",
             "mrp", "consumer_care", "batch_number", "best_before"],
        ).to_dict()

    if qty is not None and unit in {"ml", "millilitre", "millilitres", "milliliter", "milliliters"} and qty <= 10:
        return ExemptionResult(
            True,
            "NOT_APPLICABLE",
            "R26_A_SMALL_VOLUME",
            "Package contains 10 ml or less.",
            ["manufacturer", "generic_name", "net_quantity", "manufacturing_date",
             "mrp", "consumer_care", "batch_number", "best_before"],
        ).to_dict()

    # The source contains a specific proviso for 10g–20g / 10ml–20ml:
    # MRP and net quantity still have to be declared.
    if qty is not None and unit in {"g", "gram", "grams"} and 10 < qty <= 20:
        return ExemptionResult(
            False,
            "PARTIAL",
            "R26_A_10_TO_20G",
            "For 10 g to 20 g packages, the supplied reference states that MRP and net quantity are still to be declared.",
            ["mrp", "net_quantity"],
        ).to_dict()

    if qty is not None and unit in {"ml", "millilitre", "millilitres", "milliliter", "milliliters"} and 10 < qty <= 20:
        return ExemptionResult(
            False,
            "PARTIAL",
            "R26_A_10_TO_20ML",
            "For 10 ml to 20 ml packages, the supplied reference states that MRP and net quantity are still to be declared.",
            ["mrp", "net_quantity"],
        ).to_dict()

    # Rule 26(b).
    if bool(m.get("restaurant_fast_food", False)):
        return ExemptionResult(
            True,
            "NOT_APPLICABLE",
            "R26_B_RESTAURANT_FAST_FOOD",
            "Package is identified as fast food packed by a restaurant/hotel and the like.",
            ["manufacturer", "generic_name", "net_quantity", "manufacturing_date",
             "mrp", "consumer_care", "batch_number", "best_before"],
        ).to_dict()

    # Rule 26(c): cited formulations.
    if bool(m.get("scheduled_drug", False)) or bool(m.get("non_scheduled_drug", False)):
        return ExemptionResult(
            True,
            "NOT_APPLICABLE",
            "R26_C_DRUG_FORMULATION",
            "Package is identified as a scheduled/non-scheduled formulation covered by the cited price-control provision.",
            ["manufacturer", "generic_name", "net_quantity", "manufacturing_date",
             "mrp", "consumer_care", "batch_number", "best_before"],
        ).to_dict()

    # Rule 26(d): agricultural farm produce above 50 kg.
    if bool(m.get("agricultural_produce", False)) and qty is not None:
        if unit in {"kg", "kilogram", "kilograms"} and qty > 50:
            return ExemptionResult(
                True,
                "NOT_APPLICABLE",
                "R26_D_AGRICULTURAL_PRODUCE",
                "Package is identified as agricultural farm produce above 50 kg.",
                ["manufacturer", "generic_name", "net_quantity", "manufacturing_date",
                 "mrp", "consumer_care", "batch_number", "best_before"],
            ).to_dict()

    # Potential special category but not enough information.
    if category in {"fast_food", "restaurant_food", "hotel_food"}:
        return ExemptionResult(
            False,
            "REVIEW_REQUIRED",
            "R26_B_REVIEW",
            "Commodity/category suggests the restaurant fast-food exemption may be relevant; confirm how and by whom it was packed.",
            [],
        ).to_dict()

    if category in {"drug", "medicine", "pharmaceutical"}:
        return ExemptionResult(
            False,
            "REVIEW_REQUIRED",
            "R26_C_REVIEW",
            "Commodity appears pharmaceutical; confirm whether the cited scheduled/non-scheduled formulation exemption applies.",
            [],
        ).to_dict()

    if category in {"agricultural_produce", "farm_produce"}:
        return ExemptionResult(
            False,
            "REVIEW_REQUIRED",
            "R26_D_REVIEW",
            "Commodity appears agricultural produce; confirm whether it is farm produce above 50 kg.",
            [],
        ).to_dict()

    return ExemptionResult(
        False,
        "NO_EXEMPTION_ESTABLISHED",
        None,
        "No Rule 26 exemption was established from the supplied metadata.",
        [],
    ).to_dict()


def get_rule_application_overrides(
    exemption_result: dict[str, Any],
    default_status: str = "APPLICABLE",
) -> dict[str, str]:
    """
    Convert an exemption result into per-field overrides.

    This lets the existing rule engine keep its current declaration
    extractors while the new applicability/exemption layer decides
    whether a field should actually be required.
    """
    affected = set(exemption_result.get("affected_declarations", []))
    status = exemption_result.get("status")

    if status == "NOT_APPLICABLE":
        return {field: "NOT_APPLICABLE" for field in affected}

    if status == "PARTIAL":
        return {field: default_status for field in affected}

    return {}


if __name__ == "__main__":
    examples = [
        {"net_quantity_value": 8, "net_quantity_unit": "g"},
        {"net_quantity_value": 15, "net_quantity_unit": "g"},
        {"restaurant_fast_food": True},
        {"agricultural_produce": True, "net_quantity_value": 60, "net_quantity_unit": "kg"},
        {"commodity_category": "drug"},
    ]

    for example in examples:
        print(check_exemptions(example))
