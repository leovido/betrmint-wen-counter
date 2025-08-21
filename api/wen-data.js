// Real WEN data API with Farcaster integration
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
      const { apiUrl, apiToken, fetchMode, maxPages, targetHours, todayOnly } =
        req.body;

      // Validate required parameters
      if (!apiUrl || !apiToken) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({ error: "API URL and Token are required" });
        return;
      }

      // Fetch real data from Farcaster API
      const result = await fetchFarcasterData(
        apiUrl,
        apiToken,
        fetchMode,
        maxPages,
        targetHours,
        todayOnly
      );

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
  todayOnly = false
) {
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };

  let allMessages = [];
  let currentUrl = apiUrl;
  let pageCount = 0;

  // Fetch messages based on mode
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

  // Debug: Log first few messages to see structure
  if (allMessages.length > 0) {
    console.log(
      "First message structure:",
      JSON.stringify(allMessages[0], null, 2)
    );
    console.log("Sample message text:", allMessages[0].text || "No text field");

    // Log the actual message structure we found
    console.log("Message structure found:");
    console.log("- Text field: 'message'");
    console.log("- User field: 'senderContext.username'");
    console.log("- Timestamp field: 'serverTimestamp'");

    // Check if there are any messages with "wen" in them (case insensitive)
    const messagesWithWenText = allMessages.filter((msg) => {
      const text = msg.message || "";
      return text.toLowerCase().includes("wen");
    });

    console.log(
      `Found ${messagesWithWenText.length} messages containing 'wen'`
    );
    if (messagesWithWenText.length > 0) {
      console.log("First message with 'wen':", messagesWithWenText[0].message);
    }
  }

  // Analyze messages for WEN patterns
  // Try multiple patterns to catch different WEN variations
  const wenPatterns = [
    /w+e+n+/i, // Basic WEN pattern
    /w+e+n+\s*\?/i, // WEN with question mark
    /w+e+n+\s*!/i, // WEN with exclamation
    /w+e+n+\s*\./i, // WEN with period
    /\bw+e+n+\b/i, // WEN with word boundaries
  ];

  let totalWenCount = 0;
  let messagesWithWen = [];

  for (const msg of allMessages) {
    // Use the correct field name: 'message'
    const text = msg.message;

    if (text) {
      // Try all patterns
      let wenMatches = [];
      for (const pattern of wenPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          wenMatches.push(...matches);
        }
      }

      if (wenMatches.length > 0) {
        totalWenCount += wenMatches.length;

        // Extract user info from the correct field: 'senderContext'
        let senderUsername = "Unknown";
        if (msg.senderContext && msg.senderContext.username) {
          senderUsername = msg.senderContext.username;
        } else if (msg.senderContext && msg.senderContext.displayName) {
          senderUsername = msg.senderContext.displayName;
        } else if (msg.senderContext && msg.senderContext.fid) {
          senderUsername = `User${msg.senderContext.fid}`;
        }

        // Extract timestamp from the correct field: 'serverTimestamp'
        let timestamp = msg.serverTimestamp;

        messagesWithWen.push({
          senderUsername,
          text,
          wen_matches: wenMatches,
          timestamp,
        });
      }
    }
  }

  // Filter messages by time if needed
  if (messagesWithWen.length > 0) {
    const currentTime = new Date();

    let targetTime;
    if (todayOnly) {
      // From 00:00 UTC today
      targetTime = new Date(currentTime);
      targetTime.setUTCHours(0, 0, 0, 0);
    } else {
      // From X hours ago
      targetTime = new Date(currentTime.getTime() - targetHours * 3600 * 1000);
    }

    const filteredMessages = messagesWithWen.filter((msg) => {
      if (!msg.timestamp) return false;

      let messageTime;
      if (typeof msg.timestamp === "string") {
        messageTime = new Date(msg.timestamp);
      } else if (typeof msg.timestamp === "number") {
        messageTime = new Date(msg.timestamp);
      } else {
        return false;
      }

      return messageTime >= targetTime;
    });

    messagesWithWen = filteredMessages;
    totalWenCount = filteredMessages.reduce(
      (sum, msg) => sum + msg.wen_matches.length,
      0
    );
  }

  // Calculate time span
  let timeSpan = "0m";
  if (messagesWithWen.length > 0) {
    const timestamps = messagesWithWen
      .map((msg) => msg.timestamp)
      .filter((ts) => ts)
      .map((ts) => new Date(ts));

    if (timestamps.length > 0) {
      const oldest = new Date(Math.min(...timestamps));
      const newest = new Date(Math.max(...timestamps));
      const timeDiff = newest - oldest;

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      timeSpan = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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
  };
}
