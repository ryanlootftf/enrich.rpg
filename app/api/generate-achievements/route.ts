import OpenAI from "openai";

const nim = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_NIM_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();

    if (!goal || typeof goal !== "string") {
      return Response.json({ error: "Goal is required" }, { status: 400 });
    }

    const completion = await nim.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        {
          role: "system",
          content: `You are an achievement generator for a self-improvement app.
Given a user goal, return exactly 6 achievements in JSON format:
2 easy (5 stars), 2 medium (10 stars), 2 hard (20 stars).
Return ONLY a JSON array, no explanation.
Format: [{ "title": string, "difficulty": "easy"|"medium"|"hard", "stars_rewarded": number }]`,
        },
        { role: "user", content: `Goal: ${goal}` },
      ],
      temperature: 0.7,
      max_tokens: 500,
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