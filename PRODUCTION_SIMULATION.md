# 🚀 Production Simulation Guide

This guide shows you how to run your WEN AI Summarizer locally in a way that perfectly simulates your production Vercel deployment.

## 🎯 What is Production Simulation?

Production simulation runs your local server with:

- **Same API endpoints** as your Vercel deployment
- **Production-like behavior** (logging, error handling, CORS)
- **REAL Farcaster API data** (no more mock data!)
- **Full neon-tracking interface** working locally

## 🚀 Quick Start

### 1. Start Production Simulation Server

```bash
npm run prod-sim
```

### 2. Access Your Interfaces

- **Main Page**: http://localhost:3000/
- **Neon Tracking**: http://localhost:3000/neon-tracking
- **AI Demo**: http://localhost:3000/ai-summarizer-demo

### 3. Test Production Endpoints

All your production API endpoints are available locally:

- `POST /api/ai-summarizer` - AI Summarization
- `POST /api/wen-data-with-ai` - WEN Data + AI
- `POST /api/wen-data` - Main WEN Data
- `POST /api/test-connection` - Connection Test
- `POST /api/test-wen-patterns` - WEN Pattern Tests
- `GET /health` - Health Check

## 🔧 How It Works

### **Production-Like Features**

- **Structured Logging**: `[timestamp] METHOD /path - IP`
- **Error Handling**: Production-style error responses
- **CORS Configuration**: Production-like CORS settings
- **Static File Serving**: Same as Vercel deployment
- **404 Handling**: Proper endpoint not found responses

### **Real Data Integration**

- **Live Farcaster API**: Connects to your real Farcaster endpoints
- **Real WEN Messages**: Actual messages from your group chats
- **Live Timestamps**: Real message timestamps from the API
- **AI Integration**: Full AI summarization with real data
- **Fallback Protection**: Mock data only if API fails

## 🧪 Testing Scenarios

### **1. Full Neon-Tracking Interface**

1. Open http://localhost:3000/neon-tracking
2. Add your OpenAI API key
3. Start monitoring (uses mock data)
4. Generate AI summaries
5. Test all features without external dependencies

### **2. API Endpoint Testing**

```bash
# Test main WEN data endpoint
curl -X POST http://localhost:3000/api/wen-data \
  -H "Content-Type: application/json" \
  -d '{"apiUrl":"test","apiToken":"test"}'

# Test AI summarizer
curl -X POST http://localhost:3000/api/ai-summarizer \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"senderUsername":"test","text":"wen moon?","wen_matches":1}],"apiKey":"your-key","summaryType":"comprehensive"}'
```

### **3. Frontend Integration**

- Test your neon-tracking interface end-to-end
- Verify AI summary generation works
- Test all UI components with mock data
- Debug any frontend issues locally

## 🔄 Switching Between Modes

### **Development Mode** (for testing individual components)

```bash
npm run dev
```

- Basic local server
- Individual endpoint testing
- Simple mock data

### **Production Simulation Mode** (for full interface testing)

```bash
npm run prod-sim
```

- Complete production simulation
- All endpoints working
- Full neon-tracking interface
- Production-like behavior

## 🎯 Benefits of Production Simulation

1. **Full Interface Testing**: Test your complete neon-tracking UI locally
2. **Real Data Testing**: Use actual Farcaster API data locally
3. **Production Parity**: Same behavior as your Vercel deployment
4. **Debugging**: Easy to debug issues with real data
5. **Development Speed**: No need to deploy to test changes
6. **Data Validation**: Test with real production data before deploying

## 🚨 Troubleshooting

### **Port Already in Use**

```bash
# Kill existing processes
pkill -f "node.*local-dev-server.js"
pkill -f "node.*run-production-sim.js"

# Or change port
PORT=3001 npm run prod-sim
```

### **API Key Issues**

- Make sure you have a valid OpenAI API key
- The mock endpoints work without real API keys
- AI summarization requires a real OpenAI key

### **Interface Not Loading**

- Check that the server is running: `curl http://localhost:3000/health`
- Verify the correct URL: http://localhost:3000/neon-tracking
- Check browser console for any JavaScript errors

## 🎉 Ready to Test!

Your production simulation server is now running at http://localhost:3000

**Test your complete neon-tracking interface with:**

- ✅ Full UI functionality
- ✅ All API endpoints working
- ✅ AI summarization (with real OpenAI key)
- ✅ Mock WEN data generation
- ✅ Production-like behavior

This gives you the exact same experience as your Vercel deployment, but running locally for fast development and testing! 🚀
