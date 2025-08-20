#!/usr/bin/env python3
"""
Startup script for Neon WEN Monitor
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-neon.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_wen_counter():
    """Check if wen_counter.py exists"""
    if not os.path.exists("wen_counter.py"):
        print("❌ Warning: wen_counter.py not found in current directory")
        print("   The monitor will work in demo mode only")
        return False
    else:
        print("✅ wen_counter.py found")
        return True

def start_server():
    """Start the Flask server"""
    print("🚀 Starting Neon WEN Monitor Backend...")
    try:
        subprocess.run([sys.executable, "neon_backend.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")

def main():
    print("🎯 Neon WEN Monitor Startup")
    print("=" * 40)
    
    # Check if wen_counter.py exists
    wen_counter_available = check_wen_counter()
    
    # Install requirements
    if not install_requirements():
        print("❌ Cannot continue without dependencies")
        return
    
    print("\n🌐 Starting web server...")
    print("📡 The monitor will be available at: http://localhost:5000")
    print("⏹️  Press Ctrl+C to stop the server")
    print()
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()