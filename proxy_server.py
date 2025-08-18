#!/usr/bin/env python3
"""
Farcaster API Proxy Server
Obfuscates the original Farcaster endpoint by proxying requests through your own domain.
"""

import os
import json
import argparse
from flask import Flask, request, jsonify, Response
import requests
from urllib.parse import urlencode

app = Flask(__name__)

# Configuration - Set these via environment variables or command line
FARCASTER_BASE_URL = "https://client.farcaster.xyz/v2"
PROXY_PORT = 8080
DEBUG_MODE = False


class FarcasterProxy:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        
    def proxy_request(self, endpoint: str, params: dict, headers: dict) -> tuple:
        """
        Proxy the request to the actual Farcaster API.
        Returns (response_data, status_code, response_headers)
        """
        # Build the full URL
        full_url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        try:
            # Make the request to the actual Farcaster API
            response = requests.get(
                full_url,
                params=params,
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
        except json.JSONDecodeError:
            return {
                "error": "Invalid JSON response from upstream",
                "raw_response": response.text
            }, 502, {}


# Initialize proxy
proxy = FarcasterProxy(FARCASTER_BASE_URL)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "proxy": "farcaster-api-proxy",
        "version": "1.0.0"
    })


@app.route('/api/<path:endpoint>', methods=['GET'])
def proxy_api_request(endpoint):
    """
    Proxy API requests to the Farcaster endpoint.
    Route: /api/direct-cast-conversation-messages -> /v2/direct-cast-conversation-messages
    """
    # Get query parameters
    params = dict(request.args)
    
    # Get headers (filter out host and other proxy-specific headers)
    headers = {}
    for key, value in request.headers:
        # Only forward certain headers
        if key.lower() in ['authorization', 'content-type', 'user-agent']:
            headers[key] = value
    
    # Log the request (if debug mode)
    if DEBUG_MODE:
        print(f"Proxying request: /{endpoint}")
        print(f"Params: {params}")
        print(f"Headers: {headers}")
    
    # Make the proxied request
    data, status_code, response_headers = proxy.proxy_request(endpoint, params, headers)
    
    # Create response
    response = jsonify(data)
    response.status_code = status_code
    
    # Forward some response headers (filter out server-specific ones)
    headers_to_forward = ['content-type', 'cache-control']
    for header_name in headers_to_forward:
        if header_name in response_headers:
            response.headers[header_name] = response_headers[header_name]
    
    # Add CORS headers if needed
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
    
    return response


@app.route('/api/<path:endpoint>', methods=['OPTIONS'])
def handle_preflight(endpoint):
    """Handle CORS preflight requests."""
    response = Response()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
    return response


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        "error": "Endpoint not found",
        "message": "Use /api/ prefix for API calls",
        "example": "/api/direct-cast-conversation-messages?conversationId=123"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors."""
    return jsonify({
        "error": "Internal server error",
        "message": "The proxy server encountered an error"
    }), 500


def main():
    global FARCASTER_BASE_URL, DEBUG_MODE, proxy
    
    parser = argparse.ArgumentParser(
        description="Farcaster API Proxy Server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run with default settings
  python proxy_server.py
  
  # Run on a different port
  python proxy_server.py --port 3000
  
  # Run in debug mode
  python proxy_server.py --debug
  
  # Custom Farcaster base URL
  python proxy_server.py --farcaster-url "https://custom.farcaster.api"

Environment Variables:
  FARCASTER_BASE_URL - Base URL for Farcaster API (default: https://client.farcaster.xyz/v2)
  PROXY_PORT - Port to run the proxy on (default: 8080)
  DEBUG_MODE - Enable debug logging (default: False)

Usage with WEN Counter:
  Instead of: https://client.farcaster.xyz/v2/direct-cast-conversation-messages?...
  Use:        https://betrmint.leovido.xyz/api/direct-cast-conversation-messages?...
        """
    )
    
    parser.add_argument(
        '--port', '-p',
        type=int,
        default=int(os.environ.get('PROXY_PORT', PROXY_PORT)),
        help=f'Port to run the proxy server on (default: {PROXY_PORT})'
    )
    
    parser.add_argument(
        '--farcaster-url',
        default=os.environ.get('FARCASTER_BASE_URL', FARCASTER_BASE_URL),
        help=f'Base URL for Farcaster API (default: {FARCASTER_BASE_URL})'
    )
    
    parser.add_argument(
        '--debug',
        action='store_true',
        default=os.environ.get('DEBUG_MODE', '').lower() in ('true', '1', 'yes'),
        help='Enable debug mode with request logging'
    )
    
    parser.add_argument(
        '--host',
        default='0.0.0.0',
        help='Host to bind the server to (default: 0.0.0.0)'
    )
    
    args = parser.parse_args()
    
    # Update global configuration
    FARCASTER_BASE_URL = args.farcaster_url
    DEBUG_MODE = args.debug
    proxy = FarcasterProxy(FARCASTER_BASE_URL)
    
    print("🚀 Starting Farcaster API Proxy Server")
    print(f"📡 Proxying: {FARCASTER_BASE_URL}")
    print(f"🌐 Server: http://{args.host}:{args.port}")
    print(f"🔍 Debug: {'ON' if DEBUG_MODE else 'OFF'}")
    print()
    print("Example usage:")
    print(f"  Original:  {FARCASTER_BASE_URL}/direct-cast-conversation-messages")
    print(f"  Proxied:   http://{args.host}:{args.port}/api/direct-cast-conversation-messages")
    print()
    print("Press Ctrl+C to stop the server")
    
    try:
        app.run(
            host=args.host,
            port=args.port,
            debug=DEBUG_MODE,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 Proxy server stopped")


if __name__ == '__main__':
    main()
