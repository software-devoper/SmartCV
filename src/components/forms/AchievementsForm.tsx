import React from 'react';
import CharacterCounter from './CharacterCounter';
import { useCVStore } from '../../store';
import { Plus, Trash2 } from 'lucide-react';
import AIAssistButton from './AIAssistButton';

export default function AchievementsForm() {
  const { data, updateData } = useCVStore();

  const addAchievement = () => {
    const newAchievement = {
      id: crypto.randomUUID(),
      title: '',
      issuer: '',
      date: '',
      description: ''
    };
    updateData({ achievements: [...data.achievements, newAchievement] });
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    const list = [...data.achievements];
    list[index] = { ...list[index], [field]: value };
    updateData({ achievements: list });
  };

  const removeAchievement = (index: number) => {
    const list = [...data.achievements];
    list.splice(index, 1);
    updateData({ achievements: list });
  };

  return (
    <div className="space-y-4">
      {data.achievements.map((ach, index) => (
        <div key={ach.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative group shadow-2xs">
          <button 
            type="button" 
            onClick={() => removeAchievement(index)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Remove Achievement"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pr-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Achievement Title</label>
              <input 
                type="text" 
                value={ach.title || ''} 
                onChange={e => updateAchievement(index, 'title', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs font-medium" 
                placeholder="e.g. 1st Place National Hackathon Winner" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Issuing Body / Context</label>
              <input 
                type="text" 
                value={ach.issuer || ''} 
                onChange={e => updateAchievement(index, 'issuer', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. ACM / Major League Hacking" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date</label>
              <input 
                type="text" 
                value={ach.date || ''} 
                onChange={e => updateAchievement(index, 'date', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Nov 2023" 
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Short Description</label>
                <AIAssistButton 
                  text={ach.description || ''} 
                  intent="bullet" 
                  userType={data.userType} 
                  onSuggestionAccepted={(newText) => updateAchievement(index, 'description', newText)} 
                />
              </div>
              <textarea 
                rows={2}
                value={ach.description || ''} 
                onChange={e => updateAchievement(index, 'description', e.target.value)} 
                maxLength={120}
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs resize-y" 
                placeholder="Awarded top honors among 120 participating engineering teams for developing an automated medical triage algorithm." 
              />
              <CharacterCounter current={(ach.description || '').length} max={120} />
            </div>
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={addAchievement}
        disabled={data.achievements.length >= 5}
        title={data.achievements.length >= 5 ? "Maximum of 5 entries reached for optimal resume layout" : ""}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" /> Add Achievement / Award
      </button>
    </div>
  );
}
