#!/usr/bin/env python3
"""
Neon WEN Monitor Backend - Flask server that bridges the web interface with wen_monitor.py
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os
import json
from datetime import datetime, timezone

# Add the current directory to Python path to import wen_counter
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from wen_counter import WenCounter
except ImportError:
    print("Warning: wen_counter.py not found. Some functionality may be limited.")
    WenCounter = None

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global counter instance
wen_counter = WenCounter() if WenCounter else None

@app.route('/')
def index():
    """Serve the main HTML file"""
    return send_from_directory('.', 'neon-tracking.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS)"""
    return send_from_directory('.', filename)

@app.route('/api/wen-data', methods=['POST'])
def get_wen_data():
    """API endpoint to fetch WEN data using wen_counter.py"""
    try:
        if not wen_counter:
            return jsonify({
                'error': 'WEN counter not available. Please ensure wen_counter.py is in the same directory.'
            }), 500

        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        api_url = data.get('apiUrl')
        api_token = data.get('apiToken')
        fetch_mode = data.get('fetchMode', 'recent')
        max_pages = int(data.get('maxPages', 5))
        target_hours = int(data.get('targetHours', 24))

        if not api_url or not api_token:
            return jsonify({'error': 'API URL and token are required'}), 400

        # Fetch data using wen_counter
        if fetch_mode == 'all':
            api_response = wen_counter.fetch_all_messages(api_url, api_token)
        elif fetch_mode == 'recent':
            api_response = wen_counter.fetch_recent_messages(api_url, api_token, max_pages, target_hours, False)
        else:  # single mode
            api_response = wen_counter.fetch_messages(api_url, api_token)

        # Analyze the messages
        analysis = wen_counter.analyze_messages(api_response)
        
        # Format the response for the frontend
        response_data = {
            'total_wen_count': analysis['total_wen_count'],
            'total_messages': analysis['total_messages'],
            'messages_with_wen': analysis['messages_with_wen'],
            'time_analysis': {
                'time_span_formatted': analysis.get('time_analysis', {}).get('time_span_formatted', '0m')
            },
            'message_details': []
        }

        # Process message details
        if analysis.get('message_details'):
            for msg in analysis['message_details']:
                # Handle timestamp conversion - Farcaster uses milliseconds
                timestamp = msg.get('timestamp')
                if timestamp:
                    # Convert milliseconds to ISO string if it's a number
                    if isinstance(timestamp, (int, float)):
                        from datetime import datetime, timezone
                        timestamp = datetime.fromtimestamp(timestamp / 1000, tz=timezone.utc).isoformat()
                    elif isinstance(timestamp, str):
                        # If it's already a string, try to parse and reformat
                        try:
                            # Try to parse as milliseconds first
                            if timestamp.isdigit():
                                ts_int = int(timestamp)
                                timestamp = datetime.fromtimestamp(ts_int / 1000, tz=timezone.utc).isoformat()
                        except:
                            pass  # Keep original if parsing fails
                
                response_data['message_details'].append({
                    'senderUsername': msg.get('senderUsername', 'Unknown'),
                    'text': msg.get('text', ''),
                    'wen_matches': msg.get('wen_matches', []),
                    'timestamp': timestamp
                })

        return jsonify(response_data)

    except Exception as e:
        print(f"Error in /api/wen-data: {e}")
        return jsonify({
            'error': f'Failed to fetch WEN data: {str(e)}'
        }), 500

@app.route('/api/test-connection', methods=['POST'])
def test_connection():
    """API endpoint to test the connection to Farcaster API"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        api_url = data.get('apiUrl')
        api_token = data.get('apiToken')

        if not api_url or not api_token:
            return jsonify({'error': 'API URL and token are required'}), 400

        # Test with a simple single fetch
        if wen_counter:
            try:
                # Try to fetch just one message to test the connection
                test_response = wen_counter.fetch_messages(api_url, api_token)
                
                if test_response and 'result' in test_response:
                    return jsonify({
                        'success': True,
                        'message': 'Connection successful',
                        'message_count': len(test_response['result'].get('messages', []))
                    })
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Invalid response from Farcaster API'
                    })
                    
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': f'API connection failed: {str(e)}'
                })
        else:
            return jsonify({
                'success': False,
                'error': 'WEN counter not available'
            }), 500

    except Exception as e:
        print(f"Error in /api/test-connection: {e}")
        return jsonify({
            'success': False,
            'error': f'Connection test failed: {str(e)}'
        }), 500

@app.route('/api/status')
def get_status():
    """API endpoint to get server status"""
    return jsonify({
        'status': 'running',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'wen_counter_available': wen_counter is not None
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Neon WEN Monitor Backend...")
    print("📡 Server will be available at: http://localhost:5000")
    print("🌐 Open your browser and navigate to: http://localhost:5000")
    print("⚠️  Make sure wen_counter.py is in the same directory")
    print("⏹️  Press Ctrl+C to stop the server")
    print()
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")