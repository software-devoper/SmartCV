import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Sparkles,
  Bot,
  Layers,
  FileText,
  LogOut,
  User as UserIcon,
  Trash2,
  Cloud,
  ChevronDown,
  X,
  AlertTriangle,
  Loader2,
  Settings,
  Key,
  WifiOff,
} from 'lucide-react';
import ApiKeySettingsModal from '../settings/ApiKeySettingsModal';
import { listUserApiKeysClient } from '../../lib/apiKeyService';
import { UserApiKeyMetadata } from '../../types';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface AppNavbarProps {
  currentMode?: 'dashboard' | 'chat' | 'builder' | 'templates';
}

export default function AppNavbar({ currentMode }: AppNavbarProps) {
  const { user, userProfile, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [userKeys, setUserKeys] = useState<UserApiKeyMetadata[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUserKeys = async () => {
    if (user) {
      try {
        const keys = await listUserApiKeysClient();
        setUserKeys(keys);
      } catch (err) {
        console.error('Failed to load user keys:', err);
      }
    }
  };

  useEffect(() => {
    loadUserKeys();
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccount();
      setIsSettingsModalOpen(false);
      navigate('/');
    } catch (err: any) {
      console.error('Delete account error:', err);
      setDeleteError(err.message || 'Failed to delete account. You may need to log in again first.');
    } finally {
      setIsDeleting(false);
    }
  };

  const username = userProfile?.username || user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = userProfile?.email || user?.email || '';

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <img
                src="/android-chrome-192x192.png"
                alt="SmartCV"
                className="w-8 h-8 rounded-xl object-contain shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform"
              />
              <span className="text-lg font-black tracking-tight text-white">SmartCV</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/chat'
                    ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50'
                    : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/60'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Chat Builder</span>
              </Link>
              <Link
                to="/builder"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/builder'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Form Editor</span>
              </Link>
              <Link
                to="/templates"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/templates'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Templates</span>
              </Link>
            </nav>
          </div>

          {/* Right User & Cloud status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Install PWA App Button */}
            <div className="hidden md:block">
              <PWAInstallButton compact />
            </div>

            {isOnline ? (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-emerald-400 font-medium font-mono">
                <Cloud className="w-3 h-3" />
                <span>Cloud Synced</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-[11px] text-amber-300 font-bold font-mono">
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span>Offline Mode</span>
              </div>
            )}

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={username}
                    className="w-6 h-6 rounded-full object-cover border border-slate-600 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    {username[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline font-bold max-w-[100px] truncate">
                  @{username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in text-slate-200">
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">@{username}</p>
                    <p className="text-[11px] text-slate-400 truncate">{email}</p>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Resume Dashboard</span>
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span>AI Chat Builder</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsApiKeyModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Key className="w-4 h-4 text-emerald-400" />
                        <span>AI Provider & Keys</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {userKeys.length > 0 ? `${userKeys.length} active` : 'Set Key'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsSettingsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  <div className="p-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* AI Key Settings Modal */}
      <ApiKeySettingsModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeysUpdated={loadUserKeys}
      />

      {/* Account Settings & Delete Account Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-200 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Account Settings
                </h3>
                <p className="text-xs text-slate-400">Manage your profile and data</p>
              </div>
            </div>

            {/* Profile Info Card */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 mb-6 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Username:</span>
                <span className="font-bold text-white">@{username}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-white">{email}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">User ID:</span>
                <span className="font-mono text-[10px] text-slate-400">{user?.uid}</span>
              </div>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Danger Zone: Delete Account</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deleting your account will permanently delete all your saved resumes, chat histories, and release your unique username. This action cannot be undone.
              </p>

              {deleteError && (
                <p className="text-xs text-red-400 font-medium">{deleteError}</p>
              )}

              <form onSubmit={handleDeleteAccount} className="space-y-2 pt-2">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Type <span className="font-bold text-red-400">DELETE</span> to confirm:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-red-500/40 rounded-xl text-white text-xs font-mono outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete Account</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
