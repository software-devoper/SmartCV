import React from 'react';
import { useCVStore } from '../../store';
import { Plus, Trash2 } from 'lucide-react';
import AIAssistButton from './AIAssistButton';
import CharacterCounter from './CharacterCounter';

export default function ExperienceForm() {
  const { data, updateData } = useCVStore();

  const addExperience = () => {
    const newExp = {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      bullets: ['']
    };
    updateData({ experience: [...data.experience, newExp] });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const newExp = [...data.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    updateData({ experience: newExp });
  };

  const removeExperience = (index: number) => {
    const newExp = [...data.experience];
    newExp.splice(index, 1);
    updateData({ experience: newExp });
  };

  const addBullet = (expIndex: number) => {
    const newExp = [...data.experience];
    newExp[expIndex].bullets.push('');
    updateData({ experience: newExp });
  };

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const newExp = [...data.experience];
    newExp[expIndex].bullets[bulletIndex] = value;
    updateData({ experience: newExp });
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    const newExp = [...data.experience];
    newExp[expIndex].bullets.splice(bulletIndex, 1);
    updateData({ experience: newExp });
  };

  return (
    <div className="space-y-4">
      {data.experience.map((exp, index) => (
        <div key={exp.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative group shadow-2xs">
          <button 
            type="button" 
            onClick={() => removeExperience(index)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Remove Experience Entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4 pr-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Company / Organization</label>
              <input 
                type="text" 
                value={exp.company} 
                onChange={e => updateExperience(index, 'company', e.target.value)} 
                maxLength={80}
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs font-medium" 
                placeholder="e.g. Google / Acme Corp" 
              />
              <CharacterCounter current={exp.company.length} max={80} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Job Title / Role</label>
              <input 
                type="text" 
                value={exp.role} 
                onChange={e => updateExperience(index, 'role', e.target.value)} 
                maxLength={80}
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Senior Software Engineer" 
              />
              <CharacterCounter current={exp.role.length} max={80} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
              <input 
                type="text" 
                value={exp.startDate} 
                onChange={e => updateExperience(index, 'startDate', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Jan 2021" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Date</label>
              <input 
                type="text" 
                value={exp.endDate} 
                onChange={e => updateExperience(index, 'endDate', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Present" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Key Achievements & Responsibilities</label>
            <div className="space-y-3">
              {exp.bullets.map((bullet, bIndex) => (
                <div key={bIndex} className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
                  <div className="flex gap-2">
                    <textarea 
                      value={bullet} 
                      onChange={e => updateBullet(index, bIndex, e.target.value)} 
                      maxLength={150}
                      className="flex-1 px-2 py-1 bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 min-h-[52px] resize-y" 
                      placeholder="Led the re-architecture of microservices, cutting latency by 35%..."
                    />
                    <button 
                      type="button" 
                      onClick={() => removeBullet(index, bIndex)} 
                      className="text-slate-400 hover:text-red-500 p-1 self-start rounded transition-colors"
                      title="Remove bullet point"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <CharacterCounter current={bullet.length} max={150} />
                  <div className="flex justify-end mt-1 pt-1 border-t border-slate-100">
                    <AIAssistButton 
                      text={bullet} 
                      intent="bullet" 
                      userType={data.userType}
                      onSuggestionAccepted={(newText) => updateBullet(index, bIndex, newText)} 
                    />
                  </div>
                </div>
              ))}
              {exp.bullets.length < 4 && (
                <button 
                  type="button" 
                  onClick={() => addBullet(index)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1 py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add bullet point
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={addExperience}
        disabled={data.experience.length >= 5}
        title={data.experience.length >= 5 ? "Maximum of 5 entries reached for optimal resume layout" : ""}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" /> Add Experience Entry
      </button>
    </div>
  );
}
