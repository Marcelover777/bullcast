# backend/Dockerfile
# Build context: raiz do repositório (Railway passa o contexto da raiz)
# Bookworm (stable) evita problemas com Trixie/testing (502, pacotes renomeados)
FROM python:3.11-slim-bookworm AS builder

# Build deps para prophet (cmdstanpy/pystan) e pacotes com extensões C
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Runtime stage (menor imagem final) ---
FROM python:3.11-slim-bookworm

# libgomp1 para XGBoost (nome estável no Bookworm)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia site-packages do builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY backend/ .

CMD ["python", "run_daily.py"]
