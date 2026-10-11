import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { environment, interest, location } = await req.json();

    if (!environment) {
      return NextResponse.json({ error: "Environment is required" }, { status: 400 });
    }

    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "long" });
    const season = getSeason(now.getMonth());

    const prompt = `You are a field naturalist creating an outdoor nature quest and scavenger hunt.

Context:
- Setting/Environment: ${environment}
- Focal Interest: ${interest || "everything in nature"}
- General Location: ${location || "Local nature area"}
- Time of year: ${month} (${season})

Generate an engaging, realistic scavenger hunt with EXACTLY 6-8 distinct items that someone can observe or look for outdoors in this environment right now.

You must respond ONLY with a valid JSON object in this exact schema:
{
  "title": "Inspiring Quest Name (e.g. Whispering Canopy Expedition)",
  "description": "A 1-2 sentence compelling summary of the mission for this habitat and season.",
  "items": [
    {
      "name": "Specific species or natural phenomenon (e.g., Red-tailed Hawk, Lichen patch on granite, Acorn cap)",
      "description": "Specific field hint on where to look, what to listen for, or subtle visual clues.",
      "difficulty": "easy",
      "category": "Bird",
      "emoji": "🦅"
    }
  ],
  "tips": "One practical field recommendation (e.g., time of day, staying quiet, checking under logs)."
}

Rules:
- Mix difficulties: 3-4 "easy", 2-3 "medium", 1 "challenging"
- Each item MUST have a distinct, appropriate emoji
- Categories can be: Plant, Bird, Insect, Tree, Fungus, Geology, Wildlife, Track/Sign
- Items must be ecologically accurate for ${environment} in ${season}
- Output strictly raw JSON, with no markdown codeblocks or other commentary.`;

    const { text } = await generateContentWithFallback({
      contents: prompt,
      responseMimeType: "application/json",
    });

    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let quest;
    try {
      quest = JSON.parse(jsonStr);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        quest = JSON.parse(match[0]);
      } else {
        throw new Error("Unable to parse quest data from AI response.");
      }
    }

    if (quest && Array.isArray(quest.items)) {
      quest.items = quest.items.map((item: any) => ({
        ...item,
        found: false,
      }));
    }

    return NextResponse.json({ quest });
  } catch (err: any) {
    console.error("Quest API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate quest. Please try again." },
      { status: 500 }
    );
  }
}

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}
