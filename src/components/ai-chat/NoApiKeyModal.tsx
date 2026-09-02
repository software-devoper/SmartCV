import React from 'react';
import { Sparkles, Key, ShieldCheck, ArrowRight, X, Bot, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NoApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKeySettings: () => void;
  actionName?: string;
}

export default function NoApiKeyModal({
  isOpen,
  onClose,
  onOpenKeySettings,
  actionName = 'use AI resume generation',
}: NoApiKeyModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-200 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Heading */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Key className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              AI API Key Required
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              To {actionName}, please add your own AI API key.
            </p>
          </div>
        </div>

        {/* Value props / Provider icons */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 mb-6 space-y-3">
          <p className="text-xs font-semibold text-slate-300">
            SmartCV supports your favorite AI providers:
          </p>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex flex-col items-center text-center gap-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[11px] font-bold text-white">Gemini</span>
              <span className="text-[9px] text-emerald-400 font-medium">Free Tier</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex flex-col items-center text-center gap-1">
              <Bot className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold text-white">Claude</span>
              <span className="text-[9px] text-slate-400">Sonnet 3.5</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex flex-col items-center text-center gap-1">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold text-white">OpenAI</span>
              <span className="text-[9px] text-slate-400">GPT-4o Mini</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted with AES-256-GCM. Never shared or exposed.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenKeySettings();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Key className="w-4 h-4" />
            <span>Add API Key</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/builder');
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Manual Form Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
