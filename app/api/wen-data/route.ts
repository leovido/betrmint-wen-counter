import { NextRequest, NextResponse } from "next/server";
import { MonitorConfig, WenDataResponse } from "@/types/wen";

export async function POST(request: NextRequest) {
  try {
    const config: MonitorConfig = await request.json();

    if (!config.apiUrl || !config.apiToken) {
      return NextResponse.json(
        { error: "API URL and Token are required" },
        { status: 400 }
      );
    }

    // This would integrate with your existing wen-data.js logic
    // For now, returning mock data structure
    const mockResponse: WenDataResponse = {
      wenCount: 42,
      messagesAnalyzed: 150,
      messagesWithWen: 42,
      messageTimespan: "24h",
      messages: [
        {
          id: "1",
          handle: "@wen_enthusiast",
          content: "WEN is the future! 🚀",
          timestamp: new Date().toISOString(),
          hash: "0x123...",
          author: {
            fid: 12345,
            username: "wen_enthusiast",
            displayName: "WEN Enthusiast",
            pfp: "https://picsum.photos/100/100",
            verified: true,
          },
          reactions: {
            likes: 15,
            recasts: 5,
            replies: 3,
          },
          mentions: [],
          embeds: [],
        },
        {
          id: "2",
          handle: "@wen_tracker",
          content: "Just found another WEN mention! 📈",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          hash: "0x456...",
          author: {
            fid: 67890,
            username: "wen_tracker",
            displayName: "WEN Tracker",
            pfp: "https://picsum.photos/100/100",
            verified: false,
          },
          reactions: {
            likes: 8,
            recasts: 2,
            replies: 1,
          },
          mentions: [],
          embeds: [],
        },
      ],
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Error in wen-data API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
