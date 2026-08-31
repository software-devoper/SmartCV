import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SegmentEditPopoverProps {
  segmentPath: string;
  segmentTitle: string;
  currentValue: any;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (instruction: string) => Promise<void>;
}

export default function SegmentEditPopover({
  segmentPath,
  segmentTitle,
  currentValue,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: SegmentEditPopoverProps) {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onSubmit(prompt.trim());
    setPrompt('');
  };

  const quickPills = [
    "Make this more concise",
    "Add strong quantifiable metrics",
    "Strengthen action verbs",
    "Enhance professional tone",
    "Tailor for tech leadership",
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Edit with AI</h3>
                <p className="text-xs text-slate-500 font-medium">{segmentTitle || segmentPath}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Value Preview */}
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 text-xs text-slate-700 font-mono leading-relaxed max-h-32 overflow-y-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Current Content
              </span>
              {typeof currentValue === 'string'
                ? currentValue
                : Array.isArray(currentValue)
                ? currentValue.join(', ')
                : JSON.stringify(currentValue, null, 2)}
            </div>

            {/* Quick Prompts */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Prompts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPills.map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(pill)}
                    disabled={isLoading}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg transition-colors text-left"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                How should I change this?
              </label>
              <textarea
                ref={inputRef}
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Rewrite to highlight cost savings and cloud migration skills..."
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 resize-none shadow-2xs"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Apply Edit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
