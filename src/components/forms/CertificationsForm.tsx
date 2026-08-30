import React from 'react';
import CharacterCounter from './CharacterCounter';
import { useCVStore } from '../../store';
import { Plus, Trash2 } from 'lucide-react';

export default function CertificationsForm() {
  const { data, updateData } = useCVStore();

  const addCertification = () => {
    const newCert = {
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialUrl: ''
    };
    updateData({ certifications: [...data.certifications, newCert] });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const list = [...data.certifications];
    list[index] = { ...list[index], [field]: value };
    updateData({ certifications: list });
  };

  const removeCertification = (index: number) => {
    const list = [...data.certifications];
    list.splice(index, 1);
    updateData({ certifications: list });
  };

  return (
    <div className="space-y-4">
      {data.certifications.map((cert, index) => (
        <div key={cert.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative group shadow-2xs">
          <button 
            type="button" 
            onClick={() => removeCertification(index)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Remove Certification"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pr-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Certification Name</label>
              <input 
                type="text" 
                value={cert.name || ''} 
                onChange={e => updateCertification(index, 'name', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs font-medium" 
                placeholder="e.g. AWS Certified Solutions Architect" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Issuing Organization</label>
              <input 
                type="text" 
                value={cert.issuer || ''} 
                onChange={e => updateCertification(index, 'issuer', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Amazon Web Services, Google, Coursera" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date Issued</label>
              <input 
                type="text" 
                value={cert.date || ''} 
                onChange={e => updateCertification(index, 'date', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Mar 2024" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Expiry Date (Optional)</label>
              <input 
                type="text" 
                value={cert.expiryDate || ''} 
                onChange={e => updateCertification(index, 'expiryDate', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. Mar 2027 or No Expiration" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Credential ID / URL (Optional)</label>
              <input 
                type="text" 
                value={cert.credentialUrl || ''} 
                onChange={e => updateCertification(index, 'credentialUrl', e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs" 
                placeholder="e.g. https://credly.com/badges/... or ID-984320" 
              />
            </div>
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={addCertification}
        disabled={data.certifications.length >= 6}
        title={data.certifications.length >= 6 ? "Maximum of 6 entries reached for optimal resume layout" : ""}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-600 font-semibold text-xs uppercase tracking-wider hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" /> Add Certification
      </button>
    </div>
  );
}
