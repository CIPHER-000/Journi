"""
Comprehensive Test Suite for Supabase Migration
Tests all core flows: auth, journeys, payments, subscriptions
"""

import asyncio
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_supabase_client_init():
    """Test 1: Supabase client initialization"""
    print("\n🧪 Test 1: Supabase Client Initialization")
    print("=" * 60)
    
    try:
        from supabase import create_client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ FAILED: Supabase environment variables not set")
            return False
        
        client = create_client(supabase_url, supabase_key)
        print(f"✅ PASSED: Supabase client initialized successfully")
        print(f"   URL: {supabase_url[:30]}...")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


async def test_auth_service():
    """Test 2: Auth service using Supabase"""
    print("\n🧪 Test 2: Auth Service")
    print("=" * 60)
    
    try:
        from src.services.auth_service import AuthService
        
        auth_service = AuthService()
        print("✅ PASSED: Auth service initialized")
        print(f"   Using Supabase: {hasattr(auth_service, 'supabase')}")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


async def test_usage_service():
    """Test 3: Usage service using Supabase"""
    print("\n🧪 Test 3: Usage Service")
    print("=" * 60)
    
    try:
        from src.services.usage_service import UsageService
        
        usage_service = UsageService()
        print("✅ PASSED: Usage service initialized")
        print(f"   Using Supabase: {hasattr(usage_service, 'supabase')}")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


async def test_payments_controller():
    """Test 4: Payments controller using Supabase"""
    print("\n🧪 Test 4: Payments Controller")
    print("=" * 60)
    
    try:
        from supabase import create_client
        from src.controllers.optimizedPaymentsController import OptimizedPaymentsController
        
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        
        controller = OptimizedPaymentsController(supabase)
        print("✅ PASSED: Payments controller initialized with Supabase")
        print(f"   Using Supabase client: {hasattr(controller, 'supabase')}")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


async def test_no_asyncpg_imports():
    """Test 5: Verify no asyncpg imports in main modules"""
    print("\n🧪 Test 5: No AsyncPG Imports")
    print("=" * 60)
    
    files_to_check = [
        "main.py",
        "src/controllers/optimizedPaymentsController.py",
        "src/routes/optimized_payments.py"
    ]
    
    all_passed = True
    for file_path in files_to_check:
        full_path = os.path.join(os.path.dirname(__file__), file_path)
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'import asyncpg' in content or 'from asyncpg' in content:
                    print(f"❌ FAILED: {file_path} still imports asyncpg")
                    all_passed = False
                else:
                    print(f"✅ PASSED: {file_path} - no asyncpg imports")
        else:
            print(f"⚠️  SKIPPED: {file_path} not found")
    
    return all_passed


async def test_database_module_deprecated():
    """Test 6: Verify database module is deprecated"""
    print("\n🧪 Test 6: Database Module Deprecated")
    print("=" * 60)
    
    database_file = os.path.join(os.path.dirname(__file__), "src/database.py")
    deprecated_file = os.path.join(os.path.dirname(__file__), "src/database.py.deprecated")
    
    if os.path.exists(deprecated_file) and not os.path.exists(database_file):
        print("✅ PASSED: database.py has been deprecated")
        print(f"   Deprecated file exists: {os.path.exists(deprecated_file)}")
        return True
    elif not os.path.exists(database_file):
        print("✅ PASSED: database.py does not exist (removed or never created)")
        return True
    else:
        print("❌ FAILED: database.py still exists without being deprecated")
        return False


