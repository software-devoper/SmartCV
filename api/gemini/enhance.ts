import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

async function parseBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === "object") return req.body;
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
  }
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk: any) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Only POST is accepted." });
  }

  try {
    const body = await parseBody(req);
    const { text, intent, userType } = body || {};

    if (!text || !intent) {
      return res.status(400).json({ error: "Missing text or intent" });
    }

    let apiKey = process.env.GEMINI_API_KEY || "";
    apiKey = apiKey.trim().replace(/^["']|["']$/g, "");
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing in Vercel" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    let systemInstruction = "";
    if (intent === "summary") {
      systemInstruction = `You are an expert resume writer. Rewrite the provided rough draft into a highly polished, professional 2-3 sentence career summary. The tone should be confident and objective. It is for a ${userType === "student" ? "student/recent graduate" : "working professional"}. Output ONLY the rewritten text, with no introductory filler, no quotes, and no markdown formatting.`;
    } else if (intent === "bullet") {
      systemInstruction = `You are an expert resume writer. Rewrite the provided weak resume bullet point into a strong, impactful bullet point starting with a powerful action verb. Quantify the impact if possible (use placeholders like 'X%' if metrics are missing but implied). Output ONLY the rewritten bullet point, with no introductory filler, no quotes, and no markdown formatting.`;
    } else {
      return res.status(400).json({ error: "Invalid intent" });
    }

    const models = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let resultText = "";
    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: text,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        resultText = response.text?.trim() || "";
        if (resultText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} enhance error, trying fallback...`);
      }
    }

    if (!resultText) {
      throw lastError || new Error("Failed to generate enhancement");
    }

    return res.status(200).json({ result: resultText });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate content" });
  }
}
