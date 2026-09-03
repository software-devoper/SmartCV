import React, { useState, useEffect } from 'react';
import { useCVStore } from '../store';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, CheckCircle2, ChevronRight, Sparkles, ArrowRight, WifiOff, FileText } from 'lucide-react';
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
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { OfflinePresetModal } from './common/OfflinePresetModal';

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
  const isOnline = useOnlineStatus();
  const [activeSectionId, setActiveSectionId] = useState<string>(data.sectionOrder[0] || 'personal');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  // Listen for click-to-edit events from preview canvas
  useEffect(() => {
    const handleEditSection = (e: any) => {
      const sectionId = e.detail?.sectionId;
      if (sectionId) {
        setActiveSectionId(sectionId);
        setTimeout(() => {
          const el = document.getElementById(`editor-section-${sectionId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    };

    window.addEventListener('smartcv-edit-section', handleEditSection);
    return () => window.removeEventListener('smartcv-edit-section', handleEditSection);
  }, []);

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
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 relative">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 custom-scrollbar">
        {/* Offline Mode Active Banner */}
        {!isOnline && (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-3.5 sm:p-4 text-xs text-amber-900 dark:text-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-200/70 dark:bg-amber-900/70 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <WifiOff className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-100 text-xs sm:text-sm">
                  Offline Editor Active
                </p>
                <p className="text-[11px] sm:text-xs text-amber-800/90 dark:text-amber-300 mt-0.5">
                  Your CV data is persistently saved to local browser storage. AI writing is paused until internet is restored.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPresetModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Career Presets</span>
            </button>
          </div>
        )}

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
                          id={`editor-section-${sectionId}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white dark:bg-slate-850 rounded-2xl border transition-all duration-200 ${
                            isActive 
                              ? 'border-blue-400 dark:border-blue-500 shadow-md ring-2 ring-blue-500/10' 
                              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-sm'
                          } ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500 z-50 scale-[1.01]' : ''}`}
                        >
                          {/* Header / Accordion Toggle */}
                          <div 
                            className={`p-3.5 sm:p-4 flex items-center justify-between cursor-pointer rounded-2xl transition-colors ${
                              isActive ? 'bg-blue-50/40 dark:bg-blue-950/30' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                            }`}
                            onClick={() => setActiveSectionId(isActive ? '' : sectionId)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div 
                                {...provided.dragHandleProps} 
                                className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg shrink-0 transition-colors"
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
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  </motion.div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                                )}
                                <span className={`font-semibold text-sm sm:text-base tracking-tight truncate ${
                                  !isVisible ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'
                                }`}>
                                  {title}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <button 
                                type="button"
                                onClick={(e) => toggleVisibility(sectionId, e)} 
                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                  !isVisible 
                                    ? 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700' 
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title={isVisible ? "Hide section in preview" : "Show section in preview"}
                              >
                                {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <div className="p-1 text-slate-400 dark:text-slate-500">
                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'rotate-90 text-blue-600 dark:text-blue-400' : ''}`} />
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
                                <div className="p-4 sm:p-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 rounded-b-2xl">
                                  {/* AI Assistant Guidance */}
                                  <div className="flex gap-3 mb-5 mt-2 items-start">
                                    <div className="w-8 h-8 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-2xs">
                                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 dark:text-slate-200 shadow-2xs border border-slate-200/80 dark:border-slate-700 max-w-xl">
                                      <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
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
                                      className="bg-white dark:bg-slate-850 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-sm w-full focus-within:border-blue-300 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all"
                                    >
                                      {renderActiveForm(sectionId)}
                                      
                                      <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextIndex = (index + 1) % data.sectionOrder.length;
                                            setActiveSectionId(data.sectionOrder[nextIndex]);
                                          }}
                                          className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 tracking-wider uppercase py-2 px-1 transition-colors cursor-pointer"
                                        >
                                          Skip Section
                                        </button>
                                        <button 
                                          type="submit"
                                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
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

      {/* Offline Career Presets Modal */}
      <OfflinePresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
      />
    </div>
  );
}
