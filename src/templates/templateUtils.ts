import { 
  EducationEntry, 
  ExperienceEntry, 
  ProjectEntry, 
  SkillCategory, 
  ExtracurricularEntry,
  CertificationEntry,
  AchievementEntry,
  LanguageEntry,
  ReferenceEntry,
  CVData 
} from '../types';

/**
 * Returns formatted date range or single date, or null if both are empty.
 * Never leaves a dangling '-' or '–'.
 */
export function formatDateRange(startDate?: string, endDate?: string, separator = '–'): string | null {
  const start = (startDate || '').trim();
  const end = (endDate || '').trim();

  if (start && end) {
    return `${start} ${separator} ${end}`;
  }
  if (start) return start;
  if (end) return end;
  return null;
}

/**
 * Returns 'Degree in Field', 'Degree', 'Field', or null if both are empty.
 * Never leaves a dangling 'in'.
 */
export function formatDegreeField(degree?: string, field?: string): string | null {
  const d = (degree || '').trim();
  const f = (field || '').trim();

  if (d && f) {
    return `${d} in ${f}`;
  }
  if (d) return d;
  if (f) return f;
  return null;
}

/**
 * Checks if a string has meaningful non-whitespace content.
 */
export function hasContent(str?: string | null): boolean {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Filters out invalid or completely empty education items.
 */
export function getValidEducation(education?: EducationEntry[]): EducationEntry[] {
  if (!Array.isArray(education)) return [];
  return education.filter(edu => 
    hasContent(edu.institution) ||
    hasContent(edu.degree) ||
    hasContent(edu.field) ||
    hasContent(edu.startDate) ||
    hasContent(edu.endDate) ||
    hasContent(edu.gpa)
  );
}

/**
 * Filters out invalid experience items and cleans empty bullets.
 */
export function getValidExperience(experience?: ExperienceEntry[]): (ExperienceEntry & { validBullets: string[] })[] {
  if (!Array.isArray(experience)) return [];
  return experience
    .map(exp => {
      const validBullets = (exp.bullets || [])
        .map(b => (b || '').trim())
        .filter(b => b.length > 0);
      return { ...exp, validBullets };
    })
    .filter(exp => 
      hasContent(exp.company) ||
      hasContent(exp.role) ||
      hasContent(exp.startDate) ||
      hasContent(exp.endDate) ||
      exp.validBullets.length > 0
    );
}

/**
 * Filters out empty project entries.
 */
export function getValidProjects(projects?: ProjectEntry[]): ProjectEntry[] {
  if (!Array.isArray(projects)) return [];
  return projects.filter(p => 
    hasContent(p.title) ||
    hasContent(p.description) ||
    hasContent(p.tools) ||
    hasContent(p.link)
  );
}

/**
 * Filters out empty skill categories or categories with no valid items.
 */
export function getValidSkills(skills?: SkillCategory[]): { id: string; category: string; validItems: string[] }[] {
  if (!Array.isArray(skills)) return [];
  return skills
    .map(sk => {
      const validItems = (sk.items || [])
        .map(item => (item || '').trim())
        .filter(item => item.length > 0);
      return {
        id: sk.id,
        category: (sk.category || '').trim(),
        validItems
      };
    })
    .filter(sk => sk.validItems.length > 0 || hasContent(sk.category));
}

/**
 * Filters out empty extracurricular entries.
 */
export function getValidExtracurriculars(extracurriculars?: ExtracurricularEntry[]): ExtracurricularEntry[] {
  if (!Array.isArray(extracurriculars)) return [];
  return extracurriculars.filter(e => 
    hasContent(e.activityName) ||
    hasContent(e.role) ||
    hasContent(e.organization) ||
    hasContent(e.startDate) ||
    hasContent(e.endDate) ||
    hasContent(e.description)
  );
}

/**
 * Filters out empty certification entries.
 */
export function getValidCertifications(certifications?: CertificationEntry[]): CertificationEntry[] {
  if (!Array.isArray(certifications)) return [];
  return certifications.filter(c => 
    hasContent(c.name) ||
    hasContent(c.issuer) ||
    hasContent(c.date) ||
    hasContent(c.expiryDate) ||
    hasContent(c.credentialUrl)
  );
}

/**
 * Filters out empty achievement entries.
 */
export function getValidAchievements(achievements?: AchievementEntry[]): AchievementEntry[] {
  if (!Array.isArray(achievements)) return [];
  return achievements.filter(a => 
    hasContent(a.title) ||
    hasContent(a.issuer) ||
    hasContent(a.date) ||
    hasContent(a.description)
  );
}

/**
 * Filters out empty language entries.
 */
export function getValidLanguages(languages?: LanguageEntry[]): LanguageEntry[] {
  if (!Array.isArray(languages)) return [];
  return languages.filter(l => hasContent(l.language));
}

/**
 * Filters out empty reference entries or checks for available on request flag.
 */
export function getValidReferences(references?: ReferenceEntry[] | "available_on_request"): { isAvailableOnRequest: boolean; validList: ReferenceEntry[] } {
  if (references === 'available_on_request') {
    return { isAvailableOnRequest: true, validList: [] };
  }
  if (!Array.isArray(references)) {
    return { isAvailableOnRequest: false, validList: [] };
  }
  const validList = references.filter(r => 
    hasContent(r.name) ||
    hasContent(r.position) ||
    hasContent(r.company) ||
    hasContent(r.email) ||
    hasContent(r.phone) ||
    hasContent(r.relationship) ||
    hasContent(r.contact)
  );
  return { isAvailableOnRequest: false, validList };
}

/**
 * Collects non-empty contact items.
 */
export function getValidContactList(contact?: CVData['contact']): { key: string; value: string; label: string }[] {
  if (!contact) return [];
  const list: { key: string; value: string; label: string }[] = [];
  if (hasContent(contact.email)) list.push({ key: 'email', value: contact.email!.trim(), label: 'Email' });
  if (hasContent(contact.phone)) list.push({ key: 'phone', value: contact.phone!.trim(), label: 'Phone' });
  if (hasContent(contact.location)) list.push({ key: 'location', value: contact.location!.trim(), label: 'Location' });
  if (hasContent(contact.linkedin)) list.push({ key: 'linkedin', value: contact.linkedin!.trim(), label: 'LinkedIn' });
  if (hasContent(contact.portfolio)) list.push({ key: 'portfolio', value: contact.portfolio!.trim(), label: 'Portfolio' });
  return list;
}
