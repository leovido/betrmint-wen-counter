#!/bin/bash

echo "🚀 Starting WEN AI Summarizer Local Testing..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm found"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating one from template..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env file from template"
        echo "📝 Please edit .env and add your OpenAI API key"
        echo ""
    else
        echo "❌ env.example not found. Please create .env manually with:"
        echo "   OPENAI_API_KEY=sk-your-api-key-here"
        echo "   PORT=3000"
        echo "   NODE_ENV=development"
        echo ""
    fi
fi

# Check if OpenAI API key is set
if [ -f ".env" ]; then
    if grep -q "OPENAI_API_KEY=sk-" .env; then
        echo "✅ OpenAI API key found in .env"
    else
        echo "⚠️  Please add your OpenAI API key to .env file:"
        echo "   OPENAI_API_KEY=sk-your-actual-key-here"
        echo ""
    fi
fi

echo "🚀 Starting local development server..."
echo "📱 Demo page will be available at: http://localhost:3000/ai-summarizer-demo"
echo "🔍 Health check: http://localhost:3000/health"
echo ""
echo "💡 To test the AI summarizer:"
echo "   1. Open http://localhost:3000/ai-summarizer-demo in your browser"
echo "   2. Use the 'Test Data' tab with your OpenAI API key"
echo "   3. Or run: node test-local.js"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev
