import { NextRequest, NextResponse } from "next/server";
import { MonitorConfig, TestConnectionResponse } from "@/types/wen";

export async function POST(request: NextRequest) {
  try {
    const config: MonitorConfig = await request.json();

    if (!config.apiUrl || !config.apiToken) {
      return NextResponse.json(
        { success: false, message: "API URL and Token are required" },
        { status: 400 }
      );
    }

    try {
      // Test the connection to the Farcaster API
      const response = await fetch(`${config.apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: "Connection successful! API is accessible.",
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `Connection failed. HTTP ${response.status}: ${response.statusText}`,
        });
      }
    } catch (fetchError) {
      return NextResponse.json({
        success: false,
        message:
          "Connection failed. Check your API URL and network connection.",
        error:
          fetchError instanceof Error ? fetchError.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error in test-connection API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
