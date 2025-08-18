#!/usr/bin/env python3
"""
Start WEN Monitor Dashboard
Installs dependencies and starts the web server
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-web.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_server():
    """Start the Flask web server"""
    print("🚀 Starting WEN Monitor Web Server...")
    try:
        # Import and run the server
        from web_server import app
        app.run(host='0.0.0.0', port=5000, debug=True)
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure you're in the correct directory and all files exist")
        return False
    except Exception as e:
        print(f"❌ Server error: {e}")
        return False

if __name__ == "__main__":
    print("🎯 WEN Monitor Dashboard Startup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists("web_server.py"):
        print("❌ Error: web_server.py not found!")
        print("💡 Make sure you're running this from the project directory")
        sys.exit(1)
    
    # Install dependencies
    if not install_requirements():
        print("❌ Failed to install dependencies. Exiting.")
        sys.exit(1)
    
    # Start server
    print("\n🌐 Starting server...")
    print("📱 Dashboard will be available at: http://localhost:5000")
    print("⏹️  Press Ctrl+C to stop the server")
    print()
    
    start_server()
