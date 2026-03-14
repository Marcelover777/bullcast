# tests/test_cepea_fetcher.py
from unittest.mock import patch, MagicMock
import pandas as pd
from datetime import date

def test_fetch_spot_prices_handles_empty_df():
    """Garante que estados sem dados são ignorados sem travar."""
    with patch("agrobr.cepea.boi_gordo", return_value=pd.DataFrame()):
        with patch("backend.supabase_client.upsert") as mock_upsert:
            from backend.fetchers.cepea_fetcher import fetch_spot_prices
            fetch_spot_prices(start=date(2026, 3, 1))
            mock_upsert.assert_not_called()
