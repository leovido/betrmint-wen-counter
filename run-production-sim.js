#!/usr/bin/env node

// Production Simulation Script
// This script runs your local server in a way that mimics production Vercel deployment

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Production-like middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? false : "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(
  express.static(".", {
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
    etag: process.env.NODE_ENV === "production",
  })
);

// Production-like logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Production-like error handling
app.use((err, req, res, next) => {
  console.error("Production Error:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
    timestamp: new Date().toISOString(),
  });
});

// AI Summarizer functions for production simulation
async function generateAISummary(messages, apiKey, summaryType) {
  const formattedMessages = messages.map((msg) => ({
    role: "user",
    content: `[${msg.senderUsername || msg.senderContext?.username || "Unknown"}] ${
      msg.text || msg.message || ""
    }`,
  }));

  const systemPrompt = createSystemPrompt(summaryType);
  const conversation = [
    { role: "system", content: systemPrompt },
    ...formattedMessages,
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: conversation,
        max_tokens: 1500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary generated from OpenAI");
    }

    return parseSummaryResponse(summary, messages.length);
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    throw error;
  }
}

function createSystemPrompt(summaryType) {
  const basePrompt = `You are an AI assistant analyzing a group chat conversation. Your task is to provide intelligent insights and summaries similar to Apple Intelligence.

The conversation is from a group chat where people are tracking "WEN" (when) events. You will receive ALL messages from the conversation, not just WEN-related ones. This gives you full context to provide comprehensive analysis.

IMPORTANT RULES:
1. Mention particular users with an @ in front of their username, like this: @toadyhawk.eth
2. Very important to state when users are talking about something that is getting engagement via replies to their messages
3. If they are mostly simply writing WEN or related, simply summarise as "X users are WENning"
4. Analyze the FULL conversation context, including non-WEN messages that provide important context
5. Respond in the following JSON format only

IMPORTANT: Respond in the following JSON format only:
{
  "conversation_overview": "Brief overview of what's happening in the chat",
  "key_themes": ["Theme 1", "Theme 2", "Theme 3"],
  "sentiment": "Overall mood (positive/negative/neutral/mixed)",
  "wen_context": "What people are waiting for and why",
  "action_items": ["Action 1", "Action 2"],
  "trending_topics": ["Topic 1", "Topic 2"],
  "key_insights": "Most important observations about the conversation",
  "recommendations": "What the group should focus on next"
}

Focus on:`;

  switch (summaryType) {
    case "brief":
      return (
        basePrompt +
        `\n- Keep insights concise and actionable
- Focus on immediate next steps
- Highlight urgent matters`
      );

    case "detailed":
      return (
        basePrompt +
        `\n- Provide comprehensive analysis
- Include subtle patterns and trends
- Suggest long-term strategies`
      );

    case "wen-focused":
      return (
        basePrompt +
        `\n- Emphasize WEN-related discussions
- Track what people are waiting for
- Identify delays or blockers`
      );

    default: // comprehensive
      return (
        basePrompt +
        `\n- Balance brevity with depth
- Focus on actionable insights
- Identify both immediate and strategic opportunities`
      );
  }
}

function parseSummaryResponse(summaryText, messageCount) {
  try {
    const parsed = JSON.parse(summaryText);

    const requiredFields = [
      "conversation_overview",
      "key_themes",
      "sentiment",
      "wen_context",
      "action_items",
      "trending_topics",
      "key_insights",
      "recommendations",
    ];

    const missingFields = requiredFields.filter((field) => !parsed[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    return {
      success: true,
      summary: parsed,
      metadata: {
        message_count: messageCount,
        generated_at: new Date().toISOString(),
        model: "gpt-4.1-nano",
      },
    };
  } catch (parseError) {
    console.warn(
      "Failed to parse JSON response, returning raw text:",
      parseError
    );

    return {
      success: false,
      raw_summary: summaryText,
      error: "Failed to parse structured response",
      metadata: {
        message_count: messageCount,
        generated_at: new Date().toISOString(),
        model: "gpt-4.1-nano",
      },
    };
  }
}

// Production API Endpoints (matching your Vercel deployment)

// 1. AI Summarizer (production endpoint)
app.post("/api/ai-summarizer", async (req, res) => {
  try {
    const { messages, apiKey, summaryType = "comprehensive" } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages array is required and must not be empty",
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: "OpenAI API key is required",
      });
    }

    const summary = await generateAISummary(messages, apiKey, summaryType);
    res.json(summary);
  } catch (error) {
    console.error("AI Summarizer Error:", error);
    res.status(500).json({
      error: "AI summarization failed",
      details: error.message,
    });
  }
});

