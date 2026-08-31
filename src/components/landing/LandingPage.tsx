import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { templates } from '../../templates/registry';
import { useCVStore } from '../../store';
import {
  Sparkles,
  Bot,
  Layers,
  FileCheck2,
  Sliders,
  ArrowRight,
  CheckCircle2,
  Download,
  GraduationCap,
  Briefcase,
  Star,
  Shield,
  Zap,
  MousePointerClick,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const setTemplate = useCVStore((state) => state.setTemplate);
  const [templateFilter, setTemplateFilter] = useState<'all' | 'student' | 'professional'>('all');

  const filteredTemplates = templates.filter((t) =>
    templateFilter === 'all' ? true : t.type === templateFilter
  );

  const handleSelectTemplate = (templateId: string, type: 'student' | 'professional') => {
    setTemplate(templateId, type);
    if (user) {
      navigate('/builder');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">SmartCV</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#templates" className="hover:text-blue-400 transition-colors">
              Templates
            </a>
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">
              How It Works
            </a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-98 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Gemini 3.7 Flash AI Resume Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Build a Job-Winning Resume in Minutes with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                AI Precision
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Transform messy bullet points or rough drafts into ATS-optimized, beautifully structured resumes. Powered by conversational AI, 14+ handcrafted templates, and instant PDF downloads.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all active:scale-98 cursor-pointer"
              >
                <span>{user ? 'Open Your Dashboard' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={user ? '/chat' : '/signup'}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-semibold text-sm sm:text-base transition-all active:scale-98 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Try AI Chat Builder</span>
              </Link>
            </div>

            {/* Social Trust Highlights */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% ATS Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Vector PDF Export</span>
              </div>
            </div>
          </div>

          {/* Interactive Resume Visual Showcase Mockup */}
          <div className="mt-14 max-w-5xl mx-auto relative">
            <div className="p-2 sm:p-3 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative">
              {/* Top Mac Window Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-500 hidden sm:inline">
                    smartcv.app/live-preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" />
                    <span>98% ATS Score</span>
                  </span>
                </div>
              </div>

              {/* Mock App Split View */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-6 bg-slate-950 rounded-2xl">
                {/* Left Mini Chat Simulator */}
                <div className="md:col-span-5 flex flex-col justify-between space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <Bot className="w-4 h-4 text-blue-400" />
                      <span>SmartCV AI Architect</span>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-xl text-xs text-slate-300 space-y-1">
                      <p className="text-[10px] text-blue-400 font-bold uppercase">Prompt</p>
                      <p>"I led the redesign of our checkout flow at Stripe, cutting drop-offs by 24%."</p>
                    </div>

                    <div className="bg-blue-950/40 border border-blue-800/40 p-3 rounded-xl text-xs text-slate-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[10px] uppercase">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Formatted Impact</span>
                      </div>
                      <p className="leading-relaxed">
                        • Spearheaded end-to-end checkout redesign, decreasing transaction friction and reducing checkout drop-off rate by 24% across 12M monthly transactions.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Target: Senior Product Engineer</span>
                    <span className="text-emerald-400 font-semibold">1-Click Live Update</span>
                  </div>
                </div>

                {/* Right Mini Resume Document */}
                <div className="md:col-span-7 bg-white text-slate-900 p-5 sm:p-6 rounded-xl shadow-inner font-sans space-y-3 text-left">
                  <div className="border-b border-slate-200 pb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-slate-900">
                        Alex Rivera
                      </h3>
                      <p className="text-xs font-semibold text-blue-600">
                        Senior Software Engineer • San Francisco, CA
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600">
                      Executive Frame
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Executive Summary
                    </h4>
                    <p className="text-xs text-slate-700 leading-snug">
                      High-impact full-stack engineer with 6+ years driving scalable distributed services and customer-facing web applications.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Experience
                    </h4>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Apex Cloud Systems</span>
                        <span className="text-slate-500 font-normal">2021 — Present</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        • Architected real-time streaming pipeline processing 10M+ daily events with 99.99% uptime.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-slate-900/50 border-t border-slate-850 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Engineered For Results
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything you need to land interviews
            </h3>
            <p className="text-sm sm:text-base text-slate-400">
              Modern tooling built specifically for job seekers who want professional resumes without tedious formatting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">AI Chat Builder</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Describe your background in plain language. Gemini 3.7 Flash automatically organizes your history, education, and achievements into structured sections.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">14+ Handcrafted Templates</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Choose between tailored layouts for students, graduates, engineers, and executives. Swap templates at any time without re-typing content.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">ATS-Friendly Architecture</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Built to pass Applicant Tracking Systems. Semantic markup, clean typography hierarchy, and recruiter-approved standard formatting.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Click-to-Edit Precision</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Hover and click any single bullet point or summary on the live preview to ask AI to rewrite, sharpen tone, or quantify metrics on demand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Showcase Section */}
      <section id="templates" className="py-20 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
                Template Gallery
              </h2>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                Designed for every career stage
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start">
              <button
                onClick={() => setTemplateFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  templateFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All (14)
              </button>
              <button
                onClick={() => setTemplateFilter('student')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  templateFilter === 'student'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Student & Entry
              </button>
              <button
                onClick={() => setTemplateFilter('professional')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  templateFilter === 'professional'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Executive & Pro
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTemplates.slice(0, 8).map((template) => (
              <div
                key={template.id}
                className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-blue-500/60 hover:shadow-2xl transition-all duration-200 flex flex-col justify-between p-3.5"
              >
                <div
                  className={`w-full rounded-xl flex items-center justify-center p-6 mb-3 aspect-[21/28] relative overflow-hidden border ${template.thumbnailClass}`}
                >
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors" />
                  <div className="w-4/5 h-4/5 bg-white/90 rounded-md shadow-lg p-3 flex flex-col gap-2 scale-95 group-hover:scale-100 transition-transform">
                    <div className="w-1/3 h-2 bg-slate-800 rounded-full" />
                    <div className="w-1/2 h-1.5 bg-blue-600 rounded-full" />
                    <div className="w-full h-px bg-slate-200 my-1" />
                    <div className="space-y-1">
                      <div className="w-full h-1 bg-slate-400 rounded-full" />
                      <div className="w-4/5 h-1 bg-slate-300 rounded-full" />
                      <div className="w-3/5 h-1 bg-slate-300 rounded-full" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">{template.name}</h4>
                    <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 py-0.5 rounded bg-slate-800">
                      {template.type}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate(template.id, template.type)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-blue-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to={user ? '/templates' : '/signup'}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300"
            >
              <span>Explore all 14 templates</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-900/40 border-t border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Simple 3-Step Process
            </h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              From draft to interview-ready in 3 minutes
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center mb-5">
                1
              </div>
              <h4 className="text-base font-bold text-white mb-2">Prompt Your Background</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Type rough notes or chat conversationally about your experience, courses, and skills. Attach a photo if desired.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center mb-5">
                2
              </div>
              <h4 className="text-base font-bold text-white mb-2">AI Builds Your Resume</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Gemini formats your points with action verbs, quantifies metrics, and populates the live A4 preview in real-time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center mb-5">
                3
              </div>
              <h4 className="text-base font-bold text-white mb-2">Refine & Export PDF</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Use click-to-edit to polish individual lines or switch templates with 1-click. Export crisp, print-ready PDF files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-slate-950 to-blue-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Ready to stand out to hiring managers?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join thousands of job seekers creating tailored, high-converting resumes in minutes with SmartCV.
          </p>
          <div className="pt-2">
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-2xl shadow-blue-600/40 transition-all active:scale-98 cursor-pointer"
            >
              <span>{user ? 'Go to Your Dashboard' : 'Create Your Free Resume Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-300 text-sm">SmartCV</span>
            <span className="text-slate-600">© 2026 SmartCV AI Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#templates" className="hover:text-white transition-colors">
              Templates
            </a>
            <Link to="/login" className="hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="hover:text-white transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
