// Unit tests for WEN pattern matching
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
      // Test cases covering all WEN variations
      const testCases = [
        // Basic WEN patterns
        { input: "wen", expected: ["wen"], description: "Basic lowercase wen" },
        { input: "WEN", expected: ["WEN"], description: "Basic uppercase WEN" },
        { input: "Wen", expected: ["Wen"], description: "Title case Wen" },
        { input: "wEn", expected: ["wEn"], description: "Mixed case wEn" },

        // Extended E patterns
        { input: "weeen", expected: ["weeen"], description: "Multiple e's" },
        {
          input: "WEEEEEN",
          expected: ["WEEEEEN"],
          description: "Many E's uppercase",
        },
        {
          input: "weeeen",
          expected: ["weeeen"],
          description: "Many e's lowercase",
        },

        // Extended N patterns
        { input: "wenn", expected: ["wenn"], description: "Multiple n's" },
        {
          input: "WENNN",
          expected: ["WENNN"],
          description: "Many N's uppercase",
        },
        {
          input: "wennn",
          expected: ["wennn"],
          description: "Many n's lowercase",
        },

        // Combined extended patterns
        {
          input: "weeeennn",
          expected: ["weeeennn"],
          description: "Many e's and n's",
        },
        {
          input: "WEEEEENNNN",
          expected: ["WEEEEENNNN"],
          description: "Many E's and N's uppercase",
        },

        // WEN in context
        {
          input: "wen moon?",
          expected: ["wen"],
          description: "WEN with question mark",
        },
        {
          input: "WEN is the question",
          expected: ["WEN"],
          description: "WEN in sentence",
        },
        {
          input: "When will it happen?",
          expected: [],
          description: "When (not WEN pattern)",
        },
        {
          input: "wen ever netnose want",
          expected: ["wen"],
          description: "WEN in phrase",
        },
        {
          input: "WEN??",
          expected: ["WEN"],
          description: "WEN with multiple question marks",
        },
        {
          input: "wen!",
          expected: ["wen"],
          description: "WEN with exclamation",
        },
        { input: "WEN.", expected: ["WEN"], description: "WEN with period" },

        // WEN with additional letters (now should capture full words)
        {
          input: "WENing",
          expected: ["WENing"],
          description: "WEN followed by 'ing'",
        },
        {
          input: "wening",
          expected: ["wening"],
          description: "wen followed by 'ing'",
        },
        {
          input: "WENed",
          expected: ["WENed"],
          description: "WEN followed by 'ed'",
        },
        {
          input: "wened",
          expected: ["wened"],
          description: "wen followed by 'ed'",
        },
        {
          input: "WENer",
          expected: ["WENer"],
          description: "WEN followed by 'er'",
        },
        {
          input: "wener",
          expected: ["wener"],
          description: "wen followed by 'er'",
        },

        // Edge cases (now should capture multiple WENs)
        { input: "w", expected: [], description: "Just w (no e or n)" },
        { input: "we", expected: [], description: "Just we (no n)" },
        { input: "wn", expected: [], description: "Just wn (no e)" },
        {
          input: "wenwen",
          expected: ["wen", "wen"],
          description: "WEN repeated (should count as 2)",
        },
        {
          input: "wenWEN",
          expected: ["wen", "WEN"],
          description: "Mixed case WEN repeated (should count as 2)",
        },

        // Real examples from your data
        {
          input: "Are you WENing son meme",
          expected: ["WENing"],
          description: "Real example: WENing",
        },
        {
          input: "We are entering the WEN dimension",
          expected: ["WEN"],
          description: "Real example: WEN dimension",
        },
        {
          input: "WEN we hit 200 BB's",
          expected: ["WEN"],
          description: "Real example: WEN we hit",
        },
        {
          input: "wen moon?",
          expected: ["wen"],
          description: "Real example: wen moon?",
        },
        {
          input: "WEN is the question",
          expected: ["WEN"],
          description: "Real example: WEN is the question",
        },
        {
          input: "wen ever netnose want",
          expected: ["wen"],
          description: "Real example: wen ever",
        },
        {
          input: "WEN??",
          expected: ["WEN"],
          description: "Real example: WEN??",
        },

        // Complex cases (now should capture all WENs)
        {
          input: "wen moon wen moon wen moon",
          expected: ["wen", "wen", "wen"],
          description: "Multiple WENs in text (should count as 3)",
        },
        {
          input: "WEN is the question, but wen is the answer",
          expected: ["WEN", "wen"],
          description: "Mixed case WENs (should count as 2)",
        },
        {
          input: "wenWENwen",
          expected: ["wen", "WEN", "wen"],
          description: "Concatenated WENs (should count as 3)",
        },
        {
          input: "WENWEN",
          expected: ["WEN", "WEN"],
          description: "WENWEN should count as 2 separate WENs",
        },

        // Non-matches
        { input: "Hello world", expected: [], description: "No WEN pattern" },
        {
          input: "When will it happen?",
          expected: [],
          description: "When (not WEN)",
        },
        {
          input: "went",
          expected: ["wen"],
          description: "went (should match 'wen' within it)",
        },
        { input: "wine", expected: [], description: "wine (not WEN pattern)" },
        { input: "wane", expected: [], description: "wane (not WEN pattern)" },
        { input: "wane", expected: [], description: "wane (not WEN pattern)" },
        { input: "", expected: [], description: "Empty string" },
        { input: "   ", expected: [], description: "Whitespace only" },
      ];

      // Use the enhanced pattern that captures ALL WEN variations and repetitions
      const wenPattern = /w+e+n+[a-z]*/gi; // Enhanced pattern: captures WEN + any following letters (WENing, WENed, etc.)

      // Run all tests using the same logic as the main function
      const testResults = testCases.map((testCase) => {
        // Use the same enhanced logic as the main function for overlapping matches
        let wenMatches = [];
        const textCopy = testCase.input;

        // Use exec in a loop to find overlapping matches (same as main function)
        let match;
        while ((match = wenPattern.exec(textCopy)) !== null) {
          wenMatches.push(match[0]);
          // Reset lastIndex to allow overlapping matches
          wenPattern.lastIndex = match.index + 1;
        }
        // Reset pattern for next use
        wenPattern.lastIndex = 0;

        const actual = wenMatches;
        const passed =
          JSON.stringify(actual) === JSON.stringify(testCase.expected);

        return {
          description: testCase.description,
          input: testCase.input,
          expected: testCase.expected,
          actual: actual,
          passed: passed,
          pattern: wenPattern.source,
        };
      });

      // Calculate test statistics
      const totalTests = testResults.length;
      const passedTests = testResults.filter((result) => result.passed).length;
      const failedTests = totalTests - passedTests;

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        success: true,
        testResults: testResults,
        summary: {
          total: totalTests,
          passed: passedTests,
          failed: failedTests,
          successRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
        },
        pattern: wenPattern.source,
        message: "WEN pattern matching unit tests completed",
      });
    } catch (error) {
      console.error("WEN Pattern Test Error:", error);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({
        error: "Test failed",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(405).json({ error: "Method not allowed" });
  }
}
