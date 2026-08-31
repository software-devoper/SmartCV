import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { checkUsernameAvailable } from '../../lib/authService';
import { Sparkles, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function GoogleUsernameModal() {
  const {
    isGoogleUsernameModalOpen,
    pendingGoogleUser,
    user,
    completeGoogleUsername,
    logout,
  } = useAuth();

  const targetUser = pendingGoogleUser || user;
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suggest default username from Google email
  useEffect(() => {
    if (targetUser && targetUser.email && !username) {
      const prefix = targetUser.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 15);
      setUsername(prefix);
    }
  }, [targetUser]);

  // Debounced username availability checking
  useEffect(() => {
    if (!username.trim()) {
      setIsAvailable(null);
      setErrorMessage(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      const res = await checkUsernameAvailable(username);
      setIsChecking(false);
      setIsAvailable(res.available);
      if (!res.available) {
        setErrorMessage(res.error || 'Username is not available');
      } else {
        setErrorMessage(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  if (!isGoogleUsernameModalOpen || !targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isChecking || isAvailable === false) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await completeGoogleUsername(username.trim());
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to set username. Please try another.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              One Last Step
            </h2>
            <p className="text-xs text-slate-500">
              Welcome, {targetUser.displayName || targetUser.email}!
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Choose a unique username to complete your SmartCV account. This will be your permanent handle for logging in and sharing your resumes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Desired Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span className="font-semibold text-sm">@</span>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="e.g. alex_dev"
                autoFocus
                maxLength={20}
                required
                className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-slate-900 text-sm font-medium transition-all outline-none"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                {isChecking && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                {!isChecking && isAvailable === true && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            {errorMessage && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            {!errorMessage && isAvailable === true && (
              <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>@{username} is available!</span>
              </p>
            )}

            <p className="mt-2 text-[11px] text-slate-400">
              Letters, numbers, and underscores (3-20 characters).
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => logout()}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel / Sign Out
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isChecking || isAvailable !== true}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Profile...</span>
                </>
              ) : (
                <span>Complete Setup</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