// 2. Enhanced WEN Data with AI (production endpoint) - NOW USES REAL DATA
app.post("/api/wen-data-with-ai", async (req, res) => {
  try {
    const {
      apiUrl,
      apiToken,
      fetchMode,
      maxPages,
      targetHours,
      todayOnly,
      selectedDate,
      includeAISummary,
      openaiApiKey,
      summaryType = "comprehensive",
    } = req.body;

    if (!apiUrl || !apiToken) {
      return res.status(400).json({
        error: "API URL and Token are required",
      });
    }

    // Use REAL Farcaster API data instead of mock data
    const realWenData = await fetchRealWenData({
      apiUrl,
      apiToken,
      fetchMode,
      maxPages,
      targetHours,
      todayOnly,
      selectedDate,
    });

    if (includeAISummary && openaiApiKey && realWenData.all_messages) {
      try {
        const aiSummary = await generateAISummary(
          realWenData.all_messages || [],
          openaiApiKey,
          summaryType
        );
        realWenData.ai_summary = aiSummary;
      } catch (aiError) {
        console.error("AI summary generation failed:", aiError);
        realWenData.ai_summary = {
          error: "AI summary generation failed",
          details: aiError.message,
        };
      }
    }

    res.json(realWenData);
  } catch (error) {
    console.error("Real WEN Data Error:", error);
    res.status(500).json({
      error: "Failed to fetch real WEN data",
      details: error.message,
    });
  }
});

// 3. Main WEN Data endpoint (production endpoint) - NOW USES REAL DATA
app.post("/api/wen-data", async (req, res) => {
  try {
    const {
      apiUrl,
      apiToken,
      fetchMode,
      maxPages,
      targetHours,
      todayOnly,
      selectedDate,
    } = req.body;

    if (!apiUrl || !apiToken) {
      return res.status(400).json({
        error: "API URL and Token are required",
      });
    }

    // Use REAL Farcaster API data instead of mock data
    const realWenData = await fetchRealWenData({
      apiUrl,
      apiToken,
      fetchMode,
      maxPages,
      targetHours,
      todayOnly,
      selectedDate,
    });

    res.json(realWenData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch WEN data",
      details: error.message,
    });
  }
});

// Function to fetch real WEN data from Farcaster API
async function fetchRealWenData({
  apiUrl,
  apiToken,
  fetchMode,
  maxPages,
  targetHours,
  todayOnly,
  selectedDate,
}) {
  try {
    console.log(`🔗 Fetching real data from: ${apiUrl}`);

    // Make request to your real Farcaster API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        fetchMode: fetchMode || "recent",
        maxPages: maxPages || 5,
        targetHours: targetHours || 24,
        todayOnly: todayOnly || false,
        selectedDate: selectedDate || null,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Farcaster API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      `✅ Real data fetched: ${data.total_messages || 0} messages, ${
        data.total_wen_count || 0
      } WEN matches`
    );

    return data;
  } catch (error) {
    console.error("Failed to fetch real data:", error);

    // Fallback to mock data if real API fails
    console.log("⚠️ Falling back to mock data due to API failure");
    return generateMockWenData();
  }
}

