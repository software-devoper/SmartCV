import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import GoogleUsernameModal from './components/auth/GoogleUsernameModal';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import DashboardPage from './components/dashboard/DashboardPage';
import ChatBuilderPage from './components/ai-chat/ChatBuilderPage';
import Builder from './components/Builder';
import TemplateGallery from './components/TemplateGallery';

function ChatWrapper() {
  const navigate = useNavigate();
  return <ChatBuilderPage onSwitchToFormMode={() => navigate('/builder')} />;
}

function BuilderWrapper() {
  const navigate = useNavigate();
  return <Builder onSwitchToAIChat={() => navigate('/chat')} />;
}

function AppRoutes() {
  const { isGoogleUsernameModalOpen } = useAuth();

  return (
    <>
      {isGoogleUsernameModalOpen && <GoogleUsernameModal />}
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public-only Auth Pages (redirects to /dashboard if already logged in) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected App Routes (requires auth) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <BuilderWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <TemplateGallery />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
