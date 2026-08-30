import React from 'react';
import { TemplateProps } from './registry';
import {
  formatDateRange,
  formatDegreeField,
  hasContent,
  getValidEducation,
  getValidExperience,
  getValidProjects,
  getValidSkills,
  getValidExtracurriculars,
  getValidCertifications,
  getValidAchievements,
  getValidLanguages,
  getValidReferences,
  getValidContactList
} from './templateUtils';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

// Helper for rendering contact icons
function getContactIcon(key: string) {
  switch (key) {
    case 'email': return <Mail className="w-3 h-3 shrink-0" />;
    case 'phone': return <Phone className="w-3 h-3 shrink-0" />;
    case 'location': return <MapPin className="w-3 h-3 shrink-0" />;
    case 'linkedin': return <Linkedin className="w-3 h-3 shrink-0" />;
    case 'portfolio': return <Globe className="w-3 h-3 shrink-0" />;
    default: return null;
  }
}

// ==========================================
// 1. Executive Suite (Charcoal & Burnished Gold Accent - Authoritative Single Column)
// ==========================================
export const ProExecutive: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);

  return (
    <div className="font-serif text-slate-900 p-8 sm:p-10 text-[10pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto box-border" id="cv-template-root">
      {/* Header Block with Charcoal Top Bar and Gold Border */}
      <header className="border-t-4 border-slate-950 border-b-2 border-amber-600/70 bg-slate-50/70 p-6 mb-6 text-center rounded-t-sm">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-slate-950 mb-1 font-serif">
          {data.fullName || 'Your Name'}
        </h1>
        {hasContent(data.title) && (
          <p className="text-sm sm:text-base font-bold tracking-widest text-amber-900 uppercase font-sans mb-3">{data.title}</p>
        )}

        {contactList.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs font-sans font-semibold text-slate-700 pt-2 border-t border-slate-200">
            {contactList.map((item, idx) => (
              <React.Fragment key={item.key}>
                {idx > 0 && <span className="text-amber-500 font-bold">•</span>}
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-amber-800">{getContactIcon(item.key)}</span>
                  <span>{item.value}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <div className="space-y-5">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section]) return null;

          // Executive Summary
          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section} className="border-l-3 border-amber-600 pl-4 py-0.5">
                <h2 className="font-bold uppercase tracking-widest text-slate-950 mb-1.5 font-sans text-xs sm:text-sm flex items-center gap-2">
                  <span>Executive Summary</span>
                </h2>
                <p className="text-justify leading-relaxed text-slate-800 text-[9.5pt]">{data.summary}</p>
              </section>
            );
          }

          // Professional Experience
          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                  <h2 className="font-extrabold uppercase tracking-widest text-slate-950 font-sans text-xs sm:text-sm px-2">
                    Professional Experience
                  </h2>
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                </div>
                <div className="space-y-4">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="text-[9.5pt] border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          {hasContent(exp.company) && <h3 className="font-bold text-[10.5pt] text-slate-950">{exp.company}</h3>}
                          {dateStr && <span className="text-xs font-sans font-bold text-amber-900">{dateStr}</span>}
                        </div>
                        {hasContent(exp.role) && <div className="italic mb-1.5 font-semibold text-slate-800 text-xs sm:text-sm">{exp.role}</div>}
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-5 space-y-1 text-slate-800 text-[9pt]">
                            {exp.validBullets.map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Education
          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                  <h2 className="font-extrabold uppercase tracking-widest text-slate-950 font-sans text-xs sm:text-sm px-2">
                    Education & Credentials
                  </h2>
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                </div>
                <div className="space-y-2.5">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="flex justify-between items-baseline text-[9.5pt] border-l-2 border-slate-300 pl-3">
                        <div>
                          {hasContent(edu.institution) && <div className="font-bold text-slate-900">{edu.institution}</div>}
                          <div className="italic text-slate-700 text-xs">
                            {degreeField && <span className="font-medium text-amber-950">{degreeField}</span>}
                            {hasContent(edu.gpa) && <span className="ml-2 font-sans font-normal">— GPA: {edu.gpa}</span>}
                          </div>
                        </div>
                        {dateStr && <div className="text-xs font-sans font-bold text-amber-900">{dateStr}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Core Competencies / Skills
          if (section === 'skills') {
            const validSkills = getValidSkills(data.skills);
            if (validSkills.length === 0) return null;

            return (
              <section key={section}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                  <h2 className="font-extrabold uppercase tracking-widest text-slate-950 font-sans text-xs sm:text-sm px-2">
                    Core Competencies
                  </h2>
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
                  {validSkills.map(sk => (
                    <div key={sk.id} className="border-l-2 border-amber-600 pl-3 py-0.5 bg-slate-50/50 rounded-r">
                      {hasContent(sk.category) && <span className="font-bold block mb-0.5 text-slate-950">{sk.category}</span>}
                      {sk.validItems.length > 0 && <span className="text-slate-700">{sk.validItems.join(' • ')}</span>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Key Projects
          if (section === 'projects') {
            const validProjects = getValidProjects(data.projects);
            if (validProjects.length === 0) return null;

            return (
              <section key={section}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                  <h2 className="font-extrabold uppercase tracking-widest text-slate-950 font-sans text-xs sm:text-sm px-2">
                    Key Initiatives & Projects
                  </h2>
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                </div>
                <div className="space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="text-[9.5pt] bg-slate-50/40 p-3 rounded-lg border border-slate-200/80">
                      <div className="flex justify-between items-baseline font-bold">
                        <span className="text-slate-950">{proj.title || 'Initiative'}</span>
                        {hasContent(proj.tools) && <span className="text-xs font-sans font-semibold text-amber-900">Tech: {proj.tools}</span>}
                      </div>
                      {hasContent(proj.description) && <p className="text-slate-700 text-[9pt] mt-1">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Certifications
          if (section === 'certifications') {
            const validCerts = getValidCertifications(data.certifications);
            if (validCerts.length === 0) return null;

            return (
              <section key={section}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                  <h2 className="font-extrabold uppercase tracking-widest text-slate-950 font-sans text-xs sm:text-sm px-2">
                    Certifications & Credentials
                  </h2>
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                </div>
                <div className="space-y-2.5">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="flex justify-between items-baseline text-[9.5pt] border-l-2 border-amber-600 pl-3">
                        <div>
                          <span className="font-bold text-slate-950">{cert.name}</span>
                          {hasContent(cert.issuer) && <span className="text-xs font-sans text-slate-600 ml-2 font-medium">({cert.issuer})</span>}
                        </div>
                        {dateStr && <span className="text-xs font-sans font-bold text-amber-900">{dateStr}</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Achievements
          if (section === 'achievements') {
            const validAch = getValidAchievements(data.achievements);
            if (validAch.length === 0) return null;

            return (
              <section key={section}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                  <h2 className="font-extrabold uppercase tracking-widest text-slate-950 font-sans text-xs sm:text-sm px-2">
                    Executive Honors & Achievements
                  </h2>
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                </div>
                <div className="space-y-2.5">
                  {validAch.map(ach => (
                    <div key={ach.id} className="text-[9.5pt] border-l-2 border-amber-600 pl-3">
                      <div className="flex justify-between items-baseline font-bold">
                        <span className="text-slate-950">{ach.title}</span>
                        {hasContent(ach.date) && <span className="text-xs font-sans text-amber-900">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-xs font-sans text-slate-600">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-slate-700 text-[9pt] mt-0.5">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Extracurriculars
          if (section === 'extracurriculars') {
            const validExt = getValidExtracurriculars(data.extracurriculars);
            if (validExt.length === 0) return null;

            return (
              <section key={section}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                  <h2 className="font-extrabold uppercase tracking-widest text-slate-950 font-sans text-xs sm:text-sm px-2">
                    Board Memberships & Community Leadership
                  </h2>
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                </div>
                <div className="space-y-3">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="text-[9.5pt] border-l-2 border-slate-300 pl-3">
                        <div className="flex justify-between items-baseline font-bold">
                          <span className="text-slate-950">{ext.activityName || ext.role || 'Leadership Role'}</span>
                          {dateStr && <span className="text-xs font-sans font-bold text-amber-900">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-xs font-sans text-slate-700 italic mb-0.5">
                            {[ext.role, ext.organization].filter(hasContent).join(' • ')}
                          </div>
                        )}
                        {hasContent(ext.description) && <p className="text-slate-700 text-[9pt]">{ext.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Languages
          if (section === 'languages') {
            const validLang = getValidLanguages(data.languages);
            if (validLang.length === 0) return null;

            return (
              <section key={section}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                  <h2 className="font-extrabold uppercase tracking-widest text-slate-950 font-sans text-xs sm:text-sm px-2">
                    Languages
                  </h2>
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-sans">
                  {validLang.map(lang => (
                    <div key={lang.id} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded">
                      <span className="font-bold text-slate-950">{lang.language}</span>
                      {hasContent(lang.level) && <span className="text-amber-900 font-semibold ml-1.5">({lang.level})</span>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // References
          if (section === 'references') {
            const { isAvailableOnRequest, validList: validRef } = getValidReferences(data.references);
            if (!isAvailableOnRequest && validRef.length === 0) return null;

            return (
              <section key={section}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                  <h2 className="font-extrabold uppercase tracking-widest text-slate-950 font-sans text-xs sm:text-sm px-2">
                    References
                  </h2>
                  <span className="h-px bg-amber-600/40 flex-1"></span>
                </div>
                {isAvailableOnRequest ? (
                  <p className="text-slate-600 italic text-xs font-sans">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    {validRef.map(ref => (
                      <div key={ref.id} className="border-l-2 border-slate-300 pl-3">
                        <div className="font-bold text-slate-950">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-slate-700">
                            {[ref.position, ref.company].filter(hasContent).join(', ')}
                          </div>
                        )}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-amber-900 text-[8pt] mt-0.5">
                            {[ref.email, ref.phone].filter(hasContent).join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. Corporate Classic (Midnight Charcoal & Steel Blue - Two-Column Sidebar with Timeline)
// ==========================================
export const ProModern: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);
  const validSkills = getValidSkills(data.skills);
  const validLanguages = getValidLanguages(data.languages);

  return (
    <div className="font-sans text-slate-800 text-[9.5pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto flex box-border" id="cv-template-root">
      {/* Left Dark Sidebar with Steel Blue Accents */}
      <div className="w-[33%] bg-slate-950 text-slate-300 p-6 sm:p-7 flex flex-col gap-6 border-r-2 border-sky-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 leading-tight">
            {data.fullName || 'Your Name'}
          </h1>
          {hasContent(data.title) && (
            <p className="text-sky-400 uppercase tracking-wider text-[8.5pt] font-bold">{data.title}</p>
          )}
        </div>

        {data.sectionVisibility.photo && hasContent(data.photo) && (
          <div className="flex justify-center">
            <img src={data.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-sky-400 shadow-md" />
          </div>
        )}

        {data.sectionVisibility.contact && contactList.length > 0 && (
          <div className="border-t border-slate-800 pt-4">
            <h2 className="text-sky-400 font-bold uppercase text-[8.5pt] tracking-widest mb-3 flex items-center gap-1.5">
              <span>Contact</span>
            </h2>
            <div className="flex flex-col gap-2.5 text-xs break-words">
              {contactList.map(item => (
                <div key={item.key} className="flex items-start gap-2">
                  <span className="text-sky-400 mt-0.5">{getContactIcon(item.key)}</span>
                  <div>
                    <div className="text-[7.5pt] text-slate-500 uppercase font-bold">{item.label}</div>
                    <div className="text-slate-100 text-[8.5pt]">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.sectionVisibility.skills && validSkills.length > 0 && (
          <div className="border-t border-slate-800 pt-4">
            <h2 className="text-sky-400 font-bold uppercase text-[8.5pt] tracking-widest mb-3">
              Skills & Expertise
            </h2>
            <div className="flex flex-col gap-3">
              {validSkills.map(sk => (
                <div key={sk.id}>
                  {hasContent(sk.category) && (
                    <div className="text-slate-200 font-semibold text-xs mb-1.5">{sk.category}</div>
                  )}
                  {sk.validItems.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sk.validItems.map((item, i) => (
                        <span key={i} className="bg-slate-900 border border-slate-700 text-sky-200 px-2 py-0.5 rounded text-[7.5pt] font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.sectionVisibility.languages && validLanguages.length > 0 && (
          <div className="border-t border-slate-800 pt-4">
            <h2 className="text-sky-400 font-bold uppercase text-[8.5pt] tracking-widest mb-3">
              Languages
            </h2>
            <div className="flex flex-col gap-1.5 text-xs text-slate-300">
              {validLanguages.map(lang => (
                <div key={lang.id} className="flex justify-between">
                  <span className="font-semibold text-white">{lang.language}</span>
                  {hasContent(lang.level) && <span className="text-sky-300 text-[8pt]">{lang.level}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="w-[67%] p-6 sm:p-8 space-y-5">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section] || section === 'contact' || section === 'skills' || section === 'languages' || section === 'photo') return null;

          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section} className="bg-sky-50/40 p-4 rounded-xl border border-sky-100">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1.5">
                  Executive Profile
                </h2>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm text-justify">{data.summary}</p>
              </section>
            );
          }

          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 border-b-2 border-sky-700 pb-1 flex items-center justify-between">
                  <span>Professional Experience</span>
                  <span className="w-10 h-0.5 bg-sky-200"></span>
                </h2>
                <div className="space-y-4">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="relative pl-4 border-l-2 border-sky-300 text-xs">
                        <div className="absolute w-2.5 h-2.5 bg-sky-700 rounded-full -left-[6px] top-1"></div>
                        <div className="flex justify-between items-baseline mb-0.5">
                          {hasContent(exp.role) && <div className="font-bold text-slate-950 text-sm">{exp.role}</div>}
                          {dateStr && <div className="text-sky-800 font-bold text-[8pt]">{dateStr}</div>}
                        </div>
                        {hasContent(exp.company) && (
                          <div className="text-slate-600 font-semibold mb-1.5">{exp.company}</div>
                        )}
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-3.5 text-slate-700 space-y-1">
                            {exp.validBullets.map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 border-b-2 border-sky-700 pb-1 flex items-center justify-between">
                  <span>Education & Credentials</span>
                  <span className="w-10 h-0.5 bg-sky-200"></span>
                </h2>
                <div className="space-y-3">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="text-xs border-l-2 border-slate-300 pl-3">
                        {degreeField && <div className="font-bold text-slate-900 text-sm">{degreeField}</div>}
                        {hasContent(edu.institution) && <div className="text-slate-600 font-medium">{edu.institution}</div>}
                        <div className="flex gap-2 text-slate-500 text-[8pt] mt-0.5">
                          {dateStr && <span className="text-sky-800 font-semibold">{dateStr}</span>}
                          {hasContent(edu.gpa) && <span>• GPA: {edu.gpa}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section === 'projects') {
            const validProjects = getValidProjects(data.projects);
            if (validProjects.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 border-b-2 border-sky-700 pb-1 flex items-center justify-between">
                  <span>Key Projects & Ventures</span>
                  <span className="w-10 h-0.5 bg-sky-200"></span>
                </h2>
                <div className="space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900 text-sm">{proj.title || 'Project'}</div>
                      {hasContent(proj.tools) && <div className="text-sky-700 font-semibold text-[8pt] mb-0.5">Tech: {proj.tools}</div>}
                      {hasContent(proj.description) && <p className="text-slate-600 leading-snug">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Certifications
          if (section === 'certifications') {
            const validCerts = getValidCertifications(data.certifications);
            if (validCerts.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 border-b-2 border-sky-700 pb-1 flex items-center justify-between">
                  <span>Certifications</span>
                  <span className="w-10 h-0.5 bg-sky-200"></span>
                </h2>
                <div className="space-y-2.5">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="text-xs bg-sky-50/40 p-2.5 rounded-lg border border-sky-100 flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-slate-900">{cert.name}</span>
                          {hasContent(cert.issuer) && <span className="text-sky-800 text-[8pt] ml-2 font-medium">({cert.issuer})</span>}
                        </div>
                        {dateStr && <span className="text-sky-700 font-semibold text-[8pt]">{dateStr}</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Achievements
          if (section === 'achievements') {
            const validAch = getValidAchievements(data.achievements);
            if (validAch.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 border-b-2 border-sky-700 pb-1 flex items-center justify-between">
                  <span>Honors & Achievements</span>
                  <span className="w-10 h-0.5 bg-sky-200"></span>
                </h2>
                <div className="space-y-2.5">
                  {validAch.map(ach => (
                    <div key={ach.id} className="text-xs bg-sky-50/40 p-2.5 rounded-lg border border-sky-100">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="text-sky-700 font-semibold text-[8pt]">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-sky-900 font-medium text-[8pt]">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-slate-600 leading-snug mt-1">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Extracurriculars
          if (section === 'extracurriculars') {
            const validExt = getValidExtracurriculars(data.extracurriculars);
            if (validExt.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 border-b-2 border-sky-700 pb-1 flex items-center justify-between">
                  <span>Community & Leadership</span>
                  <span className="w-10 h-0.5 bg-sky-200"></span>
                </h2>
                <div className="space-y-3">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="text-xs border-l-2 border-sky-300 pl-3">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="text-sky-700 font-semibold text-[8pt]">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-sky-900 font-medium text-[8pt] mb-0.5">
                            {[ext.role, ext.organization].filter(hasContent).join(' • ')}
                          </div>
                        )}
                        {hasContent(ext.description) && <p className="text-slate-600">{ext.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // References
          if (section === 'references') {
            const { isAvailableOnRequest, validList: validRef } = getValidReferences(data.references);
            if (!isAvailableOnRequest && validRef.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 border-b-2 border-sky-700 pb-1 flex items-center justify-between">
                  <span>References</span>
                  <span className="w-10 h-0.5 bg-sky-200"></span>
                </h2>
                {isAvailableOnRequest ? (
                  <p className="text-slate-600 italic text-xs">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {validRef.map(ref => (
                      <div key={ref.id} className="bg-sky-50/40 p-2.5 rounded-lg border border-sky-100">
                        <div className="font-bold text-slate-900">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-slate-700 font-medium">
                            {[ref.position, ref.company].filter(hasContent).join(' at ')}
                          </div>
                        )}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-sky-700 text-[8pt] mt-1">
                            {[ref.email, ref.phone].filter(hasContent).join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. Creative Professional (Cobalt Blue Banner Header with Grid Competency Cards)
// ==========================================
export const ProCreative: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);

  return (
    <div className="font-sans text-slate-800 text-[9.5pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto box-border" id="cv-template-root">
      {/* Cobalt Header Banner */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white p-7 text-center rounded-b-2xl shadow-xs">
        <h1 className="text-3xl sm:text-4xl font-black mb-1 tracking-tight">
          {data.fullName || 'Your Name'}
        </h1>
        {hasContent(data.title) && (
          <p className="text-sm sm:text-base text-blue-200 font-semibold tracking-wide uppercase">{data.title}</p>
        )}
        
        {contactList.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-blue-600/60 text-xs text-blue-100 font-medium">
            {contactList.map((item, idx) => (
              <React.Fragment key={item.key}>
                {idx > 0 && <span className="text-blue-400 font-bold">•</span>}
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-blue-300">{getContactIcon(item.key)}</span>
                  <span>{item.value}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <div className="p-6 sm:p-8 space-y-5">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section]) return null;

          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section} className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 text-center">
                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium italic">
                  "{data.summary}"
                </p>
              </section>
            );
          }

          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-3">
                  <span>Professional Experience</span> <span className="h-0.5 bg-blue-200 flex-1"></span>
                </h2>
                <div className="space-y-4">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="grid grid-cols-12 gap-3 text-xs">
                        <div className="col-span-3 text-right">
                          {dateStr && <div className="text-blue-700 font-bold text-[8.5pt]">{dateStr}</div>}
                        </div>
                        <div className="col-span-9 border-l-2 border-blue-200 pl-4 relative">
                          <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full -left-[6px] top-1"></div>
                          {hasContent(exp.role) && <div className="font-bold text-slate-900 text-sm mb-0.5">{exp.role}</div>}
                          {hasContent(exp.company) && <div className="text-slate-500 font-semibold mb-1.5">{exp.company}</div>}
                          {exp.validBullets.length > 0 && (
                            <ul className="list-disc list-outside ml-3 text-slate-700 space-y-1">
                              {exp.validBullets.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-3">
                  <span>Education</span> <span className="h-0.5 bg-blue-200 flex-1"></span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="bg-blue-50/30 p-3.5 rounded-xl border border-blue-100 text-xs">
                        {degreeField && <div className="font-bold text-slate-900 text-sm">{degreeField}</div>}
                        {hasContent(edu.institution) && <div className="text-blue-700 font-semibold">{edu.institution}</div>}
                        <div className="flex gap-2 text-slate-500 text-[8pt] mt-1">
                          {dateStr && <span className="font-semibold text-blue-900">{dateStr}</span>}
                          {hasContent(edu.gpa) && <span>• GPA: {edu.gpa}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section === 'projects') {
            const validProjects = getValidProjects(data.projects);
            if (validProjects.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-3">
                  <span>Featured Initiatives</span> <span className="h-0.5 bg-blue-200 flex-1"></span>
                </h2>
                <div className="space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="bg-blue-50/30 p-3 rounded-xl border border-blue-100 text-xs">
                      <div className="font-bold text-slate-900 text-sm flex justify-between items-baseline">
                        <span>{proj.title || 'Initiative'}</span>
                        {hasContent(proj.link) && <span className="text-blue-700 text-[8pt] font-normal">{proj.link}</span>}
                      </div>
                      {hasContent(proj.tools) && <div className="text-blue-700 font-semibold text-[8pt] mb-1">Stack: {proj.tools}</div>}
                      {hasContent(proj.description) && <p className="text-slate-700 leading-snug">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section === 'skills') {
            const validSkills = getValidSkills(data.skills);
            if (validSkills.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-3">
                  <span>Competencies</span> <span className="h-0.5 bg-blue-200 flex-1"></span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {validSkills.map(sk => (
                    <div key={sk.id} className="bg-blue-50/40 p-3 rounded-xl border border-blue-100 text-xs">
                      {hasContent(sk.category) && <div className="font-bold text-slate-900 mb-1.5">{sk.category}</div>}
                      {sk.validItems.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sk.validItems.map((item, i) => (
                            <span key={i} className="bg-white text-blue-800 px-2 py-0.5 rounded text-[8pt] font-semibold border border-blue-200">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Certifications
          if (section === 'certifications') {
            const validCerts = getValidCertifications(data.certifications);
            if (validCerts.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-3">
                  <span>Certifications</span> <span className="h-0.5 bg-blue-200 flex-1"></span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="bg-blue-50/40 p-3 rounded-xl border border-blue-100 text-xs">
                        <div className="font-bold text-slate-900">{cert.name}</div>
                        {hasContent(cert.issuer) && <div className="text-blue-700 text-[8pt] font-medium">{cert.issuer}</div>}
                        {dateStr && <div className="text-slate-500 text-[7.5pt] mt-1">{dateStr}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Achievements
          if (section === 'achievements') {
            const validAch = getValidAchievements(data.achievements);
            if (validAch.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-3">
                  <span>Honors & Achievements</span> <span className="h-0.5 bg-blue-200 flex-1"></span>
                </h2>
                <div className="space-y-2.5">
                  {validAch.map(ach => (
                    <div key={ach.id} className="bg-blue-50/40 p-3 rounded-xl border border-blue-100 text-xs">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="text-blue-700 text-[8pt]">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-blue-800 text-[8pt]">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-slate-600 mt-0.5">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Extracurriculars
          if (section === 'extracurriculars') {
            const validExt = getValidExtracurriculars(data.extracurriculars);
            if (validExt.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-3">
                  <span>Leadership & Activities</span> <span className="h-0.5 bg-blue-200 flex-1"></span>
                </h2>
                <div className="space-y-3">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="bg-blue-50/40 p-3 rounded-xl border border-blue-100 text-xs">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="text-blue-700 text-[8pt]">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-blue-800 text-[8pt] font-semibold mb-0.5">
                            {[ext.role, ext.organization].filter(hasContent).join(' • ')}
                          </div>
                        )}
                        {hasContent(ext.description) && <p className="text-slate-600">{ext.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Languages
          if (section === 'languages') {
            const validLang = getValidLanguages(data.languages);
            if (validLang.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-3">
                  <span>Languages</span> <span className="h-0.5 bg-blue-200 flex-1"></span>
                </h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  {validLang.map(lang => (
                    <div key={lang.id} className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                      <span className="font-bold text-blue-950">{lang.language}</span>
                      {hasContent(lang.level) && <span className="text-blue-700 text-[8pt] ml-1.5">({lang.level})</span>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // References
          if (section === 'references') {
            const { isAvailableOnRequest, validList: validRef } = getValidReferences(data.references);
            if (!isAvailableOnRequest && validRef.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-3">
                  <span>References</span> <span className="h-0.5 bg-blue-200 flex-1"></span>
                </h2>
                {isAvailableOnRequest ? (
                  <p className="text-slate-600 italic text-xs">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {validRef.map(ref => (
                      <div key={ref.id} className="bg-blue-50/40 p-3 rounded-xl border border-blue-100">
                        <div className="font-bold text-slate-900">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-slate-700 font-medium">
                            {[ref.position, ref.company].filter(hasContent).join(' at ')}
                          </div>
                        )}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-blue-700 text-[8pt] mt-1">
                            {[ref.email, ref.phone].filter(hasContent).join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

// ==========================================
// 4. Modern Leader (Terracotta / Rust & Slate - Executive Layout with Vertical Accent Ribbon)
// ==========================================
export const ProModernLeader: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);

  return (
    <div className="font-sans text-stone-900 text-[9.5pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto p-8 sm:p-10 box-border" id="cv-template-root">
      {/* Terracotta Executive Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-orange-700 pb-4 mb-6 gap-4">
        <div className="border-l-4 border-orange-700 pl-4 py-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-950">{data.fullName || 'Your Name'}</h1>
          {hasContent(data.title) && <p className="text-sm font-bold text-orange-800 uppercase tracking-wide mt-0.5">{data.title}</p>}
        </div>
        {contactList.length > 0 && (
          <div className="bg-orange-50/60 border border-orange-200 p-2.5 rounded-xl flex flex-col sm:items-end text-xs text-stone-700 font-medium">
            {contactList.map(item => (
              <span key={item.key} className="inline-flex items-center gap-1.5">
                <span className="text-orange-700">{getContactIcon(item.key)}</span>
                <span>{item.value}</span>
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="space-y-5">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section]) return null;

          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section}>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-950 mb-2 border-b border-orange-200 pb-0.5">
                  Leadership Profile
                </h2>
                <p className="text-stone-700 leading-relaxed text-xs sm:text-sm text-justify">{data.summary}</p>
              </section>
            );
          }

          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-950 mb-3 border-b border-orange-200 pb-0.5">
                  Executive Experience
                </h2>
                <div className="space-y-4">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="text-xs border-l-2 border-orange-600 pl-3">
                        <div className="flex justify-between items-baseline mb-0.5">
                          {hasContent(exp.role) && <span className="font-bold text-sm text-stone-900">{exp.role}</span>}
                          {dateStr && <span className="text-orange-800 font-bold text-[8pt]">{dateStr}</span>}
                        </div>
                        {hasContent(exp.company) && <div className="text-stone-600 font-semibold mb-1.5">{exp.company}</div>}
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-4 text-stone-700 space-y-1">
                            {exp.validBullets.map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section === 'skills') {
            const validSkills = getValidSkills(data.skills);
            if (validSkills.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-950 mb-3 border-b border-orange-200 pb-0.5">
                  Core Competencies & Capabilities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {validSkills.map(sk => (
                    <div key={sk.id} className="bg-orange-50/30 p-2.5 rounded-lg border border-orange-100">
                      {hasContent(sk.category) && <div className="font-bold text-orange-950 mb-0.5">{sk.category}</div>}
                      {sk.validItems.length > 0 && <div className="text-stone-700 leading-snug">{sk.validItems.join(', ')}</div>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section === 'projects') {
            const validProjects = getValidProjects(data.projects);
            if (validProjects.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-950 mb-3 border-b border-orange-200 pb-0.5">
                  Strategic Projects
                </h2>
                <div className="space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="text-xs bg-orange-50/30 p-3 rounded-lg border border-orange-100">
                      <div className="font-bold text-stone-900 text-sm flex justify-between items-baseline">
                        <span>{proj.title || 'Project'}</span>
                        {hasContent(proj.link) && <span className="text-orange-800 text-[8pt]">{proj.link}</span>}
                      </div>
                      {hasContent(proj.tools) && <div className="text-orange-900 font-semibold text-[8pt] mb-0.5">Tech: {proj.tools}</div>}
                      {hasContent(proj.description) && <p className="text-stone-700 leading-snug">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-950 mb-3 border-b border-orange-200 pb-0.5">
                  Education & Credentials
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="border-l-2 border-stone-300 pl-2.5">
                        {degreeField && <div className="font-bold text-stone-900">{degreeField}</div>}
                        {hasContent(edu.institution) && <div className="text-stone-600">{edu.institution}</div>}
                        <div className="text-orange-800 font-semibold text-[8pt]">{dateStr}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Certifications
          if (section === 'certifications') {
            const validCerts = getValidCertifications(data.certifications);
            if (validCerts.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-950 mb-3 border-b border-orange-200 pb-0.5">
                  Certifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="border-l-2 border-orange-600 pl-2.5">
                        <div className="font-bold text-stone-950">{cert.name}</div>
                        {hasContent(cert.issuer) && <div className="text-stone-600 text-[8pt]">{cert.issuer}</div>}
                        {dateStr && <div className="text-orange-800 text-[7.5pt]">{dateStr}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Achievements
          if (section === 'achievements') {
            const validAch = getValidAchievements(data.achievements);
            if (validAch.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-950 mb-3 border-b border-orange-200 pb-0.5">
                  Honors & Achievements
                </h2>
                <div className="space-y-2.5">
                  {validAch.map(ach => (
                    <div key={ach.id} className="border-l-2 border-orange-600 pl-2.5 text-xs">
                      <div className="flex justify-between items-baseline font-bold text-stone-950">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="text-orange-800 text-[8pt]">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-orange-900 text-[8pt]">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-stone-600 mt-0.5">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Extracurriculars
          if (section === 'extracurriculars') {
            const validExt = getValidExtracurriculars(data.extracurriculars);
            if (validExt.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-950 mb-3 border-b border-orange-200 pb-0.5">
                  Leadership & Extracurriculars
                </h2>
                <div className="space-y-2.5">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="border-l-2 border-orange-600 pl-2.5 text-xs">
                        <div className="flex justify-between items-baseline font-bold text-stone-900">
                          <span>{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="text-orange-800 text-[8pt] font-semibold">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-stone-600 text-[8pt]">{[ext.role, ext.organization].filter(hasContent).join(' • ')}</div>
                        )}
                        {hasContent(ext.description) && <p className="text-stone-600 mt-0.5">{ext.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Languages
          if (section === 'languages') {
            const validLang = getValidLanguages(data.languages);
            if (validLang.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-950 mb-3 border-b border-orange-200 pb-0.5">
                  Languages
                </h2>
                <div className="flex flex-wrap gap-4 text-xs">
                  {validLang.map(lang => (
                    <span key={lang.id}>
                      <strong className="text-stone-950">{lang.language}</strong>
                      {hasContent(lang.level) && <span className="text-orange-800"> ({lang.level})</span>}
                    </span>
                  ))}
                </div>
              </section>
            );
          }

          // References
          if (section === 'references') {
            const { isAvailableOnRequest, validList: validRef } = getValidReferences(data.references);
            if (!isAvailableOnRequest && validRef.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-950 mb-3 border-b border-orange-200 pb-0.5">
                  References
                </h2>
                {isAvailableOnRequest ? (
                  <p className="text-stone-600 italic text-xs">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {validRef.map(ref => (
                      <div key={ref.id} className="border-l-2 border-stone-300 pl-2.5">
                        <div className="font-bold text-stone-950">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-stone-700">
                            {[ref.position, ref.company].filter(hasContent).join(', ')}
                          </div>
                        )}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-orange-800 text-[8pt]">
                            {[ref.email, ref.phone].filter(hasContent).join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

// ==========================================
// 5. Minimal Expert (Graphite & Deep Pine - Swiss Asymmetric 4-Column Grid)
// ==========================================
export const ProMinimal: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);

  return (
    <div className="font-sans text-neutral-800 text-[9pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto p-8 sm:p-12 box-border" id="cv-template-root">
      {/* Swiss Grid Header with Deep Pine Accent */}
      <header className="mb-7 grid grid-cols-1 sm:grid-cols-4 items-end border-b-2 border-emerald-800 pb-5 gap-4">
        <div className="sm:col-span-3">
          <h1 className="text-3xl font-extrabold text-neutral-900 mb-0.5 tracking-tight">
            {data.fullName || 'Your Name'}
          </h1>
          {hasContent(data.title) && <p className="text-emerald-800 font-bold uppercase tracking-wider text-xs">{data.title}</p>}
        </div>
        {contactList.length > 0 && (
          <div className="sm:col-span-1 text-xs text-neutral-600 space-y-1 sm:text-right font-medium">
            {contactList.map(item => (
              <div key={item.key} className="truncate">{item.value}</div>
            ))}
          </div>
        )}
      </header>

      <div className="space-y-6">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section]) return null;

          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 border-b border-neutral-100 pb-4">
                <h2 className="sm:col-span-1 text-xs font-bold uppercase text-emerald-900 tracking-wider pt-0.5">
                  About
                </h2>
                <p className="sm:col-span-3 text-neutral-700 leading-relaxed text-justify text-xs sm:text-sm">{data.summary}</p>
              </section>
            );
          }

          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 border-b border-neutral-100 pb-4">
                <h2 className="sm:col-span-1 text-xs font-bold uppercase text-emerald-900 tracking-wider pt-0.5">
                  Experience
                </h2>
                <div className="sm:col-span-3 space-y-4">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate, '—');
                    return (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          {hasContent(exp.company) && <div className="font-bold text-neutral-900 text-sm">{exp.company}</div>}
                          {dateStr && <div className="text-emerald-800 font-semibold text-xs">{dateStr}</div>}
                        </div>
                        {hasContent(exp.role) && <div className="text-neutral-600 text-xs mb-1.5 font-medium">{exp.role}</div>}
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-4 text-neutral-700 space-y-1 text-xs">
                            {exp.validBullets.map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 border-b border-neutral-100 pb-4">
                <h2 className="sm:col-span-1 text-xs font-bold uppercase text-emerald-900 tracking-wider pt-0.5">
                  Education
                </h2>
                <div className="sm:col-span-3 space-y-3">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate, '—');
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="text-xs">
                        <div className="flex justify-between items-baseline">
                          {degreeField && <span className="font-bold text-neutral-900">{degreeField}</span>}
                          {dateStr && <span className="text-emerald-800 font-semibold">{dateStr}</span>}
                        </div>
                        {hasContent(edu.institution) && <div className="text-neutral-600">{edu.institution}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section === 'projects') {
            const validProjects = getValidProjects(data.projects);
            if (validProjects.length === 0) return null;

            return (
              <section key={section} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 border-b border-neutral-100 pb-4">
                <h2 className="sm:col-span-1 text-xs font-bold uppercase text-emerald-900 tracking-wider pt-0.5">
                  Projects
                </h2>
                <div className="sm:col-span-3 space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="text-xs">
                      <div className="font-bold text-neutral-900 flex justify-between">
                        <span>{proj.title || 'Project'}</span>
                        {hasContent(proj.link) && <span className="text-emerald-800 text-[8pt]">{proj.link}</span>}
                      </div>
                      {hasContent(proj.tools) && <div className="text-emerald-800 text-[8pt] mb-0.5 font-medium">Stack: {proj.tools}</div>}
                      {hasContent(proj.description) && <p className="text-neutral-600">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section === 'skills') {
            const validSkills = getValidSkills(data.skills);
            if (validSkills.length === 0) return null;

            return (
              <section key={section} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 border-b border-neutral-100 pb-4">
                <h2 className="sm:col-span-1 text-xs font-bold uppercase text-emerald-900 tracking-wider pt-0.5">
                  Skills
                </h2>
                <div className="sm:col-span-3 space-y-2 text-xs">
                  {validSkills.map(sk => (
                    <div key={sk.id} className="flex gap-2">
                      {hasContent(sk.category) && <span className="font-bold text-neutral-900 min-w-[80px]">{sk.category}:</span>}
                      {sk.validItems.length > 0 && <span className="text-neutral-600">{sk.validItems.join(', ')}</span>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Certifications
          if (section === 'certifications') {
            const validCerts = getValidCertifications(data.certifications);
            if (validCerts.length === 0) return null;

            return (
              <section key={section} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 border-b border-neutral-100 pb-4">
                <h2 className="sm:col-span-1 text-xs font-bold uppercase text-emerald-900 tracking-wider pt-0.5">
                  Certifications
                </h2>
                <div className="sm:col-span-3 space-y-2 text-xs">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-neutral-900">{cert.name}</span>
                          {hasContent(cert.issuer) && <span className="text-neutral-600 ml-2">— {cert.issuer}</span>}
                        </div>
                        {dateStr && <span className="text-emerald-800 font-semibold">{dateStr}</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Achievements
          if (section === 'achievements') {
            const validAch = getValidAchievements(data.achievements);
            if (validAch.length === 0) return null;

            return (
              <section key={section} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 border-b border-neutral-100 pb-4">
                <h2 className="sm:col-span-1 text-xs font-bold uppercase text-emerald-900 tracking-wider pt-0.5">
                  Achievements
                </h2>
                <div className="sm:col-span-3 space-y-2 text-xs">
                  {validAch.map(ach => (
                    <div key={ach.id}>
                      <div className="flex justify-between font-bold text-neutral-900">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="text-emerald-800 font-normal">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-emerald-900">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-neutral-600 mt-0.5">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Extracurriculars
          if (section === 'extracurriculars') {
            const validExt = getValidExtracurriculars(data.extracurriculars);
            if (validExt.length === 0) return null;

            return (
              <section key={section} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 border-b border-neutral-100 pb-4">
                <h2 className="sm:col-span-1 text-xs font-bold uppercase text-emerald-900 tracking-wider pt-0.5">
                  Activities
                </h2>
                <div className="sm:col-span-3 space-y-2 text-xs">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id}>
                        <div className="flex justify-between font-bold text-neutral-900">
                          <span>{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="text-emerald-800 font-semibold">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-neutral-600">{[ext.role, ext.organization].filter(hasContent).join(' • ')}</div>
                        )}
                        {hasContent(ext.description) && <p className="text-neutral-600 mt-0.5">{ext.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Languages
          if (section === 'languages') {
            const validLang = getValidLanguages(data.languages);
            if (validLang.length === 0) return null;

            return (
              <section key={section} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 border-b border-neutral-100 pb-4">
                <h2 className="sm:col-span-1 text-xs font-bold uppercase text-emerald-900 tracking-wider pt-0.5">
                  Languages
                </h2>
                <div className="sm:col-span-3 flex flex-wrap gap-4 text-xs">
                  {validLang.map(lang => (
                    <span key={lang.id}>
                      <strong className="text-neutral-900">{lang.language}</strong>
                      {hasContent(lang.level) && <span className="text-emerald-800"> ({lang.level})</span>}
                    </span>
                  ))}
                </div>
              </section>
            );
          }

          // References
          if (section === 'references') {
            const { isAvailableOnRequest, validList: validRef } = getValidReferences(data.references);
            if (!isAvailableOnRequest && validRef.length === 0) return null;

            return (
              <section key={section} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
                <h2 className="sm:col-span-1 text-xs font-bold uppercase text-emerald-900 tracking-wider pt-0.5">
                  References
                </h2>
                <div className="sm:col-span-3 text-xs">
                  {isAvailableOnRequest ? (
                    <p className="text-neutral-600 italic">References available upon request.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {validRef.map(ref => (
                        <div key={ref.id}>
                          <div className="font-bold text-neutral-900">{ref.name}</div>
                          {(hasContent(ref.position) || hasContent(ref.company)) && (
                            <div className="text-neutral-600">
                              {[ref.position, ref.company].filter(hasContent).join(', ')}
                            </div>
                          )}
                          {(hasContent(ref.email) || hasContent(ref.phone)) && (
                            <div className="text-emerald-800 text-[8pt]">
                              {[ref.email, ref.phone].filter(hasContent).join(' • ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

// ==========================================
// 6. Executive Frame (NEW: Bold Bordered Page Frame, Serif Display & Bordered Dividers)
// ==========================================
export const ProExecutiveFrame: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);

  return (
    <div className="font-serif text-slate-900 text-[10pt] bg-slate-100 min-h-[842pt] max-w-[210mm] mx-auto p-4 box-border" id="cv-template-root">
      {/* Outer Executive Frame */}
      <div className="bg-white border-4 border-slate-900 p-8 sm:p-10 shadow-sm min-h-[800pt] flex flex-col justify-between">
        <div>
          {/* Header Block with Title & Colored Horizontal Rule */}
          <header className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-slate-950 mb-1">
              {data.fullName || 'Your Name'}
            </h1>
            {hasContent(data.title) && (
              <p className="text-sm sm:text-base font-bold font-sans tracking-widest text-slate-700 uppercase mb-3">
                {data.title}
              </p>
            )}
            {contactList.length > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs font-sans font-semibold text-slate-600 pt-2 border-t border-slate-200">
                {contactList.map((item, idx) => (
                  <React.Fragment key={item.key}>
                    {idx > 0 && <span className="text-slate-400 font-bold">•</span>}
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-slate-800">{getContactIcon(item.key)}</span>
                      <span>{item.value}</span>
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </header>

          <div className="space-y-5">
            {data.sectionOrder.map(section => {
              if (!data.sectionVisibility[section]) return null;

              if (section === 'summary' && hasContent(data.summary)) {
                return (
                  <section key={section}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 font-sans border-b border-slate-300 pb-1 mb-2">
                      Executive Summary
                    </h2>
                    <p className="text-justify leading-relaxed text-slate-800 text-[9.5pt]">{data.summary}</p>
                  </section>
                );
              }

              if (section === 'experience') {
                const validExp = getValidExperience(data.experience);
                if (validExp.length === 0) return null;

                return (
                  <section key={section}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 font-sans border-b border-slate-300 pb-1 mb-3">
                      Professional Experience
                    </h2>
                    <div className="space-y-3.5">
                      {validExp.map(exp => {
                        const dateStr = formatDateRange(exp.startDate, exp.endDate);
                        return (
                          <div key={exp.id} className="text-[9.5pt]">
                            <div className="flex justify-between items-baseline mb-0.5">
                              {hasContent(exp.company) && <h3 className="font-bold text-slate-950">{exp.company}</h3>}
                              {dateStr && <span className="text-xs font-sans font-bold text-slate-700">{dateStr}</span>}
                            </div>
                            {hasContent(exp.role) && <div className="italic text-xs sm:text-sm font-medium text-slate-700 mb-1">{exp.role}</div>}
                            {exp.validBullets.length > 0 && (
                              <ul className="list-disc list-outside ml-5 space-y-0.5 text-slate-800 text-[9pt]">
                                {exp.validBullets.map((b, i) => <li key={i}>{b}</li>)}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              }

              if (section === 'education') {
                const validEdu = getValidEducation(data.education);
                if (validEdu.length === 0) return null;

                return (
                  <section key={section}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 font-sans border-b border-slate-300 pb-1 mb-3">
                      Education & Credentials
                    </h2>
                    <div className="space-y-2">
                      {validEdu.map(edu => {
                        const dateStr = formatDateRange(edu.startDate, edu.endDate);
                        const degreeField = formatDegreeField(edu.degree, edu.field);
                        return (
                          <div key={edu.id} className="flex justify-between items-baseline text-[9.5pt]">
                            <div>
                              {hasContent(edu.institution) && <div className="font-bold text-slate-900">{edu.institution}</div>}
                              <div className="italic text-slate-700 text-xs">
                                {degreeField && <span>{degreeField}</span>}
                                {hasContent(edu.gpa) && <span className="ml-2 font-sans font-normal">— GPA: {edu.gpa}</span>}
                              </div>
                            </div>
                            {dateStr && <div className="text-xs font-sans font-bold text-slate-700">{dateStr}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              }

              if (section === 'skills') {
                const validSkills = getValidSkills(data.skills);
                if (validSkills.length === 0) return null;

                return (
                  <section key={section}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 font-sans border-b border-slate-300 pb-1 mb-2.5">
                      Core Competencies
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                      {validSkills.map(sk => (
                        <div key={sk.id} className="border-l-2 border-slate-900 pl-2.5">
                          {hasContent(sk.category) && <span className="font-bold block text-slate-950">{sk.category}</span>}
                          {sk.validItems.length > 0 && <span className="text-slate-700">{sk.validItems.join(', ')}</span>}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              if (section === 'projects') {
                const validProjects = getValidProjects(data.projects);
                if (validProjects.length === 0) return null;

                return (
                  <section key={section}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 font-sans border-b border-slate-300 pb-1 mb-2.5">
                      Key Projects & Initiatives
                    </h2>
                    <div className="space-y-2.5">
                      {validProjects.map(proj => (
                        <div key={proj.id} className="text-[9.5pt]">
                          <div className="flex justify-between items-baseline font-bold">
                            <span>{proj.title || 'Initiative'}</span>
                            {hasContent(proj.tools) && <span className="text-xs font-sans font-normal text-slate-600">Tools: {proj.tools}</span>}
                          </div>
                          {hasContent(proj.description) && <p className="text-slate-700 text-[9pt]">{proj.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              // Certifications
              if (section === 'certifications') {
                const validCerts = getValidCertifications(data.certifications);
                if (validCerts.length === 0) return null;

                return (
                  <section key={section}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 font-sans border-b border-slate-300 pb-1 mb-2.5">
                      Certifications
                    </h2>
                    <div className="space-y-2 text-xs">
                      {validCerts.map(cert => {
                        const dateStr = formatDateRange(cert.date, cert.expiryDate);
                        return (
                          <div key={cert.id} className="flex justify-between items-baseline">
                            <div>
                              <span className="font-bold text-slate-950">{cert.name}</span>
                              {hasContent(cert.issuer) && <span className="text-slate-600 ml-2">— {cert.issuer}</span>}
                            </div>
                            {dateStr && <span className="font-sans font-semibold text-slate-700">{dateStr}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              }

              // Achievements
              if (section === 'achievements') {
                const validAch = getValidAchievements(data.achievements);
                if (validAch.length === 0) return null;

                return (
                  <section key={section}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 font-sans border-b border-slate-300 pb-1 mb-2.5">
                      Honors & Achievements
                    </h2>
                    <div className="space-y-2 text-xs">
                      {validAch.map(ach => (
                        <div key={ach.id}>
                          <div className="flex justify-between items-baseline font-bold text-slate-950">
                            <span>{ach.title}</span>
                            {hasContent(ach.date) && <span className="text-slate-600 text-[8pt]">{ach.date}</span>}
                          </div>
                          {hasContent(ach.issuer) && <div className="text-slate-700 text-[8pt]">{ach.issuer}</div>}
                          {hasContent(ach.description) && <p className="text-slate-600 mt-0.5">{ach.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              // Extracurriculars
              if (section === 'extracurriculars') {
                const validExt = getValidExtracurriculars(data.extracurriculars);
                if (validExt.length === 0) return null;

                return (
                  <section key={section}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 font-sans border-b border-slate-300 pb-1 mb-2.5">
                      Leadership & Activities
                    </h2>
                    <div className="space-y-2 text-xs">
                      {validExt.map(ext => {
                        const dateStr = formatDateRange(ext.startDate, ext.endDate);
                        return (
                          <div key={ext.id}>
                            <div className="flex justify-between items-baseline font-bold text-slate-950">
                              <span>{ext.activityName || ext.role || 'Activity'}</span>
                              {dateStr && <span className="text-slate-700 font-semibold">{dateStr}</span>}
                            </div>
                            {(hasContent(ext.role) || hasContent(ext.organization)) && (
                              <div className="text-slate-600">{[ext.role, ext.organization].filter(hasContent).join(' • ')}</div>
                            )}
                            {hasContent(ext.description) && <p className="text-slate-600 mt-0.5">{ext.description}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              }

              // Languages
              if (section === 'languages') {
                const validLang = getValidLanguages(data.languages);
                if (validLang.length === 0) return null;

                return (
                  <section key={section}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 font-sans border-b border-slate-300 pb-1 mb-2.5">
                      Languages
                    </h2>
                    <div className="flex flex-wrap gap-4 text-xs font-sans">
                      {validLang.map(lang => (
                        <span key={lang.id}>
                          <strong className="text-slate-950">{lang.language}</strong>
                          {hasContent(lang.level) && <span className="text-slate-600"> ({lang.level})</span>}
                        </span>
                      ))}
                    </div>
                  </section>
                );
              }

              // References
              if (section === 'references') {
                const { isAvailableOnRequest, validList: validRef } = getValidReferences(data.references);
                if (!isAvailableOnRequest && validRef.length === 0) return null;

                return (
                  <section key={section}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 font-sans border-b border-slate-300 pb-1 mb-2.5">
                      References
                    </h2>
                    {isAvailableOnRequest ? (
                      <p className="text-slate-600 italic text-xs font-sans">References available upon request.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                        {validRef.map(ref => (
                          <div key={ref.id} className="border-l-2 border-slate-900 pl-2.5">
                            <div className="font-bold text-slate-950">{ref.name}</div>
                            {(hasContent(ref.position) || hasContent(ref.company)) && (
                              <div className="text-slate-700">
                                {[ref.position, ref.company].filter(hasContent).join(', ')}
                              </div>
                            )}
                            {(hasContent(ref.email) || hasContent(ref.phone)) && (
                              <div className="text-slate-600 text-[8pt]">
                                {[ref.email, ref.phone].filter(hasContent).join(' • ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. Corporate Sidebar (NEW: Dark Emerald Obsidian Sidebar with Icon Labels & Clean Main Area)
// ==========================================
export const ProCorporateSidebar: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);
  const validSkills = getValidSkills(data.skills);
  const validLanguages = getValidLanguages(data.languages);

  return (
    <div className="font-sans text-slate-800 text-[9.5pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto flex box-border" id="cv-template-root">
      {/* Dark Forest Obsidian Full-Height Sidebar */}
      <div className="w-[33%] bg-emerald-950 text-emerald-100 p-6 flex flex-col gap-6 border-r-2 border-emerald-800">
        {data.sectionVisibility.photo && hasContent(data.photo) && (
          <div className="flex justify-center">
            <img src={data.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-emerald-400 shadow-md" />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-snug">
            {data.fullName || 'Your Name'}
          </h1>
          {hasContent(data.title) && (
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[8pt] mt-1">{data.title}</p>
          )}
        </div>

        {data.sectionVisibility.contact && contactList.length > 0 && (
          <div className="border-t border-emerald-800/80 pt-4">
            <h2 className="font-black text-emerald-400 uppercase text-[8pt] tracking-widest mb-3">
              Contact Details
            </h2>
            <div className="flex flex-col gap-2.5 text-xs text-emerald-100">
              {contactList.map(item => (
                <div key={item.key} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">{getContactIcon(item.key)}</span>
                  <div className="min-w-0">
                    <span className="text-[7pt] text-emerald-400 font-bold uppercase block">{item.label}</span>
                    <span className="text-emerald-50 text-[8.5pt] break-words">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.sectionVisibility.skills && validSkills.length > 0 && (
          <div className="border-t border-emerald-800/80 pt-4">
            <h2 className="font-black text-emerald-400 uppercase text-[8pt] tracking-widest mb-3">
              Skills & Expertise
            </h2>
            <div className="flex flex-col gap-3">
              {validSkills.map(sk => (
                <div key={sk.id}>
                  {hasContent(sk.category) && (
                    <div className="text-emerald-200 font-bold text-xs mb-1.5">{sk.category}</div>
                  )}
                  {sk.validItems.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sk.validItems.map((item, i) => (
                        <span key={i} className="bg-emerald-900/90 border border-emerald-700 text-emerald-100 px-2 py-0.5 rounded text-[7.5pt] font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.sectionVisibility.languages && validLanguages.length > 0 && (
          <div className="border-t border-emerald-800/80 pt-4">
            <h2 className="font-black text-emerald-400 uppercase text-[8pt] tracking-widest mb-3">
              Languages
            </h2>
            <div className="flex flex-col gap-1.5 text-xs text-emerald-100">
              {validLanguages.map(lang => (
                <div key={lang.id} className="flex justify-between">
                  <span className="font-bold text-white">{lang.language}</span>
                  {hasContent(lang.level) && <span className="text-emerald-300 text-[8pt]">{lang.level}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-[67%] p-6 sm:p-8 space-y-5">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section] || section === 'contact' || section === 'skills' || section === 'languages' || section === 'photo') return null;

          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section} className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-widest mb-1.5">
                  Executive Summary
                </h2>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm text-justify">{data.summary}</p>
              </section>
            );
          }

          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-emerald-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-emerald-700 flex items-center justify-between">
                  <span>Work Experience</span>
                  <span className="w-10 h-0.5 bg-emerald-200"></span>
                </h2>
                <div className="space-y-4">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="relative pl-3.5 border-l-2 border-emerald-400 text-xs">
                        <div className="absolute w-2 h-2 bg-emerald-700 rounded-full -left-[5px] top-1"></div>
                        <div className="flex justify-between items-baseline mb-0.5">
                          {hasContent(exp.role) && <div className="font-bold text-slate-900 text-sm">{exp.role}</div>}
                          {dateStr && <div className="text-emerald-800 font-bold text-[8pt]">{dateStr}</div>}
                        </div>
                        {hasContent(exp.company) && (
                          <div className="text-slate-600 font-semibold mb-1.5">{exp.company}</div>
                        )}
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-3 text-slate-700 space-y-1">
                            {exp.validBullets.map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-emerald-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-emerald-700 flex items-center justify-between">
                  <span>Education & Credentials</span>
                  <span className="w-10 h-0.5 bg-emerald-200"></span>
                </h2>
                <div className="space-y-3">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="text-xs">
                        {degreeField && <div className="font-bold text-slate-900 text-sm">{degreeField}</div>}
                        {hasContent(edu.institution) && <div className="text-slate-600 font-medium">{edu.institution}</div>}
                        <div className="flex gap-2 text-slate-500 text-[8pt] mt-0.5">
                          {dateStr && <span className="text-emerald-800 font-bold">{dateStr}</span>}
                          {hasContent(edu.gpa) && <span>• GPA: {edu.gpa}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section === 'projects') {
            const validProjects = getValidProjects(data.projects);
            if (validProjects.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-emerald-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-emerald-700 flex items-center justify-between">
                  <span>Initiatives & Projects</span>
                  <span className="w-10 h-0.5 bg-emerald-200"></span>
                </h2>
                <div className="space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="text-xs bg-emerald-50/40 p-3 rounded-lg border border-emerald-100">
                      <div className="font-bold text-slate-900 text-sm">{proj.title || 'Project'}</div>
                      {hasContent(proj.tools) && <div className="text-emerald-800 font-semibold text-[8pt] mb-0.5">Tech: {proj.tools}</div>}
                      {hasContent(proj.description) && <p className="text-slate-600 leading-snug">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Certifications
          if (section === 'certifications') {
            const validCerts = getValidCertifications(data.certifications);
            if (validCerts.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-emerald-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-emerald-700 flex items-center justify-between">
                  <span>Certifications</span>
                  <span className="w-10 h-0.5 bg-emerald-200"></span>
                </h2>
                <div className="space-y-2.5">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="text-xs bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100 flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-slate-900">{cert.name}</span>
                          {hasContent(cert.issuer) && <span className="text-emerald-800 text-[8pt] ml-2 font-medium">({cert.issuer})</span>}
                        </div>
                        {dateStr && <span className="text-emerald-700 font-semibold text-[8pt]">{dateStr}</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Achievements
          if (section === 'achievements') {
            const validAch = getValidAchievements(data.achievements);
            if (validAch.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-emerald-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-emerald-700 flex items-center justify-between">
                  <span>Honors & Achievements</span>
                  <span className="w-10 h-0.5 bg-emerald-200"></span>
                </h2>
                <div className="space-y-2.5">
                  {validAch.map(ach => (
                    <div key={ach.id} className="text-xs bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="text-emerald-700 font-semibold text-[8pt]">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-emerald-900 font-medium text-[8pt]">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-slate-600 leading-snug mt-1">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Extracurriculars
          if (section === 'extracurriculars') {
            const validExt = getValidExtracurriculars(data.extracurriculars);
            if (validExt.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-emerald-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-emerald-700 flex items-center justify-between">
                  <span>Leadership & Activities</span>
                  <span className="w-10 h-0.5 bg-emerald-200"></span>
                </h2>
                <div className="space-y-3">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="text-xs border-l-2 border-emerald-400 pl-3">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="text-emerald-700 font-semibold text-[8pt]">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-emerald-900 font-medium text-[8pt] mb-0.5">
                            {[ext.role, ext.organization].filter(hasContent).join(' • ')}
                          </div>
                        )}
                        {hasContent(ext.description) && <p className="text-slate-600">{ext.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // References
          if (section === 'references') {
            const { isAvailableOnRequest, validList: validRef } = getValidReferences(data.references);
            if (!isAvailableOnRequest && validRef.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-emerald-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-emerald-700 flex items-center justify-between">
                  <span>References</span>
                  <span className="w-10 h-0.5 bg-emerald-200"></span>
                </h2>
                {isAvailableOnRequest ? (
                  <p className="text-slate-600 italic text-xs">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {validRef.map(ref => (
                      <div key={ref.id} className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100">
                        <div className="font-bold text-slate-900">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-slate-700 font-medium">
                            {[ref.position, ref.company].filter(hasContent).join(' at ')}
                          </div>
                        )}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-emerald-700 text-[8pt] mt-1">
                            {[ref.email, ref.phone].filter(hasContent).join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
