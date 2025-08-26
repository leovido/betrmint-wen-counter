import { NextRequest, NextResponse } from "next/server";
import type { WenMessage } from "@/types/wen";

export async function POST(request: NextRequest) {
  try {
    const { messages, openaiApiKey } = await request.json();

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is required" },
        { status: 400 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required for summarization" },
        { status: 400 }
      );
    }

    try {
      // Prepare the messages for OpenAI
      const messageTexts = messages
        .map((msg: WenMessage) => `@${msg.handle}: ${msg.content}`)
        .join("\n\n");

      const prompt = `Please analyze the following Farcaster messages that contain "WEN" mentions and provide a comprehensive summary:

${messageTexts}

Please provide a structured summary including:
1. Overall conversation overview
2. Key themes and topics discussed
3. Sentiment analysis
4. Context around WEN mentions
5. Notable insights
6. Any actionable items or recommendations

Keep the summary concise but informative.`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant that analyzes social media conversations and provides clear, structured summaries.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API error: ${errorData.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      const summary =
        data.choices[0]?.message?.content || "No summary generated";

      return NextResponse.json({ summary });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      return NextResponse.json(
        {
          error:
            "Failed to generate AI summary. Check your OpenAI API key and try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in ai-summarizer API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
