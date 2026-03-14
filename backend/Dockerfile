# backend/Dockerfile
# Build context: raiz do repositório (Railway passa o contexto da raiz)
FROM python:3.11-slim

WORKDIR /app

# Copia apenas o backend para evitar copiar node_modules do frontend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD ["python", "run_daily.py"]
