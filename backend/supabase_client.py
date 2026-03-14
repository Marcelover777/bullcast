# backend/supabase_client.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_KEY"]
        _client = create_client(url, key)
    return _client


def upsert(table: str, data: list[dict], conflict_columns: list[str]) -> None:
    """Upsert rows — ignora duplicatas, atualiza se já existe.
    conflict_columns NÃO pode ser lista vazia — use insert() para inserções sem conflito.
    """
    if not conflict_columns:
        raise ValueError(f"upsert() requer conflict_columns não-vazio para tabela {table!r}")
    client = get_client()
    client.table(table).upsert(data, on_conflict=",".join(conflict_columns)).execute()


def insert(table: str, data: list[dict]) -> None:
    """INSERT puro sem upsert — para tabelas sem chave de conflito natural."""
    get_client().table(table).insert(data).execute()
