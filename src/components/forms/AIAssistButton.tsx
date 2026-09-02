import React, { useState } from 'react';
import { Sparkles, Loader2, Check, AlertCircle, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../../lib/firebase';
import { getAuthHeaders, getLocalApiKey, getLocalDefaultProvider } from '../../lib/apiKeyService';
import ApiKeySettingsModal from '../settings/ApiKeySettingsModal';

interface AIAssistButtonProps {
  text: string;
  intent: 'summary' | 'bullet';
  userType?: 'student' | 'professional';
  onSuggestionAccepted: (newText: string) => void;
}

export default function AIAssistButton({
  text,
  intent,
  userType = 'professional',
  onSuggestionAccepted,
}: AIAssistButtonProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const handleEnhance = async () => {
    if (!text || text.trim().length < 5) return;
    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      const activeProvider = getLocalDefaultProvider();
      const headers = await getAuthHeaders(activeProvider);
      const directApiKey = getLocalApiKey(activeProvider);

      const response = await fetch('/api/gemini/enhance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text,
          intent,
          userType,
          provider: activeProvider,
          directApiKey,
        }),
      });

      if (!response.ok) {
        let errMsg = 'Failed to enhance text';
        let code = '';
        const raw = await response.text().catch(() => '');
        try {
          const data = JSON.parse(raw);
          errMsg = data.error || errMsg;
          code = data.code || '';
        } catch {
          if (raw) errMsg = `Server error (${response.status}): ${raw.slice(0, 100)}`;
        }

        setErrorCode(code);
        throw new Error(errMsg);
      }

      const data = await response.json();
      setSuggestion(data.result);
    } catch (err: any) {
      setError(err.message || 'Failed to enhance text');
    } finally {
      setLoading(false);
    }
  };

  if (suggestion) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mt-3 flex gap-3 w-full"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none text-slate-700 shadow-sm border border-slate-200 space-y-2.5 w-full">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Refinement Suggestion
              </p>
              <span className="text-[10px] uppercase font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm italic text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed shadow-2xs">
              "{suggestion}"
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onSuggestionAccepted(suggestion);
                  setSuggestion(null);
                }}
                className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Accept
              </button>
              <button
                type="button"
                onClick={() => setSuggestion(null)}
                className="bg-white text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {error && (
          <div className="flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-xs">{error}</span>
            {(errorCode === 'no_key_configured' || errorCode === 'invalid_api_key') && (
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className="ml-1 text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Add Key
              </button>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={handleEnhance}
          disabled={loading || !text || text.trim().length < 5}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all py-1 px-2 rounded-lg hover:bg-blue-50/80 active:scale-95 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          )}
          {loading ? 'Enhancing...' : '✨ Improve with AI'}
        </button>
      </div>

      <ApiKeySettingsModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
    </>
  );
}
