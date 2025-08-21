#!/usr/bin/env python3
"""
Deploy and Test Vercel Function
This script deploys the ultra-minimal function and tests it to isolate the issue
"""

import subprocess
import time
import requests
import json

def deploy_to_vercel():
    """Deploy to Vercel"""
    print("🚀 Deploying ultra-minimal function to Vercel...")
    
    try:
        result = subprocess.run(['npx', 'vercel', '--prod'], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ Deployment successful!")
            
            # Extract the URL
            deployment_url = None
            for line in result.stdout.split('\n'):
                if 'https://' in line and 'vercel.app' in line:
                    deployment_url = line.strip()
                    break
            
            if deployment_url:
                print(f"🌐 Deployment URL: {deployment_url}")
                return deployment_url
            else:
                print("❌ Could not find deployment URL")
                return None
        else:
            print("❌ Deployment failed!")
            print("Error output:")
            print(result.stderr)
            return None
            
    except subprocess.TimeoutExpired:
        print("❌ Deployment timed out")
        return None
    except Exception as e:
        print(f"❌ Deployment error: {e}")
        return None

def test_endpoint(base_url, endpoint):
    """Test a specific endpoint"""
    url = f"{base_url}{endpoint}"
    print(f"\n🧪 Testing {endpoint}...")
    
    try:
        # Test OPTIONS (CORS preflight)
        print("  Testing OPTIONS request...")
        response = requests.options(url, timeout=10)
        print(f"    Status: {response.status_code}")
        print(f"    CORS Headers: {dict(response.headers)}")
        
        # Test POST request
        print("  Testing POST request...")
        response = requests.post(url, json={'test': 'data'}, timeout=10)
        print(f"    Status: {response.status_code}")
        print(f"    Response: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"    ❌ Error: {e}")
        return False

def wait_for_deployment():
    """Wait a bit for deployment to propagate"""
    print("\n⏳ Waiting for deployment to propagate...")
    for i in range(10):
        print(f"  {i+1}/10 seconds...")
        time.sleep(1)
    print("  Deployment should be ready now!")

def main():
    print("🔧 Deploy and Test Vercel Function")
    print("=" * 50)
    
    # Deploy
    deployment_url = deploy_to_vercel()
    if not deployment_url:
        print("❌ Deployment failed. Cannot proceed with testing.")
        return
    
    # Wait for deployment to propagate
    wait_for_deployment()
    
    # Test endpoints
    print("\n🧪 Testing endpoints...")
    
    # Remove trailing slash if present
    base_url = deployment_url.rstrip('/')
    
    # Test both endpoints
    test_results = []
    test_results.append(test_endpoint(base_url, '/api/test-connection'))
    test_results.append(test_endpoint(base_url, '/api/wen-data'))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"  /api/test-connection: {'✅ PASS' if test_results[0] else '❌ FAIL'}")
    print(f"  /api/wen-data: {'✅ PASS' if test_results[1] else '❌ FAIL'}")
    
    if all(test_results):
        print("\n🎉 All tests passed! Your API is working.")
        print(f"\n🌐 Your dashboard: {base_url}")
        print("📝 Next steps:")
        print("1. Test the dashboard in your browser")
        print("2. Enter your Farcaster API credentials")
        print("3. Start monitoring!")
    else:
        print("\n❌ Some tests failed. Check the error messages above.")
        print("\n🔍 Debugging tips:")
        print("1. Check Vercel dashboard for function logs")
        print("2. Verify the function is deployed correctly")
        print("3. Check if there are any runtime errors")

if __name__ == "__main__":
    main()
