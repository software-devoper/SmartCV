import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import { useCVStore } from '../store';
import { exportToPDF } from '../utils/pdfExport';
import { useAuth } from '../contexts/AuthContext';
import { saveOfflineDraft, getActiveResumeId } from '../lib/offlineDraftService';
import SyncStatusIndicator from './common/SyncStatusIndicator';
import {
  Download,
  GraduationCap,
  Briefcase,
  PenLine,
  Eye,
  Sparkles,
  WifiOff,
  FileText,
  FileJson,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import TemplateGalleryModal from './TemplateGalleryModal';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { PWAInstallButton } from './common/PWAInstallButton';
import { OfflinePresetModal } from './common/OfflinePresetModal';

export default function Builder({ onSwitchToAIChat }: { onSwitchToAIChat?: () => void }) {
  const { user } = useAuth();
  const data = useCVStore((state) => state.data);
  const isOnline = useOnlineStatus();
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  // Auto-persist active CV draft locally with timestamps
  useEffect(() => {
    const timer = setTimeout(() => {
      saveOfflineDraft({
        id: getActiveResumeId(),
        userId: user?.uid || 'guest',
        title: data.fullName ? `${data.fullName}'s Resume` : 'My Resume',
        resumeData: data,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [data, user]);

  // Listen for click-to-edit section events from the Preview Canvas
  useEffect(() => {
    const handleEditSection = () => {
      // If mobile view is on preview, switch automatically to edit view
      if (mobileTab === 'preview') {
        setMobileTab('edit');
      }
    };
    window.addEventListener('smartcv-edit-section', handleEditSection);
    return () => window.removeEventListener('smartcv-edit-section', handleEditSection);
  }, [mobileTab]);

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

  // 100% Offline JSON Backup
  const handleExportJson = () => {
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      const filename = data.fullName?.trim()
        ? `${data.fullName.trim().replace(/\s+/g, '_')}_Backup.json`
        : 'SmartCV_Backup.json';
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('JSON export error:', err);
    }
  };

  const handleSwitchAIChat = () => {
    if (!isOnline) {
      setOfflineNotice('AI Chat is offline. AI features require an internet connection. Continue creating your CV in this offline editor.');
      setTimeout(() => setOfflineNotice(null), 5000);
      return;
    }
    if (onSwitchToAIChat) {
      onSwitchToAIChat();
    }
  };

  const isStudent = data.userType === 'student';

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-900 border-b border-slate-800 shadow-xs z-30 shrink-0">
        {/* Left: Brand Logo, Mode Pill & Preset Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 group touch-target" title="Return to Dashboard">
            <img
              src="/android-chrome-192x192.png"
              alt="SmartCV"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-xs shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white leading-none">SmartCV</span>
            </div>
          </Link>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="inline-flex sm:hidden text-lg font-extrabold tracking-tight text-white leading-none"
              >
                SmartCV
              </Link>
              
              {/* Desktop Mode Pill */}
              <button 
                onClick={() => setIsTemplateModalOpen(true)}
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all shadow-2xs border cursor-pointer ${
                  isStudent 
                    ? 'bg-purple-950/70 text-purple-300 border-purple-800/80 hover:bg-purple-900/80' 
                    : 'bg-blue-950/70 text-blue-300 border-blue-800/80 hover:bg-blue-900/80'
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

              {/* Active Career Preset Badge (Updates immediately when shifting presets) */}
              {data.activePresetName && (
                <button
                  type="button"
                  onClick={() => setIsPresetModalOpen(true)}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 shadow-2xs hover:bg-emerald-900/80 transition cursor-pointer"
                  title="Active Career Preset: Click to change or shift role"
                >
                  <FileText className="w-3 h-3 text-emerald-400" />
                  <span>Preset: {data.activePresetName}</span>
                </button>
              )}

              {/* Offline Badge */}
              {!isOnline && (
                <div
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700 shadow-2xs animate-pulse"
                  title="Offline Mode: Local edits and PDF export are enabled. AI is paused."
                >
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </div>
              )}
            </div>

            {/* Mobile Mode subtle text (under wordmark) */}
            <button 
              onClick={() => setIsTemplateModalOpen(true)}
              className={`sm:hidden flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-1 ${
                isStudent ? 'text-purple-400' : 'text-blue-400'
              }`}
            >
              {isStudent ? (
                <><GraduationCap className="w-3 h-3" /><span>Student</span></>
              ) : (
                <><Briefcase className="w-3 h-3" /><span>Pro</span></>
              )}
              {data.activePresetName && (
                <span className="text-emerald-400 font-semibold truncate max-w-[100px]">
                  • {data.activePresetName}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-3.5">
          
          {/* Real-time Cloud Sync & Offline Status Indicator */}
          <SyncStatusIndicator compact className="hidden sm:flex" />

          {/* Progress Pill (Desktop) */}
          <div className="hidden xl:flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-extrabold text-blue-400">{completedCount} of {totalCount} completed</span>
            </div>
            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Career Presets (Offline-friendly starter profiles) */}
          <button
            type="button"
            onClick={() => setIsPresetModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-2xs cursor-pointer"
            title="Populate resume with sample role presets (Works completely offline)"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Career Presets</span>
          </button>

          {/* JSON Backup Tool (100% offline) */}
          <button
            type="button"
            onClick={handleExportJson}
            className="hidden md:flex p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 transition cursor-pointer"
            title="Backup CV as JSON file (Offline)"
          >
            <FileJson className="w-4 h-4" />
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton compact className="hidden md:flex" />

          {/* AI Chat Mode Button */}
          {onSwitchToAIChat && (
            <button
              type="button"
              onClick={handleSwitchAIChat}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                !isOnline
                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : 'bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border-purple-800/80'
              }`}
              title={!isOnline ? 'AI Chat requires internet. Edit offline in this editor.' : 'Open AI Resume Chat'}
            >
              <Sparkles className={`w-3.5 h-3.5 ${!isOnline ? 'text-slate-400' : 'text-purple-400'}`} />
              <span className="hidden sm:inline">AI Chat Builder</span>
              {!isOnline && <span className="text-[10px] uppercase font-bold text-amber-500">(Offline)</span>}
            </button>
          )}

          {/* Segmented Control (Icons only on very small screens, text on tablet) */}
          <div className="flex lg:hidden bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setMobileTab('edit')}
              className={`flex items-center justify-center gap-1.5 h-9 sm:h-10 min-w-[38px] sm:min-w-[44px] sm:px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mobileTab === 'edit' 
                  ? 'bg-slate-700 text-blue-400 shadow-2xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Edit"
            >
              <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`flex items-center justify-center gap-1.5 h-9 sm:h-10 min-w-[38px] sm:min-w-[44px] sm:px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mobileTab === 'preview' 
                  ? 'bg-slate-700 text-blue-400 shadow-2xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Preview"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Download CV Button */}
          <button 
            type="button"
            onClick={handleExport}
            disabled={isExporting} 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            title="Download CV as PDF"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isExporting ? 'Generating...' : 'Download CV'}</span>
          </button>
        </div>
      </header>

      {/* Offline Toast / Notice */}
      {offlineNotice && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs z-30 transition-all">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{offlineNotice}</span>
          </div>
          <button onClick={() => setOfflineNotice(null)} className="underline text-[11px] ml-4 hover:opacity-80 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Chat & Forms */}
        <section className={`w-full lg:w-[48%] xl:w-[45%] flex flex-col bg-slate-900 border-r border-slate-800 shadow-xs z-10 relative ${
          mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
        }`}>
          <ChatPanel />
        </section>

        {/* Right Side: Live A4 Preview */}
        <section className={`w-full lg:w-[52%] xl:w-[55%] flex flex-col bg-slate-950 relative overflow-hidden ${
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

      {/* Offline Career Presets Modal */}
      <OfflinePresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
      />
    </div>
  );
}
