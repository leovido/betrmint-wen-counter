// Test specific WEN message matching
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
      // Test our exact WEN patterns with the real message we found
      const testMessages = [
        "Are you WENing son meme",
        "We are entering the WEN dimension",
        "WEN we hit 200 BB's",
        "wen moon?",
        "WEN is the question"
      ];

      const wenPatterns = [
        /w+e+n+/i, // Basic WEN pattern
        /w+e+n+\s*\?/i, // WEN with question mark
        /w+e+n+\s*!/i, // WEN with exclamation
        /w+e+n+\s*\./i, // WEN with period
        /\bw+e+n+\b/i, // WEN with word boundaries
        /w+e+n+[a-z]*/i, // WEN followed by any letters
      ];

      const results = testMessages.map(msg => {
        let wenMatches = [];
        let patternMatches = [];
        
        for (let i = 0; i < wenPatterns.length; i++) {
          const pattern = wenPatterns[i];
          const matches = msg.match(pattern);
          if (matches) {
            wenMatches.push(...matches);
            patternMatches.push(`Pattern ${i + 1}: ${pattern.source}`);
          }
        }
        
        return {
          message: msg,
          hasWen: wenMatches.length > 0,
          matches: wenMatches,
          patternMatches,
          pattern: wenMatches.length > 0 ? 'FOUND' : 'NO MATCH'
        };
      });

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        success: true,
        testResults: results,
        totalWenFound: results.filter(r => r.hasWen).length,
        patterns: wenPatterns.map((p, i) => `Pattern ${i + 1}: ${p.source}`),
        message: "Specific WEN pattern test results"
      });

    } catch (error) {
      console.error("Test Specific WEN Error:", error);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({ 
        error: "Test failed", 
        details: error.message
      });
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(405).json({ error: "Method not allowed" });
  }
}
