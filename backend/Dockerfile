# backend/Dockerfile
# Build context: raiz do repositório (Railway passa o contexto da raiz)
# Bookworm (stable) — repos confiáveis, libgomp1 disponível
FROM python:3.11-slim-bookworm AS builder

# unset proxy em cada RUN — Railway injeta HTTPS_PROXY como build arg
# que faz apt/pip usarem proxy Webshare (502 no PyPI/Debian)
RUN unset HTTPS_PROXY HTTP_PROXY ALL_PROXY https_proxy http_proxy all_proxy \
    && apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN unset HTTPS_PROXY HTTP_PROXY ALL_PROXY https_proxy http_proxy all_proxy \
    && pip install --no-cache-dir -r requirements.txt

# --- Runtime stage ---
FROM python:3.11-slim-bookworm

RUN unset HTTPS_PROXY HTTP_PROXY ALL_PROXY https_proxy http_proxy all_proxy \
    && apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY backend/ .

CMD ["python", "run_daily.py"]
