# backend/fetchers/weather_fetcher.py
"""
Previsão climática 7 dias via Open-Meteo (gratuito, sem API key).
Foco: Nova Ubiratã, MT (-13.28, -55.26) e praças pecuárias.
"""
import logging
from datetime import date

import httpx

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

# Coordenadas das praças relevantes
LOCATIONS = {
    "MT-NUB": {"lat": -13.28, "lon": -55.26, "name": "Nova Ubiratã"},
    "MT":     {"lat": -12.64, "lon": -55.42, "name": "Mato Grosso (centro)"},
    "MS":     {"lat": -20.77, "lon": -54.78, "name": "Mato Grosso do Sul"},
    "GO":     {"lat": -15.98, "lon": -49.86, "name": "Goiás"},
    "PA":     {"lat": -3.79,  "lon": -52.48, "name": "Pará"},
}

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


@with_retry
def fetch_weather_forecast() -> None:
    """Busca previsão 7 dias para cada localidade."""
    logger.info("Buscando previsão climática Open-Meteo (7d)")
    rows = []

    with httpx.Client(timeout=30) as client:
        for state_code, loc in LOCATIONS.items():
            try:
                resp = client.get(OPEN_METEO_URL, params={
                    "latitude": loc["lat"],
                    "longitude": loc["lon"],
                    "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean,"
                             "precipitation_sum,precipitation_probability_max,"
                             "windspeed_10m_max,relative_humidity_2m_mean",
                    "timezone": "America/Cuiaba",
                    "forecast_days": 7,
                })
                resp.raise_for_status()
                data = resp.json()

                daily = data.get("daily", {})
                dates = daily.get("time", [])
                temp_max = daily.get("temperature_2m_max", [])
                temp_min = daily.get("temperature_2m_min", [])
                temp_avg = daily.get("temperature_2m_mean", [])
                precip = daily.get("precipitation_sum", [])
                precip_prob = daily.get("precipitation_probability_max", [])
                wind = daily.get("windspeed_10m_max", [])
                humidity = daily.get("relative_humidity_2m_mean", [])

                for i, d in enumerate(dates):
                    rows.append({
                        "date": d,
                        "state": state_code,
                        "location_name": loc["name"],
                        "forecast_type": "7d",
                        "temp_max": float(temp_max[i]) if i < len(temp_max) and temp_max[i] is not None else None,
                        "temp_min": float(temp_min[i]) if i < len(temp_min) and temp_min[i] is not None else None,
                        "temp_avg": float(temp_avg[i]) if i < len(temp_avg) and temp_avg[i] is not None else None,
                        "precipitation_mm": float(precip[i]) if i < len(precip) and precip[i] is not None else 0,
                        "precipitation_prob": float(precip_prob[i]) if i < len(precip_prob) and precip_prob[i] is not None else None,
                        "wind_max_kmh": float(wind[i]) if i < len(wind) and wind[i] is not None else None,
                        "humidity_avg": float(humidity[i]) if i < len(humidity) and humidity[i] is not None else None,
                    })

            except Exception as exc:
                logger.error("Erro previsão %s: %s", state_code, exc)

    if rows:
        try:
            upsert("weather_forecast", rows, ["date", "state"])
            logger.info("Upsert %d registros weather_forecast", len(rows))
        except Exception as exc:
            exc_str = str(exc)
            if "PGRST205" in exc_str or "weather_forecast" in exc_str:
                logger.warning(
                    "Tabela weather_forecast não existe no Supabase. "
                    "Execute o schema.sql para criá-la. Dados descartados."
                )
            else:
                raise

        # Análise de seca para Nova Ubiratã
        _analyze_drought_risk(rows)
    else:
        logger.warning("Nenhuma previsão climática obtida")


def _analyze_drought_risk(rows: list[dict]) -> None:
    """Verifica se Nova Ubiratã terá seca nos próximos 7 dias."""
    nub_rows = [r for r in rows if r["state"] == "MT-NUB"]
    if not nub_rows:
        return

    total_precip = sum(r.get("precipitation_mm") or 0 for r in nub_rows)
    max_temp = max((r.get("temp_max") or 0 for r in nub_rows), default=0)
    days_no_rain = sum(1 for r in nub_rows if (r.get("precipitation_mm") or 0) < 1.0)

    risk = "low"
    pasture = "regular"
    alert_msg = None

    if days_no_rain >= 6 and max_temp > 35:
        risk = "high"
        pasture = "critico"
        alert_msg = f"Seca severa prevista: {days_no_rain} dias sem chuva, máx {max_temp:.0f}°C. Considere suplementação."
    elif days_no_rain >= 4 or total_precip < 10:
        risk = "medium"
        pasture = "atencao"
        alert_msg = f"Chuvas escassas nos próximos 7 dias ({total_precip:.0f}mm). Monitore pastagens."

    if alert_msg:
        logger.warning("ALERTA CLIMA NUB: %s", alert_msg)

    # Atualiza climate_data com análise
    from supabase_client import upsert as _upsert
    _upsert("climate_data", [{
        "date": str(date.today()),
        "state": "MT-NUB",
        "precipitation_mm": round(total_precip, 1),
        "temp_avg": round(sum((r.get("temp_avg") or 0 for r in nub_rows)) / len(nub_rows), 1),
        "temp_max": round(max_temp, 1),
        "precipitation_anomaly_pct": 0,
        "risk_level": risk,
        "pasture_condition": pasture,
    }], ["date", "state"])
