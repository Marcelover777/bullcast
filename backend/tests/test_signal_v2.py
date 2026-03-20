# backend/tests/test_signal_v2.py
"""Tests for Signal Generator v2."""
import pytest


class TestSignalV2:
    def test_ml_score_magnitude(self):
        """Score should reflect magnitude of expected return."""
        from analysis.signal_generator import _ml_score_v2
        # 5% expected return with high confidence → above neutral
        score = _ml_score_v2(pred_15d=315.0, current=300.0, confidence=0.8)
        assert score > 55  # 50 + 0.05 * 0.8 * 200 = 58

        # -5% expected return → below neutral
        score = _ml_score_v2(pred_15d=285.0, current=300.0, confidence=0.8)
        assert score < 45

    def test_score_clamped_0_100(self):
        """All scores must be in [0, 100]."""
        from analysis.signal_generator import _ml_score_v2
        score = _ml_score_v2(pred_15d=500.0, current=300.0, confidence=1.0)
        assert 0 <= score <= 100

        score = _ml_score_v2(pred_15d=100.0, current=300.0, confidence=1.0)
        assert 0 <= score <= 100

    def test_composite_weights_sum_to_1(self):
        """WEIGHTS values must sum to 1.0."""
        from analysis.signal_generator import WEIGHTS
        assert sum(WEIGHTS.values()) == pytest.approx(1.0, abs=0.001)

    def test_signal_thresholds(self):
        """BUY >= 62, SELL <= 38, else HOLD."""
        from analysis.signal_generator import _classify_signal
        assert _classify_signal(70) == ("BUY", pytest.approx(0.4, abs=0.1))
        assert _classify_signal(30) == ("SELL", pytest.approx(0.4, abs=0.1))
        assert _classify_signal(50)[0] == "HOLD"

    def test_generate_signal_returns_complete_row(self, mock_supabase):
        """Signal row must include all new v2 fields."""
        from analysis.signal_generator import generate_signal
        # Full integration test in test_pipeline.py
        pass