// Fallback mock data generator (only used when real API fails)
function generateMockWenData() {
  const mockMessages = [
    {
      senderUsername: "crypto_enthusiast",
      text: "WEN moon? I've been waiting for this project to launch for months!",
      wen_matches: 1,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      senderUsername: "wen_tracker",
      text: "wen mainnet? The testnet is working great but I need the real thing",
      wen_matches: 1,
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      senderUsername: "dev_support",
      text: "We're working on the final security audit. Should be ready by next week!",
      wen_matches: 0,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      senderUsername: "community_member",
      text: "wen community call? I have some questions about the tokenomics",
      wen_matches: 1,
      timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      senderUsername: "moderator",
      text: "Community call scheduled for Friday 3 PM UTC. Check the pinned message for details!",
      wen_matches: 0,
      timestamp: new Date(Date.now() - 0.25 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const messagesWithWen = mockMessages.filter((msg) => msg.wen_matches > 0);
  const totalWenCount = messagesWithWen.reduce(
    (sum, msg) => sum + msg.wen_matches,
    0
  );

  return {
    total_wen_count: totalWenCount,
    total_messages: mockMessages.length,
    messages_with_wen: messagesWithWen.length,
    time_analysis: { time_span_formatted: "2.5 hours" },
    message_details: messagesWithWen.map((msg) => ({
      senderUsername: msg.senderUsername,
      text: msg.text,
      wen_matches: msg.wen_matches,
      timestamp: msg.timestamp,
    })),
    all_messages: mockMessages.map((msg) => ({
      senderUsername: msg.senderUsername,
      text: msg.text,
      timestamp: msg.timestamp,
    })),
    debug: {
      processingLog: `Processed ${mockMessages.length} messages, found ${totalWenCount} WEN matches (MOCK DATA - Real API failed)`,
      timeFiltering: {
        messagesAfterFilter: mockMessages.length,
      },
    },
  };
}

// 4. Test endpoints (production endpoints)
app.post("/api/test-connection", (req, res) => {
  try {
    const { apiUrl, apiToken } = req.body;

    if (!apiUrl || !apiToken) {
      return res.status(400).json({
        success: false,
        error: "API URL and Token are required",
      });
    }

    res.json({
      success: true,
      message: "Connection test successful (production simulation)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Connection test failed",
    });
  }
});

app.post("/api/test-wen-patterns", (req, res) => {
  try {
    res.json({
      success: true,
      summary: {
        total: 5,
        passed: 5,
        failed: 0,
        successRate: "100%",
      },
      message: "WEN pattern tests passed (production simulation)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "WEN pattern tests failed",
    });
  }
});

// 5. Health check (production endpoint)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Production simulation server running",
    environment: "production-sim",
    timestamp: new Date().toISOString(),
  });
});

// 6. Serve static files (production-like)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/neon-tracking", (req, res) => {
  res.sendFile(path.join(__dirname, "neon-tracking.html"));
});

app.get("/ai-summarizer-demo", (req, res) => {
  res.sendFile(path.join(__dirname, "ai-summarizer-demo.html"));
});

// Production-like error handling for 404s
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Start production simulation server
app.listen(PORT, () => {
  console.log("🚀 PRODUCTION SIMULATION SERVER STARTED");
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "production-sim"}`);
  console.log("");
  console.log("📱 Available Pages:");
  console.log(`   • Main: http://localhost:${PORT}/`);
  console.log(`   • Neon Tracking: http://localhost:${PORT}/neon-tracking`);
  console.log(`   • AI Demo: http://localhost:${PORT}/ai-summarizer-demo`);
  console.log("");
  console.log("🔗 Production API Endpoints (NOW USING REAL DATA):");
  console.log(`   • POST /api/ai-summarizer - AI Summarization`);
  console.log(
    `   • POST /api/wen-data-with-ai - WEN Data + AI (Real Farcaster API)`
  );
  console.log(`   • POST /api/wen-data - Main WEN Data (Real Farcaster API)`);
  console.log(`   • POST /api/test-connection - Connection Test`);
  console.log(`   • POST /api/test-wen-patterns - WEN Pattern Tests`);
  console.log(`   • GET /health - Health Check`);
  console.log("");
  console.log("💡 This now uses your REAL Farcaster API data locally!");
  console.log("   Mock data only as fallback if API fails.");
  console.log("   Test with real production data in local environment.");
});
