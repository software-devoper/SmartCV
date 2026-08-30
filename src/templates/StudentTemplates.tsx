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
// 1. Campus Minimal (Burgundy / Wine Accent - Single Column with Structured Border Cards)
// ==========================================
export const StudentMinimal: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);

  return (
    <div className="font-serif text-slate-800 p-8 sm:p-10 text-[10pt] leading-relaxed bg-white min-h-[842pt] max-w-[210mm] mx-auto box-border" id="cv-template-root">
      {/* Header with Burgundy Top Stripe & Border */}
      <div className="border-t-4 border-rose-900 border-x border-b border-rose-200/90 bg-rose-50/40 p-5 rounded-t-xl mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-widest text-rose-950 mb-1 font-serif">
          {data.fullName || 'Your Name'}
        </h1>
        {hasContent(data.title) && (
          <p className="text-xs sm:text-sm text-rose-800 font-semibold mb-2 font-sans tracking-wide">{data.title}</p>
        )}
        {contactList.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1.5 text-xs text-slate-600 font-sans mt-2 pt-2 border-t border-rose-200/60">
            {contactList.map((item, idx) => (
              <React.Fragment key={item.key}>
                {idx > 0 && <span className="text-rose-300 font-bold">•</span>}
                <span className="inline-flex items-center gap-1">
                  <span className="text-rose-700">{getContactIcon(item.key)}</span>
                  <span>{item.value}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section]) return null;

          // Photo
          if (section === 'photo' && hasContent(data.photo)) {
            return (
              <div key={section} className="flex justify-center mb-4">
                <img src={data.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-rose-900 shadow-xs" />
              </div>
            );
          }

          // Summary
          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section} className="border-l-2 border-rose-900 pl-3.5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-950 mb-1.5 font-sans">
                  Profile Summary
                </h2>
                <p className="text-justify text-slate-700 leading-normal text-[9.5pt]">{data.summary}</p>
              </section>
            );
          }

          // Education
          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-950 border-b-2 border-rose-900 pb-1 mb-3 font-sans flex items-center justify-between">
                  <span>Education</span>
                  <span className="w-8 h-0.5 bg-rose-200"></span>
                </h2>
                <div className="space-y-3">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="text-[9.5pt] border-b border-rose-100/80 pb-2.5 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          {hasContent(edu.institution) && <span>{edu.institution}</span>}
                          {dateStr && <span className="text-xs font-semibold text-rose-800 font-sans">{dateStr}</span>}
                        </div>
                        {degreeField && <div className="italic text-rose-900 font-medium">{degreeField}</div>}
                        {hasContent(edu.gpa) && <div className="text-xs text-slate-500 font-sans mt-0.5">Cumulative GPA: <span className="font-semibold text-slate-700">{edu.gpa}</span></div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Experience
          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-950 border-b-2 border-rose-900 pb-1 mb-3 font-sans flex items-center justify-between">
                  <span>Experience</span>
                  <span className="w-8 h-0.5 bg-rose-200"></span>
                </h2>
                <div className="space-y-3.5">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="text-[9.5pt] border-b border-rose-100/80 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          {hasContent(exp.role) ? <span>{exp.role}</span> : (hasContent(exp.company) ? <span>{exp.company}</span> : null)}
                          {dateStr && <span className="text-xs font-semibold text-rose-800 font-sans">{dateStr}</span>}
                        </div>
                        {hasContent(exp.company) && hasContent(exp.role) && (
                          <div className="text-xs font-sans font-semibold text-rose-900 mb-1.5">{exp.company}</div>
                        )}
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-4 text-slate-700 space-y-1 text-[9pt]">
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

          // Projects
          if (section === 'projects') {
            const validProjects = getValidProjects(data.projects);
            if (validProjects.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-950 border-b-2 border-rose-900 pb-1 mb-3 font-sans flex items-center justify-between">
                  <span>Projects</span>
                  <span className="w-8 h-0.5 bg-rose-200"></span>
                </h2>
                <div className="space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="text-[9.5pt] bg-rose-50/30 p-2.5 rounded-lg border border-rose-100">
                      <div className="font-bold text-slate-900 flex items-baseline justify-between">
                        <span className="text-rose-950">{proj.title || 'Project'}</span>
                        {hasContent(proj.link) && (
                          <span className="font-sans font-normal text-xs text-rose-700 truncate max-w-[220px]">{proj.link}</span>
                        )}
                      </div>
                      {hasContent(proj.tools) && (
                        <div className="text-xs font-semibold text-rose-800 mb-1 font-sans">Tech: {proj.tools}</div>
                      )}
                      {hasContent(proj.description) && (
                        <p className="text-slate-700 text-[9pt] leading-snug">{proj.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Skills
          if (section === 'skills') {
            const validSkills = getValidSkills(data.skills);
            if (validSkills.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-950 border-b-2 border-rose-900 pb-1 mb-2.5 font-sans flex items-center justify-between">
                  <span>Skills & Competencies</span>
                  <span className="w-8 h-0.5 bg-rose-200"></span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9.5pt]">
                  {validSkills.map(sk => (
                    <div key={sk.id} className="border-l-2 border-rose-800 pl-2.5 py-0.5">
                      {hasContent(sk.category) && (
                        <span className="font-bold text-rose-950 block text-xs">{sk.category}</span>
                      )}
                      {sk.validItems.length > 0 && (
                        <span className="text-slate-700 font-sans text-xs">{sk.validItems.join(', ')}</span>
                      )}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-950 border-b-2 border-rose-900 pb-1 mb-3 font-sans flex items-center justify-between">
                  <span>Extracurricular Activities</span>
                  <span className="w-8 h-0.5 bg-rose-200"></span>
                </h2>
                <div className="space-y-3">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="text-[9.5pt] border-b border-rose-100/80 pb-2.5 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="text-xs font-semibold text-rose-800 font-sans">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-xs font-sans text-rose-900 font-semibold mb-1">
                            {[ext.role, ext.organization].filter(hasContent).join(' • ')}
                          </div>
                        )}
                        {hasContent(ext.description) && <p className="text-slate-700 text-[9pt] leading-snug">{ext.description}</p>}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-950 border-b-2 border-rose-900 pb-1 mb-3 font-sans flex items-center justify-between">
                  <span>Certifications</span>
                  <span className="w-8 h-0.5 bg-rose-200"></span>
                </h2>
                <div className="space-y-2.5">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="text-[9.5pt]">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{cert.name}</span>
                          {dateStr && <span className="text-xs font-semibold text-rose-800 font-sans">{dateStr}</span>}
                        </div>
                        <div className="flex justify-between items-baseline text-xs text-slate-600 font-sans">
                          {hasContent(cert.issuer) && <span className="text-rose-900 font-medium">{cert.issuer}</span>}
                          {hasContent(cert.credentialUrl) && <span className="text-rose-700 font-normal">{cert.credentialUrl}</span>}
                        </div>
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-950 border-b-2 border-rose-900 pb-1 mb-3 font-sans flex items-center justify-between">
                  <span>Honors & Achievements</span>
                  <span className="w-8 h-0.5 bg-rose-200"></span>
                </h2>
                <div className="space-y-2.5">
                  {validAch.map(ach => (
                    <div key={ach.id} className="text-[9.5pt]">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="text-xs font-semibold text-rose-800 font-sans">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-xs font-sans text-rose-900 font-medium">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-slate-700 text-[9pt] leading-snug mt-0.5">{ach.description}</p>}
                    </div>
                  ))}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-950 border-b-2 border-rose-900 pb-1 mb-2.5 font-sans flex items-center justify-between">
                  <span>Languages</span>
                  <span className="w-8 h-0.5 bg-rose-200"></span>
                </h2>
                <div className="flex flex-wrap gap-2 text-xs font-sans">
                  {validLang.map(lang => (
                    <div key={lang.id} className="bg-rose-50/60 border border-rose-200 px-2.5 py-1 rounded text-slate-800">
                      <span className="font-bold text-rose-950">{lang.language}</span>
                      {hasContent(lang.level) && <span className="text-rose-800 text-[8pt] ml-1">({lang.level})</span>}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-950 border-b-2 border-rose-900 pb-1 mb-2.5 font-sans flex items-center justify-between">
                  <span>References</span>
                  <span className="w-8 h-0.5 bg-rose-200"></span>
                </h2>
                {isAvailableOnRequest ? (
                  <p className="text-slate-600 italic text-xs font-sans">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    {validRef.map(ref => (
                      <div key={ref.id} className="bg-rose-50/40 p-2.5 rounded border border-rose-100">
                        <div className="font-bold text-rose-950">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-slate-700 font-medium">
                            {[ref.position, ref.company].filter(hasContent).join(' at ')}
                          </div>
                        )}
                        {hasContent(ref.relationship) && <div className="text-slate-500 italic text-[7.5pt]">{ref.relationship}</div>}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-rose-800 text-[8pt] mt-1">
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
// 2. Modern Graduate (Deep Teal / Ocean - Two Column with Styled Sidebar & Tag Pills)
// ==========================================
export const StudentModern: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);
  const validSkills = getValidSkills(data.skills);
  const validLanguages = getValidLanguages(data.languages);

  return (
    <div className="font-sans text-slate-800 text-[9.5pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto flex box-border" id="cv-template-root">
      {/* Left Teal-Tinted Sidebar */}
      <div className="w-[34%] bg-teal-950 text-teal-100 p-6 flex flex-col gap-5 border-r-2 border-teal-800">
        {data.sectionVisibility.photo && hasContent(data.photo) && (
          <div className="flex justify-center">
            <img src={data.photo} alt="Profile" className="w-28 h-28 rounded-2xl object-cover border-2 border-teal-400 shadow-md" />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
            {data.fullName || 'Your Name'}
          </h1>
          {hasContent(data.title) && (
            <p className="text-teal-300 font-semibold text-xs tracking-wider uppercase mt-1">{data.title}</p>
          )}
        </div>
        
        {data.sectionVisibility.contact && contactList.length > 0 && (
          <div className="border-t border-teal-800/80 pt-4">
            <h2 className="font-bold text-teal-300 uppercase text-[8.5pt] mb-3 tracking-widest flex items-center gap-1.5">
              <span>Contact</span>
            </h2>
            <div className="flex flex-col gap-2.5 text-xs text-teal-100 break-words">
              {contactList.map(item => (
                <div key={item.key} className="flex items-start gap-2">
                  <span className="text-teal-400 mt-0.5">{getContactIcon(item.key)}</span>
                  <div>
                    <div className="text-[7.5pt] font-bold text-teal-400 uppercase tracking-wider">{item.label}</div>
                    <div className="text-teal-50 text-[8.5pt] leading-tight">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.sectionVisibility.skills && validSkills.length > 0 && (
          <div className="border-t border-teal-800/80 pt-4">
            <h2 className="font-bold text-teal-300 uppercase text-[8.5pt] mb-3 tracking-widest">
              Skills
            </h2>
            <div className="flex flex-col gap-3">
              {validSkills.map(sk => (
                <div key={sk.id}>
                  {hasContent(sk.category) && (
                    <div className="font-bold text-teal-200 text-xs mb-1.5">{sk.category}</div>
                  )}
                  {sk.validItems.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sk.validItems.map((item, i) => (
                        <span key={i} className="bg-teal-900/90 border border-teal-700 text-teal-100 px-2 py-0.5 rounded text-[8pt] font-medium shadow-2xs">
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
          <div className="border-t border-teal-800/80 pt-4">
            <h2 className="font-bold text-teal-300 uppercase text-[8.5pt] mb-3 tracking-widest">
              Languages
            </h2>
            <div className="flex flex-col gap-1.5 text-xs text-teal-100">
              {validLanguages.map(lang => (
                <div key={lang.id} className="flex justify-between">
                  <span className="font-semibold text-white">{lang.language}</span>
                  {hasContent(lang.level) && <span className="text-teal-300 text-[8pt]">{lang.level}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Main Content */}
      <div className="w-[66%] p-6 sm:p-8 space-y-5">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section] || section === 'contact' || section === 'skills' || section === 'languages' || section === 'photo') return null;

          // Summary
          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section} className="bg-teal-50/50 p-3.5 rounded-xl border border-teal-100">
                <h2 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-1">About Me</h2>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm text-justify">{data.summary}</p>
              </section>
            );
          }

          // Education
          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-teal-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-teal-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-teal-600 rounded-sm"></span> Education
                </h2>
                <div className="space-y-3">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="text-xs">
                        <div className="flex justify-between items-baseline">
                          {degreeField && <div className="font-bold text-slate-900 text-sm">{degreeField}</div>}
                          {dateStr && <span className="text-teal-700 font-semibold text-[8.5pt]">{dateStr}</span>}
                        </div>
                        {hasContent(edu.institution) && <div className="text-teal-800 font-medium">{edu.institution}</div>}
                        {hasContent(edu.gpa) && <div className="text-slate-500 text-[8.5pt] mt-0.5">GPA: {edu.gpa}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Projects
          if (section === 'projects') {
            const validProjects = getValidProjects(data.projects);
            if (validProjects.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-teal-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-teal-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-teal-600 rounded-sm"></span> Projects
                </h2>
                <div className="space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="text-xs border-l-2 border-teal-500 pl-3">
                      <div className="flex items-baseline justify-between font-bold text-slate-900 text-sm">
                        <span>{proj.title || 'Project'}</span>
                        {hasContent(proj.link) && <span className="text-[8pt] text-teal-600 font-normal">{proj.link}</span>}
                      </div>
                      {hasContent(proj.tools) && (
                        <div className="text-teal-700 font-semibold text-[8pt] mb-1">Stack: {proj.tools}</div>
                      )}
                      {hasContent(proj.description) && (
                        <p className="text-slate-600 leading-snug">{proj.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Experience
          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-teal-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-teal-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-teal-600 rounded-sm"></span> Experience
                </h2>
                <div className="space-y-3.5">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="text-xs">
                        <div className="flex justify-between items-baseline mb-0.5">
                          {hasContent(exp.role) && <div className="font-bold text-slate-900 text-sm">{exp.role}</div>}
                          {dateStr && <div className="text-teal-700 font-semibold text-[8pt]">{dateStr}</div>}
                        </div>
                        {hasContent(exp.company) && <div className="text-slate-600 font-medium mb-1">{exp.company}</div>}
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-4 text-slate-600 space-y-1">
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

          // Extracurriculars
          if (section === 'extracurriculars') {
            const validExt = getValidExtracurriculars(data.extracurriculars);
            if (validExt.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-extrabold text-teal-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-teal-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-teal-600 rounded-sm"></span> Extracurriculars
                </h2>
                <div className="space-y-3">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="text-xs border-l-2 border-teal-500 pl-3">
                        <div className="flex justify-between items-baseline font-bold text-slate-900 text-sm">
                          <span>{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="text-teal-700 font-semibold text-[8pt]">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-teal-800 font-medium text-[8pt] mb-1">
                            {[ext.role, ext.organization].filter(hasContent).join(' • ')}
                          </div>
                        )}
                        {hasContent(ext.description) && <p className="text-slate-600 leading-snug">{ext.description}</p>}
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
                <h2 className="text-xs font-extrabold text-teal-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-teal-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-teal-600 rounded-sm"></span> Certifications
                </h2>
                <div className="space-y-2.5">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="text-xs bg-teal-50/40 p-2.5 rounded-lg border border-teal-100">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{cert.name}</span>
                          {dateStr && <span className="text-teal-700 font-semibold text-[8pt]">{dateStr}</span>}
                        </div>
                        <div className="flex justify-between items-baseline text-[8pt] text-slate-600 mt-0.5">
                          {hasContent(cert.issuer) && <span className="text-teal-900 font-semibold">{cert.issuer}</span>}
                          {hasContent(cert.credentialUrl) && <span className="text-teal-600">{cert.credentialUrl}</span>}
                        </div>
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
                <h2 className="text-xs font-extrabold text-teal-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-teal-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-teal-600 rounded-sm"></span> Achievements
                </h2>
                <div className="space-y-2.5">
                  {validAch.map(ach => (
                    <div key={ach.id} className="text-xs bg-teal-50/40 p-2.5 rounded-lg border border-teal-100">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="text-teal-700 font-semibold text-[8pt]">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-teal-900 font-medium text-[8pt]">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-slate-600 leading-snug mt-1">{ach.description}</p>}
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
                <h2 className="text-xs font-extrabold text-teal-950 uppercase tracking-widest mb-3 pb-1 border-b-2 border-teal-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-teal-600 rounded-sm"></span> References
                </h2>
                {isAvailableOnRequest ? (
                  <p className="text-slate-600 italic text-xs">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {validRef.map(ref => (
                      <div key={ref.id} className="bg-teal-50/40 p-2.5 rounded-lg border border-teal-100">
                        <div className="font-bold text-slate-900">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-slate-700 font-medium">
                            {[ref.position, ref.company].filter(hasContent).join(' at ')}
                          </div>
                        )}
                        {hasContent(ref.relationship) && <div className="text-slate-500 italic text-[7.5pt]">{ref.relationship}</div>}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-teal-700 text-[8pt] mt-1">
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
// 3. Academic Focus (Oxford Navy - Scholarly Double-Border Header & Refined Serifs)
// ==========================================
export const StudentAcademic: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);

  return (
    <div className="font-serif text-slate-900 text-[10pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto px-8 sm:px-12 py-8 sm:py-10 box-border" id="cv-template-root">
      {/* Classical Navy Double Header */}
      <header className="border-y-2 border-indigo-950 bg-indigo-50/40 py-4 px-6 mb-6 text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wider text-indigo-950 mb-1">
          {data.fullName || 'Your Name'}
        </h1>
        {hasContent(data.title) && (
          <p className="text-xs font-sans italic text-indigo-900 font-semibold mb-2">{data.title}</p>
        )}
        {contactList.length > 0 && (
          <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-xs font-sans text-slate-700">
            {contactList.map((item, idx) => (
              <React.Fragment key={item.key}>
                {idx > 0 && <span className="text-indigo-400 font-bold">•</span>}
                <span>{item.value}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <div className="space-y-4">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section]) return null;

          // Summary
          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-indigo-300 pb-0.5 mb-1.5 font-sans">
                  Curriculum Vitae Overview
                </h2>
                <p className="text-justify leading-relaxed text-[9.5pt] text-slate-800">{data.summary}</p>
              </section>
            );
          }

          // Education (First for Academic)
          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-indigo-300 pb-0.5 mb-2 font-sans">
                  Academic Background
                </h2>
                <div className="space-y-2.5">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="text-[9.5pt] pl-3 border-l border-indigo-200">
                        <div className="flex justify-between font-bold text-slate-900">
                          {hasContent(edu.institution) && <span>{edu.institution}</span>}
                          {dateStr && <span className="font-sans font-semibold text-xs text-indigo-900">{dateStr}</span>}
                        </div>
                        <div className="flex justify-between italic text-slate-800 text-xs sm:text-sm">
                          {degreeField && <span>{degreeField}</span>}
                          {hasContent(edu.gpa) && <span className="font-sans text-xs font-semibold text-indigo-800">GPA: {edu.gpa}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // Projects / Research
          if (section === 'projects') {
            const validProjects = getValidProjects(data.projects);
            if (validProjects.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-indigo-300 pb-0.5 mb-2 font-sans">
                  Research & Academic Projects
                </h2>
                <div className="space-y-2.5">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="text-[9.5pt] pl-3 border-l border-indigo-200">
                      <div className="font-bold flex items-baseline justify-between text-slate-900">
                        <span className="text-indigo-950">{proj.title || 'Research Project'}</span>
                        {hasContent(proj.tools) && (
                          <span className="font-normal italic text-indigo-800 text-xs font-sans">Tools: {proj.tools}</span>
                        )}
                      </div>
                      {hasContent(proj.description) && (
                        <p className="text-slate-800 text-[9pt] leading-normal">{proj.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Experience
          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-indigo-300 pb-0.5 mb-2 font-sans">
                  Professional & Teaching Experience
                </h2>
                <div className="space-y-3">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="text-[9.5pt] pl-3 border-l border-indigo-200">
                        <div className="flex justify-between font-bold text-slate-900">
                          {hasContent(exp.company) && <span>{exp.company}</span>}
                          {dateStr && <span className="font-sans font-semibold text-xs text-indigo-900">{dateStr}</span>}
                        </div>
                        {hasContent(exp.role) && <div className="italic mb-1 text-slate-700 text-xs">{exp.role}</div>}
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9pt] text-slate-800">
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

          // Extracurriculars
          if (section === 'extracurriculars') {
            const validExt = getValidExtracurriculars(data.extracurriculars);
            if (validExt.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-indigo-300 pb-0.5 mb-2 font-sans">
                  Leadership & Activities
                </h2>
                <div className="space-y-2.5">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="text-[9.5pt] pl-3 border-l border-indigo-200">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="font-sans font-semibold text-xs text-indigo-900">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="italic text-indigo-900 text-xs mb-0.5">
                            {[ext.role, ext.organization].filter(hasContent).join(' • ')}
                          </div>
                        )}
                        {hasContent(ext.description) && <p className="text-slate-800 text-[9pt] leading-normal">{ext.description}</p>}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-indigo-300 pb-0.5 mb-2 font-sans">
                  Certifications & Accreditations
                </h2>
                <div className="space-y-2">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="text-[9.5pt] pl-3 border-l border-indigo-200 flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-slate-900">{cert.name}</span>
                          {hasContent(cert.issuer) && <span className="text-xs italic text-indigo-900 ml-2">— {cert.issuer}</span>}
                        </div>
                        {dateStr && <span className="font-sans font-semibold text-xs text-indigo-900">{dateStr}</span>}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-indigo-300 pb-0.5 mb-2 font-sans">
                  Honors & Awards
                </h2>
                <div className="space-y-2">
                  {validAch.map(ach => (
                    <div key={ach.id} className="text-[9.5pt] pl-3 border-l border-indigo-200">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="font-sans text-xs text-indigo-900">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-xs text-indigo-900 italic">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-slate-800 text-[9pt] mt-0.5">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Skills
          if (section === 'skills') {
            const validSkills = getValidSkills(data.skills);
            if (validSkills.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-indigo-300 pb-0.5 mb-2 font-sans">
                  Technical & Methodological Competencies
                </h2>
                <div className="space-y-1.5">
                  {validSkills.map(sk => (
                    <div key={sk.id} className="text-[9.5pt] flex items-baseline gap-2">
                      {hasContent(sk.category) && <span className="font-bold text-indigo-950 text-xs">{sk.category}:</span>}
                      {sk.validItems.length > 0 && <span className="font-sans text-xs text-slate-700">{sk.validItems.join(', ')}</span>}
                    </div>
                  ))}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-indigo-300 pb-0.5 mb-2 font-sans">
                  Languages
                </h2>
                <div className="flex flex-wrap gap-4 text-xs font-sans text-slate-800">
                  {validLang.map(lang => (
                    <span key={lang.id} className="font-medium">
                      <strong className="text-indigo-950">{lang.language}</strong>
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-indigo-300 pb-0.5 mb-2 font-sans">
                  Academic & Professional References
                </h2>
                {isAvailableOnRequest ? (
                  <p className="text-slate-700 italic text-xs font-sans">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    {validRef.map(ref => (
                      <div key={ref.id} className="pl-3 border-l border-indigo-200">
                        <div className="font-bold text-indigo-950">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-slate-700 italic">
                            {[ref.position, ref.company].filter(hasContent).join(', ')}
                          </div>
                        )}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-indigo-900 text-[8pt] mt-0.5">
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
// 4. Creative Student (Deep Plum / Violet - Right Sidebar Layout with Pill Badges)
// ==========================================
export const StudentCreative: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);
  const validSkills = getValidSkills(data.skills);
  const validLanguages = getValidLanguages(data.languages);

  return (
    <div className="font-sans text-slate-800 text-[9.5pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto flex flex-row-reverse box-border" id="cv-template-root">
      {/* Right Purple-Tinted Sidebar */}
      <div className="w-[35%] bg-purple-950 text-purple-100 p-6 sm:p-7 border-l-2 border-purple-800 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 leading-tight">
            {data.fullName || 'Your Name'}
          </h1>
          {hasContent(data.title) && (
            <p className="text-purple-300 font-bold tracking-wide text-xs uppercase">{data.title}</p>
          )}
        </div>
        
        {data.sectionVisibility.skills && validSkills.length > 0 && (
          <div className="border-t border-purple-800/80 pt-4">
            <h2 className="font-black text-purple-300 uppercase text-[8.5pt] tracking-widest mb-3">
              Expertise
            </h2>
            <div className="flex flex-col gap-3">
              {validSkills.map(sk => (
                <div key={sk.id}>
                  {hasContent(sk.category) && (
                    <div className="text-purple-200 text-xs font-bold mb-1.5">{sk.category}</div>
                  )}
                  {sk.validItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {sk.validItems.map((item, i) => (
                        <span key={i} className="bg-purple-900/80 text-purple-100 px-2.5 py-0.5 rounded-full text-[8pt] font-semibold border border-purple-700">
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
          <div className="border-t border-purple-800/80 pt-4">
            <h2 className="font-black text-purple-300 uppercase text-[8.5pt] tracking-widest mb-3">
              Languages
            </h2>
            <div className="flex flex-col gap-1.5 text-xs text-purple-100">
              {validLanguages.map(lang => (
                <div key={lang.id} className="flex justify-between">
                  <span className="font-bold text-white">{lang.language}</span>
                  {hasContent(lang.level) && <span className="text-purple-300 text-[8pt]">{lang.level}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {data.sectionVisibility.contact && contactList.length > 0 && (
          <div className="border-t border-purple-800/80 pt-4">
            <h2 className="font-black text-purple-300 uppercase text-[8.5pt] tracking-widest mb-3">
              Contact
            </h2>
            <div className="flex flex-col gap-2.5 text-xs text-purple-100 font-medium">
              {contactList.map(item => (
                <div key={item.key} className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">{getContactIcon(item.key)}</span>
                  <div>
                    <span className="text-purple-400 uppercase text-[7.5pt] block font-bold">{item.label}</span>
                    <span className="break-words text-purple-50 text-[8.5pt]">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Left Main Content */}
      <div className="w-[65%] p-6 sm:p-8 space-y-5">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section] || section === 'contact' || section === 'skills' || section === 'languages' || section === 'photo') return null;

          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section} className="bg-purple-50/70 p-4 rounded-xl border border-purple-200/80">
                <p className="text-purple-950 font-medium leading-relaxed text-xs sm:text-sm">{data.summary}</p>
              </section>
            );
          }

          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-purple-950 mb-3 border-b-2 border-purple-300 pb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Education</span>
                  <span className="w-12 h-1 bg-purple-600 rounded-full"></span>
                </h2>
                <div className="space-y-3">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="text-xs bg-purple-50/30 p-2.5 rounded-lg border border-purple-100">
                        <div className="flex justify-between items-baseline">
                          {degreeField && <div className="font-black text-slate-900 text-sm">{degreeField}</div>}
                          {dateStr && <span className="text-purple-700 font-bold text-[8pt]">{dateStr}</span>}
                        </div>
                        {hasContent(edu.institution) && <div className="text-purple-900 font-bold">{edu.institution}</div>}
                        {hasContent(edu.gpa) && <div className="text-slate-500 text-[8pt] mt-0.5">GPA: {edu.gpa}</div>}
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
                <h2 className="text-sm font-black text-purple-950 mb-3 border-b-2 border-purple-300 pb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Projects</span>
                  <span className="w-12 h-1 bg-purple-600 rounded-full"></span>
                </h2>
                <div className="space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="text-xs bg-purple-50/30 p-3 rounded-xl border border-purple-100">
                      <div className="font-black text-slate-900 text-sm">{proj.title || 'Project'}</div>
                      {hasContent(proj.tools) && <div className="text-purple-700 font-bold text-[8pt] mb-0.5">Stack: {proj.tools}</div>}
                      {hasContent(proj.description) && <p className="text-slate-600 font-medium">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-purple-950 mb-3 border-b-2 border-purple-300 pb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Experience</span>
                  <span className="w-12 h-1 bg-purple-600 rounded-full"></span>
                </h2>
                <div className="space-y-3.5">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="text-xs border-l-2 border-purple-400 pl-3">
                        {hasContent(exp.role) && <div className="font-black text-slate-900 text-sm">{exp.role}</div>}
                        <div className="flex items-center gap-2 text-purple-800 font-bold mb-1">
                          {hasContent(exp.company) && <span>{exp.company}</span>}
                          {dateStr && <span className="text-purple-600 font-normal text-[8pt]">• {dateStr}</span>}
                        </div>
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-4 text-slate-600 space-y-1 font-medium">
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

          // Extracurriculars
          if (section === 'extracurriculars') {
            const validExt = getValidExtracurriculars(data.extracurriculars);
            if (validExt.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-purple-950 mb-3 border-b-2 border-purple-300 pb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Extracurriculars</span>
                  <span className="w-12 h-1 bg-purple-600 rounded-full"></span>
                </h2>
                <div className="space-y-3">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="text-xs bg-purple-50/30 p-3 rounded-xl border border-purple-100">
                        <div className="flex justify-between items-baseline">
                          <span className="font-black text-slate-900 text-sm">{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="text-purple-700 font-bold text-[8pt]">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-purple-900 font-bold text-[8pt] mb-1">
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

          // Certifications
          if (section === 'certifications') {
            const validCerts = getValidCertifications(data.certifications);
            if (validCerts.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-sm font-black text-purple-950 mb-3 border-b-2 border-purple-300 pb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Certifications</span>
                  <span className="w-12 h-1 bg-purple-600 rounded-full"></span>
                </h2>
                <div className="space-y-2">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="text-xs bg-purple-50/30 p-2.5 rounded-lg border border-purple-100 flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-purple-950">{cert.name}</span>
                          {hasContent(cert.issuer) && <span className="text-purple-800 text-[8pt] ml-2 font-medium">({cert.issuer})</span>}
                        </div>
                        {dateStr && <span className="text-purple-700 font-bold text-[8pt]">{dateStr}</span>}
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
                <h2 className="text-sm font-black text-purple-950 mb-3 border-b-2 border-purple-300 pb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Achievements</span>
                  <span className="w-12 h-1 bg-purple-600 rounded-full"></span>
                </h2>
                <div className="space-y-2">
                  {validAch.map(ach => (
                    <div key={ach.id} className="text-xs bg-purple-50/30 p-2.5 rounded-lg border border-purple-100">
                      <div className="flex justify-between items-baseline font-bold text-purple-950">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="text-purple-700 font-normal text-[8pt]">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-purple-800 text-[8pt]">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-slate-600 mt-0.5">{ach.description}</p>}
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
                <h2 className="text-sm font-black text-purple-950 mb-3 border-b-2 border-purple-300 pb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>References</span>
                  <span className="w-12 h-1 bg-purple-600 rounded-full"></span>
                </h2>
                {isAvailableOnRequest ? (
                  <p className="text-slate-600 italic text-xs">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {validRef.map(ref => (
                      <div key={ref.id} className="bg-purple-50/30 p-2.5 rounded-lg border border-purple-100">
                        <div className="font-bold text-purple-950">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-slate-700">
                            {[ref.position, ref.company].filter(hasContent).join(' at ')}
                          </div>
                        )}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-purple-700 text-[8pt] mt-1">
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
// 5. Classic College (Forest Green / Hunter Green - Two Columns with Framed Contact Card)
// ==========================================
export const StudentClassic: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);

  return (
    <div className="font-serif text-slate-800 text-[9.5pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto p-8 sm:p-10 box-border" id="cv-template-root">
      {/* Forest Green Header */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-emerald-950 mb-1">{data.fullName || 'Your Name'}</h1>
        {hasContent(data.title) && (
          <p className="text-xs sm:text-sm text-emerald-800 font-semibold italic mb-3 font-sans">{data.title}</p>
        )}
        {contactList.length > 0 && (
          <div className="inline-flex justify-center flex-wrap gap-x-3 gap-y-1 text-xs font-sans text-emerald-900 border border-emerald-300 bg-emerald-50/60 px-4 py-1.5 rounded-xl shadow-2xs">
            {contactList.map((item, idx) => (
              <React.Fragment key={item.key}>
                {idx > 0 && <span className="text-emerald-300 font-bold">•</span>}
                <span className="inline-flex items-center gap-1">
                  <span className="text-emerald-700">{getContactIcon(item.key)}</span>
                  <span>{item.value}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Left main column */}
        <div className="w-full sm:w-[62%] space-y-5">
          {data.sectionOrder.map(section => {
            if (!data.sectionVisibility[section]) return null;

            if (section === 'summary' && hasContent(data.summary)) {
              return (
                <section key={section}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-2 border-b-2 border-emerald-800 pb-0.5 font-sans">
                    Profile Summary
                  </h2>
                  <p className="text-justify leading-relaxed text-slate-700 text-xs sm:text-sm">{data.summary}</p>
                </section>
              );
            }

            if (section === 'experience') {
              const validExp = getValidExperience(data.experience);
              if (validExp.length === 0) return null;

              return (
                <section key={section}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-2 border-b-2 border-emerald-800 pb-0.5 font-sans">
                    Experience
                  </h2>
                  <div className="space-y-3">
                    {validExp.map(exp => {
                      const dateStr = formatDateRange(exp.startDate, exp.endDate);
                      return (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline font-bold text-slate-900">
                            {hasContent(exp.role) && <span>{exp.role}</span>}
                            {dateStr && <span className="text-xs font-sans font-semibold text-emerald-800">{dateStr}</span>}
                          </div>
                          {hasContent(exp.company) && <div className="italic text-emerald-900 mb-1 text-xs font-semibold">{exp.company}</div>}
                          {exp.validBullets.length > 0 && (
                            <ul className="list-disc list-outside ml-4 text-slate-700 space-y-0.5 text-[9pt]">
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

            if (section === 'projects') {
              const validProjects = getValidProjects(data.projects);
              if (validProjects.length === 0) return null;

              return (
                <section key={section}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-2 border-b-2 border-emerald-800 pb-0.5 font-sans">
                    Key Projects
                  </h2>
                  <div className="space-y-3">
                    {validProjects.map(proj => (
                      <div key={proj.id} className="border-l-2 border-emerald-300 pl-2.5">
                        <div className="font-bold text-slate-900">{proj.title || 'Project'}</div>
                        {hasContent(proj.tools) && <div className="text-xs font-sans text-emerald-700 mb-0.5 font-semibold">Tech: {proj.tools}</div>}
                        {hasContent(proj.description) && <p className="text-slate-700 text-[9pt]">{proj.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (section === 'extracurriculars') {
              const validExt = getValidExtracurriculars(data.extracurriculars);
              if (validExt.length === 0) return null;

              return (
                <section key={section}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-2 border-b-2 border-emerald-800 pb-0.5 font-sans">
                    Extracurricular Activities
                  </h2>
                  <div className="space-y-2.5">
                    {validExt.map(ext => {
                      const dateStr = formatDateRange(ext.startDate, ext.endDate);
                      return (
                        <div key={ext.id} className="border-l-2 border-emerald-300 pl-2.5">
                          <div className="flex justify-between items-baseline font-bold text-slate-900">
                            <span>{ext.activityName || ext.role || 'Activity'}</span>
                            {dateStr && <span className="text-xs font-sans text-emerald-800">{dateStr}</span>}
                          </div>
                          {(hasContent(ext.role) || hasContent(ext.organization)) && (
                            <div className="italic text-emerald-900 text-xs">{[ext.role, ext.organization].filter(hasContent).join(' • ')}</div>
                          )}
                          {hasContent(ext.description) && <p className="text-slate-700 text-[9pt] mt-0.5">{ext.description}</p>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            }

            if (section === 'references') {
              const { isAvailableOnRequest, validList: validRef } = getValidReferences(data.references);
              if (!isAvailableOnRequest && validRef.length === 0) return null;

              return (
                <section key={section}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-2 border-b-2 border-emerald-800 pb-0.5 font-sans">
                    References
                  </h2>
                  {isAvailableOnRequest ? (
                    <p className="text-slate-600 italic text-xs font-sans">References available upon request.</p>
                  ) : (
                    <div className="space-y-2 text-xs font-sans">
                      {validRef.map(ref => (
                        <div key={ref.id}>
                          <span className="font-bold text-emerald-950">{ref.name}</span>
                          {(hasContent(ref.position) || hasContent(ref.company)) && (
                            <span className="text-slate-700 ml-1.5">— {[ref.position, ref.company].filter(hasContent).join(', ')}</span>
                          )}
                          {(hasContent(ref.email) || hasContent(ref.phone)) && (
                            <div className="text-emerald-800 text-[8pt]">{[ref.email, ref.phone].filter(hasContent).join(' • ')}</div>
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

        {/* Right sidebar column */}
        <div className="w-full sm:w-[38%] space-y-5">
          {data.sectionOrder.map(section => {
            if (!data.sectionVisibility[section]) return null;

            if (section === 'education') {
              const validEdu = getValidEducation(data.education);
              if (validEdu.length === 0) return null;

              return (
                <section key={section} className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-2 border-b border-emerald-300 pb-0.5 font-sans">
                    Education
                  </h2>
                  <div className="space-y-3">
                    {validEdu.map(edu => {
                      const dateStr = formatDateRange(edu.startDate, edu.endDate);
                      const degreeField = formatDegreeField(edu.degree, edu.field);
                      return (
                        <div key={edu.id}>
                          {hasContent(edu.institution) && <div className="font-bold text-slate-900 text-xs sm:text-sm">{edu.institution}</div>}
                          {degreeField && <div className="italic text-emerald-900 font-semibold text-xs">{degreeField}</div>}
                          <div className="flex gap-1.5 text-[8pt] font-sans text-emerald-800 font-medium mt-0.5">
                            {dateStr && <span>{dateStr}</span>}
                            {hasContent(edu.gpa) && <span>• GPA: {edu.gpa}</span>}
                          </div>
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
                <section key={section} className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-2 border-b border-emerald-300 pb-0.5 font-sans">
                    Skills
                  </h2>
                  <div className="space-y-2.5">
                    {validSkills.map(sk => (
                      <div key={sk.id}>
                        {hasContent(sk.category) && <div className="font-bold text-emerald-950 text-xs mb-0.5 font-sans">{sk.category}</div>}
                        {sk.validItems.length > 0 && <div className="font-sans text-slate-700 text-xs leading-snug">{sk.validItems.join(', ')}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (section === 'certifications') {
              const validCerts = getValidCertifications(data.certifications);
              if (validCerts.length === 0) return null;

              return (
                <section key={section} className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-2 border-b border-emerald-300 pb-0.5 font-sans">
                    Certifications
                  </h2>
                  <div className="space-y-2 text-xs">
                    {validCerts.map(cert => (
                      <div key={cert.id}>
                        <div className="font-bold text-emerald-950">{cert.name}</div>
                        {hasContent(cert.issuer) && <div className="text-emerald-800 text-[8pt]">{cert.issuer}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (section === 'achievements') {
              const validAch = getValidAchievements(data.achievements);
              if (validAch.length === 0) return null;

              return (
                <section key={section} className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-2 border-b border-emerald-300 pb-0.5 font-sans">
                    Achievements
                  </h2>
                  <div className="space-y-2 text-xs">
                    {validAch.map(ach => (
                      <div key={ach.id}>
                        <div className="font-bold text-emerald-950">{ach.title}</div>
                        {hasContent(ach.issuer) && <div className="text-emerald-800 text-[8pt]">{ach.issuer}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (section === 'languages') {
              const validLang = getValidLanguages(data.languages);
              if (validLang.length === 0) return null;

              return (
                <section key={section} className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-2 border-b border-emerald-300 pb-0.5 font-sans">
                    Languages
                  </h2>
                  <div className="space-y-1 text-xs font-sans">
                    {validLang.map(lang => (
                      <div key={lang.id} className="flex justify-between">
                        <span className="font-semibold text-emerald-950">{lang.language}</span>
                        {hasContent(lang.level) && <span className="text-emerald-800 text-[8pt]">{lang.level}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. Campus Edge (Electric Indigo & Cyan Accent - 2-Column with Rounded Section Cards)
// ==========================================
export const StudentCampusEdge: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);
  const validSkills = getValidSkills(data.skills);
  const validLanguages = getValidLanguages(data.languages);

  return (
    <div className="font-sans text-slate-800 text-[9.5pt] bg-slate-50 min-h-[842pt] max-w-[210mm] mx-auto flex box-border shadow-xs" id="cv-template-root">
      {/* Left Energetic Indigo Sidebar */}
      <div className="w-[34%] bg-indigo-950 text-indigo-100 p-6 flex flex-col gap-6 border-r border-indigo-800">
        {data.sectionVisibility.photo && hasContent(data.photo) && (
          <div className="flex justify-center">
            <div className="p-1 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400">
              <img src={data.photo} alt="Profile" className="w-24 h-24 rounded-xl object-cover" />
            </div>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
            {data.fullName || 'Your Name'}
          </h1>
          {hasContent(data.title) && (
            <p className="text-cyan-300 font-bold uppercase tracking-wider text-[8.5pt] mt-1">{data.title}</p>
          )}
        </div>

        {data.sectionVisibility.contact && contactList.length > 0 && (
          <div className="border-t border-indigo-800/80 pt-4">
            <h2 className="font-black text-cyan-300 uppercase text-[8pt] tracking-widest mb-3">
              Contact Info
            </h2>
            <div className="flex flex-col gap-2.5 text-xs text-indigo-100">
              {contactList.map(item => (
                <div key={item.key} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">{getContactIcon(item.key)}</span>
                  <div className="min-w-0">
                    <span className="text-[7.5pt] text-indigo-400 font-bold uppercase block">{item.label}</span>
                    <span className="text-indigo-50 text-[8.5pt] break-words">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.sectionVisibility.skills && validSkills.length > 0 && (
          <div className="border-t border-indigo-800/80 pt-4">
            <h2 className="font-black text-cyan-300 uppercase text-[8pt] tracking-widest mb-3">
              Core Skills
            </h2>
            <div className="flex flex-col gap-3">
              {validSkills.map(sk => (
                <div key={sk.id}>
                  {hasContent(sk.category) && (
                    <div className="text-indigo-200 font-bold text-xs mb-1.5">{sk.category}</div>
                  )}
                  {sk.validItems.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sk.validItems.map((item, i) => (
                        <span key={i} className="bg-indigo-900/90 border border-indigo-700 text-cyan-200 px-2 py-0.5 rounded-lg text-[8pt] font-semibold">
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
          <div className="border-t border-indigo-800/80 pt-4">
            <h2 className="font-black text-cyan-300 uppercase text-[8pt] tracking-widest mb-3">
              Languages
            </h2>
            <div className="flex flex-col gap-1.5 text-xs text-indigo-100">
              {validLanguages.map(lang => (
                <div key={lang.id} className="flex justify-between">
                  <span className="font-bold text-white">{lang.language}</span>
                  {hasContent(lang.level) && <span className="text-cyan-300 text-[8pt]">{lang.level}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Soft Rounded Section Cards */}
      <div className="w-[66%] p-6 sm:p-7 space-y-4">
        {data.sectionOrder.map(section => {
          if (!data.sectionVisibility[section] || section === 'contact' || section === 'skills' || section === 'languages' || section === 'photo') return null;

          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Profile
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">{data.summary}</p>
              </section>
            );
          }

          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Education
                  </span>
                </h2>
                <div className="space-y-3">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="text-xs">
                        <div className="flex justify-between items-baseline">
                          {degreeField && <div className="font-bold text-slate-900 text-sm">{degreeField}</div>}
                          {dateStr && <span className="text-indigo-600 font-semibold text-[8pt]">{dateStr}</span>}
                        </div>
                        {hasContent(edu.institution) && <div className="text-indigo-900 font-semibold">{edu.institution}</div>}
                        {hasContent(edu.gpa) && <div className="text-slate-500 text-[8pt] mt-0.5">GPA: {edu.gpa}</div>}
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
              <section key={section} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Projects
                  </span>
                </h2>
                <div className="space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="text-xs">
                      <div className="font-bold text-slate-900 text-sm flex justify-between items-baseline">
                        <span>{proj.title || 'Project'}</span>
                        {hasContent(proj.link) && <span className="text-indigo-600 text-[8pt] font-normal">{proj.link}</span>}
                      </div>
                      {hasContent(proj.tools) && <div className="text-indigo-600 font-semibold text-[8pt] mb-1">Stack: {proj.tools}</div>}
                      {hasContent(proj.description) && <p className="text-slate-600 leading-snug">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Experience
                  </span>
                </h2>
                <div className="space-y-3.5">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="text-xs">
                        <div className="flex justify-between items-baseline mb-0.5">
                          {hasContent(exp.role) && <span className="font-bold text-slate-900 text-sm">{exp.role}</span>}
                          {dateStr && <span className="text-indigo-600 font-semibold text-[8pt]">{dateStr}</span>}
                        </div>
                        {hasContent(exp.company) && <div className="text-slate-600 font-medium mb-1.5">{exp.company}</div>}
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-4 text-slate-600 space-y-1">
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

          // Extracurriculars
          if (section === 'extracurriculars') {
            const validExt = getValidExtracurriculars(data.extracurriculars);
            if (validExt.length === 0) return null;

            return (
              <section key={section} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Extracurriculars
                  </span>
                </h2>
                <div className="space-y-3">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="text-xs">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="text-indigo-600 font-semibold text-[8pt]">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-indigo-800 text-[8pt] font-semibold mb-0.5">
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

          // Certifications
          if (section === 'certifications') {
            const validCerts = getValidCertifications(data.certifications);
            if (validCerts.length === 0) return null;

            return (
              <section key={section} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Certifications
                  </span>
                </h2>
                <div className="space-y-2 text-xs">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-slate-900">{cert.name}</span>
                          {hasContent(cert.issuer) && <span className="text-indigo-600 text-[8pt] ml-2">({cert.issuer})</span>}
                        </div>
                        {dateStr && <span className="text-indigo-600 font-semibold text-[8pt]">{dateStr}</span>}
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
              <section key={section} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Achievements
                  </span>
                </h2>
                <div className="space-y-2 text-xs">
                  {validAch.map(ach => (
                    <div key={ach.id}>
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="text-indigo-600 text-[8pt]">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-indigo-700 text-[8pt]">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-slate-600 mt-0.5">{ach.description}</p>}
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
              <section key={section} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span> References
                  </span>
                </h2>
                {isAvailableOnRequest ? (
                  <p className="text-slate-600 italic text-xs">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {validRef.map(ref => (
                      <div key={ref.id}>
                        <div className="font-bold text-slate-900">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-slate-600">
                            {[ref.position, ref.company].filter(hasContent).join(' at ')}
                          </div>
                        )}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-indigo-600 text-[8pt] mt-0.5">
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
// 7. Scholar Classic (Warm Bronze / Amber - Single Column with Left Accent Bars)
// ==========================================
export const StudentScholarClassic: React.FC<TemplateProps> = ({ data }) => {
  const contactList = getValidContactList(data.contact);

  return (
    <div className="font-serif text-stone-900 text-[10pt] bg-white min-h-[842pt] max-w-[210mm] mx-auto p-8 sm:p-10 box-border" id="cv-template-root">
      {/* Bordered Header Block with Warm Amber Underline */}
      <header className="border-2 border-amber-900/40 bg-amber-50/40 p-5 rounded-lg text-center mb-6">
        <h1 className="text-3xl font-extrabold uppercase tracking-wide text-amber-950 mb-1">
          {data.fullName || 'Your Name'}
        </h1>
        {hasContent(data.title) && (
          <p className="text-xs sm:text-sm font-sans font-semibold text-amber-900 tracking-wider uppercase mb-2">
            {data.title}
          </p>
        )}
        <div className="w-20 h-0.5 bg-amber-700 mx-auto my-2"></div>
        {contactList.length > 0 && (
          <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-xs font-sans text-stone-700">
            {contactList.map((item, idx) => (
              <React.Fragment key={item.key}>
                {idx > 0 && <span className="text-amber-500 font-bold">•</span>}
                <span className="inline-flex items-center gap-1">
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

          if (section === 'summary' && hasContent(data.summary)) {
            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-950 border-b border-amber-300 pb-1 mb-2 font-sans">
                  Candidate Statement
                </h2>
                <p className="text-justify leading-relaxed text-[9.5pt] text-stone-800">{data.summary}</p>
              </section>
            );
          }

          if (section === 'education') {
            const validEdu = getValidEducation(data.education);
            if (validEdu.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-950 border-b border-amber-300 pb-1 mb-3 font-sans">
                  Education & Honors
                </h2>
                <div className="space-y-3">
                  {validEdu.map(edu => {
                    const dateStr = formatDateRange(edu.startDate, edu.endDate);
                    const degreeField = formatDegreeField(edu.degree, edu.field);
                    return (
                      <div key={edu.id} className="border-l-3 border-amber-700 pl-3.5 py-0.5 text-[9.5pt]">
                        <div className="flex justify-between items-baseline font-bold text-stone-900">
                          {hasContent(edu.institution) && <span>{edu.institution}</span>}
                          {dateStr && <span className="font-sans font-semibold text-xs text-amber-900">{dateStr}</span>}
                        </div>
                        {degreeField && <div className="italic text-amber-900 font-medium">{degreeField}</div>}
                        {hasContent(edu.gpa) && <div className="text-xs font-sans text-stone-600 mt-0.5">GPA: <span className="font-semibold">{edu.gpa}</span></div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section === 'experience') {
            const validExp = getValidExperience(data.experience);
            if (validExp.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-950 border-b border-amber-300 pb-1 mb-3 font-sans">
                  Experience
                </h2>
                <div className="space-y-3.5">
                  {validExp.map(exp => {
                    const dateStr = formatDateRange(exp.startDate, exp.endDate);
                    return (
                      <div key={exp.id} className="border-l-3 border-amber-700 pl-3.5 py-0.5 text-[9.5pt]">
                        <div className="flex justify-between items-baseline font-bold text-stone-900">
                          {hasContent(exp.role) ? <span>{exp.role}</span> : (hasContent(exp.company) ? <span>{exp.company}</span> : null)}
                          {dateStr && <span className="font-sans font-semibold text-xs text-amber-900">{dateStr}</span>}
                        </div>
                        {hasContent(exp.company) && hasContent(exp.role) && (
                          <div className="text-xs font-sans italic text-stone-700 mb-1">{exp.company}</div>
                        )}
                        {exp.validBullets.length > 0 && (
                          <ul className="list-disc list-outside ml-4 text-stone-800 space-y-0.5 text-[9pt]">
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

          if (section === 'projects') {
            const validProjects = getValidProjects(data.projects);
            if (validProjects.length === 0) return null;

            return (
              <section key={section}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-950 border-b border-amber-300 pb-1 mb-3 font-sans">
                  Projects & Research
                </h2>
                <div className="space-y-3">
                  {validProjects.map(proj => (
                    <div key={proj.id} className="border-l-3 border-amber-700 pl-3.5 py-0.5 text-[9.5pt]">
                      <div className="font-bold flex justify-between items-baseline text-stone-900">
                        <span>{proj.title || 'Project'}</span>
                        {hasContent(proj.link) && <span className="font-sans text-xs text-amber-800">{proj.link}</span>}
                      </div>
                      {hasContent(proj.tools) && <div className="text-xs font-sans text-amber-900 font-semibold mb-0.5">Stack: {proj.tools}</div>}
                      {hasContent(proj.description) && <p className="text-stone-700 text-[9pt] leading-snug">{proj.description}</p>}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-950 border-b border-amber-300 pb-1 mb-2.5 font-sans">
                  Areas of Expertise
                </h2>
                <div className="space-y-1.5 text-[9.5pt]">
                  {validSkills.map(sk => (
                    <div key={sk.id} className="flex gap-2 items-baseline">
                      {hasContent(sk.category) && <span className="font-bold text-amber-950 text-xs font-sans">{sk.category}:</span>}
                      {sk.validItems.length > 0 && <span className="font-sans text-xs text-stone-700">{sk.validItems.join(', ')}</span>}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-950 border-b border-amber-300 pb-1 mb-3 font-sans">
                  Extracurricular & Leadership
                </h2>
                <div className="space-y-3">
                  {validExt.map(ext => {
                    const dateStr = formatDateRange(ext.startDate, ext.endDate);
                    return (
                      <div key={ext.id} className="border-l-3 border-amber-700 pl-3.5 py-0.5 text-[9.5pt]">
                        <div className="flex justify-between items-baseline font-bold text-stone-900">
                          <span>{ext.activityName || ext.role || 'Activity'}</span>
                          {dateStr && <span className="font-sans font-semibold text-xs text-amber-900">{dateStr}</span>}
                        </div>
                        {(hasContent(ext.role) || hasContent(ext.organization)) && (
                          <div className="text-xs font-sans italic text-amber-900 mb-0.5">
                            {[ext.role, ext.organization].filter(hasContent).join(' • ')}
                          </div>
                        )}
                        {hasContent(ext.description) && <p className="text-stone-700 text-[9pt] leading-snug">{ext.description}</p>}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-950 border-b border-amber-300 pb-1 mb-2.5 font-sans">
                  Certifications
                </h2>
                <div className="space-y-2">
                  {validCerts.map(cert => {
                    const dateStr = formatDateRange(cert.date, cert.expiryDate);
                    return (
                      <div key={cert.id} className="border-l-3 border-amber-700 pl-3.5 py-0.5 text-[9.5pt] flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-stone-900">{cert.name}</span>
                          {hasContent(cert.issuer) && <span className="text-xs italic text-amber-900 ml-2">— {cert.issuer}</span>}
                        </div>
                        {dateStr && <span className="font-sans font-semibold text-xs text-amber-900">{dateStr}</span>}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-950 border-b border-amber-300 pb-1 mb-2.5 font-sans">
                  Honors & Achievements
                </h2>
                <div className="space-y-2">
                  {validAch.map(ach => (
                    <div key={ach.id} className="border-l-3 border-amber-700 pl-3.5 py-0.5 text-[9.5pt]">
                      <div className="flex justify-between items-baseline font-bold text-stone-900">
                        <span>{ach.title}</span>
                        {hasContent(ach.date) && <span className="font-sans text-xs text-amber-900">{ach.date}</span>}
                      </div>
                      {hasContent(ach.issuer) && <div className="text-xs italic text-amber-900">{ach.issuer}</div>}
                      {hasContent(ach.description) && <p className="text-stone-700 text-[9pt] mt-0.5">{ach.description}</p>}
                    </div>
                  ))}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-950 border-b border-amber-300 pb-1 mb-2 font-sans">
                  Languages
                </h2>
                <div className="flex flex-wrap gap-4 text-xs font-sans text-stone-800">
                  {validLang.map(lang => (
                    <span key={lang.id}>
                      <strong className="text-amber-950">{lang.language}</strong>
                      {hasContent(lang.level) && <span className="text-stone-600"> ({lang.level})</span>}
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-950 border-b border-amber-300 pb-1 mb-2 font-sans">
                  References
                </h2>
                {isAvailableOnRequest ? (
                  <p className="text-stone-600 italic text-xs font-sans">References available upon request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    {validRef.map(ref => (
                      <div key={ref.id} className="border-l-3 border-amber-700 pl-3.5 py-0.5">
                        <div className="font-bold text-amber-950">{ref.name}</div>
                        {(hasContent(ref.position) || hasContent(ref.company)) && (
                          <div className="text-stone-700">
                            {[ref.position, ref.company].filter(hasContent).join(', ')}
                          </div>
                        )}
                        {(hasContent(ref.email) || hasContent(ref.phone)) && (
                          <div className="text-amber-900 text-[8pt]">
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
