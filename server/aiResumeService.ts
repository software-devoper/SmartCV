import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CVData, defaultSectionOrder, studentSectionOrder } from "../src/types";

export function getGeminiClient(): GoogleGenAI {
  let apiKey = process.env.GEMINI_API_KEY || "";
  apiKey = apiKey.trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required. Please add it to your environment settings.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Helper to call Gemini model with automatic fallback models if preferred model is unavailable.
 */
async function generateWithFallback(ai: GoogleGenAI, config: any, contents: any) {
  const models = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      return res;
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying fallback...`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error("All Gemini AI models failed to respond");
}

function parseJsonCleanly(rawText: string): any {
  if (!rawText) return {};
  let cleaned = rawText.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON Parse failure on text:", rawText);
    throw new Error("Could not parse structured resume from AI output.");
  }
}

// JSON Schema for structured resume generation
const resumeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING, description: "Full name of the candidate" },
    title: { type: Type.STRING, description: "Professional title or headline" },
    userType: { 
      type: Type.STRING, 
      enum: ["student", "professional"], 
      description: "Whether the profile matches a student/recent grad or an experienced professional" 
    },
    summary: { type: Type.STRING, description: "Compelling 2-4 sentence professional summary" },
    contact: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        portfolio: { type: Type.STRING },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          field: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          gpa: { type: Type.STRING },
        },
        required: ["institution", "degree"],
      },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "High-impact action-oriented bullet points (each 1-2 lines with metrics)",
          },
        },
        required: ["company", "role", "bullets"],
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          tools: { type: Type.STRING, description: "Technologies and tools used, e.g., 'React, TypeScript, Node.js'" },
          link: { type: Type.STRING },
        },
        required: ["title", "description"],
      },
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING, description: "Category name e.g. 'Languages', 'Frameworks & Tools', 'Soft Skills'" },
          items: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["category", "items"],
      },
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          date: { type: Type.STRING },
          expiryDate: { type: Type.STRING },
          credentialUrl: { type: Type.STRING },
        },
        required: ["name", "issuer"],
      },
    },
    achievements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          issuer: { type: Type.STRING },
          date: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["title", "description"],
      },
    },
    languages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          language: { type: Type.STRING },
          level: { type: Type.STRING },
        },
        required: ["language", "level"],
      },
    },
    extracurriculars: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          activityName: { type: Type.STRING },
          role: { type: Type.STRING },
          organization: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["activityName", "role"],
      },
    },
    references: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          position: { type: Type.STRING },
          company: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
        },
      },
    },
  },
  required: ["fullName", "summary", "userType"],
};

export async function generateFullResume(prompt: string, photoUrl?: string): Promise<{ resumeData: CVData; summaryMessage: string }> {
  const ai = getGeminiClient();

  const systemInstruction = `You are an elite executive resume writer and career strategist.
Your task is to take free-form, unorganized, or comprehensive user text and extract, organize, and enrich it into a world-class professional resume data structure.
Ensure every bullet point follows the Google XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]") starting with active, punchy power verbs.
Generate unique ID strings (e.g., random 8-char strings) for all list item IDs if not present.
Infer whether the user is a 'student' (or recent grad) or a 'professional'.
Do not hallucinate fake employers or fake academic degrees, but make the phrasing crisp, quantifiable, and ATS-friendly.`;

  const response = await generateWithFallback(
    ai,
    {
      systemInstruction,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: resumeSchema,
    },
    prompt
  );

  const parsed = parseJsonCleanly(response.text || "{}");
  
  // Assemble full CVData
  const userType: "student" | "professional" = parsed.userType === "student" ? "student" : "professional";
  const defaultTemplate = userType === "student" ? "student-minimal" : "pro-executive";

  const completeResume: CVData = {
    templateId: defaultTemplate,
    userType,
    photo: photoUrl || "",
    fullName: parsed.fullName || "",
    title: parsed.title || "",
    summary: parsed.summary || "",
    contact: {
      email: parsed.contact?.email || "",
      phone: parsed.contact?.phone || "",
      location: parsed.contact?.location || "",
      linkedin: parsed.contact?.linkedin || "",
      portfolio: parsed.contact?.portfolio || "",
    },
    education: (parsed.education || []).map((e: any, idx: number) => ({
      id: e.id || `edu-${idx}-${Date.now()}`,
      institution: e.institution || "",
      degree: e.degree || "",
      field: e.field || "",
      startDate: e.startDate || "",
      endDate: e.endDate || "",
      gpa: e.gpa || "",
    })),
    experience: (parsed.experience || []).map((exp: any, idx: number) => ({
      id: exp.id || `exp-${idx}-${Date.now()}`,
      company: exp.company || "",
      role: exp.role || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
    })),
    projects: (parsed.projects || []).map((p: any, idx: number) => ({
      id: p.id || `proj-${idx}-${Date.now()}`,
      title: p.title || "",
      description: p.description || "",
      tools: p.tools || "",
      link: p.link || "",
    })),
    skills: (parsed.skills || []).map((s: any, idx: number) => ({
      id: s.id || `skill-${idx}-${Date.now()}`,
      category: s.category || "",
      items: Array.isArray(s.items) ? s.items : [],
    })),
    certifications: (parsed.certifications || []).map((c: any, idx: number) => ({
      id: c.id || `cert-${idx}-${Date.now()}`,
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
      expiryDate: c.expiryDate || "",
      credentialUrl: c.credentialUrl || "",
    })),
    achievements: (parsed.achievements || []).map((a: any, idx: number) => ({
      id: a.id || `ach-${idx}-${Date.now()}`,
      title: a.title || "",
      issuer: a.issuer || "",
      date: a.date || "",
      description: a.description || "",
    })),
    languages: (parsed.languages || []).map((l: any, idx: number) => ({
      id: l.id || `lang-${idx}-${Date.now()}`,
      language: l.language || "",
      level: l.level || "Intermediate",
    })),
    extracurriculars: (parsed.extracurriculars || []).map((ex: any, idx: number) => ({
      id: ex.id || `extra-${idx}-${Date.now()}`,
      activityName: ex.activityName || "",
      role: ex.role || "",
      organization: ex.organization || "",
      startDate: ex.startDate || "",
      endDate: ex.endDate || "",
      description: ex.description || "",
    })),
    references: (parsed.references || []).map((r: any, idx: number) => ({
      id: r.id || `ref-${idx}-${Date.now()}`,
      name: r.name || "",
      position: r.position || "",
      company: r.company || "",
      email: r.email || "",
      phone: r.phone || "",
    })),
    customSections: [],
    sectionOrder: userType === "student" ? studentSectionOrder : defaultSectionOrder,
    sectionVisibility: {
      photo: !!photoUrl,
      personal: true,
      summary: true,
      contact: true,
      experience: (parsed.experience || []).length > 0,
      education: (parsed.education || []).length > 0,
      projects: (parsed.projects || []).length > 0,
      skills: (parsed.skills || []).length > 0,
      certifications: (parsed.certifications || []).length > 0,
      achievements: (parsed.achievements || []).length > 0,
      languages: (parsed.languages || []).length > 0,
      extracurriculars: (parsed.extracurriculars || []).length > 0,
      references: (parsed.references || []).length > 0,
    },
  };

  const summaryMessage = `I've generated a complete, polished resume for **${completeResume.fullName || "you"}** formatted for ${userType === "student" ? "students & entry-level roles" : "experienced professionals"}. You can preview it on the right and click any section to refine it with targeted prompts!`;

  return { resumeData: completeResume, summaryMessage };
}

