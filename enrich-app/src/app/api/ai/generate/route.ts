import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const nvidiaClient = process.env.NVIDIA_API_KEY
  ? new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: "https://integrate.api.nvidia.com/v1",
    })
  : null;

const MODEL = "deepseek-ai/deepseek-v4-flash";
const TIMEOUT_MS = 26_000;
const MAX_RETRIES = 3;

/**
 * Calls NVIDIA NIM with up to MAX_RETRIES attempts.
 * Each attempt uses an AbortController with a 26-second timeout
 * to stay within Vercel's 30-second function limit.
 */
async function callNvidiaWithRetry(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const completion = await nvidiaClient!.chat.completions.create(
        {
          model: MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 16384,
          top_p: 0.95,
          // extra_body is NVIDIA-specific, not in OpenAI types
          ...({ extra_body: { chat_template_kwargs: { thinking: true, reasoning_effort: "high" } } } as Record<string, unknown>),
        },
        { signal: controller.signal }
      );

      clearTimeout(timeout);

      const content = completion.choices[0]?.message?.content;
      if (content) return content;
    } catch (err: unknown) {
      lastError = err;
      if (err instanceof Error) {
        // If we got a response-level error (not an abort), log and retry
        console.warn(
          `NVIDIA NIM attempt ${attempt}/${MAX_RETRIES} failed:`,
          err.message
        );
      }
    }

    if (attempt < MAX_RETRIES) {
      // Brief backoff before retry
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw lastError ?? new Error("All NVIDIA NIM retries exhausted");
}

export async function POST(req: Request) {
  if (!nvidiaClient) {
    return NextResponse.json(
      { error: "AI generation not configured (missing NVIDIA_API_KEY)" },
      { status: 500 }
    );
  }

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

    const content = await callNvidiaWithRetry([
      {
        role: "system",
        content:
          "You are a helpful gamification coach. Always return valid JSON. Do not wrap in markdown code blocks.",
      },
      { role: "user", content: prompt },
    ]);

    // Extract JSON from the response (NVIDIA models may wrap in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;

    const data = JSON.parse(jsonStr);
    return NextResponse.json({ achievements: data.achievements });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate achievements" },
      { status: 500 }
    );
  }
}
