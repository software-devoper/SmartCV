import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from './useOnlineStatus';
import {
  syncOfflineDraftsToCloud,
  hasUnsyncedDrafts,
  SyncStatusEvent,
} from '../lib/offlineDraftService';

export function useOfflineSync() {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [hasUnsynced, setHasUnsynced] = useState<boolean>(() => hasUnsyncedDrafts());
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkUnsynced = useCallback(() => {
    setHasUnsynced(hasUnsyncedDrafts());
  }, []);

  const triggerSync = useCallback(async () => {
    if (!user || !isOnline) return;
    try {
      const result = await syncOfflineDraftsToCloud(user);
      checkUnsynced();
      if (result.syncedCount > 0) {
        setStatusMessage('All offline changes synced!');
        if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = setTimeout(() => {
          setStatusMessage(null);
        }, 4000);
      }
    } catch (err) {
      console.warn('Sync attempt encountered error:', err);
    }
  }, [user, isOnline, checkUnsynced]);

  // Listen to custom sync status events
  useEffect(() => {
    const handleSyncEvent = (e: Event) => {
      const detail = (e as CustomEvent<SyncStatusEvent>).detail;
      if (detail) {
        setIsSyncing(detail.isSyncing);
        if (detail.statusMessage) {
          setStatusMessage(detail.statusMessage);
          if (!detail.isSyncing) {
            if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = setTimeout(() => {
              setStatusMessage(null);
            }, 4000);
          }
        }
        if (detail.lastSyncedAt) {
          setLastSyncedAt(detail.lastSyncedAt);
        }
        checkUnsynced();
      }
    };

    window.addEventListener('smartcv_sync_status', handleSyncEvent);
    return () => {
      window.removeEventListener('smartcv_sync_status', handleSyncEvent);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, [checkUnsynced]);

  // Sync on reconnect or when user signs in
  useEffect(() => {
    if (isOnline && user) {
      triggerSync();
    }
  }, [isOnline, user, triggerSync]);

  return {
    isSyncing,
    statusMessage,
    lastSyncedAt,
    hasUnsyncedChanges: hasUnsynced,
    syncNow: triggerSync,
  };
}
