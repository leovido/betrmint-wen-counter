import { ResourceUnavailableRpcError } from "viem";

// Enhanced WEN data API with AI summarization
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
      const {
        apiUrl,
        apiToken,
        fetchMode,
        maxPages,
        targetHours,
        todayOnly,
        selectedDate,
        includeAISummary = false,
        openaiApiKey,
        summaryType = "comprehensive",
      } = req.body;

      // Validate required parameters
      if (!apiUrl || !apiToken) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({ error: "API URL and Token are required" });
        return;
      }

      // Validate AI summary parameters if requested
      if (includeAISummary && !openaiApiKey) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({
          error: "OpenAI API key is required when includeAISummary is true",
        });
        return;
      }

      // Fetch real data from Farcaster API
      const result = await fetchFarcasterData(
        apiUrl,
        apiToken,
        fetchMode,
        maxPages,
        targetHours,
        todayOnly,
        selectedDate
      );

      // Add AI summary if requested
      if (includeAISummary && openaiApiKey) {
        try {
          console.log(result.all_messages, "here");
          const aiSummary = await generateAISummary(
            result.all_messages || [],
            openaiApiKey,
            summaryType
          );
          result.ai_summary = aiSummary;
        } catch (aiError) {
          console.error("AI summary generation failed:", aiError);
          result.ai_summary = {
            error: "AI summary generation failed",
            details: aiError.message,
          };
        }
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(200).json(result);
    } catch (error) {
      console.error("API Error:", error);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(405).json({ error: "Method not allowed" });
  }
}

