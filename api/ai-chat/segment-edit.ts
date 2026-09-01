import type { Request, Response } from "express";
import { modifySegment } from "../../server/aiResumeService";

export default async function handler(req: Request, res: Response) {
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

    const { segmentPath, currentValue, instruction, resumeContext } = body || {};
    if (!segmentPath || !instruction) {
      return res.status(400).json({ error: "Segment path and instruction are required." });
    }

    const result = await modifySegment(
      segmentPath,
      currentValue,
      instruction,
      resumeContext || {}
    );
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("AI Segment Edit error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to edit segment",
    });
  }
}
