# 🌐 WEN Monitor Web Dashboard

A modern, responsive web interface for monitoring WEN variations in Farcaster messages with real-time updates and neon aesthetics.

## ✨ Features

- **🎨 Neon Aesthetic**: Cyberpunk-inspired design with glowing effects
- **📱 Responsive**: Works on desktop, tablet, and mobile devices
- **⚡ Real-time Updates**: Live monitoring with configurable intervals
- **🔧 Easy Configuration**: Web-based setup for all monitor parameters
- **💾 Persistent Settings**: Saves configuration in browser localStorage
- **📊 Live Statistics**: Real-time WEN count, message analysis, and trends
- **🔥 Message Display**: Shows recent WEN messages with details
- **🔄 Smart Updates**: Trend indicators and change tracking

## 🚀 Quick Start

### 1. Open the Dashboard

Simply open `web_dashboard.html` in your web browser. No server setup required!

### 2. Configure Your Settings

- **API URL**: Your Farcaster API endpoint
- **Bearer Token**: Your authentication token
- **Fetch Mode**: Single, Recent, or All messages
- **Update Interval**: How often to refresh data
- **Today Filter**: Option to show only today's messages

### 3. Start Monitoring

Click the **🚀 Start Monitor** button to begin real-time monitoring!

## 📁 Files

- **`web_dashboard.html`** - Main dashboard interface
- **`web_dashboard.css`** - Neon styling and responsive design
- **`web_dashboard.js`** - Interactive functionality and monitoring logic

## 🎯 Current Status

**⚠️ Note**: This is currently a **frontend prototype** with mock data. To connect it to your actual WEN counter:

### What Works Now:

- ✅ Complete UI design and layout
- ✅ Configuration management
- ✅ Real-time monitoring simulation
- ✅ Responsive design
- ✅ Neon aesthetics

### What Needs Integration:

- 🔄 Replace mock API calls with real Farcaster API calls
- 🔄 Connect to your `wen_counter.py` backend
- 🔄 Implement actual data fetching

## 🔌 Backend Integration Options

### Option 1: Direct API Integration

Modify `web_dashboard.js` to call Farcaster API directly:

```javascript
async fetchWenData(config) {
    const response = await fetch(config.apiUrl, {
        headers: {
            'Authorization': `Bearer ${config.bearerToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
}
```

### Option 2: Python Backend Bridge

Create a simple Flask/FastAPI server that wraps your `wen_counter.py`:

```python
from flask import Flask, request, jsonify
from wen_counter import WenCounter

app = Flask(__name__)
counter = WenCounter()

@app.route('/api/wen-data', methods=['POST'])
def get_wen_data():
    data = request.json
    # Use your existing WenCounter logic
    # Return JSON response
```

### Option 3: WebSocket Real-time

For true real-time updates, implement WebSocket connections.

## 🎨 Customization

### Colors

Modify `web_dashboard.css` to change the neon color scheme:

```css
:root {
  --primary-neon: #00ffff; /* Cyan */
  --secondary-neon: #ffff00; /* Yellow */
  --accent-neon: #ff0000; /* Red */
  --highlight-neon: #ff00ff; /* Magenta */
}
```

### Layout

Adjust the grid layout in CSS:

```css
.content-grid {
  grid-template-columns: 1fr 1fr; /* 2 columns */
  /* Change to: */
  grid-template-columns: 1fr; /* 1 column */
}
```

## 📱 Mobile Optimization

The dashboard is fully responsive and includes:

- Touch-friendly buttons
- Mobile-optimized layouts
- Responsive grids
- Optimized font sizes

## 🔒 Security Notes

- **Bearer tokens** are stored in browser localStorage (not secure for production)
- **API calls** should use HTTPS in production
- Consider implementing **user authentication** for production use

## 🚧 Development

### Adding New Features

1. **HTML**: Add new elements to `web_dashboard.html`
2. **CSS**: Style new elements in `web_dashboard.css`
3. **JavaScript**: Add functionality in `web_dashboard.js`

### Testing

- Open in multiple browsers
- Test responsive design
- Verify localStorage persistence
- Check error handling

## 🌟 Future Enhancements

- **📈 Charts**: Add WEN count graphs over time
- **🔔 Notifications**: Browser notifications for new WENs
- **📊 Analytics**: Detailed statistics and trends
- **🔄 WebSocket**: Real-time updates without polling
- **📱 PWA**: Progressive web app capabilities
- **🌙 Themes**: Dark/light mode toggle

## 🐛 Troubleshooting

### Common Issues:

**Dashboard won't start:**

- Check browser console for errors
- Verify API URL and token format
- Ensure all required fields are filled

**No data displayed:**

- Check network tab for API calls
- Verify API endpoint is accessible
- Check bearer token validity

**Styling issues:**

- Clear browser cache
- Check CSS file path
- Verify font loading

## 📞 Support

For issues or questions:

1. Check browser console for error messages
2. Verify your configuration settings
3. Test API connectivity separately
4. Check browser compatibility

## 🎉 Enjoy Your WEN Monitoring!

The dashboard provides a beautiful, modern interface for tracking WEN variations in real-time. Once connected to your backend, you'll have a powerful monitoring tool accessible from any device with a web browser!

---

_Built with ❤️ and lots of WEN energy_ 🚀
