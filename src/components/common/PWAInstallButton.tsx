import React, { useState } from 'react';
import { DownloadCloud, Smartphone, X, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700/80 shadow-sm transition active:scale-95 cursor-pointer ${
          compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
        } ${className}`}
        title="Install SmartCV app for offline access"
      >
        <DownloadCloud className="w-3.5 h-3.5 text-blue-400" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-medium text-xs transition cursor-pointer ${
            compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
          } ${className}`}
          title="Install SmartCV on iOS"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-500" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                    1
                  </div>
                  <p>
                    Tap the <strong>Share</strong> button <Share2 className="inline w-3.5 h-3.5 text-blue-500 mx-0.5" /> in your Safari toolbar at the bottom.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                    2
                  </div>
                  <p>
                    Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="inline w-3.5 h-3.5 text-blue-500 mx-0.5" />.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                    3
                  </div>
                  <p>
                    Tap <strong>Add</strong> in the top-right corner to launch SmartCV offline anytime!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-98"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
