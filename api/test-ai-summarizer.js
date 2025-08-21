// Test endpoint for AI Summarizer
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    // Return sample data for testing
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

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
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
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(405).json({ error: "Method not allowed" });
  }
}
