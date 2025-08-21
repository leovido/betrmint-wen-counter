import json
import requests
from datetime import datetime, timezone

def handler(request, context):
    """Simplified Vercel serverless function handler"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        # Only handle POST requests
        if request.method != 'POST':
            return {
                'statusCode': 405,
                'body': 'Method not allowed'
            }
        
        # Parse request data
        request_data = request.json
        
        if request.path == '/api/test-connection':
            return handle_test_connection(request_data)
        elif request.path == '/api/wen-data':
            return handle_wen_data(request_data)
        else:
            return {
                'statusCode': 404,
                'body': 'Endpoint not found'
            }
            
    except Exception as e:
        print(f"Handler error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }

def handle_test_connection(request_data):
    """Handle connection test"""
    try:
        api_url = request_data.get('apiUrl')
        api_token = request_data.get('apiToken')
        
        if not api_url or not api_token:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': False, 'error': 'API URL and Token required'})
            }
        
        # Test the connection
        headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(api_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'Connection successful'})
            }
        else:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': False, 'error': f'API returned status {response.status_code}'})
            }
            
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': f'Connection failed: {str(e)}'})
        }

def handle_wen_data(request_data):
    """Handle WEN data request"""
    try:
        api_url = request_data.get('apiUrl')
        api_token = request_data.get('apiToken')
        fetch_mode = request_data.get('fetchMode', 'recent')
        max_pages = int(request_data.get('maxPages', 5))
        target_hours = int(request_data.get('targetHours', 24))
        today_only = request_data.get('todayOnly', False)
        
        if not api_url or not api_token:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'API URL and Token required'})
            }
        
        # Fetch messages
        headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
        
        all_messages = []
        current_url = api_url
        page_count = 0
        
        # Fetch pages
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
        
        # Analyze for WEN patterns
        import re
        wen_pattern = r'w+e+n+'
        
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
        
        # Filter by time if needed
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
                    # Convert to ISO string
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
        time_span = "0m"
        if messages_with_wen:
            timestamps = [msg.get('timestamp') for msg in messages_with_wen if msg.get('timestamp')]
            if timestamps:
                try:
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
                except:
                    time_span = "0m"
        
        result = {
            'total_wen_count': total_wen_count,
            'total_messages': len(all_messages),
            'messages_with_wen': len(messages_with_wen),
            'time_analysis': {'time_span_formatted': time_span},
            'message_details': messages_with_wen
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
        
    except Exception as e:
        print(f"WEN data error: {str(e)}")
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to process request: {str(e)}'})
        }
