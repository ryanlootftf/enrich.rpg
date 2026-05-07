import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { goal, style } = await req.json();

    if (!goal) {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    const stylePrompt =
      style === "easy"
        ? "Focus on easy, low-effort achievements."
        : style === "hard"
          ? "Focus on challenging, high-effort achievements."
          : "Create a balanced mix of easy, medium, and hard achievements.";

    const prompt = `You are a gamified self-improvement coach. A user wants to improve at: "${goal}"

${stylePrompt}

Generate 6-8 specific, actionable achievements for a RPG-style self-improvement game called Questify. Categorize them by difficulty.

Rules:
- Easy achievements: simple, low-effort, quick wins (reward 5 stars)
- Medium achievements: moderate effort, requires some commitment (reward 12 stars)
- Hard achievements: challenging, requires real effort (reward 25 stars)
- Achievements should be specific, measurable, and realistic
- Use a motivational but practical tone

Return ONLY valid JSON in this exact format:
{
  "achievements": [
    { "title": "Achievement name here", "difficulty": "easy", "stars_rewarded": 5 },
    { "title": "Achievement name here", "difficulty": "medium", "stars_rewarded": 12 },
    { "title": "Achievement name here", "difficulty": "hard", "stars_rewarded": 25 }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful gamification coach. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    const data = JSON.parse(content);
    return NextResponse.json({ achievements: data.achievements });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate achievements" },
      { status: 500 }
    );
  }
}