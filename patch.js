const fs = require('fs');

const files = {
  'PersonalForm.tsx': null,
  'SummaryForm.tsx': { maxLength: 400 }, // I already updated SummaryForm manually
  'ExperienceForm.tsx': { maxEntries: 5, maxBullets: 4, company: 80, role: 80, bullet: 150 },
  'ProjectsForm.tsx': { maxEntries: 4, maxBullets: 4, title: 80, bullet: 150 },
  'EducationForm.tsx': { maxEntries: 4 },
  'SkillsForm.tsx': { maxEntries: 5, maxItems: 8 },
  'CertificationsForm.tsx': { maxEntries: 6, desc: 120 },
  'AchievementsForm.tsx': { maxEntries: 5, desc: 120 },
  'ExtracurricularsForm.tsx': { maxEntries: 4, desc: 150 },
  'LanguagesForm.tsx': { maxEntries: 5 },
  'ReferencesForm.tsx': { maxEntries: 3 }
};
