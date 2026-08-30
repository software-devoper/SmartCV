import React from 'react';
import CharacterCounter from './CharacterCounter';
import { useCVStore } from '../../store';
import { Plus, Trash2 } from 'lucide-react';
import AIAssistButton from './AIAssistButton';

export default function ProjectsForm() {
  const { data, updateData } = useCVStore();

  const addProject = () => {
    const newProj = {
      id: crypto.randomUUID(),
      title: '',
      tools: '',
      link: '',
      description: ''
    };
    updateData({ projects: [...data.projects, newProj] });
  };

  const updateProject = (index: number, field: string, value: string) => {
    const newProj = [...data.projects];
    newProj[index] = { ...newProj[index], [field]: value };
    updateData({ projects: newProj });
  };

  const removeProject = (index: number) => {
    const newProj = [...data.projects];
    newProj.splice(index, 1);
    updateData({ projects: newProj });
  };

  return (
    <div className="space-y-4">
      {data.projects.map((proj, index) => (
        <div key={proj.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative group shadow-2xs">
          <button 
            type="button" 
            onClick={() => removeProject(index)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Remove Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="space-y-3 pr-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Project Name / Title</label>
                <input 
                  type="text" 
                  value={proj.title} 
                  onChange={e => updateProject(index, 'title', e.target.value)} 
                  maxLength={80}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs font-medium" 
                  placeholder="e.g. Distributed Task Scheduler" 
                />
                <CharacterCounter current={proj.title.length} max={80} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Live URL / Repo (Optional)</label>
                <input 
                  type="text" 
                  value={proj.link || ''} 
                  onChange={e => updateProject(index, 'link', e.target.value)} 
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                  placeholder="github.com/user/project" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tech Stack / Tools</label>
              <input 
                type="text" 
                value={proj.tools} 
                onChange={e => updateProject(index, 'tools', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. React, TypeScript, Go, PostgreSQL, Redis" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Description & Impact</label>
              <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
                <textarea 
                  value={proj.description} 
                  onChange={e => updateProject(index, 'description', e.target.value)} 
                  maxLength={150}
                  className="w-full px-2 py-1 bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 min-h-[64px] resize-y" 
                  placeholder="Engineered an asynchronous task queuing pipeline handling 50k+ jobs daily with sub-second execution..." 
                />
                <CharacterCounter current={proj.description.length} max={150} />
                <div className="flex justify-end mt-1 pt-1 border-t border-slate-100">
                  <AIAssistButton 
                    text={proj.description} 
                    intent="bullet" 
                    userType={data.userType}
                    onSuggestionAccepted={(newText) => updateProject(index, 'description', newText)} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={addProject}
        disabled={data.projects.length >= 4}
        title={data.projects.length >= 4 ? "Maximum of 4 entries reached for optimal resume layout" : ""}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" /> Add Project
      </button>
    </div>
  );
}
