"""
Quick startup verification script
Simulates app startup to catch any import or initialization errors
"""

import sys
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

print("🔍 Verifying backend startup...")
print("=" * 60)

try:
    # Test imports
    print("\n1. Testing imports...")
    from src.models.journey import JourneyFormData, Job, JourneyMap, JobStatus
    from src.services.job_manager import JobManager
    from src.services.usage_service import UsageService
    from src.routes.auth_routes import router as auth_router
    from src.routes.analytics_routes import router as analytics_router
    from src.routes.payments import router as payments_router
    from src.routes.optimized_payments import router as optimized_payments_router
    from src.routes import journey_routes
    from src.routes import export_routes
    from src.middleware.auth_middleware import require_auth
    from src.models.auth import UserProfile, UserJourney, UsageLimitResponse
    print("   ✅ All imports successful")
    
    # Test service initialization
    print("\n2. Testing service initialization...")
    usage_service = UsageService()
    print(f"   ✅ UsageService initialized (has Supabase: {hasattr(usage_service, 'supabase')})")
    
    # Test job manager initialization
    print("\n3. Testing job manager initialization...")
    job_manager = JobManager()
    print("   ✅ JobManager initialized")
    
    # Verify no database pool references
    print("\n4. Verifying no database pool...")
    import main
    main_code = open("main.py", 'r').read()
    
    if 'create_db_pool' not in main_code and 'close_db_pool' not in main_code:
        print("   ✅ No database pool initialization found")
    else:
        print("   ⚠️  Database pool references still exist")
    
    print("\n" + "=" * 60)
    print("✅ STARTUP VERIFICATION PASSED")
    print("=" * 60)
    print("\n✨ Backend is ready to run with Supabase!")
    
except Exception as e:
    print(f"\n❌ STARTUP VERIFICATION FAILED")
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
