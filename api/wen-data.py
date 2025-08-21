import json
import requests
from datetime import datetime, timezone

def get_wen_data(request_data):
    """Get WEN data from Farcaster API"""
    try:
        api_url = request_data.get('apiUrl')
        api_token = request_data.get('apiToken')
        fetch_mode = request_data.get('fetchMode', 'recent')
        max_pages = int(request_data.get('maxPages', 5))
        target_hours = int(request_data.get('targetHours', 24))
        today_only = request_data.get('todayOnly', False)
        
        if not api_url or not api_token:
            return {'error': 'API URL and Token are required'}
        
        # Make direct API call to Farcaster
        headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
        
        # Fetch messages based on mode
        all_messages = []
        current_url = api_url
        page_count = 0
        
        while current_url and page_count < max_pages:
            try:
                response = requests.get(current_url, headers=headers, timeout=30)
                response.raise_for_status()
                data = response.json()
                
                # Extract messages
                if 'result' in data and 'messages' in data['result']:
                    messages = data['result']['messages']
                    all_messages.extend(messages)
                
                # Get next page cursor
                if 'next' in data and 'cursor' in data['next']:
                    current_url = f"{api_url}&cursor={data['next']['cursor']}"
                else:
                    current_url = None
                
                page_count += 1
                
            except Exception as e:
                print(f"Error fetching page {page_count}: {e}")
                break
        
        # Analyze messages for WEN patterns
        wen_pattern = r'w+e+n+'
        import re
        
        total_wen_count = 0
        messages_with_wen = []
        
        for msg in all_messages:
            if 'text' in msg:
                text = msg['text']
                wen_matches = re.findall(wen_pattern, text, re.IGNORECASE)
                
                if wen_matches:
                    total_wen_count += len(wen_matches)
                    
                    # Extract user info
                    sender_username = "Unknown"
                    if 'author' in msg and 'username' in msg['author']:
                        sender_username = msg['author']['username']
                    elif 'author' in msg and 'displayName' in msg['author']:
                        sender_username = msg['author']['displayName']
                    
                    # Extract timestamp
                    timestamp = None
                    if 'timestamp' in msg:
                        timestamp = msg['timestamp']
                    elif 'serverTimestamp' in msg:
                        timestamp = msg['serverTimestamp']
                    
                    messages_with_wen.append({
                        'senderUsername': sender_username,
                        'text': text,
                        'wen_matches': wen_matches,
                        'timestamp': timestamp
                    })
        
        # Filter messages by time if needed
        if messages_with_wen:
            current_time = datetime.now(timezone.utc)
            
            if today_only:
                today_start = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
                target_time_ms = int(today_start.timestamp() * 1000)
            else:
                target_time_ms = int((current_time.timestamp() * 1000) - (target_hours * 3600 * 1000))
            
            filtered_messages = []
            for msg in messages_with_wen:
                timestamp = msg.get('timestamp')
                timestamp_ms = None
                
                if timestamp:
                    if isinstance(timestamp, (int, float)):
                        timestamp_ms = int(timestamp)
                    elif isinstance(timestamp, str):
                        try:
                            if timestamp.isdigit():
                                timestamp_ms = int(timestamp)
                        except:
                            pass
                
                if timestamp_ms and timestamp_ms >= target_time_ms:
                    # Convert to ISO string for display
                    if isinstance(timestamp, (int, float)):
                        timestamp_iso = datetime.fromtimestamp(timestamp / 1000, tz=timezone.utc).isoformat()
                    else:
                        timestamp_iso = timestamp
                    
                    filtered_messages.append({
                        'senderUsername': msg['senderUsername'],
                        'text': msg['text'],
                        'wen_matches': msg['wen_matches'],
                        'timestamp': timestamp_iso
                    })
            
            messages_with_wen = filtered_messages
            total_wen_count = sum(len(msg['wen_matches']) for msg in filtered_messages)
        
        # Calculate time span
        if messages_with_wen:
            timestamps = [msg.get('timestamp') for msg in messages_with_wen if msg.get('timestamp')]
            if timestamps:
                try:
                    # Convert ISO strings to datetime objects
                    dt_timestamps = []
                    for ts in timestamps:
                        if isinstance(ts, str):
                            dt_timestamps.append(datetime.fromisoformat(ts.replace('Z', '+00:00')))
                        elif isinstance(ts, (int, float)):
                            dt_timestamps.append(datetime.fromtimestamp(ts / 1000, tz=timezone.utc))
                    
                    if dt_timestamps:
                        oldest = min(dt_timestamps)
                        newest = max(dt_timestamps)
                        time_diff = newest - oldest
                        hours = int(time_diff.total_seconds() // 3600)
                        minutes = int((time_diff.total_seconds() % 3600) // 60)
                        time_span = f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"
                    else:
                        time_span = "0m"
                except:
                    time_span = "0m"
            else:
                time_span = "0m"
        else:
            time_span = "0m"
        
        return {
            'total_wen_count': total_wen_count,
            'total_messages': len(all_messages),
            'messages_with_wen': len(messages_with_wen),
            'time_analysis': {'time_span_formatted': time_span},
            'message_details': messages_with_wen
        }
        
    except Exception as e:
        print(f"Error in get_wen_data: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'error': f'Failed to process request: {str(e)}'}

def test_connection(request_data):
    """Test connection to Farcaster API"""
    try:
        api_url = request_data.get('apiUrl')
        api_token = request_data.get('apiToken')
        
        if not api_url or not api_token:
            return {'success': False, 'error': 'API URL and Token are required'}
        
        # Make a simple test request
        headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(api_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return {'success': True, 'message': 'Connection successful'}
        else:
            return {'success': False, 'error': f'API returned status {response.status_code}'}
            
    except Exception as e:
        print(f"Error in test_connection: {str(e)}")
        return {'success': False, 'error': f'Connection failed: {str(e)}'}

# Vercel serverless function entry point
def handler(request, context):
    """Vercel serverless function handler"""
    try:
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '86400'
                },
                'body': ''
            }
        
        # Process POST requests
        if request.method == 'POST':
            if request.path == '/api/wen-data':
                result = get_wen_data(request.json)
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    'body': json.dumps(result)
                }
            elif request.path == '/api/test-connection':
                result = test_connection(request.json)
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    'body': json.dumps(result)
                }
        
        return {
            'statusCode': 404,
            'body': 'Not Found'
        }
        
    except Exception as e:
        print(f"Error in handler: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }
