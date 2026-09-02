import { CVData, AIProvider } from '../types';

/**
 * Normalizes raw output into full valid CVData
 */
function normalizeClientResumeData(raw: any, photoUrl?: string): CVData {
  const now = Date.now();
  const safeStr = (v: any, def = '') => (typeof v === 'string' ? v : def);
  const safeArr = (v: any) => (Array.isArray(v) ? v : []);

  const normalized: CVData = {
    templateId: 'pro-executive',
    userType: raw.userType === 'student' ? 'student' : 'professional',
    photo: photoUrl || raw.photo || '',
    fullName: safeStr(raw.fullName, 'Candidate'),
    title: safeStr(raw.title, 'Professional'),
    summary: safeStr(raw.summary, ''),
    contact: {
      email: safeStr(raw.contact?.email, ''),
      phone: safeStr(raw.contact?.phone, ''),
      location: safeStr(raw.contact?.location, ''),
      linkedin: safeStr(raw.contact?.linkedin, ''),
      portfolio: safeStr(raw.contact?.portfolio, ''),
    },
    education: safeArr(raw.education).map((e: any, idx: number) => ({
      id: safeStr(e.id, `edu-${idx}-${now}`),
      institution: safeStr(e.institution, 'University'),
      degree: safeStr(e.degree, 'Degree'),
      field: safeStr(e.field, ''),
      startDate: safeStr(e.startDate, ''),
      endDate: safeStr(e.endDate, ''),
      gpa: safeStr(e.gpa, ''),
    })),
    experience: safeArr(raw.experience).map((exp: any, idx: number) => ({
      id: safeStr(exp.id, `exp-${idx}-${now}`),
      company: safeStr(exp.company, 'Organization'),
      role: safeStr(exp.role, 'Role'),
      startDate: safeStr(exp.startDate, ''),
      endDate: safeStr(exp.endDate, ''),
      bullets: safeArr(exp.bullets).map((b: any) => String(b)),
    })),
    projects: safeArr(raw.projects).map((p: any, idx: number) => ({
      id: safeStr(p.id, `proj-${idx}-${now}`),
      title: safeStr(p.title, 'Project'),
      description: safeStr(p.description, ''),
      tools: safeStr(p.tools, ''),
      link: safeStr(p.link, ''),
    })),
    skills: safeArr(raw.skills).map((s: any, idx: number) => ({
      id: safeStr(s.id, `skill-${idx}-${now}`),
      category: safeStr(s.category, 'Technical Skills'),
      items: safeArr(s.items).map((i: any) => String(i)),
    })),
    certifications: safeArr(raw.certifications).map((c: any, idx: number) => ({
      id: safeStr(c.id, `cert-${idx}-${now}`),
      name: safeStr(c.name, 'Certification'),
      issuer: safeStr(c.issuer, 'Issuer'),
      date: safeStr(c.date, ''),
      expiryDate: safeStr(c.expiryDate, ''),
      credentialUrl: safeStr(c.credentialUrl, ''),
    })),
    achievements: safeArr(raw.achievements).map((a: any, idx: number) => ({
      id: safeStr(a.id, `ach-${idx}-${now}`),
      title: safeStr(a.title, 'Achievement'),
      issuer: safeStr(a.issuer, ''),
      date: safeStr(a.date, ''),
      description: safeStr(a.description, ''),
    })),
    languages: safeArr(raw.languages).map((l: any, idx: number) => ({
      id: safeStr(l.id, `lang-${idx}-${now}`),
      language: safeStr(l.language, 'English'),
      level: safeStr(l.level || l.proficiency, 'Native'),
    })),
    extracurriculars: safeArr(raw.extracurriculars).map((ex: any, idx: number) => ({
      id: safeStr(ex.id, `extra-${idx}-${now}`),
      activityName: safeStr(ex.activityName || ex.activity, 'Activity'),
      role: safeStr(ex.role, ''),
      organization: safeStr(ex.organization, ''),
      startDate: safeStr(ex.startDate, ''),
      endDate: safeStr(ex.endDate, ''),
      description: safeStr(ex.description || (Array.isArray(ex.bullets) ? ex.bullets.join('. ') : ''), ''),
    })),
    references: safeArr(raw.references).map((r: any, idx: number) => ({
      id: safeStr(r.id, `ref-${idx}-${now}`),
      name: safeStr(r.name, 'Reference'),
      position: safeStr(r.position || r.role, 'Professional Reference'),
      company: safeStr(r.company, 'Company'),
      relationship: safeStr(r.relationship, ''),
      email: safeStr(r.email, ''),
      phone: safeStr(r.phone, ''),
      contact: safeStr(r.contact || r.email || r.phone, ''),
    })),
    customSections: [],
    sectionOrder: [
      'photo',
      'personal',
      'summary',
      'contact',
      'experience',
      'education',
      'projects',
      'skills',
      'certifications',
      'achievements',
      'languages',
      'extracurriculars',
      'references',
    ],
    sectionVisibility: {
      photo: Boolean(photoUrl || raw.photo),
      personal: true,
      summary: Boolean(raw.summary),
      contact: true,
      experience: Boolean(raw.experience && raw.experience.length > 0),
      education: Boolean(raw.education && raw.education.length > 0),
      projects: Boolean(raw.projects && raw.projects.length > 0),
      skills: Boolean(raw.skills && raw.skills.length > 0),
      certifications: Boolean(raw.certifications && raw.certifications.length > 0),
      achievements: Boolean(raw.achievements && raw.achievements.length > 0),
      languages: Boolean(raw.languages && raw.languages.length > 0),
      extracurriculars: Boolean(raw.extracurriculars && raw.extracurriculars.length > 0),
      references: Boolean(raw.references && raw.references.length > 0),
    },
  };

  return normalized;
}

