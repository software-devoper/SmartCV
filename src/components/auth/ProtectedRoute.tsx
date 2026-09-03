import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center animate-pulse p-2.5">
            <img
              src="/android-chrome-192x192.png"
              alt="SmartCV Loading"
              className="w-full h-full object-contain animate-bounce"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-400 tracking-wide">
          Loading SmartCV...
        </p>
      </div>
    );
  }

  if (!user) {
    // If offline and trying to access the offline resume editor, allow guest access
    if (typeof navigator !== 'undefined' && !navigator.onLine && (location.pathname === '/builder' || location.pathname === '/templates')) {
      return <>{children}</>;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
