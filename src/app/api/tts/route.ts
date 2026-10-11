import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 501 }
      );
    }

    // Clean text of markdown symbols
    const cleaned = text
      .replace(/[#*_`]/g, "")
      .replace(/\[.*?\]/g, "")
      .slice(0, 800);

    // Default warm natural voice (Adam or Rachel or George)
    const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // George - warm British naturalist tone

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleaned,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.warn("ElevenLabs TTS error:", errText);
      return NextResponse.json({ error: "TTS generation failed" }, { status: 502 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    console.error("TTS API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate audio" },
      { status: 500 }
    );
  }
}
