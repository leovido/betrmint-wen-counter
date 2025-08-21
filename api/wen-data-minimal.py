import json

def handler(request, context):
    """Minimal Vercel serverless function handler"""
    
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
    
    # Only handle POST requests
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'body': 'Method not allowed'
        }
    
    try:
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
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }

def handle_test_connection(request_data):
    """Handle connection test - simplified version"""
    try:
        api_url = request_data.get('apiUrl')
        api_token = request_data.get('apiToken')
        
        if not api_url or not api_token:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': False, 'error': 'API URL and Token required'})
            }
        
        # For now, just return success without making actual API call
        # This helps isolate if the issue is with external API calls
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True, 'message': 'Connection test passed (simulated)'})
        }
            
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': f'Connection test failed: {str(e)}'})
        }

def handle_wen_data(request_data):
    """Handle WEN data request - simplified version"""
    try:
        # Return mock data for now to test if the function works at all
        mock_result = {
            'total_wen_count': 42,
            'total_messages': 100,
            'messages_with_wen': 15,
            'time_analysis': {'time_span_formatted': '2h 30m'},
            'message_details': [
                {
                    'senderUsername': 'testuser1',
                    'text': 'wen moon?',
                    'wen_matches': ['wen'],
                    'timestamp': '2024-01-20T10:00:00Z'
                },
                {
                    'senderUsername': 'testuser2',
                    'text': 'WEN is the question',
                    'wen_matches': ['WEN'],
                    'timestamp': '2024-01-20T09:30:00Z'
                }
            ]
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(mock_result)
        }
        
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to process request: {str(e)}'})
        }
