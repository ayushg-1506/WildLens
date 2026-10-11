import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Extract base64 data and mime type from data URL
    const match = image.match(/^data:(.+?);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const prompt = `You are a professional field biologist, botanist, and naturalist. Examine this image and identify the organism or natural subject.

Respond ONLY with a valid JSON object matching this schema:
{
  "commonName": "Common Name of the species (or best identification)",
  "scientificName": "Scientific Latin name in italics convention",
  "category": "Plant | Bird | Insect | Tree | Fungus | Mammal | Reptile | Amphibian | Geology | Other",
  "family": "Taxonomic family (e.g. Asteraceae, Corvidae)",
  "confidence": "High | Moderate | Tentative",
  "habitat": "Where this organism naturally thrives",
  "season": "Peak active season or viewing period",
  "safety": "Clear safety info: non-toxic, edible, harmless, poisonous to touch, stinging hairs, venomous, or precautions",
  "summary": "2-3 engaging sentences describing key identification marks, behavior, and ecological importance.",
  "identificationTips": [
    "Key physical marker 1 (e.g., leaf venation, plumage pattern, serrated margin)",
    "Key physical marker 2 to distinguish from lookalikes"
  ],
  "funFact": "One captivating, scientifically accurate fact about this species."
}

Rules:
- Be as precise as possible. If the image is partially obscured or blurry, provide your best grounded identification and set confidence to 'Moderate' or 'Tentative'.
- If the image contains no living organism or natural subject, set commonName to "Unidentified Subject", category to "Other", and explain clearly in summary.
- Respond strictly in raw JSON without Markdown wrappers or commentary.`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
    ];

    const { text } = await generateContentWithFallback({
      contents,
      responseMimeType: "application/json",
    });

    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse identification result.");
      }
    }

    // Build markdown representation for backward compatibility or display
    const markdown = `## ${parsed.commonName || "Unknown Species"}
*${parsed.scientificName || ""}*

### Quick Facts
- **Type:** ${parsed.category || "Wild species"}
- **Family:** ${parsed.family || "N/A"}
- **Habitat:** ${parsed.habitat || "N/A"}
- **Season:** ${parsed.season || "N/A"}
- **Confidence:** ${parsed.confidence || "Moderate"}

### About
${parsed.summary || ""}

### Identification Tips
${(parsed.identificationTips || []).map((tip: string) => `- ${tip}`).join("\n")}

### Safety
${parsed.safety || "Observe from a respectful distance."}

### Fun Fact
${parsed.funFact || ""}`;

    return NextResponse.json({
      result: markdown,
      data: parsed,
    });
  } catch (err: any) {
    console.error("Identify API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to identify subject. Please try again." },
      { status: 500 }
    );
  }
}
