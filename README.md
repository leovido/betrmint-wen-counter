# WEN Counter CLI Tools

Command-line tools to count "WEN" variations in Farcaster conversation messages. Includes both one-time analysis and continuous monitoring capabilities.

## Tools Included

1. **`wen_counter.py`** - One-time analysis with detailed reports
2. **`wen_monitor.py`** - Continuous live monitoring with real-time updates
3. **`proxy_server.py`** - API proxy server to obfuscate original Farcaster endpoints

## Features

- **Pattern Matching**: Detects various "WEN" patterns including:
  - Basic: `WEN`, `wen`, `Wen`
  - Extended: `weeeeen`, `WEEEEEEEN`
  - Mixed case: `WeN`, `wEn`
- **API Integration**: Fetches messages directly from Farcaster API
- **Time Analysis**: Shows time range from first to last message
- **Individual Timestamps**: Displays when each WEN message was posted
- **Detailed Analysis**: Shows which users posted WEN messages
- **Multiple Output Formats**: Human-readable and JSON formats
- **Verbose Mode**: Includes message IDs, sender FIDs, and full message text

## Installation

1. Clone or download the files to your desired directory
2. Install required dependencies:
```bash
pip3 install -r requirements.txt
```

3. Make the script executable (optional):
```bash
chmod +x wen_counter.py
```

## Usage

### Basic Usage
```bash
python3 wen_counter.py --url "YOUR_API_URL" --token "YOUR_BEARER_TOKEN"
```

### With Verbose Output
```bash
python3 wen_counter.py --url "YOUR_API_URL" --token "YOUR_BEARER_TOKEN" --verbose
```

### JSON Output
```bash
python3 wen_counter.py --url "YOUR_API_URL" --token "YOUR_BEARER_TOKEN" --json
```

### Using Short Flags
```bash
python3 wen_counter.py -u "YOUR_API_URL" -t "YOUR_BEARER_TOKEN" -v
```

## Example

```bash
python3 wen_counter.py \
  --url "https://client.farcaster.xyz/v2/direct-cast-conversation-messages?conversationId=7048a08fe1f2e0a3&messageId=38c49cfaafb6a73f4b954da4e7b878c1&limit=50" \
  --token "MK-3PNeLvX4yjhZ/uf0cc2L5CVJkg6TFrz+ij59FEmPW397LN0qgoduxdUigLbLDpFVOmcJmyz1pOlTF8XpHUUUfA==" \
  --verbose
```

## Command Line Options

| Option | Short | Required | Description |
|--------|-------|----------|-------------|
| `--url` | `-u` | Yes | Farcaster API URL |
| `--token` | `-t` | Yes | Bearer token for authentication |
| `--verbose` | `-v` | No | Show detailed message information |
| `--json` | | No | Output results in JSON format |
| `--help` | `-h` | No | Show help message |

## Sample Output

### Standard Output
```
==================================================
WEN COUNTER RESULTS
==================================================
Total messages analyzed: 100
Messages containing WEN: 3
Total WEN count: 5

TIME RANGE:
First message: 2025-08-15 19:28:14 UTC
Last message:  2025-08-16 01:48:58 UTC
Time span:     6h 20m

MESSAGES WITH WEN (newest first):
----------------------------------------
1. @user1 (Display Name)
   Time: 2025-08-16 01:30:15 UTC
   WEN count: 2
   Matches: WEN, wen

2. @user2 (Another User)
   Time: 2025-08-15 22:15:30 UTC
   WEN count: 1
   Matches: weeeeen

3. @user3 (Third User)
   Time: 2025-08-15 20:45:22 UTC
   WEN count: 2
   Matches: WEN, WEEEEEEEN
```

### Verbose Output
Includes additional details like:
- Message ID
- Sender FID
- Full message text

### JSON Output
```json
{
  "total_messages": 100,
  "messages_with_wen": 3,
  "total_wen_count": 5,
  "message_details": [
    {
      "messageId": "abc123...",
      "senderFid": 12345,
      "senderName": "Display Name",
      "senderUsername": "username",
      "text": "WEN moon? wen lambo?",
      "wen_count": 2,
      "wen_matches": ["WEN", "wen"],
      "timestamp": 1755308938783,
      "timestamp_formatted": "2025-08-16 01:30:15 UTC"
    }
  ],
  "time_analysis": {
    "first_message_time": "2025-08-15 19:28:14 UTC",
    "last_message_time": "2025-08-16 01:48:58 UTC",
    "time_span_formatted": "6h 20m"
  }
}
```

