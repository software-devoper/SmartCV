import React from 'react';
import CharacterCounter from './CharacterCounter';
import { useCVStore } from '../../store';
import { Plus, Trash2, Award } from 'lucide-react';
import AIAssistButton from './AIAssistButton';

export default function ExtracurricularsForm() {
  const { data, updateData } = useCVStore();

  const addExtracurricular = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      activityName: '',
      role: '',
      organization: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    updateData({ extracurriculars: [...data.extracurriculars, newEntry] });
  };

  const updateExtracurricular = (index: number, field: string, value: string) => {
    const list = [...data.extracurriculars];
    list[index] = { ...list[index], [field]: value };
    updateData({ extracurriculars: list });
  };

  const removeExtracurricular = (index: number) => {
    const list = [...data.extracurriculars];
    list.splice(index, 1);
    updateData({ extracurriculars: list });
  };

  return (
    <div className="space-y-4">
      {data.extracurriculars.map((entry, index) => (
        <div key={entry.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative group shadow-2xs">
          <button 
            type="button" 
            onClick={() => removeExtracurricular(index)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Remove Entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pr-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Activity / Initiative Name</label>
              <input 
                type="text" 
                value={entry.activityName || ''} 
                onChange={e => updateExtracurricular(index, 'activityName', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs font-medium" 
                placeholder="e.g. Annual Tech Symposium" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Role</label>
              <input 
                type="text" 
                value={entry.role || ''} 
                onChange={e => updateExtracurricular(index, 'role', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Team Lead, Volunteer, Organizer" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Organization / Event Name</label>
              <input 
                type="text" 
                value={entry.organization || ''} 
                onChange={e => updateExtracurricular(index, 'organization', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. University Coding Club / IEEE Student Branch" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date (From)</label>
              <input 
                type="text" 
                value={entry.startDate || ''} 
                onChange={e => updateExtracurricular(index, 'startDate', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Jan 2023" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Date (To)</label>
              <input 
                type="text" 
                value={entry.endDate || ''} 
                onChange={e => updateExtracurricular(index, 'endDate', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Present or Dec 2023" 
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Description (Impact & Responsibilities)</label>
                <AIAssistButton 
                  text={entry.description || ''} 
                  intent="bullet" 
                  userType={data.userType} 
                  onSuggestionAccepted={(newText) => updateExtracurricular(index, 'description', newText)} 
                />
              </div>
              <textarea 
                rows={2}
                value={entry.description || ''} 
                onChange={e => updateExtracurricular(index, 'description', e.target.value)} 
                maxLength={150}
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs resize-y" 
                placeholder="Managed a committee of 12 members, increased event attendance by 40%, and coordinated logistics." 
              />
              <CharacterCounter current={(entry.description || '').length} max={150} />
            </div>
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={addExtracurricular}
        disabled={data.extracurriculars.length >= 4}
        title={data.extracurriculars.length >= 4 ? "Maximum of 4 entries reached for optimal resume layout" : ""}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" /> Add Extracurricular Activity
      </button>
    </div>
  );
}
