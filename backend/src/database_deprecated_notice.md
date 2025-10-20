# Database Module - Deprecated

**Status:** DEPRECATED as of 2025-01-20

## Why Deprecated?

The direct PostgreSQL connection pool (`database.py`) has been fully replaced by **Supabase REST API** integration.

## Migration Summary

- **Before:** Used `asyncpg` for direct PostgreSQL connections
- **After:** Using Supabase Python client for all database operations via REST API

## What Changed

1. **Payments Controller**: Now uses `supabase.table()` instead of raw SQL with `asyncpg`
2. **All Services**: Auth, usage tracking, journeys all use Supabase client
3. **Startup/Shutdown**: No more database pool initialization/cleanup

## Benefits

- ✅ Consistent API across all services
- ✅ Built-in connection pooling via Supabase
- ✅ Better error handling
- ✅ Automatic retries and rate limiting
- ✅ No need to manage connection pool lifecycle
- ✅ Simplified deployment (no DB credentials needed)

## If You Need Database Access

Use the Supabase client:

```python
from supabase import create_client

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Query example
response = supabase.table("users").select("*").eq("id", user_id).execute()
```

## Environment Variables

**Removed:**
- `DATABASE_URL`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `SUPABASE_DB_PASSWORD`

**Required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

The old `database.py.deprecated` file is kept for reference only.
