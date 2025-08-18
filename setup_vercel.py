#!/usr/bin/env python3
"""
Quick setup script for Vercel deployment
Prepares the necessary files and provides deployment instructions
"""

import os
import shutil
import json

def create_vercel_deployment_package():
    """Create a clean package ready for Vercel deployment"""
    
    print("🚀 Setting up Vercel deployment package...")
    
    # Create deployment directory
    deploy_dir = "vercel-deployment"
    if os.path.exists(deploy_dir):
        shutil.rmtree(deploy_dir)
    os.makedirs(deploy_dir)
    os.makedirs(f"{deploy_dir}/api")
    
    print(f"📁 Created deployment directory: {deploy_dir}/")
    
    # Files to copy for Vercel deployment
    files_to_copy = [
        ("vercel.json", "vercel.json"),
        ("requirements-vercel.txt", "requirements-vercel.txt"),
        ("api/proxy.py", "api/proxy.py"),
        ("VERCEL_DEPLOY.md", "README.md")
    ]
    
    for src, dst in files_to_copy:
        if os.path.exists(src):
            shutil.copy2(src, f"{deploy_dir}/{dst}")
            print(f"✅ Copied: {src} → {deploy_dir}/{dst}")
        else:
            print(f"❌ Missing: {src}")
    
    # Create a simple .gitignore
    gitignore_content = """# Vercel
.vercel

# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/

# Local development
.env
.env.local
"""
    
    with open(f"{deploy_dir}/.gitignore", "w") as f:
        f.write(gitignore_content)
    print(f"✅ Created: {deploy_dir}/.gitignore")
    
    # Create package.json for better Vercel detection
    package_json = {
        "name": "betrmint-wen-proxy",
        "version": "1.0.0",
        "description": "Farcaster API Proxy for WEN Counter Tools",
        "scripts": {
            "dev": "vercel dev",
            "deploy": "vercel --prod"
        }
    }
    
    with open(f"{deploy_dir}/package.json", "w") as f:
        json.dump(package_json, f, indent=2)
    print(f"✅ Created: {deploy_dir}/package.json")
    
    print("\n" + "="*60)
    print("🎉 VERCEL DEPLOYMENT PACKAGE READY!")
    print("="*60)
    print(f"📦 Package location: {deploy_dir}/")
    print("\n📋 Files included:")
    for root, dirs, files in os.walk(deploy_dir):
        for file in files:
            rel_path = os.path.relpath(os.path.join(root, file), deploy_dir)
            print(f"   📄 {rel_path}")
    
    print("\n🚀 NEXT STEPS:")
    print("="*60)
    print("1. Create a GitHub repository (e.g., 'betrmint-wen-proxy')")
    print("2. Upload the contents of 'vercel-deployment/' to your repo")
    print("3. Go to https://vercel.com/dashboard")
    print("4. Click 'New Project' and import from GitHub")
    print("5. Select your repository and deploy!")
    print("\n📖 For detailed instructions, see VERCEL_DEPLOY.md")
    
    print("\n💻 Quick GitHub upload commands:")
    print("-"*40)
    print(f"cd {deploy_dir}")
    print("git init")
    print("git add .")
    print("git commit -m 'Initial Vercel deployment'")
    print("git remote add origin https://github.com/YOUR_USERNAME/betrmint-wen-proxy.git")
    print("git push -u origin main")
    
    return deploy_dir

def main():
    print("🔧 Vercel Deployment Setup")
    print("="*60)
    
    # Check if we have all required files
    required_files = ["vercel.json", "requirements-vercel.txt", "api/proxy.py", "VERCEL_DEPLOY.md"]
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files:
        print("❌ Missing required files:")
        for f in missing_files:
            print(f"   - {f}")
        print("\n🔧 Please ensure all files are present before running setup.")
        return
    
    # Create deployment package
    deploy_dir = create_vercel_deployment_package()
    
    print("\n✨ Setup complete!")
    print(f"📁 Your Vercel deployment package is ready in: {deploy_dir}/")
    
    # Offer to show file contents for verification
    response = input("\n🔍 Would you like to verify the vercel.json configuration? (y/n): ").lower().strip()
    if response == 'y':
        try:
            with open(f"{deploy_dir}/vercel.json", "r") as f:
                config = json.load(f)
            print("\n📋 vercel.json contents:")
            print("-" * 30)
            print(json.dumps(config, indent=2))
        except Exception as e:
            print(f"❌ Error reading vercel.json: {e}")

if __name__ == "__main__":
    main()
