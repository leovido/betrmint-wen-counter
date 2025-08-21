#!/usr/bin/env node

// Simple test script for local AI summarizer testing
const fetch = require("node-fetch");

// Test configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "your-api-key-here";
const LOCAL_SERVER_URL = "http://localhost:3000";

// Sample test messages
const testMessages = [
  {
    senderUsername: "crypto_enthusiast",
    text: "WEN moon? I've been waiting for this project to launch for months!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    senderUsername: "wen_tracker",
    text: "wen mainnet? The testnet is working great but I need the real thing",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    senderUsername: "dev_support",
    text: "We're working on the final security audit. Should be ready by next week!",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    senderUsername: "community_member",
    text: "wen community call? I have some questions about the tokenomics",
    timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    senderUsername: "moderator",
    text: "Community call scheduled for Friday 3 PM UTC. Check the pinned message for details!",
    timestamp: new Date(Date.now() - 0.25 * 60 * 60 * 1000).toISOString(),
  },
];

async function testLocalAI() {
  console.log("🧪 Testing Local AI Summarizer...\n");

  if (OPENAI_API_KEY === "your-api-key-here") {
    console.log("❌ Please set your OpenAI API key:");
    console.log('   export OPENAI_API_KEY="sk-your-actual-key"');
    console.log(
      "   or create a .env file with OPENAI_API_KEY=sk-your-actual-key\n"
    );
    return;
  }

  try {
    console.log("📡 Testing AI Summarizer endpoint...");

    const response = await fetch(`${LOCAL_SERVER_URL}/api/ai-summarizer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: testMessages,
        apiKey: OPENAI_API_KEY,
        summaryType: "comprehensive",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log("✅ AI Summary generated successfully!\n");
      console.log(
        "📋 Conversation Overview:",
        result.summary.conversation_overview
      );
      console.log("🎯 Key Themes:", result.summary.key_themes.join(", "));
      console.log("😊 Sentiment:", result.summary.sentiment);
      console.log("⏰ WEN Context:", result.summary.wen_context);
      console.log("✅ Action Items:", result.summary.action_items.join(", "));
      console.log("💡 Key Insights:", result.summary.key_insights);
      console.log("🚀 Recommendations:", result.summary.recommendations);
    } else {
      console.log("❌ AI Summary failed:", result.error);
      if (result.raw_summary) {
        console.log("Raw response:", result.raw_summary);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Make sure your local server is running: npm run dev");
  }
}

async function testHealthCheck() {
  try {
    console.log("🔍 Testing health check...");
    const response = await fetch(`${LOCAL_SERVER_URL}/health`);
    const health = await response.json();
    console.log("✅ Server health:", health.status);
    return true;
  } catch (error) {
    console.log(
      "❌ Server not responding. Make sure to start it with: npm run dev"
    );
    return false;
  }
}

async function runTests() {
  console.log("🚀 WEN AI Summarizer - Local Testing\n");

  // First check if server is running
  const serverHealthy = await testHealthCheck();
  if (!serverHealthy) return;

  console.log("");

  // Test AI summarizer
  await testLocalAI();

  console.log("\n🎉 Testing complete!");
  console.log(
    "💡 Visit http://localhost:3000/ai-summarizer-demo for the full web interface"
  );
}

// Run tests
runTests().catch(console.error);
