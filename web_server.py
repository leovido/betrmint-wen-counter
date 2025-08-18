#!/usr/bin/env python3
"""
WEN Monitor Web Server
Serves the dashboard and proxies API calls to avoid CORS issues
"""

from flask import Flask, request, jsonify, send_from_directory
import requests
import json
import sys
import os

# Add current directory to path to import wen_counter
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from wen_counter import WenCounter

app = Flask(__name__)

# Simple CORS headers for local development
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# Initialize WEN counter
wen_counter = WenCounter()

@app.route('/')
def dashboard():
    """Serve the main dashboard"""
    return send_from_directory('.', 'web_dashboard.html')

@app.route('/<filename>')
def serve_static(filename):
    """Serve static files (CSS, JS)"""
    return send_from_directory('.', filename)

@app.route('/api/fetch-wen', methods=['POST'])
def fetch_wen():
    """Proxy API call to Farcaster and process with WEN counter"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        api_url = data.get('apiUrl')
        bearer_token = data.get('bearerToken')
        fetch_mode = data.get('fetchMode', 'single')
        max_pages = data.get('maxPages', 5)
        target_hours = data.get('targetHours', 24)
        filter_today = data.get('todayFilter', False)
        
        if not api_url or not bearer_token:
            return jsonify({'error': 'Missing API URL or Bearer Token'}), 400
        
        # print(f"🌐 Fetching WEN data with mode: {fetch_mode}")
        # print(f"📊 Max pages: {max_pages}, Target hours: {target_hours}")
        # print(f"📅 Today filter: {filter_today}")
        
        # Use the appropriate fetch method based on mode
        if fetch_mode == 'all':
            api_response = wen_counter.fetch_all_messages(api_url, bearer_token)
        elif fetch_mode == 'recent':
            api_response = wen_counter.fetch_recent_messages(
                api_url, bearer_token, max_pages, target_hours, filter_today
            )
        else:  # single
            api_response = wen_counter.fetch_messages(api_url, bearer_token)
        
        # Analyze the messages using WEN counter
        analysis = wen_counter.analyze_messages(api_response, filter_today)
        
        # Transform to dashboard format
        dashboard_data = {
            'total_wen_count': analysis['total_wen_count'],
            'total_messages': analysis['total_messages'],
            'messages_with_wen': analysis['messages_with_wen'],
            'time_analysis': {
                'time_span_formatted': analysis['time_analysis']['time_span_formatted']
            },
            'message_details': []
        }
        
        # Transform message details
        for msg in analysis['message_details']:
            dashboard_data['message_details'].append({
                'senderUsername': msg['senderUsername'],
                'text': msg['text'],
                'wen_count': msg['wen_count'],
                'wen_matches': msg['wen_matches'],
                'timestamp_formatted': msg['timestamp_formatted']
            })
        
        # print(f"✅ Found {dashboard_data['total_wen_count']} WENs in {dashboard_data['total_messages']} messages")
        
        return jsonify(dashboard_data)
        
    except Exception as e:
        print(f"❌ Error in fetch_wen: {str(e)}")
        return jsonify({'error': f'Failed to fetch data: {str(e)}'}), 500

@app.route('/api/test-connection', methods=['POST'])
def test_connection():
    """Test connection to Farcaster API"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        api_url = data.get('apiUrl')
        bearer_token = data.get('bearerToken')
        
        if not api_url or not bearer_token:
            return jsonify({'error': 'Missing API URL or Bearer Token'}), 400
        
        # print(f"🧪 Testing connection to: {api_url}")
        
        # Make a test request
        headers = {
            'Authorization': f'Bearer {bearer_token}',
            'Content-Type': 'application/json',
            'User-Agent': 'WEN-Monitor-Dashboard/1.0'
        }
        
        response = requests.get(api_url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return jsonify({'error': f'API Error: {response.status_code}'}), 400
        
        # Parse response to validate format
        api_response = response.json()
        
        if 'result' not in api_response or 'messages' not in api_response['result']:
            return jsonify({'error': 'Invalid API response format'}), 400
        
        message_count = len(api_response['result']['messages'])
        
        # print(f"✅ Connection successful! Found {message_count} messages")
        
        return jsonify({
            'success': True,
            'message': f'Connection successful! Found {message_count} messages.',
            'messageCount': message_count
        })
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error in test_connection: {str(e)}")
        return jsonify({'error': f'Network error: {str(e)}'}), 500
    except Exception as e:
        print(f"❌ Error in test_connection: {str(e)}")
        return jsonify({'error': f'Failed to test connection: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Starting WEN Monitor Web Server...")
    print("📱 Dashboard will be available at: http://localhost:5000")
    print("🔌 API endpoints:")
    print("   - GET  /                    -> Dashboard")
    print("   - POST /api/fetch-wen       -> Fetch WEN data")
    print("   - POST /api/test-connection -> Test API connection")
    print()
    
    app.run(host='0.0.0.0', port=5000, debug=True)
