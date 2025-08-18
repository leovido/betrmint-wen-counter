#!/usr/bin/env python3
"""
Production deployment script for Farcaster API Proxy Server
Configures the proxy server for production deployment with gunicorn
"""

import os
import subprocess
import sys
from pathlib import Path

def create_systemd_service():
    """Create a systemd service file for the proxy."""
    service_content = """[Unit]
Description=Farcaster API Proxy Server
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/opt/betrmint-wen
Environment=FARCASTER_BASE_URL=https://client.farcaster.xyz/v2
Environment=PROXY_PORT=8080
Environment=DEBUG_MODE=false
ExecStart=/usr/bin/python3 proxy_server.py --host 0.0.0.0 --port 8080
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
"""
    
    service_path = "/etc/systemd/system/farcaster-proxy.service"
    print(f"Creating systemd service: {service_path}")
    print("(Run with sudo to actually create the file)")
    print("\nService file content:")
    print("-" * 40)
    print(service_content)
    return service_content

def create_nginx_config():
    """Create nginx configuration for the proxy."""
    nginx_config = """# Nginx configuration for betrmint.leovido.xyz
server {
    listen 80;
    listen [::]:80;
    server_name betrmint.leovido.xyz;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name betrmint.leovido.xyz;
    
    # SSL configuration (you'll need to set up SSL certificates)
    ssl_certificate /path/to/your/ssl/certificate.pem;
    ssl_certificate_key /path/to/your/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Proxy configuration
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'Authorization, Content-Type';
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
            add_header Access-Control-Allow-Headers 'Authorization, Content-Type';
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:8080/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Optional: Serve static content or redirect root
    location / {
        return 200 '{"message": "Farcaster API Proxy", "status": "running"}';
        add_header Content-Type application/json;
    }
}
"""
    
    print("\nNginx configuration:")
    print("-" * 40)
    print(nginx_config)
    print("\nSave this to: /etc/nginx/sites-available/betrmint.leovido.xyz")
    print("Then: sudo ln -s /etc/nginx/sites-available/betrmint.leovido.xyz /etc/nginx/sites-enabled/")
    return nginx_config

def create_docker_config():
    """Create Docker configuration for easy deployment."""
    dockerfile = """FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY proxy_server.py .

# Expose port
EXPOSE 8080

# Set environment variables
ENV FARCASTER_BASE_URL=https://client.farcaster.xyz/v2
ENV PROXY_PORT=8080
ENV DEBUG_MODE=false

# Run the application
CMD ["python", "proxy_server.py", "--host", "0.0.0.0", "--port", "8080"]
"""
    
    docker_compose = """version: '3.8'

services:
  farcaster-proxy:
    build: .
    ports:
      - "8080:8080"
    environment:
      - FARCASTER_BASE_URL=https://client.farcaster.xyz/v2
      - PROXY_PORT=8080
      - DEBUG_MODE=false
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
"""
    
    print("\nDockerfile:")
    print("-" * 40)
    print(dockerfile)
    
    print("\ndocker-compose.yml:")
    print("-" * 40) 
    print(docker_compose)
    
    return dockerfile, docker_compose

def print_deployment_instructions():
    """Print step-by-step deployment instructions."""
    print("\n" + "=" * 60)
    print("DEPLOYMENT INSTRUCTIONS")
    print("=" * 60)
    
    print("\n1. SERVER SETUP:")
    print("   • Deploy this code to your server (e.g., /opt/betrmint-wen/)")
    print("   • Install dependencies: pip3 install -r requirements.txt")
    print("   • Test locally: python3 proxy_server.py --debug")
    
    print("\n2. DOMAIN SETUP:")
    print("   • Point betrmint.leovido.xyz to your server's IP")
    print("   • Set up SSL certificates (Let's Encrypt recommended)")
    
    print("\n3. NGINX SETUP:")
    print("   • Install nginx: sudo apt install nginx")
    print("   • Create the nginx config file (shown above)")
    print("   • Test config: sudo nginx -t")
    print("   • Restart nginx: sudo systemctl restart nginx")
    
    print("\n4. SYSTEMD SERVICE (optional):")
    print("   • Create service file (shown above)")
    print("   • Enable service: sudo systemctl enable farcaster-proxy")
    print("   • Start service: sudo systemctl start farcaster-proxy")
    
    print("\n5. TESTING:")
    print("   • Health check: curl https://betrmint.leovido.xyz/health")
    print("   • API test: curl 'https://betrmint.leovido.xyz/api/direct-cast-conversation-messages?...'")
    
    print("\n6. UPDATE WEN COUNTER USAGE:")
    print("   Original URL:")
    print("   https://client.farcaster.xyz/v2/direct-cast-conversation-messages?...")
    print("   ↓")
    print("   Your proxied URL:")
    print("   https://betrmint.leovido.xyz/api/direct-cast-conversation-messages?...")

def main():
    print("🚀 Farcaster API Proxy - Deployment Configuration")
    print("=" * 60)
    
    # Create configurations
    create_systemd_service()
    create_nginx_config() 
    create_docker_config()
    print_deployment_instructions()
    
    print("\n" + "=" * 60)
    print("FILES TO CREATE ON YOUR SERVER:")
    print("=" * 60)
    print("1. proxy_server.py (main application)")
    print("2. requirements.txt (dependencies)")
    print("3. /etc/nginx/sites-available/betrmint.leovido.xyz (nginx config)")
    print("4. /etc/systemd/system/farcaster-proxy.service (systemd service)")
    
    print("\n🔒 SECURITY CONSIDERATIONS:")
    print("• Use HTTPS (SSL certificates)")
    print("• Consider rate limiting in nginx")
    print("• Monitor logs for suspicious activity")
    print("• Keep the original Farcaster URL secret")
    print("• Use environment variables for sensitive config")

if __name__ == '__main__':
    main()
