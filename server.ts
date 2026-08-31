import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  generateFullResume,
  modifyGeneralResume,
  modifySegment,
  enhancePromptText,
} from "./server/aiResumeService";

const PORT = 3000;

async function startServer() {
  const app = express();
  // Increase payload limit for base64 photo uploads
  app.use(express.json({ limit: "15mb" }));

  // Existing single field enhance API
  app.post("/api/gemini/enhance", async (req, res) => {
    try {
      const { text, intent, userType } = req.body;

      if (!text || !intent) {
        return res.status(400).json({ error: "Missing text or intent" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
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

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: text,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ result: response.text?.trim() });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  // AI Resume Chat Builder Endpoints

  // 1. Full Generation from free-form prompt + photo
  app.post("/api/ai-chat/generate", async (req, res) => {
    try {
      const { prompt, photoUrl } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "A prompt is required for resume generation." });
      }

      const result = await generateFullResume(prompt, photoUrl);
      res.json(result);
    } catch (error: any) {
      console.error("AI Full Generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate structured resume" });
    }
  });

  // 2. General Whole-Resume Modification
  app.post("/api/ai-chat/general-edit", async (req, res) => {
    try {
      const { currentResume, instruction, history } = req.body;
      if (!currentResume || !instruction) {
        return res.status(400).json({ error: "Current resume data and instruction are required." });
      }

      const result = await modifyGeneralResume(currentResume, instruction, history || []);
      res.json(result);
    } catch (error: any) {
      console.error("AI General Edit error:", error);
      res.status(500).json({ error: error.message || "Failed to modify resume" });
    }
  });

  // 3. Segment-Specific Targeted Edit
  app.post("/api/ai-chat/segment-edit", async (req, res) => {
    try {
      const { segmentPath, currentValue, instruction, resumeContext } = req.body;
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
  });

  // 4. Prompt Enhancement
  app.post("/api/ai-chat/enhance-prompt", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Draft prompt text is required to enhance." });
      }

      const enhancedText = await enhancePromptText(text);
      res.json({ enhancedText });
    } catch (error: any) {
      console.error("Prompt Enhancement error:", error);
      res.status(500).json({ error: error.message || "Failed to enhance prompt" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express v4, use '*'
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
