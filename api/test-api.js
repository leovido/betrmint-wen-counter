// Simple test endpoint to verify Farcaster API
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
      const { apiUrl, apiToken } = req.body;

      if (!apiUrl || !apiToken) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({ error: "API URL and Token are required" });
        return;
      }

      // Test the API with minimal processing
      const headers = {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      };

      console.log("Testing API URL:", apiUrl);
      console.log("Using token:", apiToken.substring(0, 20) + "...");

      const response = await fetch(apiUrl, { headers, timeout: 30000 });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Return the raw data for inspection
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        success: true,
        status: response.status,
        data: data,
        message: "Raw API response for inspection",
      });
    } catch (error) {
      console.error("Test API Error:", error);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({
        error: "Test failed",
        details: error.message,
        stack: error.stack,
      });
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.status(405).json({ error: "Method not allowed" });
  }
}
