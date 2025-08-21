#!/usr/bin/env python3
"""
Test the API function locally before deploying to Vercel
"""

import json
import sys
import os

# Add the api directory to path
sys.path.append('api')

try:
    # Import the handler function from the correct filename
    import importlib.util
    spec = importlib.util.spec_from_file_location("wen_data_simple", "api/wen-data-simple.py")
    wen_data_simple = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(wen_data_simple)
    handler = wen_data_simple.handler
    
    # Mock request object
    class MockRequest:
        def __init__(self, method, path, data):
            self.method = method
            self.path = path
            self.json = data
    
    class MockContext:
        pass
    
    # Test data
    test_data = {
        'apiUrl': 'https://client.farcaster.xyz/v2/direct-cast-conversation-messages?conversationId=7048a08fe1f2e0a3&messageId=38c49cfaafb6a73f4b954da4e7b878c1&limit=50',
        'apiToken': 'test-token',
        'fetchMode': 'recent',
        'maxPages': 2,
        'targetHours': 24,
        'todayOnly': False
    }
    
    print("🧪 Testing API function locally...")
    print("=" * 50)
    
    # Test 1: Test connection
    print("\n1️⃣ Testing connection endpoint...")
    mock_request = MockRequest('POST', '/api/test-connection', test_data)
    mock_context = MockContext()
    
    try:
        result = handler(mock_request, mock_context)
        print(f"✅ Status: {result['statusCode']}")
        print(f"📋 Response: {result['body']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: WEN data endpoint
    print("\n2️⃣ Testing WEN data endpoint...")
    mock_request = MockRequest('POST', '/api/wen-data', test_data)
    
    try:
        result = handler(mock_request, mock_context)
        print(f"✅ Status: {result['statusCode']}")
        print(f"📋 Response: {result['body']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: CORS preflight
    print("\n3️⃣ Testing CORS preflight...")
    mock_request = MockRequest('OPTIONS', '/api/wen-data', {})
    
    try:
        result = handler(mock_request, mock_context)
        print(f"✅ Status: {result['statusCode']}")
        print(f"📋 Headers: {result['headers']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🎉 Local testing completed!")
    print("\n📝 Next steps:")
    print("1. If all tests pass, deploy to Vercel")
    print("2. If tests fail, check the error messages above")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're in the correct directory")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    import traceback
    traceback.print_exc()