export async function modifyGeneralResume(
  currentResume: CVData,
  instruction: string,
  history: Array<{ role: string; content: string }>
): Promise<{ resumeData: CVData; replyMessage: string }> {
  const ai = getGeminiClient();

  const systemInstruction = `You are an expert resume consultant modifying an existing resume according to user instructions.
You will be provided with the current complete resume in JSON format and conversation history.
Update the resume JSON according to the instruction (e.g. adding a section, revising tone, shortening bullets, changing titles).
Preserve existing IDs, structure, and unmodified data. Return ONLY valid JSON adhering to the resume schema.`;

  const conversationContext = history
    .slice(-6)
    .map((h) => `${h.role === "user" ? "User" : "AI"}: ${h.content}`)
    .join("\n");

  const promptContent = `
Current Resume JSON:
${JSON.stringify(currentResume, null, 2)}

Recent Conversation Context:
${conversationContext}

User Modification Instruction:
${instruction}
`;

  const response = await generateWithFallback(
    ai,
    {
      systemInstruction,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: resumeSchema,
    },
    promptContent
  );

  const parsed = parseJsonCleanly(response.text || "{}");

  const updatedResume: CVData = {
    ...currentResume,
    fullName: parsed.fullName || currentResume.fullName,
    title: parsed.title || currentResume.title,
    summary: parsed.summary || currentResume.summary,
    contact: { ...currentResume.contact, ...(parsed.contact || {}) },
    education: parsed.education?.length ? parsed.education : currentResume.education,
    experience: parsed.experience?.length ? parsed.experience : currentResume.experience,
    projects: parsed.projects?.length ? parsed.projects : currentResume.projects,
    skills: parsed.skills?.length ? parsed.skills : currentResume.skills,
    certifications: parsed.certifications?.length ? parsed.certifications : currentResume.certifications,
    achievements: parsed.achievements?.length ? parsed.achievements : currentResume.achievements,
    languages: parsed.languages?.length ? parsed.languages : currentResume.languages,
    extracurriculars: parsed.extracurriculars?.length ? parsed.extracurriculars : currentResume.extracurriculars,
    references: parsed.references?.length ? parsed.references : currentResume.references,
  };

  const replyMessage = `I've updated your resume according to your request: "${instruction}".`;

  return { resumeData: updatedResume, replyMessage };
}

