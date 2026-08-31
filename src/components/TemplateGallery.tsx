import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCVStore } from '../store';
import { templates, TemplateDefinition } from '../templates/registry';
import { FileText, Briefcase, GraduationCap, ArrowRight, Sparkles, Check, ArrowLeft } from 'lucide-react';
import { CVData } from '../types';

const dummyData: CVData = {
  templateId: '',
  userType: 'professional',
  fullName: 'Alex Rivera',
  title: 'Senior Software Engineer',
  summary: 'Full-stack software engineer with 5+ years of experience building scalable distributed web applications.',
  contact: {
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexrivera'
  },
  education: [
    { id: '1', institution: 'University of California, Berkeley', degree: 'B.S.', field: 'Computer Science', startDate: '2016', endDate: '2020', gpa: '3.85' }
  ],
  experience: [
    {
      id: '1',
      company: 'Apex Cloud Systems',
      role: 'Senior Software Engineer',
      startDate: '2020',
      endDate: 'Present',
      bullets: [
        'Architected real-time streaming pipeline processing 10M+ daily events',
        'Reduced p99 API response latencies by 42% via Redis caching layer'
      ]
    }
  ],
  projects: [
    {
      id: '1',
      title: 'Distributed Key-Value Store',
      description: 'Built a high-throughput consensus-backed storage engine with Raft protocol.',
      tools: 'Go, Raft, gRPC, Docker'
    }
  ],
  skills: [
    { id: '1', category: 'Languages & Systems', items: ['TypeScript', 'Go', 'Python', 'PostgreSQL', 'React'] }
  ],
  certifications: [],
  achievements: [],
  languages: [],
  extracurriculars: [],
  references: 'available_on_request',
  customSections: [],
  sectionOrder: ['personal', 'summary', 'contact', 'experience', 'education', 'projects', 'skills'],
  sectionVisibility: {
    personal: true, summary: true, contact: true, experience: true, education: true, projects: true, skills: true
  }
};

function GalleryThumbnail({ template }: { template: TemplateDefinition }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newScale = entry.contentRect.width / 794;
        setScale(newScale);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const TemplateComponent = template.component;

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden relative transition-all group-hover:shadow-md group-hover:border-blue-300 ${template.thumbnailClass}`}
      style={{ aspectRatio: '21 / 29.7' }}
    > 
      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors z-10 pointer-events-none" />
      <div 
        className="absolute top-0 left-0 origin-top-left pointer-events-none" 
        style={{ width: '794px', height: '1123px', transform: `scale(${scale})` }}
      >
        <TemplateComponent data={dummyData} />
      </div>
    </div>
  );
}

export default function TemplateGallery({ onStartWithAIChat }: { onStartWithAIChat?: () => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'student' | 'professional'>('student');
  const setTemplate = useCVStore(state => state.setTemplate);

  const filteredTemplates = templates.filter(t => t.type === activeTab);

  const handleSelect = (templateId: string) => {
    setTemplate(templateId, activeTab);
    navigate('/builder');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs shadow-blue-500/20 text-white font-bold text-lg group-hover:scale-105 transition-transform">
                <span>S</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">SmartCV</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/chat"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Build with AI Chat</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Select your starting template
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Choose a layout designed specifically for your experience level. You can easily modify content, section order, and design anytime.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-200/70 p-1.5 rounded-2xl flex gap-1.5 shadow-inner border border-slate-200/80">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'student' 
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-900/5' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student & Entry Level
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'professional' 
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-900/5' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Working Professional
            </button>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTemplates.map(template => (
            <div 
              key={template.id} 
              className="group bg-white p-3 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <GalleryThumbnail template={template} />
                <div className="mt-3 mb-3">
                  <h3 className="font-bold text-sm text-slate-900">{template.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{template.type} layout</p>
                </div>
              </div>
              <button
                onClick={() => handleSelect(template.id)}
                className="w-full py-2 bg-slate-900 group-hover:bg-blue-600 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
