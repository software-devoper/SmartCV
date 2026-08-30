import React, { useState, useRef, useEffect } from 'react';
import { useCVStore } from '../store';
import { templates, TemplateDefinition } from '../templates/registry';
import { X, Check, GraduationCap, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CVData } from '../types';

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
      className={`w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative ${template.thumbnailClass}`}
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Switch Resume Template</h2>
                <span className="text-xs text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded-full font-medium">14 Templates (7 Student • 7 Professional)</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type selector tabs */}
            <div className="px-6 pt-4 pb-2 flex justify-center shrink-0">
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/80">
                <button
                  onClick={() => setActiveTab('student')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'student' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Student Templates
                </button>
                <button
                  onClick={() => setActiveTab('professional')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'professional' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Professional Templates
                </button>
              </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredTemplates.map(template => {
                  const isSelected = data.templateId === template.id;
                  return (
                    <div 
                      key={template.id} 
                      onClick={() => handleSelectTemplate(template.id)}
                      className={`group cursor-pointer flex flex-col p-2.5 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/30 shadow-md ring-2 ring-blue-500/20' 
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-slate-50/50'
                      }`}
                    >
                      <ModalThumbnail template={template} previewData={data} />
                      <div className="mt-2 flex items-center justify-between px-1">
                        <span className="font-bold text-xs text-slate-800 truncate">{template.name}</span>
                        {isSelected && (
                          <span className="p-0.5 bg-blue-600 text-white rounded-full">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
