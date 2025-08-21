#!/usr/bin/env python3
"""
Deploy Neon WEN Dashboard to Vercel
This script helps deploy the neon-tracking.html dashboard to Vercel
"""

import os
import subprocess
import sys

def check_vercel_cli():
    """Check if Vercel CLI is installed"""
    try:
        result = subprocess.run(['vercel', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Vercel CLI found: {result.stdout.strip()}")
            return True
        else:
            return False
    except FileNotFoundError:
        return False

def install_vercel_cli():
    """Install Vercel CLI if not present"""
    print("📦 Installing Vercel CLI...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'vercel'], check=True)
        print("✅ Vercel CLI installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Vercel CLI: {e}")
        return False

def check_files():
    """Check if required files exist"""
    required_files = ['neon-tracking.html', 'neon-tracking.css', 'neon-tracking.js', 'vercel.json']
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing required files: {', '.join(missing_files)}")
        return False
    
    print("✅ All required files found!")
    return True

def deploy_to_vercel():
    """Deploy to Vercel"""
    print("🚀 Deploying to Vercel...")
    
    try:
        # Deploy to Vercel
        result = subprocess.run(['vercel', '--prod'], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Deployment successful!")
            print("\n📋 Deployment output:")
            print(result.stdout)
            
            # Look for the deployment URL
            if 'https://' in result.stdout:
                lines = result.stdout.split('\n')
                for line in lines:
                    if 'https://' in line and 'vercel.app' in line:
                        print(f"\n🌐 Your dashboard is available at: {line.strip()}")
                        break
        else:
            print("❌ Deployment failed!")
            print("Error output:")
            print(result.stderr)
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Deployment error: {e}")
        return False
    
    return True

def main():
    print("🎯 Neon WEN Dashboard Vercel Deployment")
    print("=" * 50)
    
    # Check if Vercel CLI is installed
    if not check_vercel_cli():
        print("❌ Vercel CLI not found!")
        choice = input("Would you like to install it now? (y/n): ").lower()
        if choice == 'y':
            if not install_vercel_cli():
                print("❌ Failed to install Vercel CLI. Please install manually:")
                print("   npm i -g vercel")
                print("   or")
                print("   pip install vercel")
                return
        else:
            print("❌ Vercel CLI is required for deployment")
            return
    
    # Check if required files exist
    if not check_files():
        print("❌ Please ensure all required files are present")
        return
    
    # Deploy to Vercel
    if deploy_to_vercel():
        print("\n🎉 Deployment completed successfully!")
        print("\n📝 Next steps:")
        print("1. Configure your custom domain 'betr-wen.leovido.xyz' in Vercel dashboard")
        print("2. Update DNS records to point to Vercel")
        print("3. Your dashboard will be available at your custom domain!")
    else:
        print("\n❌ Deployment failed. Please check the error messages above.")

if __name__ == "__main__":
    main()
