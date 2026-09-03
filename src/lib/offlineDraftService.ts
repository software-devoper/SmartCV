import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './firebase';
import { CVData } from '../types';

export interface OfflineResumeDraft {
  id: string;
  userId: string;
  title: string;
  resumeData: CVData;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
  lastSyncedAt?: number;
}

export interface SyncStatusEvent {
  isSyncing: boolean;
  statusMessage?: string;
  syncedCount?: number;
  lastSyncedAt?: number;
  error?: string;
}

const STORAGE_KEY = 'smartcv_offline_resumes_v1';
const ACTIVE_DRAFT_KEY = 'smartcv_active_resume_id_v1';

export function getActiveResumeId(): string {
  try {
    return localStorage.getItem(ACTIVE_DRAFT_KEY) || 'default_draft';
  } catch {
    return 'default_draft';
  }
}

export function setActiveResumeId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_DRAFT_KEY, id);
  } catch (e) {
    console.warn('Failed to set active resume id:', e);
  }
}

export function getOfflineDrafts(): OfflineResumeDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read offline drafts:', err);
    return [];
  }
}

export function getOfflineDraft(id: string): OfflineResumeDraft | null {
  const drafts = getOfflineDrafts();
  return drafts.find((d) => d.id === id) || null;
}

export function saveOfflineDraft(
  payload: {
    id?: string;
    userId?: string;
    title?: string;
    resumeData: CVData;
    isSyncUpdate?: boolean;
  }
): OfflineResumeDraft {
  const drafts = getOfflineDrafts();
  const id = payload.id || getActiveResumeId() || `resume_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const existingIndex = drafts.findIndex((d) => d.id === id);
  const now = Date.now();

  const generatedTitle =
    payload.title?.trim() ||
    (payload.resumeData.fullName ? `${payload.resumeData.fullName}'s Resume` : 'Untitled Resume');

  let updatedDraft: OfflineResumeDraft;

  if (existingIndex >= 0) {
    const existing = drafts[existingIndex];
    updatedDraft = {
      ...existing,
      userId: payload.userId || existing.userId || 'guest',
      title: payload.title || existing.title || generatedTitle,
      resumeData: payload.resumeData,
      updatedAt: now,
      synced: payload.isSyncUpdate ? true : false,
      lastSyncedAt: payload.isSyncUpdate ? now : existing.lastSyncedAt,
    };
    drafts[existingIndex] = updatedDraft;
  } else {
    updatedDraft = {
      id,
      userId: payload.userId || 'guest',
      title: generatedTitle,
      resumeData: payload.resumeData,
      createdAt: now,
      updatedAt: now,
      synced: payload.isSyncUpdate ? true : false,
      lastSyncedAt: payload.isSyncUpdate ? now : undefined,
    };
    drafts.unshift(updatedDraft);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    setActiveResumeId(id);
    dispatchSyncStatus({
      isSyncing: false,
      lastSyncedAt: updatedDraft.lastSyncedAt,
    });
  } catch (err) {
    console.error('Failed to write offline draft to localStorage:', err);
  }

  return updatedDraft;
}

export function deleteOfflineDraft(id: string): void {
  const drafts = getOfflineDrafts().filter((d) => d.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    dispatchSyncStatus({ isSyncing: false });
  } catch (err) {
    console.error('Failed to delete offline draft:', err);
  }
}

export function hasUnsyncedDrafts(): boolean {
  const drafts = getOfflineDrafts();
  return drafts.some((d) => !d.synced);
}

function dispatchSyncStatus(event: SyncStatusEvent) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('smartcv_sync_status', { detail: event }));
  }
}

/**
 * Last-Write-Wins Synchronization of offline drafts with Firestore
 */
export async function syncOfflineDraftsToCloud(user: User): Promise<{
  syncedCount: number;
  errors: number;
}> {
  if (!user || !navigator.onLine) {
    return { syncedCount: 0, errors: 0 };
  }

  const drafts = getOfflineDrafts();
  const unsyncedDrafts = drafts.filter((d) => !d.synced || d.userId === 'guest');

  if (unsyncedDrafts.length === 0) {
    return { syncedCount: 0, errors: 0 };
  }

  dispatchSyncStatus({
    isSyncing: true,
    statusMessage: 'Syncing your offline changes...',
  });

  let syncedCount = 0;
  let errors = 0;

  for (const draft of unsyncedDrafts) {
    try {
      const resumeDocRef = doc(db, `users/${user.uid}/resumes/${draft.id}`);
      let shouldWriteLocalToCloud = true;

      try {
        const remoteSnap = await getDoc(resumeDocRef);
        if (remoteSnap.exists()) {
          const remoteData = remoteSnap.data();
          // Last-Write-Wins based on updatedAt timestamp
          if (remoteData?.updatedAt && remoteData.updatedAt > draft.updatedAt) {
            // Remote is newer: update local draft from cloud
            shouldWriteLocalToCloud = false;
            draft.resumeData = remoteData.resumeData || draft.resumeData;
            draft.title = remoteData.title || draft.title;
            draft.updatedAt = remoteData.updatedAt;
            draft.userId = user.uid;
            draft.synced = true;
            draft.lastSyncedAt = Date.now();
          }
        }
      } catch (checkErr) {
        console.warn('Could not read remote doc for timestamp check, proceeding with local draft save:', checkErr);
      }

      if (shouldWriteLocalToCloud) {
        const now = Date.now();
        const documentToSave = {
          id: draft.id,
          userId: user.uid,
          title: draft.title || 'My Resume',
          resumeData: draft.resumeData,
          createdAt: draft.createdAt || now,
          updatedAt: draft.updatedAt || now,
          syncedAt: now,
        };

        await setDoc(resumeDocRef, documentToSave, { merge: true });
        
        draft.userId = user.uid;
        draft.synced = true;
        draft.lastSyncedAt = now;
      }

      syncedCount++;
    } catch (err) {
      console.error(`Failed to sync draft ${draft.id} to Firestore:`, err);
      errors++;
    }
  }

  // Update storage with synced statuses
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.warn('Failed to save synced drafts to localStorage:', err);
  }

  dispatchSyncStatus({
    isSyncing: false,
    syncedCount,
    lastSyncedAt: Date.now(),
    statusMessage: syncedCount > 0 ? 'All offline changes synced!' : undefined,
  });

  return { syncedCount, errors };
}
