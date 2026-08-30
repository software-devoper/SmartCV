import React, { useState } from 'react';
import CharacterCounter from './CharacterCounter';
import { useCVStore } from '../../store';
import { Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SkillsForm() {
  const { data, updateData } = useCVStore();
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  const addCategory = () => {
    const newCat = {
      id: crypto.randomUUID(),
      category: '',
      items: []
    };
    updateData({ skills: [...data.skills, newCat] });
  };

  const updateCategory = (index: number, value: string) => {
    const newSkills = [...data.skills];
    newSkills[index].category = value;
    updateData({ skills: newSkills });
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = (inputValues[index] || '').trim();
      if (val && data.skills[index].items.length < 8) {
        const newSkills = [...data.skills];
        newSkills[index].items = [...newSkills[index].items, val];
        updateData({ skills: newSkills });
        setInputValues({ ...inputValues, [index]: '' });
      }
    } else if (e.key === 'Backspace' && !inputValues[index] && data.skills[index].items.length > 0) {
      e.preventDefault();
      const newSkills = [...data.skills];
      newSkills[index].items.pop();
      updateData({ skills: newSkills });
    }
  };

  const removeSkillItem = (catIndex: number, itemIndex: number) => {
    const newSkills = [...data.skills];
    newSkills[catIndex].items.splice(itemIndex, 1);
    updateData({ skills: newSkills });
  };

  const removeCategory = (index: number) => {
    const newSkills = [...data.skills];
    newSkills.splice(index, 1);
    updateData({ skills: newSkills });
  };

  return (
    <div className="space-y-4">
      {data.skills.map((skill, index) => (
        <div key={skill.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative group shadow-2xs">
          <button 
            type="button"
            onClick={() => removeCategory(index)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="mb-3 pr-8">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Skill Category</label>
            <input 
              type="text" 
              value={skill.category} 
              onChange={e => updateCategory(index, e.target.value)} 
              className="w-full px-3.5 py-2 border border-slate-200 bg-white focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs" 
              placeholder="e.g. Technical Skills, Languages, Tools" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Skills (Press Enter or comma to add)</label>
            <div 
              className="flex flex-wrap gap-2 p-2.5 px-3 border border-slate-200 bg-white rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all min-h-[46px] items-center cursor-text shadow-2xs" 
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input');
                if (input) input.focus();
              }}
            >
              <AnimatePresence>
                {skill.items.map((item, i) => (
                  <motion.span 
                    key={`${item}-${i}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200/80 px-2.5 py-1 rounded-lg text-xs font-medium tracking-tight shadow-2xs"
                  >
                    {item}
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeSkillItem(index, i); }}
                      className="hover:bg-blue-200/60 hover:text-blue-950 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              <input 
                type="text" 
                value={inputValues[index] || ''}
                onChange={e => setInputValues({ ...inputValues, [index]: e.target.value })}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={skill.items.length >= 8}
                className="flex-1 bg-transparent min-w-[120px] outline-none text-sm px-1 py-1 text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                placeholder={skill.items.length >= 8 ? "Limit reached (8/8)" : skill.items.length === 0 ? "Type skill and hit Enter..." : "Add more..."}
              />
            </div>
          </div>
        </div>
      ))}
      <button 
        type="button"
        onClick={addCategory}
        disabled={data.skills.length >= 5}
        title={data.skills.length >= 5 ? "Maximum of 5 entries reached for optimal resume layout" : ""}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" /> Add Skill Category
      </button>
    </div>
  );
}
