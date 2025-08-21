// Detailed debug endpoint to inspect real Farcaster data
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
      const { apiUrl, apiToken, fetchMode, maxPages, targetHours, todayOnly } = req.body;

      if (!apiUrl || !apiToken) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({ error: "API URL and Token are required" });
        return;
      }

      // Fetch real data from Farcaster API
      const headers = {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      };

      let allMessages = [];
      let currentUrl = apiUrl;
      let pageCount = 0;

      // Fetch messages based on mode
      while (currentUrl && pageCount < (maxPages || 1)) {
        try {
          const response = await fetch(currentUrl, { headers, timeout: 30000 });
          
          if (!response.ok) {
            throw new Error(`Farcaster API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          // Extract messages from response
          if (data.result && data.result.messages) {
            allMessages.push(...data.result.messages);
          }
          
          // Get next page cursor
          if (data.next && data.next.cursor) {
            if (currentUrl.includes('?')) {
              currentUrl = `${apiUrl}&cursor=${data.next.cursor}`;
            } else {
              currentUrl = `${apiUrl}?cursor=${data.next.cursor}`;
            }
          } else {
            currentUrl = null;
          }
          
          pageCount++;
        } catch (error) {
          console.error(`Error fetching page ${pageCount}:`, error);
          break;
        }
      }

      // Detailed analysis of the first few messages
      const analysis = {
        totalMessages: allMessages.length,
        firstMessage: allMessages[0] ? {
          allFields: Object.keys(allMessages[0]),
          messageField: allMessages[0].message,
          messageFieldType: typeof allMessages[0].message,
          senderContext: allMessages[0].senderContext,
          serverTimestamp: allMessages[0].serverTimestamp,
          rawMessage: allMessages[0]
        } : null,
        sampleMessages: allMessages.slice(0, 3).map((msg, index) => ({
          index,
          message: msg.message,
          messageType: typeof msg.message,
          hasMessage: !!msg.message,
          senderUsername: msg.senderContext?.username,
          senderDisplayName: msg.senderContext?.displayName,
          timestamp: msg.serverTimestamp
        }))
      };

      // Test WEN detection on real messages
      const wenPatterns = [
        /w+e+n+/i,
        /w+e+n+\s*\?/i,
        /w+e+n+\s*!/i,
        /w+e+n+\s*\./i,
        /\bw+e+n+\b/i
      ];

      const wenTestResults = allMessages.slice(0, 10).map((msg, index) => {
        const text = msg.message || '';
        let wenMatches = [];
        
        for (const pattern of wenPatterns) {
          const matches = text.match(pattern);
          if (matches) {
            wenMatches.push(...matches);
          }
        }
        
        return {
          index,
          message: text,
          messageLength: text.length,
          hasMessage: !!text,
          wenMatches,
          hasWen: wenMatches.length > 0,
          pattern: wenMatches.length > 0 ? 'FOUND' : 'NO MATCH'
        };
      });

      // Check for any messages containing 'wen' (case insensitive)
      const messagesWithWenText = allMessages.filter(msg => {
        const text = msg.message || '';
        return text.toLowerCase().includes('wen');
      });

      analysis.wenTestResults = wenTestResults;
      analysis.messagesWithWenText = {
        count: messagesWithWenText.length,
        samples: messagesWithWenText.slice(0, 3).map(msg => ({
          message: msg.message,
          sender: msg.senderContext?.username
        }))
      };

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        success: true,
        analysis,
        message: "Detailed analysis of real Farcaster data"
      });

    } catch (error) {
      console.error("Debug Real Data Error:", error);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({ 
        error: "Debug failed", 
        details: error.message
      });
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(405).json({ error: "Method not allowed" });
  }
}
