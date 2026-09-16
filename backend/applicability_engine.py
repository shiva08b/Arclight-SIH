"""
LabelLens - Phase 1: Package Applicability Engine

Purpose:
Determine which parts of the Legal Metrology (Packaged Commodities)
Rules, 2011 apply to a package before individual compliance checks run.

This module is deliberately conservative:
- "PASS"/"APPLICABLE" means the supplied facts support applicability.
- "NOT_APPLICABLE" is used only where the supplied facts clearly establish
  an exclusion/exemption.
- "REVIEW_REQUIRED" is used when the image/OCR cannot establish the fact.

The rules implemented here are based on the uploaded Legal Metrology
(Packaged Commodities) Rules, 2011 reference document.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any


@dataclass
class ApplicabilityResult:
    chapter_ii: str
    retail_declarations: str
    wholesale_declarations: str
    import_checks: str
    export_checks: str
    standard_package_check: str
    quantity_verification: str
    exemption_check: str
    reason: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _normalise(value: Any) -> str:
    return str(value or "").strip().lower().replace("-", "_").replace(" ", "_")


def _to_float(value: Any) -> float | None:
    try:
        if value is None or value == "":
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def determine_applicability(metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    """
    Determine applicability from supplied package metadata.

    Expected optional metadata:
        package_type: retail | wholesale | export | import | unknown
        commodity_category: free text, e.g. biscuits, soap, cosmetics
        consumer_type: retail | industrial | institutional | unknown
        net_quantity_value: numeric
        net_quantity_unit: g | kg | ml | l | ...
        is_imported: bool
        is_export_package: bool
        sold_in_india: bool
        restaurant_fast_food: bool
        scheduled_drug: bool
        agricultural_produce: bool

    Missing facts result in REVIEW_REQUIRED rather than an invented
    determination.
    """
    m = metadata or {}

    package_type = _normalise(m.get("package_type", "unknown"))
    consumer_type = _normalise(m.get("consumer_type", "unknown"))

    qty = _to_float(m.get("net_quantity_value"))
    unit = _normalise(m.get("net_quantity_unit"))

    is_imported = bool(m.get("is_imported", False))
    is_export = bool(m.get("is_export_package", package_type == "export"))
    sold_in_india = m.get("sold_in_india", None)

    # Rule 3: Chapter II exclusions.
    # The supplied document excludes packages >25 kg/25 litre
    # (with stated cement/fertilizer exception) and industrial/
    # institutional consumer packages.
    if consumer_type in {"industrial", "institutional"}:
        return ApplicabilityResult(
            chapter_ii="NOT_APPLICABLE",
            retail_declarations="NOT_APPLICABLE",
            wholesale_declarations="REVIEW_REQUIRED",
            import_checks="APPLICABLE" if is_imported else "NOT_APPLICABLE",
            export_checks="REVIEW_REQUIRED" if is_export else "NOT_APPLICABLE",
            standard_package_check="NOT_APPLICABLE",
            quantity_verification="REVIEW_REQUIRED",
            exemption_check="NOT_APPLICABLE",
            reason="Chapter II does not apply to packages meant for industrial or institutional consumers.",
        ).to_dict()

    # Quantity-based Chapter II exclusion.
    if qty is not None and unit in {"kg", "kilogram", "kilograms"} and qty > 25:
        return ApplicabilityResult(
            chapter_ii="REVIEW_REQUIRED",
            retail_declarations="REVIEW_REQUIRED",
            wholesale_declarations="REVIEW_REQUIRED",
            import_checks="APPLICABLE" if is_imported else "NOT_APPLICABLE",
            export_checks="REVIEW_REQUIRED" if is_export else "NOT_APPLICABLE",
            standard_package_check="REVIEW_REQUIRED",
            quantity_verification="APPLICABLE",
            exemption_check="REVIEW_REQUIRED",
            reason="Declared quantity is above 25 kg; Chapter II has an applicability exclusion with a stated cement/fertilizer exception.",
        ).to_dict()

    if qty is not None and unit in {"l", "litre", "litres", "liter", "liters"} and qty > 25:
        return ApplicabilityResult(
            chapter_ii="NOT_APPLICABLE",
            retail_declarations="NOT_APPLICABLE",
            wholesale_declarations="REVIEW_REQUIRED",
            import_checks="APPLICABLE" if is_imported else "NOT_APPLICABLE",
            export_checks="REVIEW_REQUIRED" if is_export else "NOT_APPLICABLE",
            standard_package_check="NOT_APPLICABLE",
            quantity_verification="APPLICABLE",
            exemption_check="REVIEW_REQUIRED",
            reason="Declared quantity is above 25 litres; Chapter II excludes such packages except for the stated exceptions.",
        ).to_dict()

    # Clearly wholesale.
    if package_type == "wholesale":
        return ApplicabilityResult(
            chapter_ii="NOT_APPLICABLE",
            retail_declarations="NOT_APPLICABLE",
            wholesale_declarations="APPLICABLE",
            import_checks="APPLICABLE" if is_imported else "NOT_APPLICABLE",
            export_checks="REVIEW_REQUIRED" if is_export else "NOT_APPLICABLE",
            standard_package_check="NOT_APPLICABLE",
            quantity_verification="APPLICABLE",
            exemption_check="REVIEW_REQUIRED",
            reason="Package was identified as a wholesale package; wholesale declarations are checked separately.",
        ).to_dict()

    # Clearly export package.
    if is_export and sold_in_india is False:
        return ApplicabilityResult(
            chapter_ii="REVIEW_REQUIRED",
            retail_declarations="REVIEW_REQUIRED",
            wholesale_declarations="REVIEW_REQUIRED",
            import_checks="NOT_APPLICABLE",
            export_checks="APPLICABLE",
            standard_package_check="REVIEW_REQUIRED",
            quantity_verification="REVIEW_REQUIRED",
            exemption_check="REVIEW_REQUIRED",
            reason="Package is identified as an export package and is not stated to be sold in India.",
        ).to_dict()

    # Retail/default path.
    import_status = "APPLICABLE" if is_imported else "NOT_APPLICABLE"
    export_status = "REVIEW_REQUIRED" if is_export else "NOT_APPLICABLE"

    if package_type in {"retail", ""}:
        return ApplicabilityResult(
            chapter_ii="APPLICABLE",
            retail_declarations="APPLICABLE",
            wholesale_declarations="NOT_APPLICABLE",
            import_checks=import_status,
            export_checks=export_status,
            standard_package_check="REVIEW_REQUIRED",
            quantity_verification="APPLICABLE",
            exemption_check="REVIEW_REQUIRED",
            reason="Package is being treated as a retail package; no supplied fact establishes a Chapter II exclusion.",
        ).to_dict()

    # Unknown package type: do not silently classify it.
    return ApplicabilityResult(
        chapter_ii="REVIEW_REQUIRED",
        retail_declarations="REVIEW_REQUIRED",
        wholesale_declarations="REVIEW_REQUIRED",
        import_checks=import_status,
        export_checks=export_status,
        standard_package_check="REVIEW_REQUIRED",
        quantity_verification="REVIEW_REQUIRED",
        exemption_check="REVIEW_REQUIRED",
        reason="Package type is unknown; applicability requires package classification.",
    ).to_dict()


def should_run_retail_rules(applicability: dict[str, Any]) -> bool:
    """Return True only when retail/Chapter II checks should run."""
    return applicability.get("retail_declarations") == "APPLICABLE"


if __name__ == "__main__":
    examples = [
        {
            "package_type": "retail",
            "consumer_type": "retail",
            "net_quantity_value": 250,
            "net_quantity_unit": "g",
        },
        {
            "package_type": "retail",
            "consumer_type": "institutional",
            "net_quantity_value": 5,
            "net_quantity_unit": "kg",
        },
        {
            "package_type": "wholesale",
            "consumer_type": "retail",
        },
    ]

    for example in examples:
        print(determine_applicability(example))
