// AI Summarizer API for WEN tracking group chats
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  // Handle POST requests
  if (req.method === "POST") {
    try {
      const { messages, apiKey, summaryType = "comprehensive" } = req.body;

      // Validate required parameters
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res
          .status(400)
          .json({ error: "Messages array is required and must not be empty" });
        return;
      }

      if (!apiKey) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({ error: "OpenAI API key is required" });
        return;
      }

      // Generate AI summary
      const summary = await generateAISummary(messages, apiKey, summaryType);

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(200).json(summary);
    } catch (error) {
      console.error("AI Summarizer Error:", error);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({
        error: "AI summarization failed",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(405).json({ error: "Method not allowed" });
  }
}

export async function generateAISummary(messages, apiKey, summaryType) {
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
        model: "gpt-4.1-nano", // Use latest GPT-4 for best results
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

export function createSystemPrompt(summaryType) {
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

export function parseSummaryResponse(summaryText, messageCount) {
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
