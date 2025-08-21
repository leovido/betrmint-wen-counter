const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// For local testing, we'll implement the AI functions directly
// In production, these would be imported from the API files

// AI Summarizer functions for local testing
async function generateAISummary(messages, apiKey, summaryType) {
  // Prepare messages for AI analysis
  const formattedMessages = messages.map((msg) => ({
    role: "user",
    content: `[${msg.senderUsername || "Unknown"}] ${
      msg.text || msg.message || ""
    }`,
  }));

  // Create system prompt based on summary type
  const systemPrompt = createSystemPrompt(summaryType);

  // Prepare conversation for OpenAI
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

    // Parse the summary into structured format
    return parseSummaryResponse(summary, messages.length);
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    throw error;
  }
}

function createSystemPrompt(summaryType) {
  const basePrompt = `You are an AI assistant analyzing a group chat conversation. Your task is to provide intelligent insights and summaries similar to Apple Intelligence.

The conversation is from a group chat where people are tracking "WEN" (when) events. Analyze the messages and provide insights.

IMPORTANT RULES:
1. Mention particular users with an @ in front of their username, like this: @toadyhawk.eth
2. Very important to state when users are talking about something that is getting engagement via replies to their messages
3. If they are mostly simply writing WEN or related, simply summarise as "X users are WENning"
4. Respond in the following JSON format only

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
    // Try to parse as JSON first
    const parsed = JSON.parse(summaryText);

    // Validate required fields
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

    // Fallback: return the raw text with basic structure
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

// Local AI Summarizer endpoint
app.post("/api/ai-summarizer", async (req, res) => {
  try {
    const { messages, apiKey, summaryType = "comprehensive" } = req.body;

    // Validate required parameters
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "Messages array is required and must not be empty" });
    }

    if (!apiKey) {
      return res.status(400).json({ error: "OpenAI API key is required" });
    }

    // Generate AI summary
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

// Local test endpoint
app.get("/api/test-ai-summarizer", (req, res) => {
  const sampleMessages = [
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

  res.json({
    message: "Sample data for AI summarizer testing",
    sample_messages: sampleMessages,
    usage: {
      endpoint: "/api/ai-summarizer",
      method: "POST",
      body: {
        messages: "Array of message objects",
        apiKey: "Your OpenAI API key",
        summaryType: "comprehensive|brief|detailed|wen-focused (optional)",
      },
    },
    test_instructions: [
      "1. Copy the sample_messages array",
      "2. Get an OpenAI API key from https://platform.openai.com/",
      "3. POST to /api/ai-summarizer with the data",
      "4. Check the AI-generated summary!",
    ],
  });
});

// Mock test connection endpoint for local testing
app.post("/api/test-connection", (req, res) => {
  try {
    const { apiUrl, apiToken } = req.body;

    if (!apiUrl || !apiToken) {
      return res.status(400).json({
        success: false,
        error: "API URL and Token are required",
      });
    }

    // Mock successful connection
    res.json({
      success: true,
      message: "Connection test successful (local mock)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Connection test failed",
    });
  }
});

// Mock WEN patterns test endpoint for local testing
app.post("/api/test-wen-patterns", (req, res) => {
  try {
    // Mock successful WEN pattern tests
    res.json({
      success: true,
      summary: {
        total: 5,
        passed: 5,
        failed: 0,
        successRate: "100%",
      },
      message: "WEN pattern tests passed (local mock)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "WEN pattern tests failed",
    });
  }
});

// Mock main WEN data endpoint for local testing
app.post("/api/wen-data", (req, res) => {
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

    // Generate mock WEN data
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

    res.json({
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
        processingLog: `Processed ${mockMessages.length} messages, found ${totalWenCount} WEN matches`,
        timeFiltering: {
          targetHours,
          todayOnly,
          selectedDate,
          messagesAfterFilter: mockMessages.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch WEN data",
      details: error.message,
    });
  }
});

// Mock WEN data endpoint for local testing
app.post("/api/wen-data-with-ai", async (req, res) => {
  try {
    const {
      includeAISummary,
      openaiApiKey,
      summaryType = "comprehensive",
    } = req.body;

    // Mock WEN data response
    const mockWenData = {
      total_wen_count: 15,
      total_messages: 150,
      messages_with_wen: 12,
      time_analysis: { time_span_formatted: "24 hours" },
      message_details: [
        {
          senderUsername: "user1",
          text: "wen launch?",
          wen_matches: 1,
          timestamp: new Date().toISOString(),
        },
        {
          senderUsername: "user2",
          text: "wen moon wen moon",
          wen_matches: 2,
          timestamp: new Date().toISOString(),
        },
      ],
      all_messages: [
        {
          senderUsername: "user1",
          text: "wen launch?",
          timestamp: new Date().toISOString(),
        },
        {
          senderUsername: "user2",
          text: "wen moon wen moon",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Add AI summary if requested
    if (includeAISummary && openaiApiKey) {
      try {
        const aiSummary = await generateAISummary(
          mockWenData.all_messages || [],
          openaiApiKey,
          summaryType
        );
        mockWenData.ai_summary = aiSummary;
      } catch (aiError) {
        console.error("AI summary generation failed:", aiError);
        mockWenData.ai_summary = {
          error: "AI summary generation failed",
          details: aiError.message,
        };
      }
    }

    res.json(mockWenData);
  } catch (error) {
    console.error("Mock WEN Data Error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Serve the demo page
app.get("/ai-summarizer-demo", (req, res) => {
  res.sendFile(path.join(__dirname, "ai-summarizer-demo.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Local dev server running" });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `🚀 Local development server running on http://localhost:${PORT}`
  );
  console.log(`📱 Demo page: http://localhost:${PORT}/ai-summarizer-demo`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Summarizer: http://localhost:${PORT}/api/ai-summarizer`);
  console.log(
    `🧪 Test endpoint: http://localhost:${PORT}/api/test-ai-summarizer`
  );
  console.log(
    `📊 Mock WEN data: http://localhost:${PORT}/api/wen-data-with-ai`
  );
  console.log(`🔗 Main WEN data: http://localhost:${PORT}/api/wen-data`);
  console.log(
    `🧪 Test connection: http://localhost:${PORT}/api/test-connection`
  );
  console.log(
    `🧪 Test WEN patterns: http://localhost:${PORT}/api/test-wen-patterns`
  );
  console.log("");
  console.log("💡 To test locally:");
  console.log("1. Get an OpenAI API key from https://platform.openai.com/");
  console.log("2. Visit http://localhost:3000/ai-summarizer-demo");
  console.log('3. Use the "Test Data" tab to try with sample messages');
  console.log('4. Or use the "Standalone AI" tab with your own message data');
  console.log(
    "5. Or test the full neon-tracking interface at http://localhost:3000/neon-tracking.html"
  );
});
