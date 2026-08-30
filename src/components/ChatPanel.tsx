import React, { useState } from 'react';
import { useCVStore } from '../store';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, CheckCircle2, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PersonalForm from './forms/PersonalForm';
import SummaryForm from './forms/SummaryForm';
import EducationForm from './forms/EducationForm';
import ExperienceForm from './forms/ExperienceForm';
import ProjectsForm from './forms/ProjectsForm';
import SkillsForm from './forms/SkillsForm';
import ExtracurricularsForm from './forms/ExtracurricularsForm';
import CertificationsForm from './forms/CertificationsForm';
import AchievementsForm from './forms/AchievementsForm';
import LanguagesForm from './forms/LanguagesForm';
import ReferencesForm from './forms/ReferencesForm';
import PhotoForm from './forms/PhotoForm';

const sectionTitles: Record<string, string> = {
  photo: "Profile Photo",
  personal: "Personal Details",
  summary: "Professional Summary",
  contact: "Contact Information",
  education: "Education",
  experience: "Work Experience",
  projects: "Projects",
  skills: "Skills & Expertise",
  certifications: "Certifications",
  achievements: "Achievements",
  languages: "Languages",
  extracurriculars: "Extracurriculars",
  references: "References"
};

const sectionPrompts: Record<string, string> = {
  photo: "Let's put a face to the name. Upload a crisp, professional headshot.",
  personal: "What is your full name and current or aspirational professional title?",
  summary: "Write a high-impact overview highlighting your career objectives and strengths.",
  contact: "How should hiring managers and recruiters reach you?",
  education: "Where did you study? Add your degrees, field of study, and honors.",
  experience: "Where have you worked? Highlight quantifiable achievements and roles.",
  projects: "Showcase key projects, open-source repositories, or technical initiatives.",
  skills: "What core competencies, tools, and methodologies do you specialize in?",
  certifications: "List any relevant industry credentials or certificates.",
  achievements: "Highlight any competitive awards, honors, or milestones.",
  languages: "What languages are you proficient in?",
  extracurriculars: "Any leadership, volunteering, or community initiatives?",
  references: "Provide reference contacts or state availability upon request."
};

