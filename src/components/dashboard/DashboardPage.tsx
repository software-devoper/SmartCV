import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCVStore } from '../../store';
import {
  getUserChatSessions,
  deleteChatSession,
  createChatSession,
  subscribeToChatSessions,
} from '../../lib/chatSessionService';
import { templates } from '../../templates/registry';
import AppNavbar from '../layout/AppNavbar';
import { ChatSession, CVData } from '../../types';
import {
  Sparkles,
  Bot,
  FileText,
  Plus,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const setTemplate = useCVStore((state) => state.setTemplate);
  const updateData = useCVStore((state) => state.updateData);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const username = userProfile?.username || user?.displayName || 'there';

  // Real-time user sessions subscription
  useEffect(() => {
    setIsLoadingSessions(true);
    const unsub = subscribeToChatSessions(
      (list) => {
        setSessions(list);
        setIsLoadingSessions(false);
      },
      (err) => {
        console.error('Failed to load user resume sessions:', err);
        setIsLoadingSessions(false);
      }
    );
    return () => unsub();
  }, []);

  const handleStartNewAIChat = async () => {
    setIsCreatingNew(true);
    try {
      const currentGlobal = useCVStore.getState().data;
      await createChatSession(
        currentGlobal.fullName ? `${currentGlobal.fullName}'s Resume` : 'New AI Resume',
        currentGlobal
      );
      navigate('/chat');
    } catch (err) {
      console.error('Error starting new session:', err);
      navigate('/chat');
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handleOpenSessionInChat = (session: ChatSession) => {
    if (session.resumeData) {
      updateData(session.resumeData);
    }
    navigate('/chat');
  };

  const handleOpenSessionInForm = (session: ChatSession) => {
    if (session.resumeData) {
      updateData(session.resumeData);
    }
    navigate('/builder');
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (deletingId) return;

    if (!window.confirm('Are you sure you want to permanently delete this resume session?')) return;

    setDeletingId(sessionId);
    try {
      await deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickTemplate = (templateId: string, type: 'student' | 'professional') => {
    setTemplate(templateId, type);
    navigate('/builder');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AppNavbar currentMode="dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Welcome Header Banner */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-purple-950/60 border border-slate-800 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SmartCV Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-blue-400">@{username}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create, refine, and download professional resumes tailored for your target roles.
            </p>
          </div>
        </div>

        {/* Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: AI Chat Builder */}
          <div className="relative group bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                  Recommended
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  AI Chat Resume Builder
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Type your background in natural language or attach a headshot. Gemini 3.7 Flash extracts and crafts an ATS-ready resume with live A4 preview.
                </p>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                type="button"
                onClick={handleStartNewAIChat}
                disabled={isCreatingNew}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-98 cursor-pointer"
              >
                {isCreatingNew ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Launching Session...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start with AI Chat</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Manual Form Editor */}
          <div className="relative group bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                  Granular Control
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Step-by-Step Form Editor
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Fill in your experience section by section with drag-and-drop ordering, rich bullet-points, custom sections, and live PDF preview.
                </p>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                type="button"
                onClick={() => navigate('/builder')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Open Form Editor</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Resumes & Cloud Sessions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Your Saved Resumes
              </h3>
              <p className="text-xs text-slate-400">
                Cloud-persisted sessions and drafts across your account
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartNewAIChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Resume</span>
            </button>
          </div>

          {isLoadingSessions ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
              <p className="text-xs">Loading your saved resumes...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 px-6 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No resumes created yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Get started by telling the AI about your experience or selecting a template.
              </p>
              <button
                type="button"
                onClick={handleStartNewAIChat}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Build Resume with AI</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleOpenSessionInChat(session)}
                  className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {session.title || 'Untitled Resume'}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        disabled={deletingId === session.id}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete resume"
                      >
                        {deletingId === session.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {session.resumeData?.title ||
                        session.resumeData?.fullName ||
                        'Draft Resume'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                        {session.resumeData?.templateId || 'student-minimal'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSessionInForm(session);
                      }}
                      className="text-xs text-slate-400 hover:text-white font-medium hover:underline cursor-pointer"
                    >
                      Form Editor
                    </button>
                    <span className="text-xs text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Open in AI Chat</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Template Starters */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Quick Template Starters
              </h3>
              <p className="text-xs text-slate-400">
                Choose a pre-styled layout and start customizing immediately
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/templates')}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>View All 14</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {templates.slice(0, 4).map((template) => (
              <div
                key={template.id}
                onClick={() => handleQuickTemplate(template.id, template.type)}
                className="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-3 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div
                  className={`w-full rounded-xl aspect-[21/28] flex items-center justify-center p-3 mb-3 border ${template.thumbnailClass}`}
                >
                  <div className="w-4/5 h-4/5 bg-white/90 rounded-xs shadow-xs p-2 flex flex-col gap-1.5">
                    <div className="w-1/2 h-1.5 bg-slate-800 rounded-full" />
                    <div className="w-full h-px bg-slate-200" />
                    <div className="w-full h-1 bg-slate-400 rounded-full" />
                    <div className="w-3/4 h-1 bg-slate-300 rounded-full" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-400 truncate">
                    {template.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 capitalize">{template.type}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
