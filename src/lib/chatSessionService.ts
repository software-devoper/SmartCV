import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { ChatSession, ChatMessage, CVData } from '../types';

const LOCAL_STORAGE_SESSIONS_KEY = 'smartcv_local_chat_sessions_v1';
const LOCAL_STORAGE_MESSAGES_PREFIX = 'smartcv_local_chat_msgs_';

// Helper for local storage sessions
function getLocalSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read local sessions:', e);
    return [];
  }
}

function saveLocalSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent('smartcv_local_sessions_changed'));
  } catch (e) {
    console.error('Failed to save local sessions:', e);
  }
}

function getLocalMessages(sessionId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MESSAGES_PREFIX + sessionId);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read local messages:', e);
    return [];
  }
}

function saveLocalMessages(sessionId: string, messages: ChatMessage[]): void {
  try {
    localStorage.setItem(
      LOCAL_STORAGE_MESSAGES_PREFIX + sessionId,
      JSON.stringify(messages)
    );
    window.dispatchEvent(
      new CustomEvent(`smartcv_local_messages_changed_${sessionId}`)
    );
  } catch (e) {
    console.error('Failed to save local messages:', e);
  }
}

// Sync local sessions to Firestore upon login
export async function syncLocalSessionsToCloud(user: User): Promise<void> {
  const localSessions = getLocalSessions();
  if (localSessions.length === 0) return;

  for (const session of localSessions) {
    const path = `users/${user.uid}/chatSessions/${session.id}`;
    try {
      const sessionRef = doc(db, path);
      await setDoc(sessionRef, {
        ...session,
        userId: user.uid,
      });

      // Also sync messages
      const msgs = getLocalMessages(session.id);
      for (const msg of msgs) {
        const msgPath = `users/${user.uid}/chatSessions/${session.id}/messages/${msg.id}`;
        const msgRef = doc(db, msgPath);
        await setDoc(msgRef, msg);
      }
    } catch (err) {
      console.warn(`Could not sync session ${session.id} to cloud:`, err);
    }
  }
}

// Create a new chat session
export async function createChatSession(
  title: string,
  initialResumeData: CVData,
  profilePhotoUrl?: string
): Promise<string> {
  const user = auth.currentUser;
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const sessionData: ChatSession = {
    id: sessionId,
    userId: user ? user.uid : 'guest',
    title: title || 'New AI Resume',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    resumeData: initialResumeData,
    profilePhotoUrl: profilePhotoUrl || '',
  };

  if (user) {
    const path = `users/${user.uid}/chatSessions/${sessionId}`;
    try {
      const sessionRef = doc(db, path);
      await setDoc(sessionRef, sessionData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  } else {
    // Local storage fallback
    const sessions = getLocalSessions();
    sessions.unshift(sessionData);
    saveLocalSessions(sessions);
  }

  return sessionId;
}

// Update resume data inside an active session
export async function updateSessionResumeData(
  sessionId: string,
  resumeData: CVData,
  title?: string
): Promise<void> {
  const user = auth.currentUser;

  if (user) {
    const path = `users/${user.uid}/chatSessions/${sessionId}`;
    try {
      const sessionRef = doc(db, path);
      const updatePayload: any = {
        resumeData,
        updatedAt: Date.now(),
      };
      if (title) updatePayload.title = title;
      await updateDoc(sessionRef, updatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  } else {
    const sessions = getLocalSessions();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].resumeData = resumeData;
      sessions[idx].updatedAt = Date.now();
      if (title) sessions[idx].title = title;
      saveLocalSessions(sessions);
    }
  }
}

// Add a chat message to session
export async function addChatMessage(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<string> {
  const user = auth.currentUser;
  const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const messageData: ChatMessage = {
    ...message,
    id: messageId,
    timestamp: Date.now(),
  };

  if (user) {
    const path = `users/${user.uid}/chatSessions/${sessionId}/messages/${messageId}`;
    try {
      const messageRef = doc(db, path);
      await setDoc(messageRef, messageData);

      const sessionPath = `users/${user.uid}/chatSessions/${sessionId}`;
      const sessionRef = doc(db, sessionPath);
      await updateDoc(sessionRef, { updatedAt: Date.now() }).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  } else {
    const msgs = getLocalMessages(sessionId);
    msgs.push(messageData);
    saveLocalMessages(sessionId, msgs);

    // Also update session timestamp
    const sessions = getLocalSessions();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].updatedAt = Date.now();
      saveLocalSessions(sessions);
    }
  }

  return messageId;
}

// Fetch one-time list of chat sessions
export async function getUserChatSessions(userId?: string): Promise<ChatSession[]> {
  const uid = userId || auth.currentUser?.uid;
  if (!uid) {
    return getLocalSessions();
  }

  const path = `users/${uid}/chatSessions`;
  try {
    const q = query(collection(db, path), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const sessions: ChatSession[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      sessions.push({
        id: docSnap.id,
        userId: d.userId || uid,
        title: d.title || 'Untitled Resume',
        createdAt: d.createdAt || Date.now(),
        updatedAt: d.updatedAt || Date.now(),
        resumeData: d.resumeData,
        profilePhotoUrl: d.profilePhotoUrl,
      });
    });
    return sessions;
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return getLocalSessions();
  }
}

// Subscribe to chat sessions list (Cloud when logged in, local storage otherwise)
export function subscribeToChatSessions(
  onUpdate: (sessions: ChatSession[]) => void,
  onError?: (err: Error) => void
): () => void {
  let firestoreUnsub: (() => void) | null = null;

  const handleLocalUpdate = () => {
    const sessions = getLocalSessions();
    onUpdate(sessions);
  };

  const authUnsub = onAuthStateChanged(auth, (user) => {
    if (firestoreUnsub) {
      firestoreUnsub();
      firestoreUnsub = null;
    }

    if (user) {
      // Sync local to cloud once signed in
      syncLocalSessionsToCloud(user).catch((e) => console.warn('Cloud sync error:', e));

      const path = `users/${user.uid}/chatSessions`;
      try {
        const q = query(collection(db, path), orderBy('updatedAt', 'desc'));
        firestoreUnsub = onSnapshot(
          q,
          (snapshot) => {
            const sessions: ChatSession[] = [];
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              sessions.push({
                id: docSnap.id,
                userId: d.userId || user.uid,
                title: d.title || 'Untitled Resume',
                createdAt: d.createdAt || Date.now(),
                updatedAt: d.updatedAt || Date.now(),
                resumeData: d.resumeData,
                profilePhotoUrl: d.profilePhotoUrl,
              });
            });
            onUpdate(sessions);
          },
          (error) => {
            console.error('Firestore chat sessions listen error:', error);
            handleFirestoreError(error, OperationType.LIST, path);
            if (onError) onError(error);
          }
        );
      } catch (error: any) {
        console.error('Error establishing Firestore session listener:', error);
        if (onError) onError(error);
      }
    } else {
      // Return local sessions
      handleLocalUpdate();
      window.addEventListener('smartcv_local_sessions_changed', handleLocalUpdate);
    }
  });

  return () => {
    authUnsub();
    if (firestoreUnsub) firestoreUnsub();
    window.removeEventListener('smartcv_local_sessions_changed', handleLocalUpdate);
  };
}

