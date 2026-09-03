import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCVStore } from '../store';
import { templates } from '../templates/registry';
import { ZoomIn, ZoomOut, LayoutTemplate, RotateCcw, Maximize2, MousePointerClick } from 'lucide-react';
import TemplateGalleryModal from './TemplateGalleryModal';
import CVRenderer from './CVRenderer';
import { ErrorBoundary } from './common/ErrorBoundary';

const quickSections = [
  { id: 'personal', label: 'Personal' },
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
];

export default function PreviewPanel() {
  const { data, resetData } = useCVStore();
  const [zoom, setZoom] = useState(0.85);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTemplate = templates.find((t) => t.id === data.templateId) || templates[0];
  const TemplateComponent = selectedTemplate.component;

  // Auto-compute fit scale on initial load or resize
  const computeFitScale = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      const targetScale = Math.min(1.1, Math.max(0.45, containerWidth / 820));
      setZoom(Number(targetScale.toFixed(2)));
    }
  }, []);

  useEffect(() => {
    computeFitScale();
    const handleResize = () => computeFitScale();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [computeFitScale]);

  const handleStartOver = () => {
    if (window.confirm('Are you sure you want to clear all data and reset to defaults?')) {
      resetData();
    }
  };

  const handleSectionClick = (sectionId: string) => {
    window.dispatchEvent(
      new CustomEvent('smartcv-edit-section', {
        detail: { sectionId },
      })
    );
  };

  return (
    <div className="flex flex-col h-full relative bg-slate-200/90 dark:bg-slate-950 select-none overflow-hidden transition-colors duration-200">
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-0 right-0 flex justify-center z-20 pointer-events-none px-4">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-900/10 flex items-center gap-2 sm:gap-3 pointer-events-auto transition-all">
          <button 
            type="button"
            onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))} 
            className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-10 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          
          <button 
            type="button"
            onClick={() => setZoom(z => Math.min(1.4, Number((z + 0.1).toFixed(2))))} 
            className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button 
            type="button"
            onClick={computeFitScale}
            className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:inline-flex cursor-pointer"
            title="Fit to Width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
          
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-tight px-1.5 py-1 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-950/40 cursor-pointer"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Change Template</span>
            <span className="sm:hidden">Template</span>
          </button>
          
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
          
          <button 
            type="button"
            onClick={handleStartOver} 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors uppercase tracking-tight px-1.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer" 
            title="Reset All Progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Quick Section Edit Pills */}
      <div className="absolute top-16 left-0 right-0 flex justify-center z-20 pointer-events-none px-4">
        <div className="bg-slate-900/90 dark:bg-slate-850/90 text-white backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-slate-700/60 flex items-center gap-1.5 pointer-events-auto text-[11px] overflow-x-auto max-w-full">
          <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1 shrink-0 mr-1">
            <MousePointerClick className="w-3 h-3 text-blue-400" /> Click to Edit:
          </span>
          {quickSections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => handleSectionClick(sec.id)}
              className="px-2 py-0.5 rounded-md hover:bg-blue-600/80 active:scale-95 text-slate-200 hover:text-white font-medium transition cursor-pointer shrink-0"
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* A4 Preview Canvas Container */}
      <div 
        className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 pt-24 sm:pt-28 flex justify-center custom-scrollbar relative" 
        ref={containerRef}
      >
        <div 
          className="origin-top transition-transform duration-150 ease-out shadow-2xl bg-white rounded-xs mb-12 border border-slate-300/60 shrink-0 cursor-pointer group/canvas"
          style={{ 
            transform: `scale(${zoom})`, 
            width: '210mm', 
            minHeight: '297mm',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
          id="cv-export-container"
          onClick={(e) => {
            // Find if user clicked on a specific section
            const target = e.target as HTMLElement;
            const sectionTarget = target.closest('[data-section-id]') as HTMLElement | null;
            if (sectionTarget?.dataset.sectionId) {
              handleSectionClick(sectionTarget.dataset.sectionId);
            }
          }}
        >
          <ErrorBoundary sectionName="Resume Preview Canvas">
            <CVRenderer TemplateComponent={TemplateComponent} data={data} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Template Switcher Modal */}
      <TemplateGalleryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
