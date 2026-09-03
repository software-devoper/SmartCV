import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import GoogleUsernameModal from './components/auth/GoogleUsernameModal';
import OfflineBanner from './components/common/OfflineBanner';
import PWAUpdateToast from './components/common/PWAUpdateToast';
import PageTransition from './components/common/PageTransition';
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
      <PageTransition>
        <ChatBuilderPage onSwitchToFormMode={() => navigate('/builder')} />
      </PageTransition>
    </ErrorBoundary>
  );
}

function BuilderWrapper() {
  const navigate = useNavigate();
  return (
    <ErrorBoundary sectionName="Resume Editor" showHomeButton>
      <PageTransition>
        <Builder onSwitchToAIChat={() => navigate('/chat')} />
      </PageTransition>
    </ErrorBoundary>
  );
}

function AppRoutes() {
  const { isGoogleUsernameModalOpen } = useAuth();

  return (
    <>
      <OfflineBanner />
      {isGoogleUsernameModalOpen && <GoogleUsernameModal />}
      <Routes>
        {/* Public Landing Page */}
        <Route
          path="/"
          element={
            <ErrorBoundary sectionName="Landing Page">
              <PageTransition>
                <LandingPage />
              </PageTransition>
            </ErrorBoundary>
          }
        />

        {/* Public-only Auth Pages (redirects to /dashboard if already logged in) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <ErrorBoundary sectionName="Sign In">
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              </ErrorBoundary>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <ErrorBoundary sectionName="Sign Up">
                <PageTransition>
                  <SignupPage />
                </PageTransition>
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
                <PageTransition>
                  <DashboardPage />
                </PageTransition>
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
                <PageTransition>
                  <TemplateGallery />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PWAUpdateToast />
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
