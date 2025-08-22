# 🚀 Local Testing Guide for WEN AI Summarizer

This guide will help you test the AI summarizer locally before deploying to Vercel.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **OpenAI API Key** - Get one from [platform.openai.com](https://platform.openai.com/api-keys)
3. **Git** (for version control)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Copy the example file
cp env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3000
NODE_ENV=development
```

**⚠️ Important**: Never commit your `.env` file to git!

### 3. Start Local Development Server

```bash
npm run dev
```

You should see output like:

```
🚀 Local development server running on http://localhost:3000
📱 Demo page: http://localhost:3000/ai-summarizer-demo
🔍 Health check: http://localhost:3000/health
🤖 AI Summarizer: http://localhost:3000/api/ai-summarizer
🧪 Test endpoint: http://localhost:3000/api/test-ai-summarizer
📊 Mock WEN data: http://localhost:3000/api/wen-data-with-ai
```

## 🧪 Testing Methods

### Method 1: Web Interface (Recommended)

1. Open your browser and go to `http://localhost:3000/ai-summarizer-demo`
2. Use the **"Test Data"** tab to test with sample messages
3. Enter your OpenAI API key and click "Test with Sample Data"
4. View the AI-generated summary

### Method 2: Command Line Testing

```bash
# Test the AI summarizer with sample data
node test-local.js
```

### Method 3: Direct API Testing

#### Test Health Check

```bash
curl http://localhost:3000/health
```

#### Test AI Summarizer

```bash
curl -X POST http://localhost:3000/api/ai-summarizer \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "senderUsername": "test_user",
        "text": "wen moon? I am excited!",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "apiKey": "your-openai-api-key",
    "summaryType": "comprehensive"
  }'
```

#### Test Sample Data Endpoint

```bash
curl http://localhost:3000/api/test-ai-summarizer
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Server not responding"

```bash
# Make sure the server is running
npm run dev
```

#### 2. "OpenAI API key required"

```bash
# Set your API key
export OPENAI_API_KEY="sk-your-key"
# or add it to .env file
```

#### 3. "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port already in use

```bash
# Change port in .env file
PORT=3001
# or kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Debug Mode

To see detailed logs, you can modify the server:

```javascript
// In local-dev-server.js, add:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

## 📊 Testing Different Scenarios

### 1. Test Different Summary Types

- **Comprehensive**: Balanced analysis
- **Brief**: Concise insights
- **Detailed**: In-depth analysis
- **WEN-Focused**: Emphasizes timing

### 2. Test with Various Message Types

- Short messages: "wen moon?"
- Long messages: Detailed explanations
- Mixed content: Questions, statements, announcements
- Multiple users: Different perspectives

### 3. Test Error Handling

- Invalid API key
- Empty message array
- Malformed JSON
- Network timeouts

## 🚀 Next Steps

Once local testing is successful:

1. **Deploy to Vercel**:

   ```bash
   git add .
   git commit -m "Add AI summarizer with local testing"
   git push
   ```

2. **Test on Vercel**: Visit your deployed demo page
3. **Integrate with main app**: Add AI summaries to your WEN dashboard

## 📝 API Reference

### Endpoints

- `GET /health` - Server health check
- `GET /ai-summarizer-demo` - Demo web interface
- `POST /api/ai-summarizer` - AI summarization
- `GET /api/test-ai-summarizer` - Sample test data
- `POST /api/wen-data-with-ai` - Mock WEN data with AI

### Request Format

```json
{
  "messages": [
    {
      "senderUsername": "string",
      "text": "string",
      "timestamp": "ISO string"
    }
  ],
  "apiKey": "string",
  "summaryType": "comprehensive|brief|detailed|wen-focused"
}
```

### Response Format

```json
{
  "success": true,
  "summary": {
    "conversation_overview": "string",
    "key_themes": ["string"],
    "sentiment": "string",
    "wen_context": "string",
    "action_items": ["string"],
    "trending_topics": ["string"],
    "key_insights": "string",
    "recommendations": "string"
  },
  "metadata": {
    "message_count": 5,
    "generated_at": "ISO string",
    "model": "gpt-4.1-nano"
  }
}
```

## 🎯 Tips for Effective Testing

1. **Start Simple**: Test with basic messages first
2. **Test Edge Cases**: Empty arrays, very long messages, special characters
3. **Monitor API Usage**: Check your OpenAI dashboard for usage
4. **Save Good Examples**: Keep track of messages that generate good summaries
5. **Iterate**: Adjust prompts based on results

Happy testing! 🚀
