import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCVStore } from '../../store';
import { CVData, ChatMessage, ChatSession } from '../../types';
import HistorySidebar from './HistorySidebar';
import AIChatPanel from './AIChatPanel';
import AIPreviewPanel from './AIPreviewPanel';
import SegmentEditPopover from './SegmentEditPopover';
import {
  createChatSession,
  subscribeToChatSessions,
  subscribeToChatMessages,
  addChatMessage,
  updateSessionResumeData,
  deleteChatSession,
  renameChatSession,
} from '../../lib/chatSessionService';
import { auth, signInWithGoogle, logOut } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { exportToPDF } from '../../utils/pdfExport';
import {
  Bot,
  PanelLeft,
  PenLine,
  Eye,
  Download,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles,
  ArrowLeft,
  LogIn,
  LogOut as LogOutIcon,
  Cloud,
} from 'lucide-react';

interface ChatBuilderPageProps {
  onSwitchToFormMode: () => void;
}

export default function ChatBuilderPage({ onSwitchToFormMode }: ChatBuilderPageProps) {
  const globalStoreData = useCVStore((state) => state.data);
  const updateGlobalStore = useCVStore((state) => state.updateData);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentResume, setCurrentResume] = useState<CVData>(globalStoreData);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const [isExporting, setIsExporting] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Monitor auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // AI Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Thinking...');

  // Segment Edit state
  const [segmentEditState, setSegmentEditState] = useState<{
    isOpen: boolean;
    path: string;
    title: string;
    currentValue: any;
    isLoading: boolean;
  }>({
    isOpen: false,
    path: '',
    title: '',
    currentValue: null,
    isLoading: false,
  });

  // 1. Subscribe to real-time chat sessions list
  useEffect(() => {
    const unsub = subscribeToChatSessions(
      (list) => {
        setSessions(list);
        // If no active session selected yet, auto-select the latest or create initial
        if (!currentSessionId && list.length > 0) {
          setCurrentSessionId(list[0].id);
          setCurrentResume(list[0].resumeData || globalStoreData);
        }
      },
      (err) => console.error('Chat sessions sync error:', err)
    );
    return () => unsub();
  }, [currentSessionId]);

  // 2. Subscribe to messages of the current active session
  useEffect(() => {
    if (!currentSessionId) return;
    const unsub = subscribeToChatMessages(
      currentSessionId,
      (msgs) => {
        setMessages(msgs);
      },
      (err) => console.error('Messages sync error:', err)
    );
    return () => unsub();
  }, [currentSessionId]);

  // Handle New Session
  const handleNewSession = async () => {
    try {
      const newSessionId = await createChatSession(
        'New AI Resume',
        globalStoreData
      );
      setCurrentSessionId(newSessionId);
      setCurrentResume(globalStoreData);
      setMessages([]);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('Failed to create new session:', err);
    }
  };

  // Handle Select Session from Sidebar
  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    if (session.resumeData) {
      setCurrentResume(session.resumeData);
      updateGlobalStore(session.resumeData);
    }
    setIsSidebarOpen(false);
  };

  // Handle Delete Session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      if (currentSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId);
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
          setCurrentResume(remaining[0].resumeData);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Delete session error:', err);
    }
  };

  // Handle Rename Session
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await renameChatSession(sessionId, newTitle);
    } catch (err) {
      console.error('Rename session error:', err);
    }
  };

  // 3. Main Message Handler (Full Generation or General Edit)
  const handleSendMessage = async (promptText: string, photoUrl?: string) => {
    let activeId = currentSessionId;

    // Ensure session exists
    if (!activeId) {
      activeId = await createChatSession(
        promptText.slice(0, 30) + '...',
        globalStoreData,
        photoUrl
      );
      setCurrentSessionId(activeId);
    }

    const isFirstFullGen =
      !currentResume.fullName &&
      currentResume.experience.length === 0 &&
      currentResume.education.length === 0;

    // Add user message to Firestore
    await addChatMessage(activeId, {
      role: 'user',
      content: promptText,
      type: isFirstFullGen ? 'full_generation' : 'general_edit',
    });

    setIsLoading(true);

    // Rotating status text for lifelike feedback
    const statusCycle = [
      'Analyzing your career achievements...',
      'Structuring education and skills...',
      'Writing ATS-optimized bullet points...',
      'Polishing professional layout...',
    ];
    let cycleIndex = 0;
    setLoadingStatus(statusCycle[0]);
    const statusInterval = setInterval(() => {
      cycleIndex = (cycleIndex + 1) % statusCycle.length;
      setLoadingStatus(statusCycle[cycleIndex]);
    }, 1800);

    try {
      if (isFirstFullGen) {
        // Full Generation Call
        const res = await fetch('/api/ai-chat/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText, photoUrl }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Full generation failed');
        }

        const data = await res.json();
        const generatedData: CVData = data.resumeData;

        // Auto-set title from candidate name
        const title = generatedData.fullName
          ? `${generatedData.fullName}'s Resume`
          : 'AI Generated Resume';

        setCurrentResume(generatedData);
        updateGlobalStore(generatedData);

        await updateSessionResumeData(activeId, generatedData, title);
        await addChatMessage(activeId, {
          role: 'ai',
          content: data.summaryMessage || 'Your resume has been crafted successfully!',
          type: 'full_generation',
        });
      } else {
        // General Modification Call
        const res = await fetch('/api/ai-chat/general-edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentResume,
            instruction: promptText,
            history: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Modification failed');
        }

        const data = await res.json();
        const updatedData: CVData = data.resumeData;

        setCurrentResume(updatedData);
        updateGlobalStore(updatedData);

        await updateSessionResumeData(activeId, updatedData);
        await addChatMessage(activeId, {
          role: 'ai',
          content: data.replyMessage || 'Resume updated based on your prompt!',
          type: 'general_edit',
        });
      }
    } catch (err: any) {
      console.error('AI message handling error:', err);
      if (activeId) {
        await addChatMessage(activeId, {
          role: 'ai',
          content: `Sorry, I encountered an error: ${err.message || 'Please try again.'}`,
          type: 'general_edit',
        });
      }
    } finally {
      clearInterval(statusInterval);
      setIsLoading(false);
    }
  };

  // 4. Segment-Specific Targeted Edit Trigger
  const handleOpenSegmentEdit = (path: string, title: string, currentValue: any) => {
    setSegmentEditState({
      isOpen: true,
      path,
      title,
      currentValue,
      isLoading: false,
    });
  };

  // 5. Submit Segment Edit
  const handleSubmitSegmentEdit = async (instruction: string) => {
    if (!currentSessionId) return;

    setSegmentEditState((s) => ({ ...s, isLoading: true }));

    // Record user edit action in chat thread
    await addChatMessage(currentSessionId, {
      role: 'user',
      content: `[Targeted Edit for ${segmentEditState.title}]: ${instruction}`,
      type: 'segment_edit',
      targetSegment: segmentEditState.title,
    });

    try {
      const res = await fetch('/api/ai-chat/segment-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segmentPath: segmentEditState.path,
          currentValue: segmentEditState.currentValue,
          instruction,
          resumeContext: {
            fullName: currentResume.fullName,
            title: currentResume.title,
            userType: currentResume.userType,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Segment edit failed');
      }

      const data = await res.json();
      const updatedValue = data.updatedValue;

      // Update local and store state
      const updatedResume = { ...currentResume };

      if (segmentEditState.path === 'summary') {
        updatedResume.summary = updatedValue;
      } else if (segmentEditState.path === 'title') {
        updatedResume.title = updatedValue;
      } else if (segmentEditState.path.startsWith('experience[')) {
        // e.g. experience[0].bullets
        const match = segmentEditState.path.match(/experience\[(\d+)\]/);
        if (match) {
          const idx = parseInt(match[1], 10);
          if (updatedResume.experience[idx]) {
            if (Array.isArray(updatedValue)) {
              updatedResume.experience[idx].bullets = updatedValue;
            } else if (typeof updatedValue === 'string') {
              updatedResume.experience[idx].bullets = [updatedValue];
            }
          }
        }
      }

      setCurrentResume(updatedResume);
      updateGlobalStore(updatedResume);

      await updateSessionResumeData(currentSessionId, updatedResume);
      await addChatMessage(currentSessionId, {
        role: 'ai',
        content: `I've updated your ${segmentEditState.title}: "${instruction}"`,
        type: 'segment_edit',
        targetSegment: segmentEditState.title,
      });

      setSegmentEditState((s) => ({ ...s, isOpen: false, isLoading: false }));
    } catch (err: any) {
      console.error('Segment edit error:', err);
      alert(`Segment edit error: ${err.message}`);
      setSegmentEditState((s) => ({ ...s, isLoading: false }));
    }
  };

  // 6. Prompt Enhancement Handler
  const handleEnhancePrompt = async (rawText: string): Promise<string> => {
    const res = await fetch('/api/ai-chat/enhance-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: rawText }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Prompt enhancement failed');
    }

    const data = await res.json();
    return data.enhancedText || rawText;
  };

  // 7. PDF Export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = currentResume.fullName?.trim()
        ? `${currentResume.fullName.trim().replace(/\s+/g, '_')}_AI_Resume.pdf`
        : 'SmartCV_AI_Resume.pdf';
      await exportToPDF('cv-renderer-root', filename);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const isStudent = currentResume.userType === 'student';

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-3 bg-white border-b border-slate-200/80 shadow-xs z-30 shrink-0">
        {/* Left: Brand Logo + Sidebar Toggle + Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Chat History"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group" title="Return to Dashboard">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs shadow-blue-500/20 text-white font-bold text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
              <span>S</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                  SmartCV
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-purple-100 text-purple-700 border border-purple-200">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>AI Chat Mode</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px] sm:max-w-xs mt-0.5">
                {currentResume.fullName || 'Prompt-based builder'}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Mode Toggle + Mobile Tabs + Export */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Switch to Step-by-Step Form Mode */}
          <button
            type="button"
            onClick={onSwitchToFormMode}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            title="Switch to Step-by-Step Editor"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Form Editor</span>
          </button>

          {/* Google Sign-In / Account status on Desktop */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.displayName?.[0] || 'U'}
                </div>
              )}
              <span className="font-semibold max-w-[90px] truncate">
                {currentUser.displayName?.split(' ')[0] || 'Account'}
              </span>
              <button
                type="button"
                onClick={async () => {
                  setIsAuthLoading(true);
                  try {
                    await logOut();
                  } finally {
                    setIsAuthLoading(false);
                  }
                }}
                className="text-slate-400 hover:text-red-500 p-0.5 ml-0.5 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOutIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={async () => {
                setIsAuthLoading(true);
                try {
                  await signInWithGoogle();
                } catch (e) {
                  console.error('Google Sign In error:', e);
                } finally {
                  setIsAuthLoading(false);
                }
              }}
              disabled={isAuthLoading}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              title="Sign in with Google to backup and sync"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAuthLoading ? 'Connecting...' : 'Sign in'}</span>
            </button>
          )}

          {/* Mobile Segmented Control (Chat / Preview) */}
          <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMobileTab('chat')}
              className={`flex items-center justify-center gap-1.5 h-9 min-w-[40px] sm:px-3 rounded-lg text-xs font-bold transition-all ${
                mobileTab === 'chat'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Chat"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`flex items-center justify-center gap-1.5 h-9 min-w-[40px] sm:px-3 rounded-lg text-xs font-bold transition-all ${
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

          {/* Export PDF */}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            title="Export PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Collapsible History Sidebar */}
        <HistorySidebar
          sessions={sessions}
          activeSessionId={currentSessionId}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
        />

        {/* Left Panel: Chat Interface (~38-40% desktop) */}
        <section
          className={`w-full lg:w-[40%] xl:w-[38%] flex flex-col bg-white border-r border-slate-200/80 shadow-xs z-10 relative ${
            mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <AIChatPanel
            messages={messages}
            isLoading={isLoading}
            loadingStatus={loadingStatus}
            onSendMessage={handleSendMessage}
            onEnhancePrompt={handleEnhancePrompt}
          />
        </section>

        {/* Right Panel: Live Editable Preview (~60-62% desktop) */}
        <section
          className={`w-full lg:w-[60%] xl:w-[62%] flex flex-col bg-slate-200/80 relative overflow-hidden ${
            mobileTab === 'chat' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <AIPreviewPanel
            data={currentResume}
            isLoading={isLoading}
            loadingStatus={loadingStatus}
            activeEditingSegment={segmentEditState.isOpen ? segmentEditState.path : null}
            onEditSegment={handleOpenSegmentEdit}
            onTemplateChange={(templateId) => {
              const updated = { ...currentResume, templateId };
              setCurrentResume(updated);
              updateGlobalStore(updated);
              if (currentSessionId) updateSessionResumeData(currentSessionId, updated);
            }}
          />
        </section>
      </div>

      {/* Segment AI Edit Popover */}
      <SegmentEditPopover
        segmentPath={segmentEditState.path}
        segmentTitle={segmentEditState.title}
        currentValue={segmentEditState.currentValue}
        isOpen={segmentEditState.isOpen}
        isLoading={segmentEditState.isLoading}
        onClose={() => setSegmentEditState((s) => ({ ...s, isOpen: false }))}
        onSubmit={handleSubmitSegmentEdit}
      />
    </div>
  );
}
