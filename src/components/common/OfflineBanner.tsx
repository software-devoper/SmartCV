import React from 'react';
import { WifiOff, Wifi, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { isOnline, isReconnected } = useNetworkStatus();

  return (
    <div className="relative z-40">
      <AnimatePresence mode="wait">
        {!isOnline && (
          <motion.div
            key="offline-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-amber-500 text-slate-950 font-sans border-b border-amber-600/40 shadow-xs overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-2.5 font-bold min-w-0">
                <span className="p-1 rounded-lg bg-amber-600/20 text-slate-950 shrink-0">
                  <WifiOff className="w-4 h-4" />
                </span>
                <span className="truncate">
                  You're offline &mdash; <span className="underline decoration-slate-900/40 font-extrabold">Editor mode only</span>
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden md:inline text-[11px] font-semibold text-slate-900/80 bg-amber-400/60 px-2.5 py-0.5 rounded-full border border-amber-600/20">
                  Form editing & PDF export work 100% offline
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-extrabold bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md">
                  Offline
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {isOnline && isReconnected && (
          <motion.div
            key="reconnected-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-emerald-600 text-white font-sans border-b border-emerald-700 shadow-xs overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold min-w-0">
                <span className="p-1 rounded-lg bg-emerald-700/60 text-white shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <span className="truncate">
                  Back online &mdash; Cloud sync and AI features active
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] sm:text-xs uppercase font-extrabold bg-white text-emerald-800 px-2 py-0.5 rounded-md shadow-2xs">
                  Connected
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
