import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { checkUsernameAvailable, isAppInIframe } from '../../lib/authService';
import {
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Check,
  ExternalLink,
} from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Debounced username checking
  useEffect(() => {
    if (!username.trim()) {
      setUsernameAvailable(null);
      setUsernameError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      const res = await checkUsernameAvailable(username);
      setIsCheckingUsername(false);
      setUsernameAvailable(res.available);
      setUsernameError(res.available ? null : res.error || 'Username is taken');
    }, 450);

    return () => clearTimeout(timer);
  }, [username]);

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 1, label: 'Weak', color: 'bg-red-500' };
    }
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validations
    if (!username.trim()) {
      setFormError('Please enter a username.');
      return;
    }
    if (usernameAvailable === false) {
      setFormError(usernameError || 'Please choose an available username.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await signup(username.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setFormError('An account with this email already exists. Please log in.');
      } else if (err.code === 'auth/weak-password') {
        setFormError('Password is too weak. Please use at least 8 characters.');
      } else {
        setFormError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setFormError(null);
    setIsGoogleLoading(true);
    try {
      const { needsUsername } = await loginWithGoogle();
      if (!needsUsername) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Google signup error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User voluntarily closed popup
      } else if (err.code === 'auth/popup-blocked') {
        setFormError('Popups are blocked by your browser or preview environment. Please open the app in a new tab to sign in with Google, or sign up with username & email below.');
      } else {
        setFormError(err.message || 'Google sign up failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 group mb-6">
          <img
            src="/android-chrome-192x192.png"
            alt="SmartCV"
            className="w-10 h-10 rounded-2xl object-contain shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform"
          />
          <span className="text-2xl font-extrabold tracking-tight text-white">SmartCV</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Start building job-winning resumes in seconds with AI.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-700/60">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 text-slate-700 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Sign up with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-3 text-slate-400 font-semibold tracking-wider">
                Or sign up with email
              </span>
            </div>
          </div>

          {formError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{formError}</span>
              </div>
              {(formError.includes('Popups') || formError.includes('popup') || isAppInIframe()) && (
                <div className="pt-1 pl-6">
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm transition-all"
                  >
                    <span>Open App in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="font-semibold text-sm">@</span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="e.g. janesmith"
                  required
                  maxLength={20}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 text-sm font-medium outline-none transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  {isCheckingUsername && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                  {!isCheckingUsername && usernameAvailable === true && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {!isCheckingUsername && usernameAvailable === false && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
              {usernameError && (
                <p className="mt-1 text-[11px] text-red-400">{usernameError}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 text-sm font-medium outline-none transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 text-sm font-medium outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Strength:</span>
                    <span className="font-semibold text-slate-300">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          strength.score >= step ? strength.color : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 text-sm font-medium outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
