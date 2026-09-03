import React from 'react';
import { Cloud, Check, Loader2, HardDrive, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface SyncStatusIndicatorProps {
  compact?: boolean;
  className?: string;
}

export default function SyncStatusIndicator({
  compact = false,
  className = '',
}: SyncStatusIndicatorProps) {
  const isOnline = useOnlineStatus();
  const { isSyncing, statusMessage, lastSyncedAt } = useOfflineSync();

  return (
    <div className={`flex items-center text-xs font-medium font-sans select-none ${className}`}>
      <AnimatePresence mode="wait">
        {isSyncing && (
          <motion.div
            key="syncing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-mono text-[11px]"
            title="Syncing your offline changes to cloud..."
          >
            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
            <span className={compact ? 'hidden sm:inline' : ''}>
              Syncing your offline changes...
            </span>
          </motion.div>
        )}

        {!isSyncing && statusMessage && (
          <motion.div
            key="status-msg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs font-mono text-[11px]"
          >
            <Check className="w-3 h-3 text-emerald-600" />
            <span className={compact ? 'hidden sm:inline' : ''}>{statusMessage}</span>
          </motion.div>
        )}

        {!isSyncing && !statusMessage && !isOnline && (
          <motion.div
            key="offline-saved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-mono"
            title="All changes are automatically saved locally on your device."
          >
            <HardDrive className="w-3 h-3 text-slate-500" />
            <span className={compact ? 'hidden sm:inline' : ''}>Saved Locally</span>
          </motion.div>
        )}

        {!isSyncing && !statusMessage && isOnline && lastSyncedAt && (
          <motion.div
            key="cloud-synced"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-400 text-[10px] font-mono"
            title={`Synced at ${new Date(lastSyncedAt).toLocaleTimeString()}`}
          >
            <Cloud className="w-3 h-3 text-emerald-500" />
            <span>Cloud synced</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
