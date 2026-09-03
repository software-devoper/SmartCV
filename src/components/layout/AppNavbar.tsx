import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  Menu,
} from 'lucide-react';
import ApiKeySettingsModal from '../settings/ApiKeySettingsModal';
import ResponsiveModal from '../common/ResponsiveModal';
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [userKeys, setUserKeys] = useState<UserApiKeyMetadata[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

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
    setIsMobileMenuOpen(false);
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
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white font-sans">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Left: Brand Logo & Wordmark */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group touch-target">
              <img
                src="/android-chrome-192x192.png"
                alt="SmartCV Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform shrink-0"
              />
              <span className="text-base sm:text-lg font-black tracking-tight text-white">SmartCV</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl transition-all duration-150 active:scale-95 ${
                  location.pathname === '/dashboard'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-150 active:scale-95 ${
                  location.pathname === '/chat'
                    ? 'bg-purple-950/70 text-purple-300 border border-purple-800/60 shadow-xs'
                    : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/60'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Chat Builder</span>
              </Link>
              <Link
                to="/builder"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-150 active:scale-95 ${
                  location.pathname === '/builder'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Form Editor</span>
              </Link>
              <Link
                to="/templates"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-150 active:scale-95 ${
                  location.pathname === '/templates'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Templates</span>
              </Link>
            </nav>
          </div>

          {/* Right: Cloud Sync, Keys, Account & Mobile Hamburger Button */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Install PWA App Button (Desktop & Tablet) */}
            <div className="hidden sm:block">
              <PWAInstallButton compact />
            </div>

            {/* Cloud & Offline Status Pill */}
            {isOnline ? (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/60 text-[11px] text-emerald-400 font-medium font-mono">
                <Cloud className="w-3 h-3" />
                <span>Cloud Synced</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-800/60 text-[11px] text-amber-300 font-bold font-mono animate-pulse">
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="hidden xs:inline">Offline</span>
              </div>
            )}

            {/* User Account Dropdown (Desktop/Tablet) */}
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-all duration-150 active:scale-95 cursor-pointer min-h-[40px]"
                aria-label="User account menu"
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
                <span className="font-bold max-w-[110px] truncate">
                  @{username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 text-slate-200"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">@{username}</p>
                      <p className="text-[11px] text-slate-400 truncate">{email}</p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-800 transition-all duration-150 active:scale-98"
                      >
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>Resume Dashboard</span>
                      </Link>
                      <Link
                        to="/chat"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-800 transition-all duration-150 active:scale-98"
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
                        className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-150 active:scale-98 cursor-pointer"
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-150 active:scale-98 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Account Settings</span>
                      </button>
                    </div>

                    <div className="p-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-150 active:scale-98 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Animated Hamburger Button (STRICTLY HIDDEN on desktop/windows md:hidden) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden items-center justify-center p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 transition-all duration-150 active:scale-95 cursor-pointer min-w-[44px] min-h-[44px]"
              aria-label="Toggle mobile menu"
            >
              <div className="w-5 h-4 relative flex flex-col justify-between items-center">
                <span
                  className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-current rounded-full transition-all duration-200 ease-in-out ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-xl"
            >
              <div className="p-4 space-y-3">
                {/* User Profile Summary */}
                <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={username}
                      className="w-10 h-10 rounded-full object-cover border border-slate-600 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {username[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">@{username}</p>
                    <p className="text-xs text-slate-400 truncate">{email || 'SmartCV User'}</p>
                  </div>
                  {isOnline ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      Online
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">
                      Offline
                    </span>
                  )}
                </div>

                {/* Primary Nav Links */}
                <nav className="space-y-1 font-semibold text-sm">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                      location.pathname === '/dashboard'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                      location.pathname === '/chat'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Bot className="w-5 h-5 text-purple-400" />
                    <span>AI Chat Builder</span>
                  </Link>
                  <Link
                    to="/builder"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                      location.pathname === '/builder'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span>Form Editor</span>
                  </Link>
                  <Link
                    to="/templates"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                      location.pathname === '/templates'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Layers className="w-5 h-5 text-slate-400" />
                    <span>Templates Gallery</span>
                  </Link>
                </nav>

                {/* Secondary Actions */}
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsApiKeyModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-3 text-sm rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-emerald-400" />
                      <span>AI Keys & Provider</span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {userKeys.length > 0 ? `${userKeys.length} active` : 'Set Key'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-sm rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                  >
                    <Settings className="w-5 h-5 text-slate-400" />
                    <span>Account Settings</span>
                  </button>

                  {/* PWA Install in Mobile Drawer */}
                  <div className="py-2">
                    <PWAInstallButton />
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-sm rounded-xl text-red-400 hover:bg-red-500/10 font-bold transition-all cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* AI Key Settings Modal */}
      <ApiKeySettingsModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeysUpdated={loadUserKeys}
      />

      {/* Responsive Account Settings & Delete Account Modal */}
      <ResponsiveModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Account Settings"
        subtitle="Manage your profile, credentials, and data"
        icon={<Settings className="w-6 h-6 text-blue-400" />}
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-6">
          {/* Profile Info Card */}
          <div className="bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700/60 space-y-2.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-400">Username:</span>
              <span className="font-bold text-white">@{username}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-400">Email:</span>
              <span className="font-bold text-white truncate max-w-[200px] sm:max-w-none">{email}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-400">User ID:</span>
              <span className="font-mono text-[11px] text-slate-400">{user?.uid}</span>
            </div>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Danger Zone: Delete Account</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deleting your account will permanently delete all your saved resumes, chat histories, and release your unique username. This action cannot be undone.
            </p>

            {deleteError && (
              <p className="text-xs text-red-400 font-medium">{deleteError}</p>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300">
                Type <span className="font-bold text-red-400 font-mono">DELETE</span> to confirm:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-red-500/40 rounded-xl text-white text-xs sm:text-sm font-mono outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
                <button
                  type="submit"
                  disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                  className="touch-target px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/20 active:scale-95"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </ResponsiveModal>
    </>
  );
}
