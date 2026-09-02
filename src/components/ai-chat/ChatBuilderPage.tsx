import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCVStore } from '../../store';
import { CVData, ChatMessage, ChatSession, AIProvider, UserApiKeyMetadata } from '../../types';
import HistorySidebar from './HistorySidebar';
import AIChatPanel from './AIChatPanel';
import AIPreviewPanel from './AIPreviewPanel';
import SegmentEditPopover from './SegmentEditPopover';
import NoApiKeyModal from './NoApiKeyModal';
import ApiKeySettingsModal from '../settings/ApiKeySettingsModal';
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
import { listUserApiKeysClient, getAuthHeaders, getLocalApiKey } from '../../lib/apiKeyService';
import {
  generateResumeDirectClientSide,
  modifyGeneralResumeDirectClientSide,
  enhanceSingleFieldDirectClientSide,
  enhancePromptDirectClientSide,
} from '../../lib/clientAiFallback';
import {
  Bot,
  PanelLeft,
  PenLine,
  Eye,
  Download,
  LogIn,
  LogOut as LogOutIcon,
  Key,
} from 'lucide-react';

interface ChatBuilderPageProps {
  onSwitchToFormMode: () => void;
}

export default function ChatBuilderPage({ onSwitchToFormMode }: ChatBuilderPageProps) {
  const globalStoreData = useCVStore((state) => state.data);
  const updateGlobalStore = useCVStore((state) => state.updateData);
  const setTemplate = useCVStore((state) => state.setTemplate);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentResume, setCurrentResume] = useState<CVData>(globalStoreData);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  // BYOK API Keys & Provider Selection State
  const [userKeys, setUserKeys] = useState<UserApiKeyMetadata[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [isApiKeySettingsOpen, setIsApiKeySettingsOpen] = useState(false);
  const [isNoKeyGateOpen, setIsNoKeyGateOpen] = useState(false);
  const [initialSettingsProvider, setInitialSettingsProvider] = useState<AIProvider>('gemini');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const [isExporting, setIsExporting] = useState(false);

  // Monitor auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Fetch user keys
  const loadUserKeys = async () => {
    if (currentUser) {
      try {
        const keys = await listUserApiKeysClient();
        setUserKeys(keys);
        if (keys.length > 0) {
          const defaultKey = keys.find((k) => k.isDefault);
          if (defaultKey) {
            setSelectedProvider(defaultKey.provider);
          } else {
            setSelectedProvider(keys[0].provider);
          }
        }
      } catch (err) {
        console.error('Failed to load user keys:', err);
      }
    }
  };

  useEffect(() => {
    loadUserKeys();
  }, [currentUser]);

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

  const currentSessionIdRef = useRef<string | null>(null);
  currentSessionIdRef.current = currentSessionId;

  // 1. Subscribe to real-time chat sessions list
  useEffect(() => {
    const unsub = subscribeToChatSessions(
      (list) => {
        setSessions(list);
        const activeId = currentSessionIdRef.current;
        if (!activeId && list.length > 0) {
          setCurrentSessionId(list[0].id);
          setCurrentResume(list[0].resumeData || globalStoreData);
        } else if (activeId) {
          const exists = list.find((s) => s.id === activeId);
          if (!exists) {
            if (list.length > 0) {
              setCurrentSessionId(list[0].id);
              setCurrentResume(list[0].resumeData || globalStoreData);
            } else {
              setCurrentSessionId(null);
              setMessages([]);
            }
          }
        }
      },
      (err) => {
        console.warn('Sessions subscription note:', err.message);
      }
    );
    return () => unsub();
  }, [globalStoreData]);

  // 2. Subscribe to real-time messages for active session
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    const sessionObj = sessions.find((s) => s.id === currentSessionId);
    if (sessionObj && sessionObj.resumeData) {
      setCurrentResume(sessionObj.resumeData);
    }

    const unsub = subscribeToChatMessages(
      currentSessionId,
      (msgs) => {
        setMessages(msgs);
      },
      (err) => {
        console.warn('Messages subscription note:', err.message);
      }
    );

    return () => unsub();
  }, [currentSessionId, sessions]);

  const handleNewSession = async () => {
    try {
      const newId = await createChatSession('New Resume Draft', globalStoreData);
      setCurrentSessionId(newId);
      setCurrentResume(globalStoreData);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('Failed to create new session:', err);
    }
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    if (session.resumeData) {
      setCurrentResume(session.resumeData);
      updateGlobalStore(session.resumeData);
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      if (currentSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId);
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
          setCurrentResume(remaining[0].resumeData || globalStoreData);
        } else {
          setCurrentSessionId(null);
          setCurrentResume(globalStoreData);
        }
      }
    } catch (err) {
      console.error('Delete session error:', err);
    }
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await renameChatSession(sessionId, newTitle);
    } catch (err) {
      console.error('Rename session error:', err);
    }
  };

  // Helper to generate auth headers for AI requests
  const getAiRequestHeaders = async (): Promise<Record<string, string>> => {
    return await getAuthHeaders(selectedProvider);
  };

  // Helper to check if API key exists, if not opens gate modal
  const checkHasKeyOrGate = (): boolean => {
    const hasLocalKey = Boolean(getLocalApiKey(selectedProvider));
    if (userKeys.length === 0 && !hasLocalKey) {
      setIsNoKeyGateOpen(true);
      return false;
    }
    return true;
  };

  // 3. Main Message Handler (Full Generation or General Edit)
  const handleSendMessage = async (promptText: string, photoUrl?: string) => {
    if (!checkHasKeyOrGate()) return;

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

    const statusCycle = [
      'Analyzing career achievements...',
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
      const headers = await getAiRequestHeaders();
      const directApiKey = getLocalApiKey(selectedProvider);

      if (isFirstFullGen) {
        // Full Generation Call
        let res = await fetch('/api/ai-chat/generate', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            prompt: promptText,
            photoUrl,
            provider: selectedProvider,
            directApiKey,
          }),
        });

        let data: any = null;

        if (res.status === 404 && directApiKey && selectedProvider === 'gemini') {
          // Direct client-side generation fallback if backend API is not present on host
          data = await generateResumeDirectClientSide(directApiKey, promptText, photoUrl);
        } else if (!res.ok) {
          let errorMsg = 'Full generation failed';
          let errorCode = '';
          const rawText = await res.text().catch(() => '');
          try {
            const errData = JSON.parse(rawText);
            errorMsg = errData.error || errorMsg;
            errorCode = errData.code || '';
          } catch {
            if (rawText) errorMsg = `Server response (${res.status}): ${rawText.slice(0, 120)}`;
          }

          if (errorCode === 'no_key_configured' || errorCode === 'invalid_api_key') {
            setIsNoKeyGateOpen(true);
          }
          throw new Error(errorMsg);
        } else {
          data = await res.json();
        }

        const generatedData: CVData = data.resumeData;

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
        let res = await fetch('/api/ai-chat/general-edit', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            currentResume,
            instruction: promptText,
            history: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
            provider: selectedProvider,
            directApiKey,
          }),
        });

        let data: any = null;

        if (res.status === 404 && directApiKey && selectedProvider === 'gemini') {
          data = await modifyGeneralResumeDirectClientSide(directApiKey, currentResume, promptText);
        } else if (!res.ok) {
          let errorMsg = 'Modification failed';
          let errorCode = '';
          const rawText = await res.text().catch(() => '');
          try {
            const errData = JSON.parse(rawText);
            errorMsg = errData.error || errorMsg;
            errorCode = errData.code || '';
          } catch {
            if (rawText) errorMsg = `Server response (${res.status}): ${rawText.slice(0, 120)}`;
          }

          if (errorCode === 'no_key_configured' || errorCode === 'invalid_api_key') {
            setIsNoKeyGateOpen(true);
          }
          throw new Error(errorMsg);
        } else {
          data = await res.json();
        }

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
          content: `Sorry, I encountered an error: ${err.message || 'Please check your API key in Settings.'}`,
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
    if (!checkHasKeyOrGate()) return;

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
    if (!checkHasKeyOrGate()) return;

    setSegmentEditState((s) => ({ ...s, isLoading: true }));

    await addChatMessage(currentSessionId, {
      role: 'user',
      content: `[Targeted Edit for ${segmentEditState.title}]: ${instruction}`,
      type: 'segment_edit',
      targetSegment: segmentEditState.title,
    });

    try {
      const headers = await getAiRequestHeaders();
      const directApiKey = getLocalApiKey(selectedProvider);
      let res = await fetch('/api/ai-chat/segment-edit', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          segmentPath: segmentEditState.path,
          currentValue: segmentEditState.currentValue,
          instruction,
          provider: selectedProvider,
          directApiKey,
          resumeContext: {
            fullName: currentResume.fullName,
            title: currentResume.title,
            userType: currentResume.userType,
          },
        }),
      });

      let data: any = null;

      if (res.status === 404 && directApiKey && selectedProvider === 'gemini') {
        const enhanced = await enhanceSingleFieldDirectClientSide(
          directApiKey,
          String(segmentEditState.currentValue || ''),
          instruction,
          currentResume.userType
        );
        data = { updatedValue: enhanced.result, replyMessage: `Updated ${segmentEditState.title}: "${instruction}"` };
      } else if (!res.ok) {
        let errorMsg = 'Segment edit failed';
        const rawText = await res.text().catch(() => '');
        try {
          const errData = JSON.parse(rawText);
          errorMsg = errData.error || errorMsg;
          if (errData.code === 'no_key_configured' || errData.code === 'invalid_api_key') {
            setIsNoKeyGateOpen(true);
          }
        } catch {
          if (rawText) errorMsg = `Server response (${res.status}): ${rawText.slice(0, 120)}`;
        }
        throw new Error(errorMsg);
      } else {
        data = await res.json();
      }

      const updatedValue = data.updatedValue;

      const updatedResume = { ...currentResume };

      if (segmentEditState.path === 'summary') {
        updatedResume.summary = updatedValue;
      } else if (segmentEditState.path === 'title') {
        updatedResume.title = updatedValue;
      } else if (segmentEditState.path.startsWith('experience[')) {
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
        content: data.replyMessage || `Updated ${segmentEditState.title}!`,
        type: 'segment_edit',
        targetSegment: segmentEditState.title,
      });

      setSegmentEditState((s) => ({ ...s, isOpen: false, isLoading: false }));
    } catch (err: any) {
      console.error('Segment edit error:', err);
      await addChatMessage(currentSessionId, {
        role: 'ai',
        content: `Could not edit ${segmentEditState.title}: ${err.message || 'Please check your API key.'}`,
        type: 'segment_edit',
        targetSegment: segmentEditState.title,
      });
      setSegmentEditState((s) => ({ ...s, isLoading: false }));
    }
  };

  // 6. Enhance Prompt API Call
  const handleEnhancePrompt = async (rawPromptText: string): Promise<string> => {
    if (!checkHasKeyOrGate()) {
      throw new Error('Please configure an AI API key first.');
    }

    const headers = await getAiRequestHeaders();
    const directApiKey = getLocalApiKey(selectedProvider);
    let res = await fetch('/api/ai-chat/enhance-prompt', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: rawPromptText,
        provider: selectedProvider,
        directApiKey,
      }),
    });

    if (res.status === 404 && directApiKey && selectedProvider === 'gemini') {
      const fallback = await enhancePromptDirectClientSide(directApiKey, rawPromptText);
      return fallback.enhancedText || rawPromptText;
    }

    if (!res.ok) {
      const rawText = await res.text().catch(() => '');
      let errorMsg = 'Failed to enhance prompt';
      try {
        const errData = JSON.parse(rawText);
        errorMsg = errData.error || errorMsg;
        if (errData.code === 'no_key_configured' || errData.code === 'invalid_api_key') {
          setIsNoKeyGateOpen(true);
        }
      } catch {}
      throw new Error(errorMsg);
    }

    const data = await res.json();
    return data.enhancedText || rawPromptText;
  };

  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId, currentResume.userType || 'professional');
    const updated = { ...currentResume, templateId };
    setCurrentResume(updated);
    updateGlobalStore(updated);
    if (currentSessionId) {
      updateSessionResumeData(currentSessionId, updated);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const filename = `${currentResume.fullName || 'Resume'}_CV.pdf`.replace(/\s+/g, '_');
      await exportToPDF('cv-preview-container', filename);
    } catch (error) {
      console.error('PDF Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenKeySettings = (provider?: AIProvider) => {
    if (provider) setInitialSettingsProvider(provider);
    setIsApiKeySettingsOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* App Top Navigation Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Resume History Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  SmartCV
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40">
                  AI Architect
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center / Right Toolbar Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switch to Form Editor Button */}
          <button
            type="button"
            onClick={onSwitchToFormMode}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5 text-blue-400" />
            <span>Form Editor</span>
          </button>

          {/* Manage API Keys shortcut */}
          <button
            type="button"
            onClick={() => handleOpenKeySettings()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer"
            title="Configure AI API Keys (BYOK)"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">AI Keys</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">
              {userKeys.length > 0 ? `${userKeys.length} set` : 'Add Key'}
            </span>
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Download PDF'}</span>
          </button>

          {/* User Auth Info / Sign In */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="text-xs text-slate-300 font-medium hidden lg:inline truncate max-w-[120px]">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={() => logOut()}
                className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOutIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Real-Time Firestore Chat History Sidebar */}
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

        {/* Center Split: Chat Assistant (Left) & Real-Time Resume Preview (Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Mobile Tab Switcher */}
          <div className="md:hidden flex border-b border-slate-800 bg-slate-900 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMobileTab('chat')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                mobileTab === 'chat'
                  ? 'border-blue-500 text-blue-400 bg-slate-850'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                mobileTab === 'preview'
                  ? 'border-blue-500 text-blue-400 bg-slate-850'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Live Preview</span>
            </button>
          </div>

          {/* Left Column: Chat Conversation */}
          <div
            className={`w-full md:w-1/2 lg:w-[45%] h-full border-r border-slate-800 bg-white flex flex-col overflow-hidden ${
              mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <AIChatPanel
              messages={messages}
              isLoading={isLoading}
              loadingStatus={loadingStatus}
              userKeys={userKeys}
              selectedProvider={selectedProvider}
              onSelectProvider={setSelectedProvider}
              onOpenKeySettings={handleOpenKeySettings}
              onSendMessage={handleSendMessage}
              onEnhancePrompt={handleEnhancePrompt}
            />
          </div>

          {/* Right Column: Interactive Resume Canvas Preview */}
          <div
            className={`w-full md:w-1/2 lg:w-[55%] h-full bg-slate-900 flex flex-col overflow-hidden ${
              mobileTab === 'preview' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <AIPreviewPanel
              data={currentResume}
              isLoading={isLoading}
              loadingStatus={loadingStatus}
              activeEditingSegment={segmentEditState.isOpen ? segmentEditState.path : null}
              onEditSegment={handleOpenSegmentEdit}
              onTemplateChange={handleTemplateChange}
            />
          </div>
        </div>
      </div>

      {/* Segment-Level Edit Popover Modal */}
      <SegmentEditPopover
        segmentPath={segmentEditState.path}
        segmentTitle={segmentEditState.title}
        currentValue={segmentEditState.currentValue}
        isOpen={segmentEditState.isOpen}
        isLoading={segmentEditState.isLoading}
        onClose={() => setSegmentEditState((s) => ({ ...s, isOpen: false }))}
        onSubmit={handleSubmitSegmentEdit}
      />

      {/* API Key Required Gate Modal */}
      <NoApiKeyModal
        isOpen={isNoKeyGateOpen}
        onClose={() => setIsNoKeyGateOpen(false)}
        onOpenKeySettings={() => {
          setIsNoKeyGateOpen(false);
          setIsApiKeySettingsOpen(true);
        }}
        actionName="generate or enhance resumes with AI"
      />

      {/* AI Key Settings Modal (BYOK) */}
      <ApiKeySettingsModal
        isOpen={isApiKeySettingsOpen}
        onClose={() => setIsApiKeySettingsOpen(false)}
        initialProvider={initialSettingsProvider}
        onKeysUpdated={loadUserKeys}
      />
    </div>
  );
}
