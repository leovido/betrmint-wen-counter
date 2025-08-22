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
      const {
        apiUrl,
        apiToken,
        fetchMode,
        maxPages,
        targetHours,
        todayOnly,
        selectedDate,
      } = req.body;

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
        todayOnly,
        selectedDate
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

  // Analyze messages for WEN patterns - Enhanced to capture ALL WEN variations and repetitions
  // Original Python: self.wen_pattern = re.compile(r'w+e+n+', re.IGNORECASE)
  // Enhanced: Capture all variations including WENing, wenwen (counts as 2), etc.
  const wenPatterns = [
    /w+e+n+[a-z]*/gi, // Enhanced pattern: captures WEN + any following letters (WENing, WENed, etc.)
  ];

  console.log(
    `Using enhanced WEN pattern: ${wenPatterns[0].source} (captures extended words + global + case insensitive)`
  );

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

  // Implement EXACT Python time filtering logic from wen_counter.py
  if (targetHours || todayOnly || selectedDate) {
    const currentTime = new Date();
    let targetTime;
    let endTime = null;

    if (selectedDate) {
      // Filter by specific selected date (00:00 UTC to 23:59:59 UTC)
      const selectedDateObj = new Date(selectedDate);
      targetTime = new Date(selectedDateObj);
      targetTime.setUTCHours(0, 0, 0, 0);
      endTime = new Date(selectedDateObj);
      endTime.setUTCHours(23, 59, 59, 999);
      console.log(
        `Selected date filter: from ${targetTime.toISOString()} to ${endTime.toISOString()}`
      );
    } else if (todayOnly) {
      // EXACT Python logic: today_start = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
      targetTime = new Date(currentTime);
      targetTime.setUTCHours(0, 0, 0, 0);
      console.log(
        `Python today filter: from ${targetTime.toISOString()} (00:00 UTC today)`
      );
    } else {
      // EXACT Python logic: target_time = current_time.timestamp() * 1000 - (target_hours * 3600 * 1000)
      targetTime = new Date(currentTime.getTime() - targetHours * 3600 * 1000);
      console.log(
        `Python target hours filter: from ${targetTime.toISOString()} (${targetHours} hours ago)`
      );
    }

    console.log(`Current time: ${currentTime.toISOString()}`);
    console.log(`Target time: ${targetTime.toISOString()}`);

    // Debug: Show sample timestamps from messages (like Python debug)
    const sampleTimestamps = allMessages.slice(0, 5).map((msg) => ({
      message: msg.message?.substring(0, 30) + "...",
      serverTimestamp: msg.serverTimestamp,
      messageTime: new Date(msg.serverTimestamp).toISOString(),
      isRecent: new Date(msg.serverTimestamp) >= targetTime,
    }));
    console.log("Sample message timestamps:", sampleTimestamps);

    // EXACT Python filter logic: filter_messages_for_today
    filteredMessages = allMessages.filter((msg) => {
      if (!msg.serverTimestamp) return false;

      let messageTime;
      if (typeof msg.serverTimestamp === "string") {
        messageTime = new Date(msg.serverTimestamp);
      } else if (typeof msg.serverTimestamp === "number") {
        // serverTimestamp is in milliseconds, same as Python
        messageTime = new Date(msg.serverTimestamp);
      } else {
        return false;
      }

      // EXACT Python logic: return messageTime >= targetTime
      let result = messageTime >= targetTime;

      // If we have an end time (selected date), also check upper bound
      if (endTime) {
        result = result && messageTime <= endTime;
      }

      // Debug: Log a few timestamp comparisons
      if (Math.random() < 0.05) {
        const timeRange = endTime
          ? `${targetTime.toISOString()} to ${endTime.toISOString()}`
          : targetTime.toISOString();
        console.log(
          `Python timestamp comparison: messageTime=${messageTime.toISOString()}, timeRange=${timeRange}, result=${result}`
        );
      }

      return result;
    });

    console.log(
      `After Python-style filtering: ${filteredMessages.length} messages remain`
    );
  }

  // Now process the filtered messages for WEN patterns - EXACT Python logic from wen_counter.py
  for (const msg of filteredMessages) {
    // EXACT Python logic: if message.get('type') == 'text' and 'message' in message:
    if (msg.type === "text" && msg.message) {
      const text = msg.message;

      // Enhanced logic: Find ALL WEN patterns including overlapping ones
      // This will count "WENWEN" as 2 separate WENs
      let wenMatches = [];
      for (const pattern of wenPatterns) {
        // Use exec in a loop to find overlapping matches
        let match;
        const textCopy = text; // Create a copy for exec
        while ((match = pattern.exec(textCopy)) !== null) {
          wenMatches.push(match[0]);
          // Reset lastIndex to allow overlapping matches
          pattern.lastIndex = match.index + 1;
        }
        // Reset pattern for next use
        pattern.lastIndex = 0;
      }

      if (wenMatches.length > 0) {
        console.log(
          `🎯 Python WEN FOUND: "${text}" - Matches: ${wenMatches.join(", ")}`
        );
        totalWenCount += wenMatches.length;

        // EXACT Python logic for user info extraction
        let senderUsername = "Unknown";
        if (msg.senderContext && msg.senderContext.username) {
          senderUsername = msg.senderContext.username;
        } else if (msg.senderContext && msg.senderContext.displayName) {
          senderUsername = msg.senderContext.displayName;
        } else if (msg.senderContext && msg.senderContext.fid) {
          senderUsername = `User${msg.senderContext.fid}`;
        }

        // EXACT Python logic for timestamp
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

  // Calculate time span (same logic as Python wen_counter.py)
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

      // Same formatting as Python: "20h 2m" or "45m"
      timeSpan = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
  }

  const message_details = messagesWithWen.map((msg) => ({
    senderUsername: msg.senderUsername,
    text: msg.text,
    wen_matches: msg.wen_matches,
    timestamp: msg.timestamp,
  }));

  return {
    total_wen_count: totalWenCount,
    total_messages: allMessages.length,
    messages_with_wen: messagesWithWen.length,
    time_analysis: { time_span_formatted: timeSpan },
    message_details: message_details,
    all_messages: allMessages
      .slice(
        0,
        Math.min(Math.ceil(this.lastData.all_messages.length * 0.5), 500)
      )
      .map((msg) => ({
        senderUsername:
          msg.senderContext?.username ||
          msg.senderContext?.displayName ||
          `User${msg.senderContext?.fid || "Unknown"}`,
        type: msg.type,
        message: msg.message,
        senderFID: msg.senderContext?.fid,
        serverTimestamp: msg.serverTimestamp,
        mentions: msg.mentions || [],
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
        selectedDate,
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
        debugInfo: {
          currentTime: new Date().toISOString(),
          targetTime:
            targetHours || todayOnly || selectedDate
              ? (() => {
                  if (selectedDate) {
                    const selectedDateObj = new Date(selectedDate);
                    const startTime = new Date(selectedDateObj);
                    startTime.setUTCHours(0, 0, 0, 0);
                    const endTime = new Date(selectedDateObj);
                    endTime.setUTCHours(23, 59, 59, 999);
                    return `${startTime.toISOString()} to ${endTime.toISOString()}`;
                  } else if (todayOnly) {
                    const now = new Date();
                    const today = new Date(now);
                    today.setUTCHours(0, 0, 0, 0);
                    return today.toISOString();
                  } else {
                    const now = new Date();
                    const target = new Date(
                      now.getTime() - targetHours * 3600 * 1000
                    );
                    return target.toISOString();
                  }
                })()
              : "N/A",
          sampleMessageTimestamps: allMessages.slice(0, 3).map((msg) => ({
            message: msg.message?.substring(0, 30) + "...",
            serverTimestamp: msg.serverTimestamp,
            messageTime: new Date(msg.serverTimestamp).toISOString(),
            isRecent:
              targetHours || todayOnly || selectedDate
                ? (() => {
                    if (selectedDate) {
                      const selectedDateObj = new Date(selectedDate);
                      const startTime = new Date(selectedDateObj);
                      startTime.setUTCHours(0, 0, 0, 0);
                      const endTime = new Date(selectedDateObj);
                      endTime.setUTCHours(23, 59, 59, 999);
                      const messageTime = new Date(msg.serverTimestamp);
                      return messageTime >= startTime && messageTime <= endTime;
                    } else if (todayOnly) {
                      const now = new Date();
                      const today = new Date(now);
                      today.setUTCHours(0, 0, 0, 0);
                      return new Date(msg.serverTimestamp) >= today;
                    } else {
                      const now = new Date();
                      const target = new Date(
                        now.getTime() - targetHours * 3600 * 1000
                      );
                      return new Date(msg.serverTimestamp) >= target;
                    }
                  })()
                : true,
          })),
        },
      },
    },
  };
}
