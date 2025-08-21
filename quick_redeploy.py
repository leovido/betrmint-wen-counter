#!/usr/bin/env python3
"""
Quick redeploy of the fixed API to Vercel
"""

import subprocess
import sys

def main():
    print("🚀 Quick Redeploy to Vercel")
    print("=" * 40)
    print("This will deploy the fixed API that should resolve FUNCTION_INVOCATION_FAILED")
    print()
    
    # Check if Vercel CLI is available
    try:
        result = subprocess.run(['npx', 'vercel', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Vercel CLI found: {result.stdout.strip()}")
        else:
            print("❌ Vercel CLI not working with npx")
            return
    except Exception as e:
        print(f"❌ Error checking Vercel CLI: {e}")
        return
    
    # Deploy
    print("\n🚀 Deploying to Vercel...")
    try:
        result = subprocess.run(['npx', 'vercel', '--prod'], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Deployment successful!")
            print("\n📋 Output:")
            print(result.stdout)
            
            # Look for URL
            if 'https://' in result.stdout:
                lines = result.stdout.split('\n')
                for line in lines:
                    if 'https://' in line and 'vercel.app' in line:
                        print(f"\n🌐 Your dashboard: {line.strip()}")
                        break
            
            print("\n🎉 The FUNCTION_INVOCATION_FAILED error should now be fixed!")
            print("\n📝 What was fixed:")
            print("   ✅ Simplified API structure")
            print("   ✅ Removed complex imports")
            print("   ✅ Better error handling")
            print("   ✅ Proper CORS support")
            
        else:
            print("❌ Deployment failed!")
            print("Error output:")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Deployment error: {e}")

if __name__ == "__main__":
    main()
