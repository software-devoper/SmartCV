import React from 'react';
import CharacterCounter from './CharacterCounter';
import { useCVStore } from '../../store';
import { Plus, Trash2 } from 'lucide-react';
import { LanguageProficiency } from '../../types';

const proficiencyOptions: LanguageProficiency[] = [
  'Basic',
  'Intermediate',
  'Advanced',
  'Native'
];

export default function LanguagesForm() {
  const { data, updateData } = useCVStore();

  const addLanguage = () => {
    const newLang = {
      id: crypto.randomUUID(),
      language: '',
      level: 'Intermediate' as LanguageProficiency
    };
    updateData({ languages: [...data.languages, newLang] });
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const list = [...data.languages];
    list[index] = { ...list[index], [field]: value };
    updateData({ languages: list });
  };

  const removeLanguage = (index: number) => {
    const list = [...data.languages];
    list.splice(index, 1);
    updateData({ languages: list });
  };

  return (
    <div className="space-y-4">
      {data.languages.map((lang, index) => (
        <div key={lang.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative group shadow-2xs">
          <button 
            type="button" 
            onClick={() => removeLanguage(index)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Remove Language"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pr-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Language Name</label>
              <input 
                type="text" 
                value={lang.language || ''} 
                onChange={e => updateLanguage(index, 'language', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs font-medium" 
                placeholder="e.g. English, Spanish, Mandarin, French" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Proficiency Level</label>
              <select 
                value={lang.level || 'Intermediate'} 
                onChange={e => updateLanguage(index, 'level', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 shadow-2xs cursor-pointer font-medium"
              >
                {proficiencyOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={addLanguage}
        disabled={data.languages.length >= 5}
        title={data.languages.length >= 5 ? "Maximum of 5 entries reached for optimal resume layout" : ""}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" /> Add Language
      </button>
    </div>
  );
}