/**
 * Executes a Gemini request directly from the browser using the user's client API key.
 */
async function callGeminiDirectly(
  apiKey: string,
  prompt: string,
  systemInstruction?: string,
  responseSchema?: any
): Promise<string> {
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const model = 'gemini-3.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    cleanKey
  )}`;

  const bodyPayload: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {},
  };

  if (systemInstruction) {
    bodyPayload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  if (responseSchema) {
    bodyPayload.generationConfig.responseMimeType = 'application/json';
    bodyPayload.generationConfig.responseSchema = responseSchema;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    let errorDetail = `Gemini API error (${res.status})`;
    try {
      const errJson = await res.json();
      errorDetail = errJson.error?.message || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

/**
 * Direct client-side resume generation fallback.
 */
export async function generateResumeDirectClientSide(
  apiKey: string,
  prompt: string,
  photoUrl?: string
): Promise<{ resumeData: CVData; summaryMessage: string; provider: AIProvider }> {
  const systemInstruction = `You are an elite executive resume writer and career strategist.
Your task is to take candidate information and extract, organize, and enrich it into a world-class professional resume data structure conforming strictly to the schema.
- Extract all work experience mentioned (company, role, dates, and create 2-4 quantifiable high-impact bullet points using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]").
- Extract all education degrees, colleges/universities, and majors/fields.
- Categorize technical and soft skills into appropriate skill categories.
- If the user did not explicitly mention a personal full name, use an appropriate professional name (e.g., from context or "Candidate") rather than leaving it blank.
- Infer whether the user is a 'student' (or recent grad) or a 'professional'.
- You MUST output valid JSON.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      fullName: { type: 'STRING' },
      title: { type: 'STRING' },
      userType: { type: 'STRING', enum: ['student', 'professional'] },
      summary: { type: 'STRING' },
      contact: {
        type: 'OBJECT',
        properties: {
          email: { type: 'STRING' },
          phone: { type: 'STRING' },
          location: { type: 'STRING' },
          linkedin: { type: 'STRING' },
          portfolio: { type: 'STRING' },
        },
      },
      education: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            institution: { type: 'STRING' },
            degree: { type: 'STRING' },
            field: { type: 'STRING' },
            startDate: { type: 'STRING' },
            endDate: { type: 'STRING' },
            gpa: { type: 'STRING' },
          },
          required: ['institution', 'degree'],
        },
      },
      experience: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            company: { type: 'STRING' },
            role: { type: 'STRING' },
            startDate: { type: 'STRING' },
            endDate: { type: 'STRING' },
            bullets: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['company', 'role', 'bullets'],
        },
      },
      projects: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            description: { type: 'STRING' },
            tools: { type: 'STRING' },
            link: { type: 'STRING' },
          },
        },
      },
      skills: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            category: { type: 'STRING' },
            items: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['category', 'items'],
        },
      },
    },
    required: ['fullName', 'title', 'summary', 'userType', 'education', 'experience', 'skills'],
  };

  const rawText = await callGeminiDirectly(apiKey, prompt, systemInstruction, schema);
  let parsed: any = {};
  try {
    parsed = JSON.parse(rawText);
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  }

  const resumeData = normalizeClientResumeData(parsed, photoUrl);
  return {
    resumeData,
    summaryMessage: `I've generated a complete, polished resume for **${resumeData.fullName}** formatted for ${
      resumeData.userType === 'student' ? 'students & new grads' : 'experienced professionals'
    }. You can preview it on the right and edit any section!`,
    provider: 'gemini',
  };
}

