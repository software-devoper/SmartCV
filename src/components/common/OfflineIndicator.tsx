import React, { useState } from 'react';
import { WifiOff, Info, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  // If online, reset dismissed state so it alerts next time they go offline
  if (isOnline) {
    if (isDismissed) setIsDismissed(false);
    return null;
  }

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-amber-700 transition"
        title="You are currently in Offline Mode"
      >
        <WifiOff className="w-3.5 h-3.5" />
        <span>Offline Mode</span>
      </button>
    );
  }

  return (
    <div
      id="offline-status-banner"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-start gap-3 rounded-2xl bg-slate-900 border border-amber-500/40 p-3.5 text-xs text-white shadow-2xl backdrop-blur-md"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
        <WifiOff className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-300">Offline Mode Active</span>
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
        <p className="mt-1 text-slate-300 leading-relaxed text-[11px] sm:text-xs">
          Your CV edits, sections, and PDF export are stored locally in your browser. AI writing features are paused until internet reconnection.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        title="Dismiss notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
