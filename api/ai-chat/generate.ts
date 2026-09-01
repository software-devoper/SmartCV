import type { Request, Response } from "express";
import { generateFullResume } from "../../server/aiResumeService";

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
    const { prompt, photoUrl } = body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "A prompt is required for resume generation." });
    }

    const result = await generateFullResume(prompt, photoUrl);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("AI Full Generation error:", error);
    const errMsg = error?.message || "Failed to generate structured resume";
    return res.status(500).json({ error: errMsg });
  }
}
