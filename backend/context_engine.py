"""
LabelLens - Phase 1 Context Engine

Combines applicability and exemption decisions into one object consumed
by the API/rule engine.
"""

from __future__ import annotations

from typing import Any

from applicability_engine import determine_applicability
from exemption_engine import check_exemptions


def build_compliance_context(metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    metadata = metadata or {}

    applicability = determine_applicability(metadata)
    exemption = check_exemptions(metadata)

    context_status = "APPLICABLE"

    if applicability.get("chapter_ii") == "NOT_APPLICABLE":
        context_status = "NOT_APPLICABLE"
    elif exemption.get("status") == "NOT_APPLICABLE":
        context_status = "EXEMPT"
    elif (
        applicability.get("chapter_ii") == "REVIEW_REQUIRED"
        or exemption.get("status") in {"REVIEW_REQUIRED", "PARTIAL"}
    ):
        context_status = "REVIEW_REQUIRED"

    return {
        "status": context_status,
        "metadata": metadata,
        "applicability": applicability,
        "exemption": exemption,
        "disclaimer": (
            "This context layer is a screening aid. A package classification "
            "or exemption requiring facts not visible in the image must be "
            "confirmed by an authorized reviewer."
        ),
    }


def can_run_retail_declaration_checks(context: dict[str, Any]) -> bool:
    """
    Retail checks may run when Chapter II applies.

    If applicability is uncertain, callers should still run extraction for
    evidence but present the result as REVIEW_REQUIRED rather than a final
    legal determination.
    """
    return context.get("applicability", {}).get("chapter_ii") == "APPLICABLE"


if __name__ == "__main__":
    print(build_compliance_context({
        "package_type": "retail",
        "consumer_type": "retail",
        "net_quantity_value": 250,
        "net_quantity_unit": "g",
        "commodity_category": "biscuits",
    }))
