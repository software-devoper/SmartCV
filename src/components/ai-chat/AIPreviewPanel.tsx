import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CVData } from '../../types';
import { templates } from '../../templates/registry';
import CVRenderer from '../CVRenderer';
import ResumeShimmerLoader from './ResumeShimmerLoader';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  LayoutTemplate,
  ChevronDown,
} from 'lucide-react';
import TemplateGalleryModal from '../TemplateGalleryModal';

interface AIPreviewPanelProps {
  data: CVData;
  isLoading: boolean;
  loadingStatus: string;
  activeEditingSegment: string | null;
  onEditSegment: (path: string, title: string, currentValue: any) => void;
  onTemplateChange: (templateId: string) => void;
}

export default function AIPreviewPanel({
  data,
  isLoading,
  loadingStatus,
  activeEditingSegment: _activeEditingSegment,
  onEditSegment,
  onTemplateChange: _onTemplateChange,
}: AIPreviewPanelProps) {
  const [zoom, setZoom] = useState(0.85);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTemplate =
    templates.find((t) => t.id === data.templateId) ||
    templates.find((t) => t.type === data.userType) ||
    templates[0];

  const TemplateComponent = selectedTemplate.component;

  const computeFitScale = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      const targetScale = Math.min(1.05, Math.max(0.45, containerWidth / 820));
      setZoom(Number(targetScale.toFixed(2)));
    }
  }, []);

  useEffect(() => {
    computeFitScale();
    const handleResize = () => computeFitScale();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [computeFitScale]);

  const hasAnyData =
    !!data.fullName ||
    !!data.summary ||
    (data.experience && data.experience.length > 0) ||
    (data.education && data.education.length > 0) ||
    (data.projects && data.projects.length > 0);

  // Handle direct click on resume canvas elements
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const text = target.innerText?.toLowerCase() || '';

    if (text.includes('education') || target.closest('[data-section="education"]')) {
      onEditSegment('education', 'Education', data.education);
    } else if (text.includes('experience') || text.includes('employment') || target.closest('[data-section="experience"]')) {
      onEditSegment('experience', 'Work Experience', data.experience);
    } else if (text.includes('project') || target.closest('[data-section="projects"]')) {
      onEditSegment('projects', 'Key Projects', data.projects);
    } else if (text.includes('skill') || target.closest('[data-section="skills"]')) {
      onEditSegment('skills', 'Skills & Competencies', data.skills);
    } else if (text.includes('summary') || text.includes('profile') || target.closest('[data-section="summary"]')) {
      onEditSegment('summary', 'Career Summary', data.summary);
    } else if (text.includes('certification') || target.closest('[data-section="certifications"]')) {
      onEditSegment('certifications', 'Certifications', data.certifications);
    } else {
      // Default to summary or personal details if clicked near the top
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY < 200) {
        onEditSegment('personal', 'Personal & Title', `${data.fullName || ''} - ${data.title || ''}`);
      } else {
        onEditSegment('summary', 'Career Summary', data.summary || '');
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-slate-950 select-none overflow-hidden">
      {/* Floating Toolbar */}
      <div className="absolute top-3 left-0 right-0 flex justify-center z-20 pointer-events-none px-4">
        <div className="bg-slate-900/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-800 shadow-xl flex items-center gap-2 sm:gap-3 pointer-events-auto transition-all">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
            className="p-1 sm:p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-200 w-10 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
            className="p-1 sm:p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={computeFitScale}
            className="p-1 sm:p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors hidden sm:inline-flex cursor-pointer"
            title="Fit to Width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-800" />

          {/* Template Switcher */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-blue-400 transition-colors uppercase tracking-tight px-2 py-1 rounded-lg hover:bg-blue-950/40 cursor-pointer"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">{selectedTemplate.name}</span>
            <span className="sm:hidden">Template</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* A4 Preview Canvas Container */}
      <div
        className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 pt-16 sm:pt-20 flex justify-center custom-scrollbar relative"
        ref={containerRef}
      >
        <div
          className="origin-top transition-transform duration-150 ease-out shadow-2xl bg-white rounded-xs mb-12 border border-slate-800 shrink-0 cursor-pointer group/canvas relative hover:ring-2 hover:ring-blue-500/50"
          style={{
            transform: `scale(${zoom})`,
            width: '210mm',
            minHeight: '297mm',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
          id="cv-export-container"
          onClick={handleCanvasClick}
          title="Click any section on the resume to edit with AI"
        >
          {isLoading && !hasAnyData ? (
            <ResumeShimmerLoader statusText={loadingStatus} />
          ) : (
            <div id="cv-renderer-root" className="relative text-slate-900">
              <CVRenderer TemplateComponent={TemplateComponent} data={data} />
            </div>
          )}
        </div>
      </div>

      {/* Template Modal */}
      <TemplateGalleryModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  );
}
