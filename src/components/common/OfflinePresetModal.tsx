import React, { useState } from 'react';
import { X, Briefcase, GraduationCap, Check, Sparkles, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { offlinePresets, CareerPreset } from '../../data/offlinePresets';
import { useCVStore } from '../../store';
import { CVData } from '../../types';

interface OfflinePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflinePresetModal: React.FC<OfflinePresetModalProps> = ({ isOpen, onClose }) => {
  const updateData = useCVStore((state) => state.updateData);
  const currentData = useCVStore((state) => state.data);
  const [preservePersonalDetails, setPreservePersonalDetails] = useState(true);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: CareerPreset) => {
    const isShift = currentData.activePresetName && currentData.activePresetName !== preset.name;
    const actionLabel = isShift ? `Switch to "${preset.name}" preset?` : `Load "${preset.name}" preset?`;
    
    const confirmed = window.confirm(
      `${actionLabel}\n\n${preservePersonalDetails ? 'Your name, contact information, photo, and custom fields will stay intact.' : 'All fields will be populated with this role sample data.'}`
    );
    if (!confirmed) return;

    if (preservePersonalDetails) {
      // Keep user's existing personal info, contact, photo, and custom sections
      const merged: Partial<CVData> = {
        ...preset.data,
        templateId: currentData.templateId || preset.data.templateId || 'modern-clean',
        fullName: currentData.fullName?.trim() ? currentData.fullName : preset.data.fullName,
        photo: currentData.photo?.trim() ? currentData.photo : preset.data.photo,
        contact: {
          email: currentData.contact?.email?.trim() ? currentData.contact.email : preset.data.contact?.email,
          phone: currentData.contact?.phone?.trim() ? currentData.contact.phone : preset.data.contact?.phone,
          location: currentData.contact?.location?.trim() ? currentData.contact.location : preset.data.contact?.location,
          linkedin: currentData.contact?.linkedin?.trim() ? currentData.contact.linkedin : preset.data.contact?.linkedin,
          portfolio: currentData.contact?.portfolio?.trim() ? currentData.contact.portfolio : preset.data.contact?.portfolio,
        },
        customSections: currentData.customSections?.length ? currentData.customSections : (preset.data.customSections || []),
        activePresetName: preset.name,
      };
      updateData(merged);
    } else {
      updateData({
        ...preset.data,
        templateId: currentData.templateId || preset.data.templateId || 'modern-clean',
        activePresetName: preset.name,
      });
    }

    onClose();
  };

  return (
    <div
      id="offline-preset-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Career Starter Presets</h2>
                {currentData.activePresetName && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                    Active: {currentData.activePresetName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% Offline ready — Populate structured sample data and customize it to your experience
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4 custom-scrollbar">
          {/* Preserve Fields Checkbox Banner */}
          <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 p-3.5 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-blue-950 dark:text-blue-100 font-semibold">
                  Field Retention on Preset Shift
                </strong>
                <span className="text-[11px] text-blue-800/90 dark:text-blue-300">
                  Keep your filled personal name, contact details, photo, and custom fields when switching between roles.
                </span>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={preservePersonalDetails}
                onChange={(e) => setPreservePersonalDetails(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                Keep All My Personal Fields
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {offlinePresets.map((preset) => {
              const isSelected = currentData.activePresetName === preset.name;
              return (
                <div
                  key={preset.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-blue-500 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 p-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md bg-white dark:bg-slate-850'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {preset.type === 'student' ? (
                          <>
                            <GraduationCap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            <span>Student / Intern</span>
                          </>
                        ) : (
                          <>
                            <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>Professional</span>
                          </>
                        )}
                      </span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{preset.badge}</span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {preset.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">{preset.roleTitle}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {preset.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {preset.data.skills?.length || 0} skill categories
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <span>{isSelected ? 'Reapply Preset' : 'Use This Preset'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>You can shift between presets anytime — your choice will reflect on the editor badge.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
