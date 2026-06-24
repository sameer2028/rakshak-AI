"""
Rakshak AI - Text Processing Utilities

Text preprocessing, pattern matching, and entity extraction.
"""

import re
from typing import List


def extract_phone_numbers(text: str) -> List[str]:
    """Extract Indian phone numbers from text."""
    pattern = r'(?:\+91[\-\s]?)?[6-9]\d{9}'
    return re.findall(pattern, text)


def extract_upi_ids(text: str) -> List[str]:
    """Extract UPI IDs from text."""
    pattern = r'[\w.\-]+@[\w]+'
    matches = re.findall(pattern, text)
    upi_suffixes = ['upi', 'paytm', 'ybl', 'okhdfcbank', 'okicici', 'oksbi', 'apl', 'ibl']
    return [m for m in matches if any(m.lower().endswith(f'@{s}') for s in upi_suffixes)]


def extract_bank_accounts(text: str) -> List[str]:
    """Extract bank account numbers from text."""
    pattern = r'\b\d{9,18}\b'
    return re.findall(pattern, text)


def extract_amounts(text: str) -> List[str]:
    """Extract monetary amounts from text."""
    pattern = r'(?:Rs\.?|₹|INR)\s*[\d,]+(?:\.\d{2})?|\b\d+\s*(?:lakh|crore|thousand|hundred)\b'
    return re.findall(pattern, text, re.IGNORECASE)


def normalize_text(text: str) -> str:
    """Normalize text for NLP processing."""
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    return text
