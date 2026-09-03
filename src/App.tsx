import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
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
  return (
    <ErrorBoundary sectionName="AI Chat Builder" showHomeButton>
      <ChatBuilderPage onSwitchToFormMode={() => navigate('/builder')} />
    </ErrorBoundary>
  );
}

function BuilderWrapper() {
  const navigate = useNavigate();
  return (
    <ErrorBoundary sectionName="Resume Editor" showHomeButton>
      <Builder onSwitchToAIChat={() => navigate('/chat')} />
    </ErrorBoundary>
  );
}

function AppRoutes() {
  const { isGoogleUsernameModalOpen } = useAuth();

  return (
    <>
      {isGoogleUsernameModalOpen && <GoogleUsernameModal />}
      <Routes>
        {/* Public Landing Page */}
        <Route
          path="/"
          element={
            <ErrorBoundary sectionName="Landing Page">
              <LandingPage />
            </ErrorBoundary>
          }
        />

        {/* Public-only Auth Pages (redirects to /dashboard if already logged in) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <ErrorBoundary sectionName="Sign In">
                <LoginPage />
              </ErrorBoundary>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <ErrorBoundary sectionName="Sign Up">
                <SignupPage />
              </ErrorBoundary>
            </PublicOnlyRoute>
          }
        />

        {/* Protected App Routes (requires auth) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ErrorBoundary sectionName="Dashboard" showHomeButton>
                <DashboardPage />
              </ErrorBoundary>
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
              <ErrorBoundary sectionName="Template Gallery" showHomeButton>
                <TemplateGallery />
              </ErrorBoundary>
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
    <ErrorBoundary showHomeButton>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
