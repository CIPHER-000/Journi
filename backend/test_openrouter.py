"""
Quick test script for OpenRouter service integration
Run this to verify OpenRouter is working before deploying
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.append(os.path.dirname(__file__))

from src.services.openrouter_service import openrouter_service


async def test_api_key_validation():
    """Test 1: Validate API key"""
    print("\n🧪 Test 1: API Key Validation")
    print("=" * 50)
    
    result = await openrouter_service.validate_api_key()
    
    if result['is_valid']:
        print("✅ API key is VALID")
    else:
        print(f"❌ API key validation FAILED: {result['error_message']}")
    
    return result['is_valid']


async def test_simple_completion():
    """Test 2: Simple completion"""
    print("\n🧪 Test 2: Simple Completion")
    print("=" * 50)
    
    result = await openrouter_service.generate_completion(
        prompt="Say 'Hello from OpenRouter' in exactly 5 words.",
        max_tokens=20,
        temperature=0.7
    )
    
    if result['success']:
        print(f"✅ Completion SUCCESS")
        print(f"📝 Response: {result['content']}")
        print(f"🤖 Model: {result['model']}")
        print(f"📊 Tokens: {result['usage']}")
    else:
        print(f"❌ Completion FAILED: {result['error']}")
    
    return result['success']


async def test_chat_completion():
    """Test 3: Chat completion"""
    print("\n🧪 Test 3: Chat Completion")
    print("=" * 50)
    
    messages = [
        {"role": "system", "content": "You are a helpful assistant. Be concise."},
        {"role": "user", "content": "What is customer journey mapping in one sentence?"}
    ]
    
    result = await openrouter_service.generate_chat_completion(
        messages=messages,
        max_tokens=50,
        temperature=0.7
    )
    
    if result['success']:
        print(f"✅ Chat completion SUCCESS")
        print(f"📝 Response: {result['content']}")
        print(f"🎯 Finish reason: {result['finish_reason']}")
    else:
        print(f"❌ Chat completion FAILED: {result['error']}")
    
    return result['success']


async def test_crewai_integration():
    """Test 4: CrewAI LLM integration"""
    print("\n🧪 Test 4: CrewAI LLM Integration")
    print("=" * 50)
    
    try:
        llm = openrouter_service.get_llm_for_crewai(
            model="openai/gpt-3.5-turbo",
            temperature=0.7
        )
        print(f"✅ LLM instance created successfully")
        print(f"🤖 Model: {llm.model_name}")
        print(f"🌡️  Temperature: {llm.temperature}")
        return True
    except Exception as e:
        print(f"❌ LLM creation FAILED: {str(e)}")
        return False


async def test_error_handling():
    """Test 5: Error handling with invalid input"""
    print("\n🧪 Test 5: Error Handling")
    print("=" * 50)
    
    # Save original API key
    original_key = os.getenv("OPENROUTER_API_KEY")
    
    # Test with invalid key
    os.environ['OPENROUTER_API_KEY'] = "invalid-key-test"
    
    # Recreate service with invalid key
    from src.services.openrouter_service import OpenRouterService
    test_service = OpenRouterService()
    
    result = await test_service.generate_completion(
        prompt="This should fail",
        max_tokens=10
    )
    
    # Restore original key
    os.environ['OPENROUTER_API_KEY'] = original_key
    
    if not result['success']:
        print(f"✅ Error handling works correctly")
        print(f"📝 Error message: {result['error']}")
        return True
    else:
        print(f"❌ Error handling FAILED: Should have returned error")
        return False


async def main():
    """Run all tests"""
    print("\n" + "=" * 50)
    print("🚀 OpenRouter Service Integration Tests")
    print("=" * 50)
    
    # Check if API key is configured
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("\n❌ ERROR: OPENROUTER_API_KEY not configured in .env")
        print("Please add your OpenRouter API key to .env file")
        return
    
    print(f"\n🔑 API Key: {api_key[:20]}..." if len(api_key) > 20 else api_key)
    print(f"🌐 Base URL: {os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')}")
    print(f"🤖 Model: {os.getenv('OPENROUTER_MODEL', 'openai/gpt-3.5-turbo')}")
    
    # Run tests
    results = []
    
    try:
        results.append(("API Key Validation", await test_api_key_validation()))
        results.append(("Simple Completion", await test_simple_completion()))
        results.append(("Chat Completion", await test_chat_completion()))
        results.append(("CrewAI Integration", await test_crewai_integration()))
        results.append(("Error Handling", await test_error_handling()))
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ All tests PASSED! OpenRouter is ready to use.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review errors above.")


if __name__ == "__main__":
    asyncio.run(main())
