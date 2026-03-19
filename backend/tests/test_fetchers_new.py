# backend/tests/test_fetchers_new.py
"""Tests for new fetchers (INPE, NDVI, IBGE, China)."""
import os
from unittest.mock import patch, MagicMock
from datetime import date
import pytest


class TestINPEFetcher:
    """Tests for backend/fetchers/inpe_fetcher.py"""

    SAMPLE_CSV = (
        "id,lat,lon,data_hora_gmt,satelite,municipio,estado,pais,diasemchuva,precipitacao,risco_fogo,bioma,frp\n"
        "1,-15.5,-47.3,2026/03/19 12:00,AQUA_M-T,Brasilia,Goiás,Brasil,5,0.0,0.8,Cerrado,25.0\n"
        "2,-21.1,-50.2,2026/03/19 12:00,AQUA_M-T,Araçatuba,São Paulo,Brasil,3,0.0,0.6,Mata Atlântica,12.0\n"
        "3,-12.5,-55.3,2026/03/19 12:00,AQUA_M-T,Sinop,Mato Grosso,Brasil,8,0.0,0.9,Amazônia,40.0\n"
        "4,-20.4,-54.6,2026/03/19 12:00,AQUA_M-T,Campo Grande,Mato Grosso do Sul,Brasil,4,0.0,0.7,Cerrado,18.0\n"
        "5,-18.9,-44.2,2026/03/19 12:00,AQUA_M-T,Curvelo,Minas Gerais,Brasil,6,0.0,0.5,Cerrado,8.0\n"
    )

    @patch("httpx.get")
    def test_fetch_fire_hotspots_parses_csv(self, mock_get, mock_supabase):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = self.SAMPLE_CSV
        mock_get.return_value = mock_resp

        from fetchers.inpe_fetcher import fetch_fire_hotspots
        fetch_fire_hotspots()

    @patch("httpx.get")
    def test_state_mapping(self, mock_get, mock_supabase):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = self.SAMPLE_CSV
        mock_get.return_value = mock_resp

        from fetchers.inpe_fetcher import _parse_hotspots
        rows = _parse_hotspots(self.SAMPLE_CSV, date(2026, 3, 19))

        states = {r["state"] for r in rows}
        assert states == {"GO", "SP", "MT", "MS", "MG"}
        assert all(r["hotspot_count"] >= 1 for r in rows)

    @patch("httpx.get")
    def test_fallback_previous_day(self, mock_get, mock_supabase):
        """If today's CSV returns 404, try yesterday."""
        resp_404 = MagicMock()
        resp_404.status_code = 404

        resp_ok = MagicMock()
        resp_ok.status_code = 200
        resp_ok.text = self.SAMPLE_CSV

        mock_get.side_effect = [resp_404, resp_ok]

        from fetchers.inpe_fetcher import fetch_fire_hotspots
        fetch_fire_hotspots()
        assert mock_get.call_count == 2


class TestIBGEFetcher:
    """Tests for backend/fetchers/ibge_fetcher.py"""

    SAMPLE_SIDRA = [
        {"D1C": "202401", "D2N": "Total", "D3N": "Bovinos", "D4N": "Brasil", "V": "7500000"},
        {"D1C": "202401", "D2N": "Fêmeas", "D3N": "Bovinos", "D4N": "Brasil", "V": "3525000"},
    ]

    @patch("httpx.get")
    def test_parse_female_percent(self, mock_get, mock_supabase):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = self.SAMPLE_SIDRA
        mock_get.return_value = mock_resp

        from fetchers.ibge_fetcher import _calc_female_pct
        pct = _calc_female_pct(self.SAMPLE_SIDRA)
        assert pct == pytest.approx(47.0, abs=0.1)

    @patch("httpx.get")
    def test_fetch_stores_data(self, mock_get, mock_supabase):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = self.SAMPLE_SIDRA
        mock_get.return_value = mock_resp

        from fetchers.ibge_fetcher import fetch_ibge_slaughter
        fetch_ibge_slaughter()


class TestChinaQuotaFetcher:
    """Tests for backend/fetchers/china_quota_fetcher.py"""

    @patch("httpx.get")
    def test_quota_usage_calculation(self, mock_get, mock_supabase):
        """Verify quota_usage_pct = ytd / quota_total * 100."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [
            {"CO_ANO": "2026", "CO_MES": "01", "KG_LIQUIDO": "85000000"},
            {"CO_ANO": "2026", "CO_MES": "02", "KG_LIQUIDO": "92000000"},
        ]
        mock_get.return_value = mock_resp

        from fetchers.china_quota_fetcher import _calc_quota_usage
        result = _calc_quota_usage(mock_resp.json(), quota_tons=1_106_000)
        # 85000 + 92000 = 177000 tons → 177000/1106000 * 100 ≈ 16.0%
        assert result["ytd_volume_tons"] == pytest.approx(177_000, rel=0.01)
        assert result["quota_usage_pct"] == pytest.approx(16.0, abs=0.5)

    @patch.dict(os.environ, {"CHINA_QUOTA_TONS": "1106000"})
    @patch("httpx.get")
    def test_fetch_stores_data(self, mock_get, mock_supabase):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [
            {"CO_ANO": "2026", "CO_MES": "01", "KG_LIQUIDO": "85000000"},
        ]
        mock_get.return_value = mock_resp

        from fetchers.china_quota_fetcher import fetch_china_quota
        fetch_china_quota()


class TestNDVIFetcher:
    """Tests for backend/fetchers/ndvi_fetcher.py"""

    @patch("fetchers.ndvi_fetcher._fetch_via_gee")
    def test_fetch_stores_ndvi_data(self, mock_gee, mock_supabase):
        mock_gee.return_value = [
            {"date": "2026-03-01", "state": "MT", "ndvi_value": 0.65, "ndvi_anomaly": -0.05},
            {"date": "2026-03-01", "state": "SP", "ndvi_value": 0.58, "ndvi_anomaly": -0.12},
        ]

        from fetchers.ndvi_fetcher import fetch_ndvi
        fetch_ndvi()

    @patch("fetchers.ndvi_fetcher._fetch_via_gee")
    def test_gee_failure_warns(self, mock_gee, mock_supabase):
        mock_gee.side_effect = RuntimeError("GEE auth failed")

        from fetchers.ndvi_fetcher import fetch_ndvi
        # Should not raise — logs warning and returns
        fetch_ndvi()
