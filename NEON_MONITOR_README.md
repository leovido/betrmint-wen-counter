# 🎯 Neon WEN Monitor

A beautiful, real-time web interface for monitoring WEN variations in Farcaster messages, built with neon aesthetics and connected to your `wen_monitor.py` backend.

## ✨ Features

- **🎨 Neon Terminal Aesthetic** - Beautiful cyan, pink, yellow, and red color scheme
- **📊 Real-time Updates** - Live WEN count and message monitoring
- **⚙️ Full Configuration** - Customizable fetch modes, pages, and intervals
- **🔄 Auto-save** - Configuration saved to localStorage
- **📱 Responsive Design** - Works on all devices
- **🚀 Demo Mode** - Works even without backend for testing

## 🚀 Quick Start

### Option 1: Automatic Startup (Recommended)

```bash
python3 start_neon_monitor.py
```

This script will:

- Install required dependencies
- Check for `wen_counter.py`
- Start the Flask backend server
- Open the monitor at `http://localhost:5000`

### Option 2: Manual Setup

1. **Install Dependencies:**

   ```bash
   pip3 install -r requirements-neon.txt
   ```

2. **Start the Backend:**

   ```bash
   python3 neon_backend.py
   ```

3. **Open in Browser:**
   Navigate to `http://localhost:5000`

## 📁 File Structure

```
├── neon-tracking.html      # Main web interface
├── neon-tracking.css       # Neon styling and animations
├── neon-tracking.js        # Frontend functionality
├── neon_backend.py         # Flask backend server
├── start_neon_monitor.py   # Automatic startup script
├── requirements-neon.txt    # Python dependencies
├── wen_counter.py          # Your existing WEN counter logic
└── NEON_MONITOR_README.md  # This file
```

## 🔧 Configuration

### API Settings

- **API URL**: Your Farcaster API endpoint
- **API Token**: Your authentication token
- **Fetch Mode**: Single, Recent, or All messages
- **Max Pages**: Maximum pages to fetch (for Recent mode)
- **Target Hours**: Time window for Recent mode
- **Update Interval**: How often to refresh (in seconds)

### Example Configuration

```
API URL: https://client.farcaster.xyz/v2/direct-cast-conversation-messages?conversationId=...
API Token: MK-3PNeLvX4yjhZ/uf0cc2L5CVJkg6TFrz+ij59FEmPW397LN0qgoduxdUigLbLDpFVOmcJmyz1pOlTF8XpHUUUfA==
Fetch Mode: Recent
Max Pages: 20
Target Hours: 24
Update Interval: 300
```

## 🎮 Usage

### 1. **Start Monitoring**

- Enter your API credentials
- Configure fetch settings
- Click "🚀 Start Monitor"

### 2. **Real-time Updates**

- WEN count updates automatically
- Recent messages display live
- Status shows current monitor state

### 3. **Test Connection**

- Use "🧪 Test Connection" to verify API access
- Shows helpful error messages if backend is unavailable

## 🔌 Backend Integration

The monitor connects to your `wen_counter.py` through a Flask backend:

- **`/api/wen-data`** - Fetches WEN data using your counter logic
- **`/api/test-connection`** - Tests Farcaster API connectivity
- **`/api/status`** - Server health check

### Data Flow

```
Web Interface → Flask Backend → wen_counter.py → Farcaster API
     ↑              ↓              ↓              ↓
Real-time UI ← JSON Response ← Analysis ← Raw Messages
```

## 🎨 Customization

### Colors

Edit `neon-tracking.css` to change the neon color scheme:

```css
:root {
  --bg: #070a14; /* Background */
  --panel: #0f1428; /* Panel backgrounds */
  --cyan: #00eaff; /* Primary accent */
  --pink: #ff2bd6; /* WEN count */
  --yellow: #ffe600; /* Values */
  --red: #ff3b3b; /* Alerts */
  --muted: #96a0c2; /* Secondary text */
  --white: #e8f6ff; /* Primary text */
}
```

### Animations

Modify keyframes in the CSS for custom effects:

```css
@keyframes glowPulse {
  0%,
  100% {
    filter: drop-shadow(0 0 2px currentColor);
  }
  50% {
    filter: drop-shadow(0 0 14px currentColor);
  }
}
```

## 🚨 Troubleshooting

### Backend Not Available

- **Symptom**: "DEMO MODE - Mock Data" indicator
- **Solution**: Ensure `neon_backend.py` is running
- **Check**: Run `python3 neon_backend.py`

### Import Errors

- **Symptom**: "WEN counter not available" error
- **Solution**: Ensure `wen_counter.py` is in the same directory
- **Check**: Verify file exists and has no syntax errors

### Port Already in Use

- **Symptom**: "Address already in use" error
- **Solution**: Change port in `neon_backend.py`
- **Edit**: Modify `app.run(port=5000)` to use different port

### CORS Issues

- **Symptom**: Browser console shows CORS errors
- **Solution**: Backend includes CORS headers automatically
- **Check**: Ensure you're accessing via `http://localhost:5000`

## 🔄 Demo Mode

When the backend is unavailable, the monitor automatically switches to demo mode:

- Shows "DEMO MODE - Mock Data" indicator
- Generates random WEN counts for testing
- Displays sample messages
- All UI functionality works for testing

## 📱 Mobile Support

The interface is fully responsive:

- Adapts to different screen sizes
- Touch-friendly controls
- Optimized for mobile browsers

## 🚀 Performance Tips

- **Update Interval**: Use 300+ seconds for production
- **Max Pages**: Limit to 20-50 for Recent mode
- **Target Hours**: 24-48 hours provides good coverage
- **Browser**: Use modern browsers for best performance

## 🔒 Security Notes

- API tokens are stored in localStorage (browser only)
- No tokens are sent to external servers
- All communication is local (localhost:5000)
- Consider using environment variables for production

## 🤝 Contributing

To extend the monitor:

1. **Add New Features**: Edit `neon-tracking.js`
2. **Modify Styling**: Edit `neon-tracking.css`
3. **Add API Endpoints**: Edit `neon_backend.py`
4. **Update Data Processing**: Modify the analysis logic

## 📞 Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Verify `wen_counter.py` is working independently
3. Ensure all dependencies are installed
4. Check that the Flask server is running

## 🎯 Next Steps

- **Connect to Production**: Update backend URL for production use
- **Add Authentication**: Implement user login system
- **Database Integration**: Store historical WEN data
- **Notifications**: Add email/SMS alerts for WEN spikes
- **Analytics**: Track WEN trends over time

---

**Happy WEN Monitoring! 🎯✨**