/**
 * Direct client-side general resume modification fallback.
 */
export async function modifyGeneralResumeDirectClientSide(
  apiKey: string,
  currentResume: CVData,
  instruction: string
): Promise<{ resumeData: CVData; replyMessage: string; provider: AIProvider }> {
  const prompt = `Current Resume Data:\n${JSON.stringify(currentResume, null, 2)}\n\nUser Edit Instruction:\n${instruction}\n\nUpdate the resume JSON according to the instruction. Output valid JSON of the modified resume only.`;
  const rawText = await callGeminiDirectly(
    apiKey,
    prompt,
    'You are an expert resume editor. You must preserve existing fields unless instructed to change them. Output pure JSON only.'
  );

  let updated: any = null;
  try {
    updated = JSON.parse(rawText);
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) updated = JSON.parse(match[0]);
  }

  const merged = normalizeClientResumeData({ ...currentResume, ...(updated || {}) });
  return {
    resumeData: merged,
    replyMessage: `I've updated your resume: "${instruction}".`,
    provider: 'gemini',
  };
}

/**
 * Direct client-side single field enhancement fallback.
 */
export async function enhanceSingleFieldDirectClientSide(
  apiKey: string,
  text: string,
  intent: string,
  userType?: string
): Promise<{ result: string; provider: AIProvider }> {
  const prompt = `Intent: ${intent}\nTarget Audience: ${userType || 'professional'}\nInput Text:\n${text}\n\nEnhance this text into a world-class, punchy, quantifiable resume statement following the Google XYZ formula. Return ONLY the enhanced statement text without quotes or explanations.`;
  const rawText = await callGeminiDirectly(
    apiKey,
    prompt,
    'You are an expert resume writer. Output ONLY the polished statement directly.'
  );

  return {
    result: rawText.trim().replace(/^["']|["']$/g, ''),
    provider: 'gemini',
  };
}

/**
 * Direct client-side prompt enhancement fallback.
 */
export async function enhancePromptDirectClientSide(
  apiKey: string,
  draftText: string
): Promise<{ enhancedText: string; provider: AIProvider }> {
  const prompt = `Draft input:\n${draftText}\n\nExpand and enrich this rough input into an executive-level prompt for generating a high-impact professional resume.`;
  const rawText = await callGeminiDirectly(
    apiKey,
    prompt,
    'You are a prompt engineering expert for career strategy. Output the expanded prompt directly.'
  );

  return {
    enhancedText: rawText.trim(),
    provider: 'gemini',
  };
}
