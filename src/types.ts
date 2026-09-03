export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  fieldOfStudy?: string;
  location?: string;
  honors?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location?: string;
  current?: boolean;
  startDate: string;
  endDate: string;
  description?: string;
  bullets?: string[];
}

export interface ProjectEntry {
  id: string;
  title: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description: string; // Used as the main body / bullet points
  tools?: string;
  link?: string;
}

export interface SkillCategory {
  id: string;
  category: string; // e.g. Technical, Soft Skills
  items: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialUrl?: string;
  credentialId?: string;
}

export interface AchievementEntry {
  id: string;
  title: string;
  issuer?: string;
  date: string;
  description: string;
}

export type LanguageProficiency = 'Basic' | 'Intermediate' | 'Advanced' | 'Native';

export interface LanguageEntry {
  id: string;
  language: string;
  level?: LanguageProficiency | string;
  proficiency?: string;
}

export interface ExtracurricularEntry {
  id: string;
  activityName: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ReferenceEntry {
  id: string;
  name: string;
  position: string;
  company: string;
  email?: string;
  phone?: string;
  relationship?: string;
  contact?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string; // Simple text area for custom sections
}

export interface CVData {
  templateId: string;
  userType: "student" | "professional";
  photo?: string; // base64
  fullName?: string;
  title?: string;
  summary?: string;
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: SkillCategory[];
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
  languages: LanguageEntry[];
  extracurriculars: ExtracurricularEntry[];
  references: ReferenceEntry[] | "available_on_request";
  customSections: CustomSection[];
  activePresetName?: string;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
}

export const defaultSectionOrder = [
  "photo",
  "personal",
  "summary",
  "contact",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "achievements",
  "languages",
  "extracurriculars",
  "references"
];

// Student default order favors education and projects
export const studentSectionOrder = [
  "photo",
  "personal",
  "summary",
  "contact",
  "education",
  "projects",
  "skills",
  "experience",
  "extracurriculars",
  "certifications",
  "achievements",
  "languages",
  "references"
];

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  type: "full_generation" | "general_edit" | "segment_edit";
  targetSegment?: string;
  timestamp: number;
  statusMessage?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  resumeData: CVData;
  profilePhotoUrl?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface UsernameRecord {
  uid: string;
  email: string;
  createdAt: number;
}

export type AIProvider = 'gemini' | 'claude' | 'openai';

export interface AIProviderMeta {
  id: AIProvider;
  name: string;
  shortName: string;
  tagline: string;
  placeholder: string;
  keyPrefix: string;
  helpUrl: string;
  helpLabel: string;
  recommendedModel: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export interface UserApiKeyMetadata {
  provider: AIProvider;
  maskedKey: string;
  isDefault: boolean;
  isValid: boolean;
  lastValidatedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export type AIErrorCode =
  | 'invalid_api_key'
  | 'rate_limited'
  | 'quota_exceeded'
  | 'provider_error'
  | 'no_key_configured'
  | 'unknown_error';

export interface AIErrorResponse {
  error: string;
  code: AIErrorCode;
  provider?: AIProvider;
}

