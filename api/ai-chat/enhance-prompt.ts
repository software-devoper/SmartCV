import type { Request, Response } from "express";
import { enhancePromptText } from "../../server/aiResumeService";

export default async function handler(req: Request, res: Response) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Only POST is accepted." });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        // ignore
      }
    }

    const { text } = body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Draft prompt text is required to enhance." });
    }

    const enhancedText = await enhancePromptText(text);
    return res.status(200).json({ enhancedText });
  } catch (error: any) {
    console.error("Enhance Prompt API error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to enhance prompt with Gemini AI",
    });
  }
}
