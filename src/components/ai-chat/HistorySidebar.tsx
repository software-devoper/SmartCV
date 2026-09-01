import React, { useState, useEffect } from 'react';
import { ChatSession } from '../../types';
import {
  MessageSquarePlus,
  Trash2,
  Edit2,
  Clock,
  ChevronLeft,
  Sparkles,
  Check,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  Cloud,
  Loader2,
} from 'lucide-react';
import { auth, signInWithGoogle, logOut } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface HistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectSession: (session: ChatSession) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onRenameSession: (sessionId: string, newTitle: string) => Promise<void>;
}

export default function HistorySidebar({
  sessions,
  activeSessionId,
  isOpen,
  onToggle,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
}: HistorySidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Google Sign in error:', e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    try {
      await logOut();
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = async (sessionId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      await onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (deletingId) return;

    if (window.confirm('Are you sure you want to permanently delete this resume?')) {
      setDeletingId(sessionId);
      try {
        await onDeleteSession(sessionId);
      } catch (err) {
        console.error('Error deleting session:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-200 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'w-72 md:w-80 shadow-2xl' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden'
        }`}
      >
        {isOpen && (
          <div className="flex flex-col h-full w-72 md:w-80">
            {/* Header / New Session Button */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onNewSession}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-98 cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>New AI Resume</span>
              </button>

              <button
                type="button"
                onClick={onToggle}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <span>Resume History ({sessions.length})</span>
                {currentUser && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium lowercase">
                    <Cloud className="w-3 h-3" />
                    <span>cloud synced</span>
                  </span>
                )}
              </div>

              {sessions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 space-y-2">
                  <Sparkles className="w-6 h-6 mx-auto text-slate-600 opacity-60" />
                  <p className="text-xs">No saved resume chats yet. Start a new session above!</p>
                </div>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const isEditing = editingId === session.id;

                  return (
                    <div
                      key={session.id}
                      onClick={() => onSelectSession(session)}
                      className={`group relative flex items-start gap-2.5 p-3 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? 'bg-slate-800 text-white border border-blue-500/40 shadow-xs'
                          : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 text-blue-400 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <form
                            onSubmit={(e) => handleSaveRename(session.id, e)}
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              autoFocus
                              className="w-full bg-slate-950 text-white text-xs px-2 py-1 rounded border border-blue-500 outline-none"
                            />
                            <button
                              type="submit"
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 text-slate-400 hover:text-slate-200"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        ) : (
                          <>
                            <p className="text-xs font-semibold truncate leading-snug">
                              {session.title || 'Untitled Resume'}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{formatDate(session.updatedAt || session.createdAt)}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action buttons (Rename & Delete) */}
                      {!isEditing && (
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => startRename(session, e)}
                            className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-700/60 cursor-pointer"
                            title="Rename session"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(session.id, e)}
                            disabled={deletingId === session.id}
                            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700/60 cursor-pointer disabled:opacity-50"
                            title="Delete session"
                          >
                            {deletingId === session.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Auth Card */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/50">
              {currentUser ? (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="User"
                        className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate leading-tight">
                        {currentUser.displayName || currentUser.email || 'Signed in'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">Cloud sync active</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isAuthLoading}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isAuthLoading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-200 border border-slate-700/80 font-medium text-xs py-2 px-3 rounded-xl transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isAuthLoading ? 'Connecting...' : 'Sign in to Backup & Sync'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
