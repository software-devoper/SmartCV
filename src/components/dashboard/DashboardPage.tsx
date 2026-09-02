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
import { listUserApiKeysClient } from '../../lib/apiKeyService';
import { templates } from '../../templates/registry';
import AppNavbar from '../layout/AppNavbar';
import ApiKeySettingsModal from '../settings/ApiKeySettingsModal';
import { ChatSession, CVData, UserApiKeyMetadata } from '../../types';
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
  Key,
  CheckCircle2,
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
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [userKeys, setUserKeys] = useState<UserApiKeyMetadata[]>([]);

  const username = userProfile?.username || user?.displayName || 'there';

  const loadKeys = async () => {
    if (user) {
      const keys = await listUserApiKeysClient();
      setUserKeys(keys);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [user]);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AppNavbar currentMode="dashboard" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-purple-900/20 to-slate-900 border border-slate-800 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SmartCV Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-blue-400">@{username}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create, refine, and download professional resumes tailored for your target roles with your own AI providers.
            </p>
          </div>

          {/* BYOK Status Card / Button */}
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(true)}
            className="relative z-10 flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/60 transition-all text-left shadow-lg group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">AI Provider Keys</span>
                {userKeys.length > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/40 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {userKeys.length} Ready
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800/40">
                    Not configured
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {userKeys.length > 0
                  ? `Active default: ${userKeys.find((k) => k.isDefault)?.provider?.toUpperCase() || userKeys[0].provider?.toUpperCase()}`
                  : 'Add Gemini, Claude, or OpenAI key'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 ml-2 group-hover:text-white transition-colors" />
          </button>
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
                  Type your background in natural language or attach a headshot. Powered by your choice of Gemini, Claude, or OpenAI with live A4 preview.
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
                Resumes synced across your devices in real time
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {sessions.length} {sessions.length === 1 ? 'Resume' : 'Resumes'}
            </span>
          </div>

          {isLoadingSessions ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Syncing your resume history...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No resumes created yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Start by chatting with the AI Resume Architect or build one using the step-by-step form editor.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartNewAIChat}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Create Your First Resume
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => {
                const updatedDate = new Date(session.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const template = templates.find((t) => t.id === session.resumeData?.templateId);

                return (
                  <div
                    key={session.id}
                    onClick={() => handleOpenSessionInChat(session)}
                    className="group bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 relative"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                          {session.title || 'Untitled Resume'}
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          disabled={deletingId === session.id}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Resume"
                        >
                          {deletingId === session.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {session.resumeData?.summary ||
                          session.resumeData?.title ||
                          'Resume draft created with AI Architect'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{updatedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {template?.name || 'Classic'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <ApiKeySettingsModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeysUpdated={loadKeys}
      />
    </div>
  );
}
