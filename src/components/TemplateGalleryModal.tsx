import React, { useState, useRef, useEffect } from 'react';
import { useCVStore } from '../store';
import { templates, TemplateDefinition } from '../templates/registry';
import { Check, GraduationCap, Briefcase, LayoutTemplate } from 'lucide-react';
import { CVData } from '../types';
import ResponsiveModal from './common/ResponsiveModal';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ModalThumbnail({ template, previewData }: { template: TemplateDefinition; previewData: CVData }) {
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
      className={`w-full bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden relative ${template.thumbnailClass}`}
      style={{ aspectRatio: '21 / 29.7' }}
    > 
      <div 
        className="absolute top-0 left-0 origin-top-left pointer-events-none" 
        style={{ width: '794px', height: '1123px', transform: `scale(${scale})` }}
      >
        <TemplateComponent data={previewData} />
      </div>
    </div>
  );
}

export default function TemplateGalleryModal({ isOpen, onClose }: TemplateGalleryModalProps) {
  const { data, updateData } = useCVStore();
  const [activeTab, setActiveTab] = useState<'student' | 'professional'>(data.userType || 'professional');

  const filteredTemplates = templates.filter(t => t.type === activeTab);

  const handleSelectTemplate = (templateId: string) => {
    updateData({ templateId, userType: activeTab });
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      theme="light"
      maxWidthClass="max-w-5xl"
      title="Switch Resume Template"
      subtitle="Choose from 14 ATS-friendly Student & Professional templates"
      icon={<LayoutTemplate className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
    >
      <div className="space-y-4">
        {/* Type selector tabs */}
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1 rounded-2xl flex w-full sm:w-auto gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex-1 sm:flex-initial touch-target flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Templates</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('professional')}
              className={`flex-1 sm:flex-initial touch-target flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'professional'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Professional Templates</span>
            </button>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pt-2">
          {filteredTemplates.map((template) => {
            const isSelected = data.templateId === template.id;
            return (
              <div 
                key={template.id} 
                onClick={() => handleSelectTemplate(template.id)}
                className={`group cursor-pointer flex flex-col p-3 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-slate-50/50'
                }`}
              >
                <ModalThumbnail template={template} previewData={data} />
                <div className="mt-3 flex items-center justify-between px-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">{template.name}</span>
                  {isSelected ? (
                    <span className="p-1 bg-blue-600 text-white rounded-full">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600">Select</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ResponsiveModal>
  );
}

