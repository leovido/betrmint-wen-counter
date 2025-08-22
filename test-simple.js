#!/usr/bin/env node

// Simple test script using built-in Node.js modules
const http = require("http");

// Test configuration
const LOCAL_SERVER_URL = "http://localhost:3000";

// Simple HTTP request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testHealthCheck() {
  try {
    console.log("🔍 Testing health check...");
    const response = await makeRequest(`${LOCAL_SERVER_URL}/health`);
    if (response.status === 200) {
      console.log("✅ Server health:", response.data.status);
      return true;
    } else {
      console.log("❌ Server health check failed:", response.status);
      return false;
    }
  } catch (error) {
    console.log(
      "❌ Server not responding. Make sure to start it with: npm run dev"
    );
    return false;
  }
}

async function testSampleData() {
  try {
    console.log("📡 Testing sample data endpoint...");
    const response = await makeRequest(
      `${LOCAL_SERVER_URL}/api/test-ai-summarizer`
    );

    if (response.status === 200) {
      console.log("✅ Sample data retrieved successfully");
      console.log(
        `📝 Found ${response.data.sample_messages.length} sample messages`
      );
      return response.data.sample_messages;
    } else {
      console.log("❌ Sample data request failed:", response.status);
      return null;
    }
  } catch (error) {
    console.log("❌ Sample data test failed:", error.message);
    return null;
  }
}

async function runTests() {
  console.log("🚀 WEN AI Summarizer - Simple Local Testing\n");

  // First check if server is running
  const serverHealthy = await testHealthCheck();
  if (!serverHealthy) return;

  console.log("");

  // Test sample data endpoint
  const sampleMessages = await testSampleData();
  if (sampleMessages) {
    console.log("\n📋 Sample messages available:");
    sampleMessages.forEach((msg, index) => {
      console.log(
        `   ${index + 1}. [${msg.senderUsername}]: ${msg.text.substring(
          0,
          50
        )}...`
      );
    });
  }

  console.log("\n🎉 Basic testing complete!");
  console.log("💡 To test the AI summarizer:");
  console.log(
    "   1. Visit http://localhost:3000/ai-summarizer-demo in your browser"
  );
  console.log('   2. Use the "Test Data" tab with your OpenAI API key');
  console.log("   3. Or use curl to test the API directly:");
  console.log("");
  console.log("   curl -X POST http://localhost:3000/api/ai-summarizer \\");
  console.log('     -H "Content-Type: application/json" \\');
  console.log(
    '     -d \'{"messages": [{"senderUsername": "test", "text": "wen moon?"}], "apiKey": "your-key", "summaryType": "comprehensive"}\''
  );
}

// Run tests
runTests().catch(console.error);
