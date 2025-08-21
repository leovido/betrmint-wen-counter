# 🚀 Quick Start: WEN AI Summarizer

Get the AI summarizer running locally in 3 simple steps!

## ⚡ Quick Start (3 Steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set OpenAI API Key

```bash
# Copy the example file
cp env.example .env

# Edit .env and add your API key
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Start Local Server

```bash
npm run dev
```

🎉 **That's it!** Visit `http://localhost:3000/ai-summarizer-demo` to test.

## 🧪 Testing Options

### Option A: Web Interface (Easiest)

1. Open `http://localhost:3000/ai-summarizer-demo`
2. Use the **"Test Data"** tab
3. Enter your OpenAI API key
4. Click "Test with Sample Data"

### Option B: Command Line

```bash
# Test basic connectivity
node test-simple.js

# Test with AI (requires OpenAI key)
node test-local.js
```

### Option C: Direct API Calls

```bash
# Health check
curl http://localhost:3000/health

# Sample data
curl http://localhost:3000/api/test-ai-summarizer

# AI summarizer (replace 'your-key' with actual key)
curl -X POST http://localhost:3000/api/ai-summarizer \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"senderUsername":"test","text":"wen moon?"}],"apiKey":"your-key","summaryType":"comprehensive"}'
```

## 🔑 Get OpenAI API Key

1. Visit [platform.openai.com](https://platform.openai.com/api-keys)
2. Sign up/login
3. Create new API key
4. Copy to your `.env` file

## 🚨 Troubleshooting

- **"Server not responding"** → Run `npm run dev`
- **"API key required"** → Check your `.env` file
- **Port in use** → Change `PORT=3001` in `.env`
- **Module errors** → Run `npm install` again

## 📱 What You'll See

The demo page has 3 tabs:

- **Standalone AI**: Test with any messages
- **Integrated WEN + AI**: Test with mock WEN data
- **Test Data**: Use predefined sample messages

## 🎯 Next Steps

Once local testing works:

1. `git add .`
2. `git commit -m "Add AI summarizer"`
3. `git push` (deploys to Vercel)

## 📚 More Info

- **Full Guide**: See `LOCAL_TESTING.md`
- **API Docs**: See the demo page
- **Code**: Check `api/` folder

---

**Need help?** Check the console output or visit the demo page for detailed error messages.
