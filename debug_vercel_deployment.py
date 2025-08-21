#!/usr/bin/env python3
"""
Debug Vercel Deployment Issues
This script helps identify and fix common Vercel deployment problems
"""

import os
import subprocess
import json

def check_file_structure():
    """Check if all required files exist and are properly structured"""
    print("🔍 Checking file structure...")
    
    required_files = [
        'neon-tracking.html',
        'neon-tracking.css',
        'neon-tracking.js',
        'vercel.json',
        'api/wen-data-minimal.py',
        'api/runtime.txt'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing files: {', '.join(missing_files)}")
        return False
    else:
        print("✅ All required files present")
        return True

def check_vercel_config():
    """Check Vercel configuration"""
    print("\n🔍 Checking Vercel configuration...")
    
    try:
        with open('vercel.json', 'r') as f:
            config = json.load(f)
        
        print("✅ vercel.json is valid JSON")
        
        # Check for required fields
        if 'version' not in config:
            print("❌ Missing 'version' field")
            return False
        
        if 'functions' not in config:
            print("❌ Missing 'functions' field")
            return False
        
        if 'routes' not in config:
            print("❌ Missing 'routes' field")
            return False
        
        print("✅ All required configuration fields present")
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in vercel.json: {e}")
        return False
    except Exception as e:
        print(f"❌ Error reading vercel.json: {e}")
        return False

def check_python_function():
    """Check if the Python function is valid"""
    print("\n🔍 Checking Python function...")
    
    try:
        with open('api/wen-data-minimal.py', 'r') as f:
            content = f.read()
        
        # Check for required elements
        if 'def handler(' not in content:
            print("❌ Missing 'handler' function")
            return False
        
        if 'request.json' not in content:
            print("❌ Missing request.json access")
            return False
        
        if 'statusCode' not in content:
            print("❌ Missing statusCode in response")
            return False
        
        print("✅ Python function looks valid")
        return True
        
    except Exception as e:
        print(f"❌ Error reading Python function: {e}")
        return False

def check_vercel_cli():
    """Check if Vercel CLI is working"""
    print("\n🔍 Checking Vercel CLI...")
    
    try:
        # Check version
        result = subprocess.run(['npx', 'vercel', '--version'], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print(f"✅ Vercel CLI working: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ Vercel CLI error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Vercel CLI timeout")
        return False
    except Exception as e:
        print(f"❌ Vercel CLI error: {e}")
        return False

def test_local_function():
    """Test the function locally"""
    print("\n🔍 Testing function locally...")
    
    try:
        # Import and test the function
        import sys
        sys.path.append('api')
        
        import importlib.util
        spec = importlib.util.spec_from_file_location("wen_data_minimal", "api/wen-data-minimal.py")
        wen_data_minimal = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(wen_data_minimal)
        
        # Mock request
        class MockRequest:
            def __init__(self, method, path, data):
                self.method = method
                self.path = path
                self.json = data
        
        class MockContext:
            pass
        
        # Test
        mock_request = MockRequest('POST', '/api/test-connection', {'apiUrl': 'test', 'apiToken': 'test'})
        mock_context = MockContext()
        
        result = wen_data_minimal.handler(mock_request, mock_context)
        
        if result and 'statusCode' in result:
            print(f"✅ Function works locally: Status {result['statusCode']}")
            return True
        else:
            print("❌ Function returned invalid response")
            return False
            
    except Exception as e:
        print(f"❌ Local function test failed: {e}")
        return False

def suggest_fixes():
    """Suggest fixes based on what we found"""
    print("\n🔧 Suggested fixes:")
    print("=" * 40)
    
    print("1. **If files are missing:**")
    print("   - Run: python3 quick_redeploy.py")
    print("   - Or manually create missing files")
    
    print("\n2. **If vercel.json is invalid:**")
    print("   - Check JSON syntax")
    print("   - Ensure all required fields are present")
    
    print("\n3. **If Python function is invalid:**")
    print("   - Check for syntax errors")
    print("   - Ensure 'handler' function exists")
    
    print("\n4. **If Vercel CLI is broken:**")
    print("   - Run: npm install -g vercel")
    print("   - Or use: npx vercel --prod")
    
    print("\n5. **If function works locally but not on Vercel:**")
    print("   - Check Python version compatibility")
    print("   - Ensure no external dependencies")
    print("   - Try the minimal version first")

def main():
    print("🐛 Vercel Deployment Debugger")
    print("=" * 40)
    
    checks = [
        check_file_structure,
        check_vercel_config,
        check_python_function,
        check_vercel_cli,
        test_local_function
    ]
    
    all_passed = True
    for check in checks:
        if not check():
            all_passed = False
    
    print("\n" + "=" * 40)
    if all_passed:
        print("🎉 All checks passed! Your deployment should work.")
        print("\n📝 Next steps:")
        print("1. Deploy: npx vercel --prod")
        print("2. Test the endpoints")
        print("3. Check Vercel logs if issues persist")
    else:
        print("❌ Some checks failed. See suggestions below.")
        suggest_fixes()

if __name__ == "__main__":
    main()
