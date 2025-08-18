"""
Vercel-compatible Farcaster API Proxy
Obfuscates the original Farcaster endpoint through Vercel serverless functions
"""

import json
import os
import re
from urllib.parse import urlencode
from http.server import BaseHTTPRequestHandler
import requests


class FarcasterProxy:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        
    def proxy_request(self, endpoint: str, query_string: str, headers: dict) -> tuple:
        """
        Proxy the request to the actual Farcaster API.
        Returns (response_data, status_code, response_headers)
        """
        # Build the full URL
        full_url = f"{self.base_url}/{endpoint.lstrip('/')}"
        if query_string:
            full_url += f"?{query_string}"
        
        try:
            # Make the request to the actual Farcaster API
            response = requests.get(
                full_url,
                headers=headers,
                timeout=30
            )
            
            # Return the response data, status code, and headers
            return response.json(), response.status_code, dict(response.headers)
            
        except requests.exceptions.RequestException as e:
            return {
                "error": "Proxy request failed",
                "details": str(e)
            }, 500, {}
        except json.JSONDecodeError as e:
            return {
                "error": "Invalid JSON response from upstream",
                "details": str(e)
            }, 502, {}


# Initialize proxy with environment variable
FARCASTER_BASE_URL = os.environ.get('FARCASTER_BASE_URL', 'https://client.farcaster.xyz/v2')
proxy = FarcasterProxy(FARCASTER_BASE_URL)


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        # Parse the request path
        path = self.path
        query_string = ""
        
        if '?' in path:
            path, query_string = path.split('?', 1)
        
        # Debug logging (Vercel logs)
        print(f"Request path: {path}")
        print(f"Query string: {query_string}")
        
        # Health check endpoint
        if path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            health_data = {
                "status": "healthy",
                "proxy": "farcaster-api-proxy",
                "version": "1.0.0",
                "platform": "vercel"
            }
            
            self.wfile.write(json.dumps(health_data).encode())
            return
        
        # Root endpoint - show API info
        if path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            info_data = {
                "message": "Farcaster API Proxy",
                "status": "running",
                "platform": "vercel",
                "usage": "Use /api/ prefix for API calls",
                "example": "/api/direct-cast-conversation-messages?conversationId=123"
            }
            
            self.wfile.write(json.dumps(info_data).encode())
            return
        
        # API proxy endpoints
        if path.startswith('/api/'):
            endpoint = path[5:]  # Remove '/api/' prefix
            
            # Get headers (filter out host and other proxy-specific headers)
            headers = {}
            for key, value in self.headers.items():
                # Only forward certain headers
                if key.lower() in ['authorization', 'content-type', 'user-agent']:
                    headers[key] = value
            
            print(f"Proxying to endpoint: {endpoint}")
            print(f"Headers: {headers}")
            
            # Make the proxied request
            data, status_code, response_headers = proxy.proxy_request(endpoint, query_string, headers)
            
            # Send response
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
            
            # Forward some response headers
            headers_to_forward = ['cache-control']
            for header_name in headers_to_forward:
                if header_name in response_headers:
                    self.send_header(header_name.title(), response_headers[header_name])
            
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
            return
        
        # 404 for unknown paths
        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_data = {
            "error": "Endpoint not found",
            "message": "Use /api/ prefix for API calls",
            "example": "/api/direct-cast-conversation-messages?conversationId=123"
        }
        
        self.wfile.write(json.dumps(error_data).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()