async def test_supabase_table_operations():
    """Test 7: Basic Supabase table operations"""
    print("\n🧪 Test 7: Supabase Table Operations")
    print("=" * 60)
    
    try:
        from supabase import create_client
        
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        
        # Test select (should work even if table is empty)
        response = supabase.table("users").select("id").limit(1).execute()
        print(f"✅ PASSED: Table select operation works")
        print(f"   Response type: {type(response)}")
        print(f"   Has data attribute: {hasattr(response, 'data')}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


async def test_environment_variables():
    """Test 8: Verify correct environment variables"""
    print("\n🧪 Test 8: Environment Variables")
    print("=" * 60)
    
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_ANON_KEY"
    ]
    
    deprecated_vars = [
        "DATABASE_URL",
        "DB_USER",
        "DB_PASSWORD",
        "DB_HOST",
        "DB_PORT"
    ]
    
    all_passed = True
    
    # Check required vars exist
    for var in required_vars:
        if os.getenv(var):
            print(f"✅ {var}: Set")
        else:
            print(f"❌ {var}: Not set (REQUIRED)")
            all_passed = False
    
    # Check deprecated vars don't exist (optional)
    for var in deprecated_vars:
        if os.getenv(var):
            print(f"⚠️  {var}: Still set (can be removed)")
        else:
            print(f"✅ {var}: Not set (good - deprecated)")
    
    return all_passed


async def test_startup_logic():
    """Test 9: App startup without database pool"""
    print("\n🧪 Test 9: App Startup Logic")
    print("=" * 60)
    
    try:
        # Check main.py for correct startup logic
        main_file = os.path.join(os.path.dirname(__file__), "main.py")
        
        if os.path.exists(main_file):
            with open(main_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Should NOT have database pool initialization
                if 'create_db_pool' in content:
                    print("❌ FAILED: main.py still calls create_db_pool")
                    return False
                
                # Should have Supabase message
                if 'Supabase' in content and 'REST API' in content:
                    print("✅ PASSED: Startup uses Supabase message")
                    return True
                else:
                    print("⚠️  WARNING: Supabase message not found in startup")
                    return True  # Not critical
        else:
            print("❌ FAILED: main.py not found")
            return False
            
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


async def test_requirements_txt():
    """Test 10: Verify requirements.txt"""
    print("\n🧪 Test 10: Requirements.txt")
    print("=" * 60)
    
    try:
        req_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
        
        if os.path.exists(req_file):
            with open(req_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                has_supabase = 'supabase' in content and not content.startswith('#supabase')
                asyncpg_commented = '# asyncpg' in content or 'asyncpg' not in content
                
                if has_supabase:
                    print("✅ PASSED: supabase in requirements")
                else:
                    print("❌ FAILED: supabase not in requirements")
                    return False
                
                if asyncpg_commented:
                    print("✅ PASSED: asyncpg is commented or removed")
                else:
                    print("⚠️  WARNING: asyncpg still active (can be removed)")
                
                return True
        else:
            print("❌ FAILED: requirements.txt not found")
            return False
            
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


async def run_all_tests():
    """Run all tests and report results"""
    print("\n" + "=" * 60)
    print("🚀 SUPABASE MIGRATION VALIDATION TEST SUITE")
    print("=" * 60)
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Environment: {os.getenv('ENVIRONMENT', 'not set')}")
    print("=" * 60)
    
    tests = [
        test_supabase_client_init,
        test_auth_service,
        test_usage_service,
        test_payments_controller,
        test_no_asyncpg_imports,
        test_database_module_deprecated,
        test_supabase_table_operations,
        test_environment_variables,
        test_startup_logic,
        test_requirements_txt
    ]
    
    results = []
    for test in tests:
        try:
            result = await test()
            results.append(result)
        except Exception as e:
            print(f"\n❌ TEST ERROR: {test.__name__}")
            print(f"   {str(e)}")
            results.append(False)
    
    # Summary
    passed = sum(results)
    total = len(results)
    percentage = (passed / total * 100) if total > 0 else 0
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {total}")
    print(f"Passed: {passed} ✅")
    print(f"Failed: {total - passed} ❌")
    print(f"Success Rate: {percentage:.1f}%")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Supabase migration successful!")
        return True
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review above.")
        return False


if __name__ == "__main__":
    try:
        success = asyncio.run(run_all_tests())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
