#!/usr/bin/env python3
"""
🎯 Neon WEN Monitor Startup Script
===================================

This script automatically:
1. Installs required Python dependencies
2. Checks for wen_counter.py availability
3. Starts the Flask web server
4. Opens the monitor in your browser

Usage: python3 start_neon_monitor.py
"""

import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

def print_banner():
    """Print the startup banner"""
    print("🎯" + "="*50)
    print("   NEON WEN MONITOR STARTUP")
    print("="*50)
    print()

def install_requirements():
    """Install required Python packages"""
    print("📦 Installing dependencies...")
    
    requirements_file = "requirements-neon.txt"
    
    if not os.path.exists(requirements_file):
        print(f"❌ {requirements_file} not found. Creating it...")
        create_requirements_file()
    
    try:
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dependencies installed successfully!")
            return True
        else:
            print(f"❌ Failed to install dependencies:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def create_requirements_file():
    """Create the requirements file if it doesn't exist"""
    requirements = """Flask==2.3.3
flask-cors==4.0.0
requests==2.31.0"""
    
    with open("requirements-neon.txt", "w") as f:
        f.write(requirements)
    
    print("✅ Created requirements-neon.txt")

def check_wen_counter():
    """Check if wen_counter.py is available"""
    if os.path.exists("wen_counter.py"):
        print("✅ wen_counter.py found - Full functionality available")
        return True
    else:
        print("⚠️  wen_counter.py not found - Limited functionality")
        print("   Some features may not work without the core WEN counter")
        return False

def start_server():
    """Start the Flask web server"""
    print("\n🌐 Starting web server...")
    
    # Check if neon_backend.py exists
    if not os.path.exists("neon_backend.py"):
        print("❌ neon_backend.py not found!")
        print("   Please make sure all files are in the same directory")
        return False
    
    try:
        # Start the server in the background
        print("📡 Server will be available at: http://localhost:5000")
        print("🌐 Opening browser in 3 seconds...")
        
        # Wait a moment for server to start
        time.sleep(3)
        
        # Try to open the browser
        try:
            webbrowser.open("http://localhost:5000")
            print("✅ Browser opened automatically")
        except:
            print("⚠️  Could not open browser automatically")
            print("   Please manually navigate to: http://localhost:5000")
        
        print("\n⏹️  Press Ctrl+C to stop the server")
        print()
        
        # Start the server
        subprocess.run([sys.executable, "neon_backend.py"])
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        return False
    
    return True

def main():
    """Main startup function"""
    print_banner()
    
    # Check for wen_counter.py
    wen_counter_available = check_wen_counter()
    
    # Install dependencies
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
