import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CVData } from '../../types';
import { templates } from '../../templates/registry';
import CVRenderer from '../CVRenderer';
import ResumeShimmerLoader from './ResumeShimmerLoader';
import EditableSegment from './EditableSegment';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  LayoutTemplate,
  Info,
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
  activeEditingSegment,
  onEditSegment,
  onTemplateChange,
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

  return (
    <div className="flex flex-col h-full relative bg-slate-200/90 select-none overflow-hidden">
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-0 right-0 flex justify-center z-20 pointer-events-none px-4">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200/80 shadow-lg shadow-slate-900/10 flex items-center gap-2 sm:gap-3 pointer-events-auto transition-all">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
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
            onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
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

          <div className="w-px h-4 bg-slate-200" />

          {/* Template Switcher */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors uppercase tracking-tight px-2 py-1 rounded-lg hover:bg-blue-50/50"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{selectedTemplate.name}</span>
            <span className="sm:hidden">Template</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Interactive Segment AI Edit Notification Banner */}
      {hasAnyData && !isLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4">
          <div className="bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700/60 flex items-center gap-2 text-[11px] font-medium pointer-events-auto">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Click any section or item to edit it with precision AI prompts</span>
          </div>
        </div>
      )}

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
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          }}
          id="cv-export-container"
        >
          {isLoading && !hasAnyData ? (
            <ResumeShimmerLoader statusText={loadingStatus} />
          ) : (
            <div className="relative">
              {/* Overlay Interactive Click Handlers onto Sections */}
              <div className="p-2">
                {/* Header / Summary Segment Click Overlay */}
                <div className="mb-2">
                  <EditableSegment
                    segmentPath="summary"
                    segmentTitle="Career Summary"
                    currentValue={data.summary || ''}
                    onEdit={onEditSegment}
                    isBeingEdited={activeEditingSegment === 'summary'}
                  >
                    <div className="pointer-events-none">
                      {/* Pass data to Renderer */}
                    </div>
                  </EditableSegment>
                </div>
              </div>

              {/* Render Template */}
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
