#!/usr/bin/env python3
"""
Redeploy Neon WEN Dashboard to Vercel with Backend Integration
This script redeploys the updated dashboard that includes the backend API
"""

import os
import subprocess
import sys

def check_vercel_cli():
    """Check if Vercel CLI is installed"""
    try:
        result = subprocess.run(['npx', 'vercel', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Vercel CLI found: {result.stdout.strip()}")
            return True
        else:
            return False
    except FileNotFoundError:
        return False

def check_files():
    """Check if all required files exist"""
    required_files = [
        'neon-tracking.html',
        'neon-tracking.css', 
        'neon-tracking.js',
        'vercel.json',
        'api/wen-data.py',
        'api/requirements.txt'
    ]
    
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing required files: {', '.join(missing_files)}")
        return False
    
    print("✅ All required files found!")
    return True

def redeploy_to_vercel():
    """Redeploy to Vercel"""
    print("🚀 Redeploying to Vercel with backend integration...")
    
    try:
        # Deploy to Vercel
        result = subprocess.run(['npx', 'vercel', '--prod'], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Redeployment successful!")
            print("\n📋 Deployment output:")
            print(result.stdout)
            
            # Look for the deployment URL
            if 'https://' in result.stdout:
                lines = result.stdout.split('\n')
                for line in lines:
                    if 'https://' in line and 'vercel.app' in line:
                        print(f"\n🌐 Your dashboard is available at: {line.strip()}")
                        break
                        
            print("\n🎉 Your dashboard now has:")
            print("   ✅ Frontend (neon-tracking.html)")
            print("   ✅ Backend API (/api/wen-data)")
            print("   ✅ No more demo mode!")
            print("   ✅ Real Farcaster API integration")
            
        else:
            print("❌ Redeployment failed!")
            print("Error output:")
            print(result.stderr)
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Redeployment error: {e}")
        return False
    
    return True

def main():
    print("🎯 Neon WEN Dashboard Vercel Redeployment")
    print("=" * 50)
    print("This will deploy the dashboard WITH backend integration")
    print("No more demo mode - real Farcaster API calls!")
    print("=" * 50)
    
    # Check if Vercel CLI is installed
    if not check_vercel_cli():
        print("❌ Vercel CLI not found!")
        print("Please install it first:")
        print("   npm i -g vercel")
        print("   or")
        print("   pip install vercel")
        return
    
    # Check if all required files exist
    if not check_files():
        print("❌ Please ensure all required files are present")
        print("\nRequired files:")
        print("  - neon-tracking.html")
        print("  - neon-tracking.css") 
        print("  - neon-tracking.js")
        print("  - vercel.json")
        print("  - api/wen-data.py")
        print("  - api/requirements.txt")
        return
    
    # Confirm redeployment
    print("\n📝 What's new in this deployment:")
    print("   🆕 Backend API integration")
    print("   🆕 No more localhost dependency")
    print("   🆕 Real Farcaster API calls")
    print("   🆕 Automatic CORS handling")
    
    choice = input("\nProceed with redeployment? (y/n): ").lower()
    if choice != 'y':
        print("❌ Redeployment cancelled")
        return
    
    # Redeploy to Vercel
    if redeploy_to_vercel():
        print("\n🎉 Redeployment completed successfully!")
        print("\n📝 What happens next:")
        print("1. Your dashboard will be available at your Vercel URL")
        print("2. Enter your Farcaster API URL and Token")
        print("3. Click 'Test Connection' to verify")
        print("4. Start monitoring - no more demo mode!")
        print("\n🔗 API Endpoints:")
        print("   - /api/wen-data (for WEN data)")
        print("   - /api/test-connection (for testing)")
    else:
        print("\n❌ Redeployment failed. Please check the error messages above.")

if __name__ == "__main__":
    main()