// Subscribe to messages in a specific session
export function subscribeToChatMessages(
  sessionId: string,
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: Error) => void
): () => void {
  let firestoreUnsub: (() => void) | null = null;

  const handleLocalUpdate = () => {
    const msgs = getLocalMessages(sessionId);
    onUpdate(msgs);
  };

  const authUnsub = onAuthStateChanged(auth, (user) => {
    if (firestoreUnsub) {
      firestoreUnsub();
      firestoreUnsub = null;
    }

    if (user) {
      const path = `users/${user.uid}/chatSessions/${sessionId}/messages`;
      try {
        const q = query(collection(db, path), orderBy('timestamp', 'asc'));
        firestoreUnsub = onSnapshot(
          q,
          (snapshot) => {
            const messages: ChatMessage[] = [];
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              messages.push({
                id: docSnap.id,
                role: d.role,
                content: d.content,
                type: d.type,
                targetSegment: d.targetSegment,
                timestamp: d.timestamp || Date.now(),
                statusMessage: d.statusMessage,
              });
            });
            onUpdate(messages);
          },
          (error) => {
            console.error('Firestore messages listen error:', error);
            handleFirestoreError(error, OperationType.LIST, path);
            if (onError) onError(error);
          }
        );
      } catch (error: any) {
        console.error('Error establishing messages listener:', error);
        if (onError) onError(error);
      }
    } else {
      handleLocalUpdate();
      window.addEventListener(
        `smartcv_local_messages_changed_${sessionId}`,
        handleLocalUpdate
      );
    }
  });

  return () => {
    authUnsub();
    if (firestoreUnsub) firestoreUnsub();
    window.removeEventListener(
      `smartcv_local_messages_changed_${sessionId}`,
      handleLocalUpdate
    );
  };
}

// Delete chat session
export async function deleteChatSession(sessionId: string): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    const path = `users/${user.uid}/chatSessions/${sessionId}`;
    try {
      const sessionRef = doc(db, path);
      await deleteDoc(sessionRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  } else {
    const sessions = getLocalSessions().filter((s) => s.id !== sessionId);
    saveLocalSessions(sessions);
    localStorage.removeItem(LOCAL_STORAGE_MESSAGES_PREFIX + sessionId);
  }
}

// Rename chat session
export async function renameChatSession(
  sessionId: string,
  newTitle: string
): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    const path = `users/${user.uid}/chatSessions/${sessionId}`;
    try {
      const sessionRef = doc(db, path);
      await updateDoc(sessionRef, {
        title: newTitle,
        updatedAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  } else {
    const sessions = getLocalSessions();
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].title = newTitle;
      sessions[idx].updatedAt = Date.now();
      saveLocalSessions(sessions);
    }
  }
}
