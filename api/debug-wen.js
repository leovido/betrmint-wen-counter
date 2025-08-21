// Debug function to test WEN pattern matching
export default function handler(req, res) {
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
      // Test our WEN patterns with sample messages
      const testMessages = [
        "Are you WENing?",
        "wen moon?",
        "WEN is the question",
        "When will it happen?",
        "wen ever netnose want",
        "WEN??",
        "Hello world",
        "No WEN here",
      ];

      const wenPatterns = [
        /w+e+n+/i, // Basic WEN pattern
        /w+e+n+\s*\?/i, // WEN with question mark
        /w+e+n+\s*!/i, // WEN with exclamation
        /w+e+n+\s*\./i, // WEN with period
        /\bw+e+n+\b/i, // WEN with word boundaries
      ];

      const results = testMessages.map((msg) => {
        let wenMatches = [];
        for (const pattern of wenPatterns) {
          const matches = msg.match(pattern);
          if (matches) {
            wenMatches.push(...matches);
          }
        }

        return {
          message: msg,
          hasWen: wenMatches.length > 0,
          matches: wenMatches,
          pattern: wenMatches.length > 0 ? "FOUND" : "NO MATCH",
        };
      });

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        success: true,
        testResults: results,
        totalWenFound: results.filter((r) => r.hasWen).length,
        message: "WEN pattern test results",
      });
    } catch (error) {
      console.error("Debug Error:", error);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({
        error: "Debug failed",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(405).json({ error: "Method not allowed" });
  }
}
