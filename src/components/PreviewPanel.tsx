import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCVStore } from '../store';
import { templates } from '../templates/registry';
import { ZoomIn, ZoomOut, LayoutTemplate, RotateCcw, Maximize2 } from 'lucide-react';
import TemplateGalleryModal from './TemplateGalleryModal';
import CVRenderer from './CVRenderer';

export default function PreviewPanel() {
  const { data, resetData } = useCVStore();
  const [zoom, setZoom] = useState(0.85);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTemplate = templates.find(t => t.id === data.templateId) || templates[0];
  const TemplateComponent = selectedTemplate.component;

  // Auto-compute fit scale on initial load or resize
  const computeFitScale = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48; // padding
      // 210mm in pixels at standard 96dpi is ~794px
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
    if (window.confirm("Are you sure you want to clear all data and reset to defaults?")) {
      resetData();
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-slate-200/90 select-none overflow-hidden">
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-0 right-0 flex justify-center z-20 pointer-events-none px-4">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200/80 shadow-lg shadow-slate-900/10 flex items-center gap-2 sm:gap-3 pointer-events-auto transition-all">
          <button 
            type="button"
            onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))} 
            className="p-1 sm:p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-bold text-slate-700 w-10 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          
          <button 
            type="button"
            onClick={() => setZoom(z => Math.min(1.4, Number((z + 0.1).toFixed(2))))} 
            className="p-1 sm:p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button 
            type="button"
            onClick={computeFitScale}
            className="p-1 sm:p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors hidden sm:inline-flex"
            title="Fit to Width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          
          <div className="w-px h-4 bg-slate-200"></div>
          
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors uppercase tracking-tight px-1.5 py-1 rounded-lg hover:bg-blue-50/50"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Change Template</span>
            <span className="sm:hidden">Template</span>
          </button>
          
          <div className="w-px h-4 bg-slate-200"></div>
          
          <button 
            type="button"
            onClick={handleStartOver} 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors uppercase tracking-tight px-1.5 py-1 rounded-lg hover:bg-red-50" 
            title="Reset All Progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* A4 Preview Canvas Container */}
      <div 
        className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 pt-16 sm:pt-20 flex justify-center custom-scrollbar relative" 
        ref={containerRef}
      >
        <div 
          className="origin-top transition-transform duration-150 ease-out shadow-2xl bg-white rounded-xs mb-12 border border-slate-300/60 shrink-0"
          style={{ 
            transform: `scale(${zoom})`, 
            width: '210mm', 
            minHeight: '297mm',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
          id="cv-export-container"
        >
          <CVRenderer TemplateComponent={TemplateComponent} data={data} />
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
