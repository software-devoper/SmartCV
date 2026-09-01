import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import {
  generateFullResume,
  modifyGeneralResume,
  modifySegment,
  enhancePromptText,
} from "../server/aiResumeService";

const app = express();
app.use(express.json({ limit: "15mb" }));

// Normalize path to handle both /api/xxx and /xxx regardless of Vercel rewrites
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// 1. Single field enhance API
const handleGeminiEnhance = async (req: Request, res: Response) => {
  try {
    const { text, intent, userType } = req.body || {};

    if (!text || !intent) {
      return res.status(400).json({ error: "Missing text or intent" });
    }

    let apiKey = process.env.GEMINI_API_KEY || "";
    apiKey = apiKey.trim().replace(/^["']|["']$/g, "");
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured in Vercel environment variables" });
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

    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];
    let resultText = "";
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
      } catch (e) {
        console.warn(`Model ${model} enhance error, trying fallback...`);
      }
    }

    if (!resultText) {
      throw new Error("Failed to generate enhancement with AI models");
    }

    res.json({ result: resultText });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
};

app.post(["/api/gemini/enhance", "/gemini/enhance"], handleGeminiEnhance);

// 2. Full Generation from free-form prompt + photo
const handleFullGeneration = async (req: Request, res: Response) => {
  try {
    const { prompt, photoUrl } = req.body || {};
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "A prompt is required for resume generation." });
    }

    const result = await generateFullResume(prompt, photoUrl);
    res.json(result);
  } catch (error: any) {
    console.error("AI Full Generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate structured resume" });
  }
};

app.post(["/api/ai-chat/generate", "/ai-chat/generate"], handleFullGeneration);

// 3. General Whole-Resume Modification
const handleGeneralEdit = async (req: Request, res: Response) => {
  try {
    const { currentResume, instruction, history } = req.body || {};
    if (!currentResume || !instruction) {
      return res.status(400).json({ error: "Current resume data and instruction are required." });
    }

    const result = await modifyGeneralResume(currentResume, instruction, history || []);
    res.json(result);
  } catch (error: any) {
    console.error("AI General Edit error:", error);
    res.status(500).json({ error: error.message || "Failed to modify resume" });
  }
};

app.post(["/api/ai-chat/general-edit", "/ai-chat/general-edit"], handleGeneralEdit);

// 4. Segment-Specific Targeted Edit
const handleSegmentEdit = async (req: Request, res: Response) => {
  try {
    const { segmentPath, currentValue, instruction, resumeContext } = req.body || {};
    if (!segmentPath || !instruction) {
      return res.status(400).json({ error: "Segment path and instruction are required." });
    }

    const result = await modifySegment(
      segmentPath,
      currentValue,
      instruction,
      resumeContext || {}
    );
    res.json(result);
  } catch (error: any) {
    console.error("AI Segment Edit error:", error);
    res.status(500).json({ error: error.message || "Failed to edit segment" });
  }
};

app.post(["/api/ai-chat/segment-edit", "/ai-chat/segment-edit"], handleSegmentEdit);

// 5. Prompt Enhancement
const handleEnhancePrompt = async (req: Request, res: Response) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Draft prompt text is required to enhance." });
    }

    const enhancedText = await enhancePromptText(text);
    res.json({ enhancedText });
  } catch (error: any) {
    console.error("Prompt Enhancement error:", error);
    res.status(500).json({ error: error.message || "Failed to enhance prompt" });
  }
};

app.post(["/api/ai-chat/enhance-prompt", "/ai-chat/enhance-prompt"], handleEnhancePrompt);

// Fallback for any unknown /api route
app.all("*", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
});

export default app;
