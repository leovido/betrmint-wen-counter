# 🌐 WEN Monitor Web Server

This web server solves the **CORS (Cross-Origin Resource Sharing)** issue that prevents your browser from directly calling the Farcaster API.

## 🚫 **The Problem:**

- **CORS Error**: Browser blocks direct calls to `client.farcaster.xyz`
- **Network Error**: Can't fetch from external domain from local HTML file
- **Security**: Browsers prevent cross-origin requests for security

## ✅ **The Solution:**

A **Python Flask server** that:

1. **Serves your dashboard** (HTML/CSS/JS)
2. **Proxies API calls** to Farcaster
3. **Handles CORS** properly
4. **Uses your existing `wen_counter.py`** logic

## 🚀 **Quick Start:**

### **1. Install Dependencies:**

```bash
pip install -r requirements-web.txt
```

### **2. Start the Server:**

```bash
python web_server.py
```

### **3. Open Dashboard:**

Open your browser to: **http://localhost:5000**

## 📁 **Files Created:**

- **`web_server.py`** - Flask server with API endpoints
- **`requirements-web.txt`** - Python dependencies
- **`start_dashboard.py`** - Auto-install and start script

## 🔌 **API Endpoints:**

- **`GET /`** → Serves the dashboard HTML
- **`POST /api/fetch-wen`** → Fetches and processes WEN data
- **`POST /api/test-connection`** → Tests Farcaster API connection

## 🔄 **How It Works:**

### **Before (CORS Error):**

```
Browser → ❌ Farcaster API (Blocked)
```

### **After (Working):**

```
Browser → ✅ Local Server → ✅ Farcaster API
```

## 🎯 **Benefits:**

- ✅ **No more CORS errors**
- ✅ **Real-time data** from Farcaster
- ✅ **Uses your existing Python logic**
- ✅ **Full pagination support**
- ✅ **Today filter support**
- ✅ **Proper error handling**

## 🧪 **Test It:**

1. **Start server**: `python web_server.py`
2. **Open dashboard**: http://localhost:5000
3. **Enter your API credentials**
4. **Click "Test Connection"** - should work now!
5. **Start monitoring** - real data!

## 🛠️ **Troubleshooting:**

### **Port already in use:**

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### **Import errors:**

```bash
# Make sure you're in the project directory
pwd
ls -la web_server.py
```

### **Dependencies not found:**

```bash
# Install manually
pip install Flask Flask-CORS requests
```

## 🔒 **Security Notes:**

- **Local only**: Server runs on localhost (127.0.0.1)
- **No external access**: Only accessible from your machine
- **API credentials**: Stored in browser localStorage (not sent to server)

## 🚀 **Next Steps:**

1. **Start the server** with `python web_server.py`
2. **Open dashboard** at http://localhost:5000
3. **Configure your API settings**
4. **Start monitoring** real WEN data!

---

**The web server bridges the gap between your browser and the Farcaster API, giving you a fully functional real-time WEN monitor! 🎉**
