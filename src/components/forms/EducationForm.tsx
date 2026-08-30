import React from 'react';
import CharacterCounter from './CharacterCounter';
import { useCVStore } from '../../store';
import { Plus, Trash2, GraduationCap } from 'lucide-react';

export default function EducationForm() {
  const { data, updateData } = useCVStore();

  const addEducation = () => {
    const newEdu = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    updateData({ education: [...data.education, newEdu] });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEdu = [...data.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    updateData({ education: newEdu });
  };

  const removeEducation = (index: number) => {
    const newEdu = [...data.education];
    newEdu.splice(index, 1);
    updateData({ education: newEdu });
  };

  return (
    <div className="space-y-4">
      {data.education.map((edu, index) => (
        <div key={edu.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative group shadow-2xs">
          <button 
            type="button" 
            onClick={() => removeEducation(index)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Remove Education Entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pr-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">School / Institution</label>
              <input 
                type="text" 
                value={edu.institution} 
                onChange={e => updateEducation(index, 'institution', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs font-medium" 
                placeholder="e.g. Stanford University" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Degree</label>
              <input 
                type="text" 
                value={edu.degree} 
                onChange={e => updateEducation(index, 'degree', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Bachelor of Science" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Field of Study / Major</label>
              <input 
                type="text" 
                value={edu.field} 
                onChange={e => updateEducation(index, 'field', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Computer Science" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
              <input 
                type="text" 
                value={edu.startDate} 
                onChange={e => updateEducation(index, 'startDate', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Sep 2020" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Date / Graduation</label>
              <input 
                type="text" 
                value={edu.endDate} 
                onChange={e => updateEducation(index, 'endDate', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. May 2024" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">GPA (Optional)</label>
              <input 
                type="text" 
                value={edu.gpa || ''} 
                onChange={e => updateEducation(index, 'gpa', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. 3.85 / 4.0" 
              />
            </div>
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={addEducation}
        disabled={data.education.length >= 4}
        title={data.education.length >= 4 ? "Maximum of 4 entries reached for optimal resume layout" : ""}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" /> Add Education
      </button>
    </div>
  );
}
