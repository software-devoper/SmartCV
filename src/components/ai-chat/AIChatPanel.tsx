import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AIProvider, UserApiKeyMetadata } from '../../types';
import {
  Send,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Wand2,
  X,
  User as UserIcon,
  Key,
  Bot,
  Cpu,
  ChevronDown,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { motion } from 'motion/react';
import { compressImage } from '../../utils/imageCompressor';
import { AI_PROVIDERS } from '../../lib/aiProviders';

interface AIChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingStatus: string;
  userKeys: UserApiKeyMetadata[];
  selectedProvider: AIProvider;
  onSelectProvider: (provider: AIProvider) => void;
  onOpenKeySettings: (provider?: AIProvider) => void;
  onSendMessage: (prompt: string, photoUrl?: string) => Promise<void>;
  onEnhancePrompt: (text: string) => Promise<string>;
}

export default function AIChatPanel({
  messages,
  isLoading,
  loadingStatus,
  userKeys,
  selectedProvider,
  onSelectProvider,
  onOpenKeySettings,
  onSendMessage,
  onEnhancePrompt,
}: AIChatPanelProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const providerMenuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Close provider dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (providerMenuRef.current && !providerMenuRef.current.contains(e.target as Node)) {
        setIsProviderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-expand textarea height
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    if (enhanceError) setEnhanceError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.8);
        setPhotoPreview(compressed);
      } catch (err) {
        console.error('Photo compression error:', err);
      }
    }
  };

  const handleEnhance = async () => {
    if (!inputPrompt.trim() || isEnhancing || isLoading) return;
    setIsEnhancing(true);
    setEnhanceError(null);
    try {
      const enhanced = await onEnhancePrompt(inputPrompt.trim());
      setInputPrompt(enhanced);
      if (textareaRef.current) {
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
          }
        }, 50);
      }
    } catch (err: any) {
      console.error('Enhance error:', err);
      setEnhanceError(err?.message || 'Enhancement failed. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isLoading || isEnhancing) return;

    const textToSend = inputPrompt.trim();
    const photoToSend = photoPreview || undefined;

    setInputPrompt('');
    setPhotoPreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(textToSend, photoToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getProviderIcon = (p: AIProvider) => {
    switch (p) {
      case 'gemini':
        return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
      case 'claude':
        return <Bot className="w-3.5 h-3.5 text-amber-500" />;
      case 'openai':
        return <Cpu className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const currentProviderMeta = AI_PROVIDERS[selectedProvider] || AI_PROVIDERS.gemini;
  const currentKeySet = userKeys.some((k) => k.provider === selectedProvider);

  const samplePrompts = [
    "I am an experienced Full Stack Engineer with 4 years of React and Node.js experience at Spotify, built microservices that reduced latency by 35%, graduated from UC Berkeley with BS in CS.",
    "Recent Economics & Data Science student at NYU seeking Business Analyst internships. Led university consulting club with 50+ members, Python & SQL proficient.",
    "Make my professional summary punchier and add AWS Certified Solutions Architect to certifications.",
  ];

  return (
    <div className="flex flex-col h-full bg-white relative font-sans">
      {/* Top Bar with Provider Selector */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">AI Model:</span>

          {/* Provider Dropdown */}
          <div className="relative" ref={providerMenuRef}>
            <button
              type="button"
              onClick={() => setIsProviderMenuOpen(!isProviderMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold transition-all shadow-2xs cursor-pointer"
            >
              {getProviderIcon(selectedProvider)}
              <span>{currentProviderMeta.name}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentKeySet ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                title={currentKeySet ? 'API Key Configured' : 'Key missing'}
              />
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {isProviderMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 animate-fade-in text-slate-800">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Select Provider
                </div>

                {(['gemini', 'claude', 'openai'] as AIProvider[]).map((prov) => {
                  const meta = AI_PROVIDERS[prov];
                  const hasKey = userKeys.some((k) => k.provider === prov);
                  const isSelected = selectedProvider === prov;

                  return (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => {
                        onSelectProvider(prov);
                        setIsProviderMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-blue-50/60 font-bold text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getProviderIcon(prov)}
                        <span>{meta.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {hasKey ? (
                          <span className="text-[10px] text-emerald-600 font-medium">Ready</span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-medium">No Key</span>
                        )}
                      </div>
                    </button>
                  );
                })}

                <div className="p-1 border-t border-slate-100 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProviderMenuOpen(false);
                      onOpenKeySettings();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Manage API Keys (BYOK)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manage Key Shortcut Button */}
        <button
          type="button"
          onClick={() => onOpenKeySettings(selectedProvider)}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-slate-400" />
          <span>{userKeys.length > 0 ? 'API Keys' : 'Set API Key'}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[380px] text-center max-w-md mx-auto space-y-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                AI Resume Architect
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Describe your background, skills, or target role in plain text. Powered by your choice of <strong>Google Gemini</strong>, <strong>Anthropic Claude</strong>, or <strong>OpenAI</strong>.
              </p>
            </div>

            {/* Starter Prompt Chips */}
            <div className="w-full space-y-2 pt-2 text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                Example Prompts
              </span>
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputPrompt(sample);
                    if (textareaRef.current) {
                      setTimeout(() => {
                        textareaRef.current?.focus();
                        textareaRef.current!.style.height = 'auto';
                        textareaRef.current!.style.height = `${Math.min(
                          textareaRef.current!.scrollHeight,
                          200
                        )}px`;
                      }, 50);
                    }
                  }}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-blue-50/60 hover:border-blue-200 text-xs text-slate-700 transition-all leading-relaxed shadow-2xs group cursor-pointer"
                >
                  <span className="font-semibold text-blue-600 mr-1.5 group-hover:underline">
                    Sample {idx + 1}:
                  </span>
                  {sample}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isErrorMsg = msg.content.includes('encountered an error') || msg.content.includes('API key');

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 sm:gap-3 items-start ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5 ${
                    isErrorMsg ? 'bg-red-500' : 'bg-blue-600'
                  }`}>
                    {isErrorMsg ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : isErrorMsg
                      ? 'bg-red-50 border border-red-200 text-red-900 rounded-tl-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {msg.type === 'segment_edit' && (
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-75 mb-1 flex items-center gap-1">
                      <Wand2 className="w-3 h-3" />
                      <span>Targeted Edit: {msg.targetSegment}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* If error relates to API key, provide helpful actionable button */}
                  {isErrorMsg && (
                    <div className="mt-3 pt-2 border-t border-red-200/60 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenKeySettings()}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Manage API Keys</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })
        )}

        {/* AI Typing / Generation Status */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-start justify-start"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 text-xs sm:text-sm text-slate-700 shadow-2xs flex items-center gap-3">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <span className="font-medium text-slate-600">{loadingStatus}</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Bottom Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-white/95 backdrop-blur-md relative z-20">
        {/* Photo Upload Attachment Tag */}
        {photoPreview && (
          <div className="mb-2 flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl w-fit text-xs text-blue-700">
            <img
              src={photoPreview}
              alt="Headshot preview"
              className="w-6 h-6 rounded-full object-cover border border-blue-300"
            />
            <span className="font-medium">Profile Photo Attached</span>
            <button
              type="button"
              onClick={() => setPhotoPreview(null)}
              className="text-blue-500 hover:text-red-500 ml-1 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-2xl shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isEnhancing}
            placeholder={`Ask ${currentProviderMeta.name} to generate or modify your resume... (Shift+Enter for newline)`}
            className="w-full px-4 pt-3 pb-2 text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 resize-none max-h-48"
          />

          {/* Action Toolbar Inside Box */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100/80">
            <div className="flex items-center gap-1.5">
              {/* Photo Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isEnhancing}
                className="p-1.5 sm:px-2.5 sm:py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                title="Attach profile photo"
              >
                <ImageIcon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Add Photo</span>
              </button>

              {/* Enhance Prompt Button */}
              <button
                type="button"
                onClick={handleEnhance}
                disabled={!inputPrompt.trim() || isEnhancing || isLoading}
                className="p-1.5 sm:px-2.5 sm:py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-2xs cursor-pointer"
                title="Enhance & structure your prompt with AI"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                )}
                <span className="hidden sm:inline">
                  {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
                </span>
              </button>
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputPrompt.trim() || isLoading || isEnhancing}
              className="p-2 sm:px-4 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {enhanceError && (
            <div className="mt-2 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-lg text-amber-800 text-xs flex items-center justify-between">
              <span>{enhanceError}</span>
              <button
                type="button"
                onClick={() => setEnhanceError(null)}
                className="text-amber-600 hover:text-amber-900 font-bold ml-2 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