# WEN Monitor - Live Tracking

The **WEN Monitor** (`wen_monitor.py`) provides continuous, real-time monitoring of WEN activity with a live-updating dashboard.

## Monitor Features

- **🔄 Real-time Updates**: Automatically refreshes at configurable intervals
- **📊 Live Dashboard**: Clear, updating display with current WEN count
- **📈 Change Indicators**: Visual indicators show when counts increase/decrease
- **⏰ Flexible Intervals**: Support for seconds, minutes, and hours
- **🔥 Recent Activity**: Shows the latest WEN messages
- **📈 Uptime Tracking**: Monitor running time and update count
- **🛑 Graceful Shutdown**: Clean exit with Ctrl+C

## Monitor Usage

### Basic Monitoring (5 minutes default)
```bash
python3 wen_monitor.py -u "YOUR_API_URL" -t "YOUR_BEARER_TOKEN"
```

### Monitor Every 1 Minute
```bash
python3 wen_monitor.py -u "YOUR_API_URL" -t "YOUR_TOKEN" -i 1m
```

### Monitor Every 30 Seconds
```bash
python3 wen_monitor.py -u "YOUR_API_URL" -t "YOUR_TOKEN" -i 30s
```

### Monitor Every 2 Hours
```bash
python3 wen_monitor.py -u "YOUR_API_URL" -t "YOUR_TOKEN" -i 2h
```

## Monitor Command Line Options

| Option | Short | Required | Description |
|--------|-------|----------|-------------|
| `--url` | `-u` | Yes | Farcaster API URL |
| `--token` | `-t` | Yes | Bearer token for authentication |
| `--interval` | `-i` | No | Update interval (30s, 5m, 2h). Default: 5m |
| `--help` | `-h` | No | Show help message |

## Interval Formats

- **Seconds**: `30s`, `45s`
- **Minutes**: `1m`, `5m`, `30m`
- **Hours**: `1h`, `2h`, `24h`
- **Backward compatibility**: Plain numbers are treated as minutes

## Sample Monitor Display

```
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
      WEN MONITOR - LIVE TRACKING
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

📈 WEN COUNT: 7 📈

📊 SUMMARY:
   Messages analyzed: 142
   Messages with WEN: 4
   Message timespan:  2h 15m

⚙️  MONITOR STATUS:
   Update interval: 1m
   Updates so far:  23
   Running time:    0:23:00
   Last update:     22:15:30 UTC

🔥 RECENT WEN MESSAGES:
   1. @diamond_hands: weeeeen, WEN
      "weeeeen lambo? WEN financial freedom? LFG!"
   2. @moon_boy: wen
      "wen are we going to see some real action here?"
   3. @crypto_enthusiast: WEN
      "WEN moon? This project looks promising! 🚀"

💡 Press Ctrl+C to stop monitoring
```

## Monitor Examples

### High-Frequency Trading Monitoring
```bash
# Monitor every 30 seconds for active trading periods
python3 wen_monitor.py -u "https://..." -t "token" -i 30s
```

### Background Monitoring
```bash
# Monitor every hour for long-term tracking
nohup python3 wen_monitor.py -u "https://..." -t "token" -i 1h > wen_log.txt 2>&1 &
```

### Demo Mode
```bash
# Try the demo with mock data
python3 test_monitor_demo.py
```

## Change Indicators

- **🔄** Initial load
- **📈** WEN count increased
- **📉** WEN count decreased  
- **➡️** WEN count unchanged

## Pattern Matching Details

The tool uses a regex pattern that matches:
- Word boundary at the start: `\b`
- One or more 'w' characters (case insensitive): `w+`
- One or more 'e' characters: `e+`
- One or more 'n' characters: `n+`
- Word boundary at the end: `\b`

This ensures:
- ✅ Matches: `WEN`, `wen`, `weeeeen`, `WEEEEEEEN`, `WeN`
- ❌ Doesn't match: `when`, `owen`, `wendys`, `towel`

## Testing

Run the test suite to verify pattern matching works correctly:
```bash
python3 test_wen_patterns.py
```

# API Proxy Server - URL Obfuscation

The **Proxy Server** (`proxy_server.py`) allows you to obfuscate the original Farcaster API endpoint by routing requests through your own domain.

## Why Use a Proxy?

- **🔒 URL Obfuscation**: Hide the original Farcaster API endpoint
- **🛡️ Security**: Prevent users from discovering your API endpoints
- **📊 Monitoring**: Track and log API usage
- **🚀 Control**: Add rate limiting, authentication, or other middleware
- **🎯 Branding**: Use your own domain for API calls

