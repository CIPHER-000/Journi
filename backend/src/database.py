"""
Database Connection Pool Management
Provides AsyncPG connection pool for Supabase PostgreSQL
"""

import os
import asyncpg
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Global connection pool
_db_pool: Optional[asyncpg.Pool] = None


async def create_db_pool() -> asyncpg.Pool:
    """
    Create AsyncPG connection pool for Supabase
    
    Returns:
        asyncpg.Pool: Database connection pool
    """
    global _db_pool
    
    if _db_pool is not None:
        return _db_pool
    
    # Get database URL from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url:
        raise ValueError("SUPABASE_URL environment variable not set")
    
    # Extract database connection info from Supabase URL
    # Format: https://xxx.supabase.co -> database at db.xxx.supabase.co
    project_id = supabase_url.replace("https://", "").replace(".supabase.co", "")
    
    # Connection string format
    db_host = f"db.{project_id}.supabase.co"
    db_port = 5432
    db_name = "postgres"
    db_user = "postgres"
    db_password = os.getenv("SUPABASE_DB_PASSWORD", "your-db-password")
    
    try:
        _db_pool = await asyncpg.create_pool(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password,
            min_size=2,
            max_size=10,
            command_timeout=60
        )
        
        logger.info(f"Database pool created successfully: {db_host}")
        return _db_pool
        
    except Exception as e:
        logger.error(f"Failed to create database pool: {str(e)}")
        raise


async def get_db_pool() -> asyncpg.Pool:
    """
    Get database connection pool (creates if doesn't exist)
    
    Returns:
        asyncpg.Pool: Database connection pool
    """
    global _db_pool
    
    if _db_pool is None:
        _db_pool = await create_db_pool()
    
    return _db_pool


async def close_db_pool():
    """Close database connection pool"""
    global _db_pool
    
    if _db_pool is not None:
        await _db_pool.close()
        _db_pool = None
        logger.info("Database pool closed")


async def get_db_connection():
    """
    Get a single database connection from pool
    Legacy function for compatibility
    
    Returns:
        asyncpg.Connection: Database connection
    """
    pool = await get_db_pool()
    return await pool.acquire()