export default function ChatPanel() {
  const { data, updateNested, updateData } = useCVStore();
  const [activeSectionId, setActiveSectionId] = useState<string>(data.sectionOrder[0] || 'personal');

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newOrder = Array.from(data.sectionOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);
    updateData({ sectionOrder: newOrder });
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateNested('sectionVisibility', { ...data.sectionVisibility, [id]: !data.sectionVisibility[id] });
  };

  const renderActiveForm = (id: string) => {
    switch (id) {
      case 'photo': return <PhotoForm />;
      case 'personal': return <PersonalForm />;
      case 'summary': return <SummaryForm />;
      case 'contact': return <PersonalForm isContact />;
      case 'education': return <EducationForm />;
      case 'experience': return <ExperienceForm />;
      case 'projects': return <ProjectsForm />;
      case 'skills': return <SkillsForm />;
      case 'extracurriculars': return <ExtracurricularsForm />;
      case 'certifications': return <CertificationsForm />;
      case 'achievements': return <AchievementsForm />;
      case 'languages': return <LanguagesForm />;
      case 'references': return <ReferencesForm />;
      default: return <PersonalForm />;
    }
  };

  const isSectionComplete = (id: string) => {
    if (id === 'photo') return !!data.photo?.trim();
    if (id === 'personal') return !!data.fullName?.trim();
    if (id === 'summary') return !!data.summary?.trim();
    if (id === 'contact') return !!data.contact?.email?.trim() || !!data.contact?.phone?.trim();
    if (id === 'education') return (data.education || []).some(e => e.institution?.trim() || e.degree?.trim());
    if (id === 'experience') return (data.experience || []).some(e => e.company?.trim() || e.role?.trim());
    if (id === 'projects') return (data.projects || []).some(p => p.title?.trim());
    if (id === 'skills') return (data.skills || []).some(s => (s.items && s.items.length > 0) || s.category?.trim());
    if (id === 'extracurriculars') return (data.extracurriculars || []).some(e => e.activityName?.trim() || e.organization?.trim() || e.role?.trim());
    if (id === 'certifications') return (data.certifications || []).some(c => c.name?.trim() || c.issuer?.trim());
    if (id === 'achievements') return (data.achievements || []).some(a => a.title?.trim());
    if (id === 'languages') return (data.languages || []).some(l => l.language?.trim());
    if (id === 'references') return Array.isArray(data.references) ? data.references.some(r => r.name?.trim()) : data.references === 'available_on_request';
    return false;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 relative">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 custom-scrollbar">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3.5 pb-24">
                {data.sectionOrder.map((sectionId, index) => {
                  const isActive = activeSectionId === sectionId;
                  const isCompleted = isSectionComplete(sectionId);
                  const isVisible = data.sectionVisibility[sectionId] !== false;
                  const title = sectionTitles[sectionId] || sectionId;

                  return (
                    // @ts-ignore
                    <Draggable key={sectionId} draggableId={sectionId} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white rounded-2xl border transition-all duration-200 ${
                            isActive 
                              ? 'border-blue-300/80 shadow-md ring-2 ring-blue-500/10' 
                              : 'border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-sm'
                          } ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500 z-50 scale-[1.01]' : ''}`}
                        >
                          {/* Header / Accordion Toggle */}
                          <div 
                            className={`p-3.5 sm:p-4 flex items-center justify-between cursor-pointer rounded-2xl transition-colors ${
                              isActive ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                            }`}
                            onClick={() => setActiveSectionId(isActive ? '' : sectionId)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div 
                                {...provided.dragHandleProps} 
                                className="text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0 transition-colors"
                                title="Drag to reorder section"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div className="flex items-center gap-2.5 min-w-0">
                                {isCompleted ? (
                                  <motion.div
                                    initial={{ scale: 0.6 }}
                                    animate={{ scale: 1 }}
                                    className="shrink-0"
                                  >
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                  </motion.div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                                )}
                                <span className={`font-semibold text-sm sm:text-base tracking-tight truncate ${
                                  !isVisible ? 'text-slate-400 line-through' : 'text-slate-800'
                                }`}>
                                  {title}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <button 
                                type="button"
                                onClick={(e) => toggleVisibility(sectionId, e)} 
                                className={`p-2 rounded-xl transition-all ${
                                  !isVisible 
                                    ? 'text-slate-400 bg-slate-100 hover:bg-slate-200' 
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                                title={isVisible ? "Hide section in preview" : "Show section in preview"}
                              >
                                {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <div className="p-1 text-slate-400">
                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'rotate-90 text-blue-600' : ''}`} />
                              </div>
                            </div>
                          </div>

                          {/* Expanded Content (Chat Style) */}
                          <AnimatePresence initial={false}>
                            {isActive && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 sm:p-6 pt-2 border-t border-slate-100 bg-slate-50/40 rounded-b-2xl">
                                  {/* AI Assistant Chat Guidance */}
                                  <div className="flex gap-3 mb-5 mt-2 items-start">
                                    <div className="w-8 h-8 rounded-full bg-blue-100/80 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
                                      <Sparkles className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 shadow-2xs border border-slate-200/80 max-w-xl">
                                      <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                                        {sectionPrompts[sectionId] || "Please provide the details for this section."}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* User Form Container */}
                                  <div className="flex justify-end w-full">
                                    <form 
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        const nextIndex = (index + 1) % data.sectionOrder.length;
                                        setActiveSectionId(data.sectionOrder[nextIndex]);
                                      }}
                                      className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm w-full focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all"
                                    >
                                      {renderActiveForm(sectionId)}
                                      
                                      <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextIndex = (index + 1) % data.sectionOrder.length;
                                            setActiveSectionId(data.sectionOrder[nextIndex]);
                                          }}
                                          className="text-xs font-semibold text-slate-400 hover:text-slate-600 tracking-wider uppercase py-2 px-1 transition-colors"
                                        >
                                          Skip Section
                                        </button>
                                        <button 
                                          type="submit"
                                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                                        >
                                          Save & Next <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
