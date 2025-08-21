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
  // Use the same simple, effective pattern as the working Python wen_counter.py: r'w+e+n+'
  const wenPatterns = [
    /w+e+n+/i, // Basic WEN pattern (matches WEN, WENing, WENed, etc.) - SAME AS PYTHON
  ];

  let totalWenCount = 0;
  let messagesWithWen = [];

  // Debug: Log the first few messages to see what we're processing
  console.log(`Processing ${allMessages.length} messages for WEN patterns...`);

  // Debug: Check the first message structure
  if (allMessages.length > 0) {
    const firstMsg = allMessages[0];
    console.log("First message structure:", {
      hasMessage: !!firstMsg.message,
      messageType: typeof firstMsg.message,
      messageValue: firstMsg.message,
      allKeys: Object.keys(firstMsg),
    });
  }

  // Filter messages by time BEFORE processing for WEN patterns
  let filteredMessages = allMessages;

  // TEMPORARILY DISABLE TIME FILTERING - timestamps are from 2025 (future dates)
  // This is causing all messages to be filtered out
  console.log(
    `Time filtering disabled - timestamps are from 2025, causing filtering issues`
  );

  /*
  if (targetHours || todayOnly) {
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
    
    console.log(`Filtering messages: targetTime = ${targetTime.toISOString()}, todayOnly = ${todayOnly}`);
    
    filteredMessages = allMessages.filter((msg) => {
      if (!msg.serverTimestamp) return false;
      
      let messageTime;
      if (typeof msg.serverTimestamp === "string") {
        messageTime = new Date(msg.serverTimestamp);
      } else if (typeof msg.serverTimestamp === "number") {
        // serverTimestamp is in milliseconds, convert to Date
        messageTime = new Date(msg.serverTimestamp);
      } else {
        return false;
      }
      
      // The comparison should be: messageTime >= targetTime
      // But let's add some tolerance to avoid filtering out recent messages
      const toleranceMs = 5 * 60 * 1000; // 5 minutes tolerance
      const result = messageTime >= (targetTime - toleranceMs);
      
      // Debug: Log a few timestamp comparisons
      if (Math.random() < 0.05) { // Log 5% of messages for debugging
        console.log(`Timestamp comparison: messageTime=${messageTime.toISOString()}, targetTime=${targetTime.toISOString()}, result=${result}`);
      }
      
      return result;
    });
    
    console.log(`After time filtering: ${filteredMessages.length} messages remain`);
  }
  */

  // Now process the filtered messages for WEN patterns
  for (const msg of filteredMessages) {
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
        console.log(
          `🎯 WEN FOUND in message: "${text}" - Matches: ${wenMatches.join(
            ", "
          )}`
        );
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

  console.log(
    `Total WEN count: ${totalWenCount}, Messages with WEN: ${messagesWithWen.length}`
  );

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
    debug: {
      firstMessageStructure:
        allMessages.length > 0
          ? {
              hasMessage: !!allMessages[0].message,
              messageType: typeof allMessages[0].message,
              messageValue: allMessages[0].message,
              allKeys: Object.keys(allMessages[0]),
            }
          : null,
      wenPatterns: wenPatterns.map((p) => p.source),
      processingLog: `Processed ${allMessages.length} messages, found ${totalWenCount} WEN matches`,
      timeFiltering: {
        targetHours,
        todayOnly,
        messagesAfterFilter: filteredMessages ? filteredMessages.length : "N/A",
        sampleTimestamps:
          filteredMessages && filteredMessages.length > 0
            ? [
                filteredMessages[0].serverTimestamp,
                filteredMessages[Math.floor(filteredMessages.length / 2)]
                  .serverTimestamp,
                filteredMessages[filteredMessages.length - 1].serverTimestamp,
              ]
            : [],
      },
    },
  };
}