async function fetchFarcasterData(
  apiUrl,
  apiToken,
  fetchMode = "recent",
  maxPages = 5,
  targetHours = 24,
  todayOnly = false,
  selectedDate = null
) {
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };

  let allMessages = [];
  let currentUrl = apiUrl;
  let pageCount = 0;

  // Implement exact Python logic from wen_counter.py
  if (fetchMode === "all") {
    // Fetch ALL messages until no more cursor (same as Python fetch_all_messages)
    console.log("Fetching ALL messages until no more cursor is available...");

    while (currentUrl) {
      pageCount++;
      console.log(`Fetching page ${pageCount}...`);

      try {
        const response = await fetch(currentUrl, { headers, timeout: 30000 });

        if (!response.ok) {
          throw new Error(
            `Farcaster API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Extract messages from response
        if (data.result && data.result.messages) {
          allMessages.push(...data.result.messages);
          console.log(
            `Page ${pageCount}: Got ${data.result.messages.length} messages`
          );
        }

        // Get next page cursor (same logic as Python)
        if (data.next && data.next.cursor) {
          // Parse the base URL and add the cursor properly (same as Python)
          if (currentUrl.includes("?")) {
            // Remove any existing cursor parameters first
            const baseParts = currentUrl.split("&cursor=");
            if (baseParts.length > 1) {
              currentUrl = baseParts[0];
            }
            currentUrl = `${currentUrl}&cursor=${data.next.cursor}`;
          } else {
            currentUrl = `${currentUrl}?cursor=${data.next.cursor}`;
          }
          console.log(`Next URL: ${currentUrl}`);
        } else {
          console.log("No next.cursor found - reached the end of all messages");
          currentUrl = null;
        }
      } catch (error) {
        console.error(`Error fetching page ${pageCount}:`, error);
        break;
      }
    }

    console.log(
      `Fetched ${allMessages.length} messages across ${pageCount} pages (complete conversation history)`
    );
  } else {
    // Fetch messages based on mode (recent or single)
    while (currentUrl && pageCount < maxPages) {
      try {
        const response = await fetch(currentUrl, { headers, timeout: 30000 });

        if (!response.ok) {
          throw new Error(
            `Farcaster API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Extract messages from response
        if (data.result && data.result.messages) {
          allMessages.push(...data.result.messages);
        }

        // Get next page cursor
        if (data.next && data.next.cursor) {
          // Handle different URL formats
          if (currentUrl.includes("?")) {
            currentUrl = `${apiUrl}&cursor=${data.next.cursor}`;
          } else {
            currentUrl = `${apiUrl}?cursor=${data.next.cursor}`;
          }
        } else {
          currentUrl = null; // No more pages
        }

        pageCount++;
      } catch (error) {
        console.error(`Error fetching page ${pageCount}:`, error);
        break;
      }
    }
  }

  // Analyze messages for WEN patterns
  const wenPatterns = [
    /w+e+n+[a-z]*/gi, // Enhanced pattern: captures WEN + any following letters
  ];

  let totalWenCount = 0;
  let messagesWithWen = [];

  // Filter messages by time
  let filteredMessages = allMessages;

  if (targetHours || todayOnly || selectedDate) {
    const currentTime = new Date();
    let targetTime;
    let endTime = null;

    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      targetTime = new Date(selectedDateObj);
      targetTime.setUTCHours(0, 0, 0, 0);
      endTime = new Date(selectedDateObj);
      endTime.setUTCHours(23, 59, 59, 999);
    } else if (todayOnly) {
      targetTime = new Date(currentTime);
      targetTime.setUTCHours(0, 0, 0, 0);
    } else {
      targetTime = new Date(currentTime.getTime() - targetHours * 3600 * 1000);
    }

    filteredMessages = allMessages.filter((msg) => {
      if (!msg.serverTimestamp) return false;

      let messageTime;
      if (typeof msg.serverTimestamp === "string") {
        messageTime = new Date(msg.serverTimestamp);
      } else if (typeof msg.serverTimestamp === "number") {
        messageTime = new Date(msg.serverTimestamp);
      } else {
        return false;
      }

      let result = messageTime >= targetTime;

      if (endTime) {
        result = result && messageTime <= endTime;
      }

      return result;
    });
  }

  // Process filtered messages for WEN patterns
  filteredMessages.forEach((msg) => {
    const text = msg.message || msg.text || "";
    let wenMatches = 0;

    wenPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        wenMatches += matches.length;
      }
    });

    if (wenMatches > 0) {
      totalWenCount += wenMatches;
      messagesWithWen.push({
        senderUsername: msg.senderContext?.username || "Unknown",
        text: text,
        wen_matches: wenMatches,
        timestamp: msg.serverTimestamp,
        message: text, // Keep both for compatibility
      });
    }
  });

  // Calculate time span
  let timeSpan = "Unknown";
  if (filteredMessages.length > 0) {
    const firstMsg = filteredMessages[0];
    const lastMsg = filteredMessages[filteredMessages.length - 1];

    if (firstMsg.serverTimestamp && lastMsg.serverTimestamp) {
      const firstTime = new Date(firstMsg.serverTimestamp);
      const lastTime = new Date(lastMsg.serverTimestamp);
      const diffHours = (lastTime - firstTime) / (1000 * 60 * 60);

      if (diffHours < 1) {
        timeSpan = `${Math.round(diffHours * 60)} minutes`;
      } else if (diffHours < 24) {
        timeSpan = `${Math.round(diffHours)} hours`;
      } else {
        timeSpan = `${Math.round(diffHours / 24)} days`;
      }
    }
  }

  return {
    total_wen_count: totalWenCount,
    total_messages: allMessages.length,
    messages_with_wen: messagesWithWen.length,
    time_analysis: { time_span_formatted: timeSpan },
    message_details: messagesWithWen.map((msg) => ({
      senderUsername: msg.senderUsername,
      text: msg.text,
      wen_matches: msg.wen_matches,
      timestamp: msg.timestamp,
    })),
    all_messages: allMessages.map((msg) => ({
      senderUsername: msg.senderContext?.username || "Unknown",
      text: msg.message || msg.text || "",
      timestamp: msg.serverTimestamp,
    })),
    debug: {
      processingLog: `Processed ${allMessages.length} messages, found ${totalWenCount} WEN matches`,
      timeFiltering: {
        targetHours,
        todayOnly,
        selectedDate,
        messagesAfterFilter: filteredMessages.length,
      },
    },
  };
}

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
        model: "gpt-4-turbo-preview",
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
        model: "gpt-4-turbo-preview",
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
        model: "gpt-4-turbo-preview",
      },
    };
  }
}
