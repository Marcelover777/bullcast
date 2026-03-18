# backend/Dockerfile
# Build context: raiz do repositório (Railway passa o contexto da raiz)
# Bookworm (stable) evita problemas com Trixie/testing (502, pacotes renomeados)
FROM python:3.11-slim-bookworm AS builder

# Desabilita proxy durante build — Railway injeta HTTPS_PROXY/HTTP_PROXY
# que interfere com pip/apt (Webshare proxy não roteia PyPI/Debian)
ENV HTTPS_PROXY="" HTTP_PROXY="" ALL_PROXY="" http_proxy="" https_proxy="" all_proxy="" no_proxy="*"

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

# Desabilita proxy durante build do runtime stage também
ENV HTTPS_PROXY="" HTTP_PROXY="" ALL_PROXY="" http_proxy="" https_proxy="" all_proxy="" no_proxy="*"

# libgomp1 para XGBoost (nome estável no Bookworm)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia site-packages do builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY backend/ .

# Limpa proxy overrides do build — Railway re-injeta em runtime via env vars
ENV HTTPS_PROXY="" HTTP_PROXY="" ALL_PROXY="" http_proxy="" https_proxy="" all_proxy=""
# Remove no_proxy para não interferir em runtime
ENV no_proxy=""

CMD ["python", "run_daily.py"]
