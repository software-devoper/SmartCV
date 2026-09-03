import React from 'react';
import { X, Briefcase, GraduationCap, Check, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { offlinePresets, CareerPreset } from '../../data/offlinePresets';
import { useCVStore } from '../../store';

interface OfflinePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflinePresetModal: React.FC<OfflinePresetModalProps> = ({ isOpen, onClose }) => {
  const updateData = useCVStore((state) => state.updateData);
  const currentData = useCVStore((state) => state.data);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: CareerPreset) => {
    // Merge preset data into current data, preserving template if already selected
    const confirmed = window.confirm(
      `Load the "${preset.name}" preset? This will populate the editor fields with this role's sample data so you can customize it.`
    );
    if (!confirmed) return;

    updateData({
      ...preset.data,
      templateId: currentData.templateId || preset.data.templateId || 'modern-clean',
    });
    onClose();
  };

  return (
    <div
      id="offline-preset-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 text-slate-900 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Career Starter Presets</h2>
              <p className="text-xs text-slate-500">
                100% Offline ready — Populate high-impact sample data and customize it to your experience
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          <div className="rounded-xl bg-blue-50/80 border border-blue-200/80 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Building without AI?</strong> These expertly structured presets give you pre-formatted bullet points, quantifiable metrics, technical skills, and clean section hierarchies that you can freely edit.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {offlinePresets.map((preset) => (
              <div
                key={preset.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-md transition-all bg-white"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700">
                      {preset.type === 'student' ? (
                        <>
                          <GraduationCap className="w-3 h-3 text-purple-600" />
                          <span>Student / Intern</span>
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-3 h-3 text-blue-600" />
                          <span>Professional</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">{preset.badge}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-2">{preset.roleTitle}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    {preset.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <span>Use This Preset</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>You can always clear or modify any section later.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
