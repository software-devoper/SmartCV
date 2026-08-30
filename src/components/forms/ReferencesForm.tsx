import React from 'react';
import CharacterCounter from './CharacterCounter';
import { useCVStore } from '../../store';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';
import { ReferenceEntry } from '../../types';

export default function ReferencesForm() {
  const { data, updateData } = useCVStore();

  const isAvailableOnRequest = data.references === 'available_on_request';
  const referencesList: ReferenceEntry[] = Array.isArray(data.references) ? data.references : [];

  const handleToggleAvailableOnRequest = (checked: boolean) => {
    if (checked) {
      updateData({ references: 'available_on_request' });
    } else {
      updateData({ references: [] });
    }
  };

  const addReference = () => {
    const newRef: ReferenceEntry = {
      id: crypto.randomUUID(),
      name: '',
      position: '',
      company: '',
      email: '',
      phone: '',
      relationship: ''
    };
    const currentList = Array.isArray(data.references) ? data.references : [];
    updateData({ references: [...currentList, newRef] });
  };

  const updateReference = (index: number, field: keyof ReferenceEntry, value: string) => {
    const list = [...referencesList];
    list[index] = { ...list[index], [field]: value };
    updateData({ references: list });
  };

  const removeReference = (index: number) => {
    const list = [...referencesList];
    list.splice(index, 1);
    updateData({ references: list });
  };

  return (
    <div className="space-y-4">
      {/* Availability Toggle */}
      <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <label htmlFor="avail-req-toggle" className="text-xs font-semibold text-slate-800 cursor-pointer">
            Display &ldquo;References available upon request&rdquo; on resume
          </label>
        </div>
        <input 
          id="avail-req-toggle"
          type="checkbox" 
          checked={isAvailableOnRequest} 
          onChange={e => handleToggleAvailableOnRequest(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300 cursor-pointer"
        />
      </div>

      {!isAvailableOnRequest && (
        <>
          {referencesList.map((ref, index) => (
            <div key={ref.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative group shadow-2xs">
              <button 
                type="button" 
                onClick={() => removeReference(index)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                title="Remove Reference"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pr-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Reference Name</label>
                  <input 
                    type="text" 
                    value={ref.name || ''} 
                    onChange={e => updateReference(index, 'name', e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs font-medium" 
                    placeholder="e.g. Dr. Eleanor Vance" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Job Title / Position</label>
                  <input 
                    type="text" 
                    value={ref.position || ''} 
                    onChange={e => updateReference(index, 'position', e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                    placeholder="e.g. Senior Principal Engineer / Department Chair" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Company / Organization</label>
                  <input 
                    type="text" 
                    value={ref.company || ''} 
                    onChange={e => updateReference(index, 'company', e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                    placeholder="e.g. Google / MIT" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Relationship</label>
                  <input 
                    type="text" 
                    value={ref.relationship || ''} 
                    onChange={e => updateReference(index, 'relationship', e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                    placeholder="e.g. Manager, Professor, Mentor, Tech Lead" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</label>
                  <input 
                    type="email" 
                    value={ref.email || ''} 
                    onChange={e => updateReference(index, 'email', e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                    placeholder="e.g. eleanor.vance@company.com" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={ref.phone || ''} 
                    onChange={e => updateReference(index, 'phone', e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                    placeholder="e.g. +1 (555) 349-2910" 
                  />
                </div>
              </div>
            </div>
          ))}

          <button 
            type="button" 
            onClick={addReference}
            disabled={data.references.length >= 3}
        title={data.references.length >= 3 ? "Maximum of 3 entries reached for optimal resume layout" : ""}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add Reference Contact
          </button>
        </>
      )}
    </div>
  );
}
