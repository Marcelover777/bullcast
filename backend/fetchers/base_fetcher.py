# backend/fetchers/base_fetcher.py
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


def with_retry(func):
    """Decorator: 3 tentativas com backoff exponencial (2s, 4s, 8s)."""
    return retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=8),
        reraise=True,
    )(func)
