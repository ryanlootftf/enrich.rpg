import OpenAI from "openai";

const nim = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_NIM_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();

    if (!title || typeof title !== "string") {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const prompt = [
      title,
      description ? `Description: ${description}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await nim.chat.completions.create({
      model: "minimaxai/minimax-m2.7",
      messages: [
        {
          role: "system",
          content: `You are a quest generator for a self-improvement RPG app.
Given the user's game title and description, generate enough quests to total approximately 100 stars.

Star values by difficulty:
- easy = 1 star
- medium = 3 stars
- hard = 5 stars

Create a realistic mix of easy, medium, and hard quests that feel achievable and specific to the user's goal. The total sum of (stars_rewarded across all quests) should be around 100.

Each quest must include a "progress_max" field — the number of repetitions/steps needed to complete the quest. This should match the nature of the task:
- "Eat 3 meals" → progress_max: 3
- "Read 5 books" → progress_max: 5
- "Exercise 10 times" → progress_max: 10
- "Drink 8 glasses of water" → progress_max: 8
- "Meet 1 person" → progress_max: 1

Return ONLY a JSON array, no explanation. Format:
[
  {
    "title": "quest title",
    "description": "actionable description of the quest",
    "difficulty": "easy" | "medium" | "hard",
    "stars_rewarded": 1 | 3 | 5,
    "progress_max": number
  }
]

Make descriptions specific, actionable, and encouraging. They should give the user a clear idea of what to do.`,
        },
        { role: "user", content: `Goal: ${prompt}` },
      ],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 8192,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return Response.json({ error: "No response from AI" }, { status: 500 });
    }

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const achievements = JSON.parse(cleaned);

    if (!Array.isArray(achievements)) {
      return Response.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    return Response.json({ achievements });
  } catch (error) {
    console.error("AI generation error:", error);
    return Response.json(
      { error: "Failed to generate achievements" },
      { status: 500 }
    );
  }
}