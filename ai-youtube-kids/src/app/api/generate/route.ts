import { NextResponse } from "next/server";

interface AgentRequest {
  channelName: string;
  topic: string;
  targetAge: string;
  learningOutcome: string;
  tone: string;
  heroCharacter: string;
  runtimeSeconds: number;
  callToAction: string;
  cadence: string;
  extraNotes: string;
  creativity: number;
}

const systemPrompt = `You are Kid Shorts Studio, an elite creative director for YouTube Kids shorts.

Guidelines:
- Content must be COPPA friendly, inclusive, kind, and safe for children.
- Match the requested tone while staying upbeat, empathetic, and imaginative.
- Deliver actionable production notes for a 9:16 short from hook to CTA.
- Include quick educational beats that reinforce positive learning.
- Provide captions, visuals, sound design suggestions, and editing beats appropriate for high retention.
- Output MUST be valid JSON that matches the schema below. Never include markdown fences or commentary.

Schema:
{
  "headline": string,
  "hook": string,
  "storyline": [
    {
      "beat": string,
      "timing": string,
      "narration": string,
      "visuals": string,
      "soundDesign": string
    }
  ],
  "script": string,
  "educationalMoments": string[],
  "callToAction": string,
  "safetyChecklist": string[],
  "metadata": {
    "description": string,
    "hashtags": string[],
    "keywords": string[],
    "publishingTip": string
  },
  "thumbnailConcepts": string[],
  "repurposingIdeas": string[]
}

Ensure narrator lines are fun to perform. Offer fresh thumbnail ideas with clear focal points and expressive characters.`;

function buildUserPrompt(payload: AgentRequest) {
  const {
    channelName,
    topic,
    targetAge,
    learningOutcome,
    tone,
    heroCharacter,
    runtimeSeconds,
    callToAction,
    cadence,
    extraNotes,
  } = payload;

  const runtimeFocus = Math.max(15, Math.min(90, runtimeSeconds));

  return [
    `Channel name: ${channelName || "Not provided"}`,
    `Short concept: ${topic}`,
    `Target age group: ${targetAge}`,
    `Desired learning outcome: ${learningOutcome || "Create an age-appropriate takeaway."}`,
    `Tone: ${tone}`,
    `Hero or host: ${heroCharacter || "Create an original, friendly character."}`,
    `Ideal runtime: ${runtimeFocus} seconds`,
    `Publishing cadence: ${cadence}`,
    `Call to action requested: ${callToAction}`,
    `Extra notes / constraints: ${extraNotes || "Stay joyful, ethical, and child-safe."}`,
  ].join("\n");
}

function sanitizeJSON(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Missing OPENAI_API_KEY. Add it to your environment before generating content.",
      },
      { status: 500 },
    );
  }

  const payload: AgentRequest = await request.json();
  const userPrompt = buildUserPrompt(payload);
  const temperature = Math.min(
    0.95,
    Math.max(0.2, Number.isFinite(payload.creativity) ? payload.creativity + 0.2 : 0.6),
  );

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI error", errorText);
    return NextResponse.json(
      { error: "The model could not generate a short. Please try again." },
      { status: 502 },
    );
  }

  const data = await response.json();
  const content =
    data?.choices?.[0]?.message?.content ??
    '{"headline":"Creative output unavailable","hook":"","storyline":[],"script":"","educationalMoments":[],"callToAction":"","safetyChecklist":[],"metadata":{"description":"","hashtags":[],"keywords":[],"publishingTip":""},"thumbnailConcepts":[],"repurposingIdeas":[]}';

  try {
    const json = sanitizeJSON(content);
    return NextResponse.json(json);
  } catch (error) {
    console.error("JSON parse failed", error, content);
    return NextResponse.json(
      {
        error:
          "Generation succeeded but the response formatting failed. Try running again.",
      },
      { status: 500 },
    );
  }
}
