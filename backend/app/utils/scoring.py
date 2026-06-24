"""
Rakshak AI - Risk Scoring Utilities

Centralized risk score computation and classification.
"""


def compute_risk_score(factors: dict) -> int:
    """Compute a weighted risk score from multiple factors.

    Args:
        factors: Dict of factor_name -> (value, weight) tuples

    Returns:
        Risk score from 0-100
    """
    total_score = 0
    total_weight = 0

    for factor_name, (value, weight) in factors.items():
        total_score += value * weight
        total_weight += weight

    if total_weight == 0:
        return 0

    return min(int(total_score / total_weight), 100)


def classify_risk_level(score: int) -> str:
    """Classify a risk score into a level."""
    if score >= 80:
        return "critical"
    elif score >= 60:
        return "high"
    elif score >= 40:
        return "medium"
    return "low"
