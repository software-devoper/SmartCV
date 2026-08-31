import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import { useCVStore } from '../store';
import { exportToPDF } from '../utils/pdfExport';
import { Download, GraduationCap, Briefcase, LayoutTemplate, PenLine, Eye, Sparkles, Bot, ArrowLeft } from 'lucide-react';
import TemplateGalleryModal from './TemplateGalleryModal';

export default function Builder({ onSwitchToAIChat }: { onSwitchToAIChat?: () => void }) {
  const data = useCVStore(state => state.data);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const completedCount = data.sectionOrder.filter(isSectionComplete).length;
  const totalCount = data.sectionOrder.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = data.fullName?.trim() 
        ? `${data.fullName.trim().replace(/\s+/g, '_')}_Resume.pdf` 
        : 'SmartCV_Resume.pdf';
      await exportToPDF('cv-renderer-root', filename);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const isStudent = data.userType === 'student';

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      {/* Top Navbar */}
                  <header className="flex items-center justify-between px-3 sm:px-6 py-3 bg-white border-b border-slate-200/80 shadow-xs z-30 shrink-0">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 group" title="Return to Dashboard">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs shadow-blue-500/20 text-white font-bold text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
              <span>S</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">SmartCV</span>
            </div>
          </Link>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="inline-flex sm:hidden text-lg font-extrabold tracking-tight text-slate-900 leading-none"
              >
                SmartCV
              </Link>
              
              {/* Desktop Mode Pill */}
              <button 
                onClick={() => setIsTemplateModalOpen(true)}
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all shadow-2xs border ${
                  isStudent 
                    ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
                title="Click to switch template mode"
              >
                {isStudent ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student Mode</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Pro Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Mode subtle text (under wordmark) */}
            <button 
              onClick={() => setIsTemplateModalOpen(true)}
              className={`sm:hidden flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-1 ${
                isStudent ? 'text-purple-600' : 'text-blue-600'
              }`}
            >
              {isStudent ? (
                <><GraduationCap className="w-3 h-3" /><span>Student</span></>
              ) : (
                <><Briefcase className="w-3 h-3" /><span>Pro</span></>
              )}
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-6">
          
          {/* Progress Pill (Desktop) */}
          <div className="hidden lg:flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-extrabold text-blue-600">{completedCount} of {totalCount} completed</span>
            </div>
            <div className="w-36 sm:w-44 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* AI Chat Mode Button */}
          {onSwitchToAIChat && (
            <button
              type="button"
              onClick={onSwitchToAIChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Open AI Resume Chat"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">AI Chat Builder</span>
            </button>
          )}

          {/* Segmented Control (Icons only on very small screens, text on tablet) */}
          <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMobileTab('edit')}
              className={`flex items-center justify-center gap-1.5 h-10 min-w-[44px] sm:px-4 rounded-lg text-sm font-bold transition-all ${
                mobileTab === 'edit' 
                  ? 'bg-white text-blue-600 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Edit"
            >
              <PenLine className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`flex items-center justify-center gap-1.5 h-10 min-w-[44px] sm:px-4 rounded-lg text-sm font-bold transition-all ${
                mobileTab === 'preview' 
                  ? 'bg-white text-blue-600 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Preview"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Export Button */}
          <button 
            type="button"
            onClick={handleExport}
            disabled={isExporting} 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            title="Export PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Chat & Forms */}
        <section className={`w-full lg:w-[48%] xl:w-[45%] flex flex-col bg-white border-r border-slate-200/80 shadow-xs z-10 relative ${
          mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
        }`}>
          <ChatPanel />
        </section>

        {/* Right Side: Live A4 Preview */}
        <section className={`w-full lg:w-[52%] xl:w-[55%] flex flex-col bg-slate-200/80 relative overflow-hidden ${
          mobileTab === 'edit' ? 'hidden lg:flex' : 'flex'
        }`}>
          <PreviewPanel />
        </section>
      </main>

      {/* Template Switcher Modal */}
      <TemplateGalleryModal 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)} 
      />
    </div>
  );
}