## Proxy Setup

### Transform URLs
**Original:**
```
https://client.farcaster.xyz/v2/direct-cast-conversation-messages?conversationId=123&limit=50
```

**Proxied:**
```
https://betrmint.leovido.xyz/api/direct-cast-conversation-messages?conversationId=123&limit=50
```

### Run Locally (Testing)
```bash
# Start the proxy server
python3 proxy_server.py --debug

# Test with WEN counter
python3 wen_counter.py -u "http://localhost:8080/api/direct-cast-conversation-messages?..." -t "YOUR_TOKEN"
```

### Production Deployment

1. **Server Setup**
```bash
# Upload files to your server
scp proxy_server.py requirements.txt user@your-server:/opt/betrmint-wen/

# Install dependencies
pip3 install -r requirements.txt

# Test locally
python3 proxy_server.py --debug
```

2. **Domain Configuration**
```bash
# Point betrmint.leovido.xyz to your server's IP
# Set up SSL certificates (Let's Encrypt recommended)
sudo certbot --nginx -d betrmint.leovido.xyz
```

3. **Nginx Configuration**
```bash
# Generate nginx config
python3 deploy_proxy.py

# Copy the nginx configuration to your server
sudo nano /etc/nginx/sites-available/betrmint.leovido.xyz
# (paste the configuration from deploy_proxy.py output)

# Enable the site
sudo ln -s /etc/nginx/sites-available/betrmint.leovido.xyz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

4. **Systemd Service (Optional)**
```bash
# Create systemd service for auto-start
sudo nano /etc/systemd/system/farcaster-proxy.service
# (paste the service configuration from deploy_proxy.py output)

# Enable and start service
sudo systemctl enable farcaster-proxy
sudo systemctl start farcaster-proxy
sudo systemctl status farcaster-proxy
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t farcaster-proxy .
docker run -p 8080:8080 farcaster-proxy

# Or use docker-compose
docker-compose up -d
```

## Proxy Command Line Options

| Option | Short | Description |
|--------|-------|-------------|
| `--port` | `-p` | Port to run proxy on (default: 8080) |
| `--host` | | Host to bind to (default: 0.0.0.0) |
| `--farcaster-url` | | Upstream Farcaster API URL |
| `--debug` | | Enable debug logging |

## Using with WEN Tools

Once deployed, update your WEN counter and monitor commands:

```bash
# Instead of the original URL:
python3 wen_counter.py -u "https://client.farcaster.xyz/v2/direct-cast-conversation-messages?..." -t "TOKEN"

# Use your proxied URL:
python3 wen_counter.py -u "https://betrmint.leovido.xyz/api/direct-cast-conversation-messages?..." -t "TOKEN"

# Same for monitoring:
python3 wen_monitor.py -u "https://betrmint.leovido.xyz/api/direct-cast-conversation-messages?..." -t "TOKEN" -i 1m
```

## Proxy Features

- **🔄 Request Forwarding**: Transparently forwards all requests to Farcaster
- **📝 Header Management**: Properly handles Authorization and other headers
- **🌐 CORS Support**: Enables cross-origin requests if needed
- **❤️ Health Checks**: Built-in `/health` endpoint for monitoring
- **🐛 Debug Mode**: Detailed request logging for troubleshooting
- **⚡ Performance**: Lightweight Flask-based proxy with minimal overhead

## Testing Your Proxy

```bash
# Health check
curl https://betrmint.leovido.xyz/health

# API test
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://betrmint.leovido.xyz/api/direct-cast-conversation-messages?conversationId=123&limit=5"
```

## Files

### Main Tools
- `wen_counter.py` - One-time WEN analysis CLI tool
- `wen_monitor.py` - Continuous WEN monitoring with live updates
- `proxy_server.py` - API proxy server for URL obfuscation

### Supporting Files  
- `requirements.txt` - Python dependencies (includes Flask for proxy)
- `deploy_proxy.py` - Production deployment configuration generator
- `test_wen_patterns.py` - Test suite for pattern matching and timestamps
- `test_monitor_demo.py` - Demo script showing monitor with mock data
- `README.md` - This comprehensive documentation

## Error Handling

The tool includes robust error handling for:
- Network issues when fetching from API
- Invalid JSON responses
- Authentication failures
- Missing or malformed message data

## Security Note

⚠️ **Important**: Keep your bearer tokens secure. Never commit them to version control or share them publicly.