export async function modifySegment(
  segmentPath: string,
  currentValue: any,
  instruction: string,
  resumeContext: { fullName?: string; title?: string; userType?: string }
): Promise<{ updatedValue: any; replyMessage: string }> {
  const ai = getGeminiClient();

  const systemInstruction = `You are a precision resume editor. You are editing ONE specific component or text block of a resume (such as a single bullet point, summary paragraph, job title, or skill item).
Do NOT output full resume JSON.
Output ONLY the revised text or revised array/object for this specific segment as requested. No quotation marks surrounding the text, no conversational chatter.`;

  const promptContent = `
Resume Context: Candidate "${resumeContext.fullName || 'Candidate'}", ${resumeContext.title || ''} (${resumeContext.userType || 'professional'})
Segment Being Edited: ${segmentPath}
Current Value:
${typeof currentValue === "string" ? currentValue : JSON.stringify(currentValue, null, 2)}

User Instruction:
${instruction}

Please provide the revised replacement for this exact segment:
`;

  const response = await generateWithFallback(
    ai,
    {
      systemInstruction,
      temperature: 0.3,
    },
    promptContent
  );

  const rawResult = (response.text || "").trim();
  let updatedValue: any = rawResult;

  // If original was an array (e.g. skills items) and output is json or list, try parsing
  if (Array.isArray(currentValue)) {
    try {
      if (rawResult.startsWith("[")) {
        updatedValue = JSON.parse(rawResult);
      } else {
        updatedValue = rawResult.split("\n").map((s) => s.replace(/^[-*•\d.]+\s*/, "").trim()).filter(Boolean);
      }
    } catch {
      updatedValue = rawResult.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  const replyMessage = `Updated ${segmentPath}: "${instruction}"`;

  return { updatedValue, replyMessage };
}

export async function enhancePromptText(rawPrompt: string): Promise<string> {
  const ai = getGeminiClient();

  const systemInstruction = `You are an expert prompt engineer and resume advisor.
Rewrite the user's raw, unorganized, or conversational draft text into a clear, comprehensive, and well-structured prompt designed for an AI Resume Builder.
Prompt for key details regarding education, work history, quantifiable achievements, skills, and projects where the original was vague or brief.
Do not invent fake employers or fake credentials; simply clarify, expand, and structure what the user is conveying so the resume generator produces the best possible result.
Output ONLY the enhanced prompt text, ready for the user to review and send.`;

  const response = await generateWithFallback(
    ai,
    {
      systemInstruction,
      temperature: 0.4,
    },
    rawPrompt
  );

  return (response.text || "").trim();
}
