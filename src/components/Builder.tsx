import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  LayoutTemplate,
  PenLine,
  Eye,
  Sparkles,
  Bot,
  ArrowLeft,
  WifiOff,
  FileText,
  FileJson,
  UploadCloud,
  AlertCircle,
} from 'lucide-react';
import TemplateGalleryModal from './TemplateGalleryModal';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { PWAInstallButton } from './common/PWAInstallButton';
import { OfflinePresetModal } from './common/OfflinePresetModal';

export default function Builder({ onSwitchToAIChat }: { onSwitchToAIChat?: () => void }) {
  const { user } = useAuth();
  const data = useCVStore(state => state.data);
  const updateData = useCVStore(state => state.updateData);
  const isOnline = useOnlineStatus();
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

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

  // 100% Offline JSON Restore
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.fullName !== undefined || parsed.sectionOrder || parsed.skills)) {
          updateData(parsed);
          setOfflineNotice('Resume backup restored successfully!');
          setTimeout(() => setOfflineNotice(null), 4000);
        } else {
          alert('Invalid SmartCV backup file.');
        }
      } catch (err) {
        alert('Could not read JSON file. Please ensure it is a valid SmartCV backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-white border-b border-slate-200/80 shadow-xs z-30 shrink-0">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 group" title="Return to Dashboard">
            <img
              src="/android-chrome-192x192.png"
              alt="SmartCV"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-xs shrink-0 group-hover:scale-105 transition-transform"
            />
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

              {/* Offline Badge */}
              {!isOnline && (
                <div
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs animate-pulse"
                  title="Offline Mode: Local edits and PDF export are enabled. AI is paused."
                >
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </div>
              )}
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
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          
          {/* Real-time Cloud Sync & Offline Status Indicator */}
          <SyncStatusIndicator compact className="hidden sm:flex" />

          {/* Progress Pill (Desktop) */}
          <div className="hidden xl:flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-extrabold text-blue-600">{completedCount} of {totalCount} completed</span>
            </div>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Career Presets (Offline-friendly starter profiles) */}
          <button
            type="button"
            onClick={() => setIsPresetModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all border border-slate-200/90 shadow-2xs cursor-pointer"
            title="Populate resume with sample role presets (Works completely offline)"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Career Presets</span>
          </button>

          {/* JSON Backup / Restore Tools (100% offline) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={handleExportJson}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition cursor-pointer"
              title="Backup CV as JSON file (Offline)"
            >
              <FileJson className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => jsonFileInputRef.current?.click()}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition cursor-pointer"
              title="Restore CV from JSON backup (Offline)"
            >
              <UploadCloud className="w-3.5 h-3.5" />
            </button>
            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportJson}
            />
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton compact className="hidden md:flex" />

          {/* AI Chat Mode Button */}
          {onSwitchToAIChat && (
            <button
              type="button"
              onClick={handleSwitchAIChat}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                !isOnline
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
              }`}
              title={!isOnline ? 'AI Chat requires internet. Edit offline in this editor.' : 'Open AI Resume Chat'}
            >
              <Sparkles className={`w-3.5 h-3.5 ${!isOnline ? 'text-slate-400' : 'text-purple-600'}`} />
              <span className="hidden sm:inline">AI Chat Builder</span>
              {!isOnline && <span className="text-[10px] uppercase font-bold text-amber-600">(Offline)</span>}
            </button>
          )}

          {/* Segmented Control (Icons only on very small screens, text on tablet) */}
          <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMobileTab('edit')}
              className={`flex items-center justify-center gap-1.5 h-9 sm:h-10 min-w-[38px] sm:min-w-[44px] sm:px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mobileTab === 'edit' 
                  ? 'bg-white text-blue-600 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
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
                  ? 'bg-white text-blue-600 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Preview"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Export Button */}
          <button 
            type="button"
            onClick={handleExport}
            disabled={isExporting} 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            title="Export PDF (Client-side offline)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
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

      {/* Offline Career Presets Modal */}
      <OfflinePresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
      />
    </div>
  );
}
