import React from 'react';
import CharacterCounter from './CharacterCounter';
import { useCVStore } from '../../store';
import { Upload, X, User } from 'lucide-react';

export default function PersonalForm({ isContact = false }: { isContact?: boolean }) {
  const { data, updateNested, updateData } = useCVStore();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData({ photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isContact) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
          <input 
            type="email" 
            value={data.contact?.email || ''} 
            onChange={e => updateNested('contact', { ...data.contact, email: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs"
            placeholder="e.g. alex.rivera@example.com"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
            <input 
              type="tel" 
              value={data.contact?.phone || ''} 
              onChange={e => updateNested('contact', { ...data.contact, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs"
              placeholder="+1 (555) 019-2834"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Location / City</label>
            <input 
              type="text" 
              value={data.contact?.location || ''} 
              onChange={e => updateNested('contact', { ...data.contact, location: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs"
              placeholder="San Francisco, CA"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">LinkedIn Profile / Portfolio</label>
          <input 
            type="text" 
            value={data.contact?.linkedin || ''} 
            onChange={e => updateNested('contact', { ...data.contact, linkedin: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs"
            placeholder="linkedin.com/in/alexrivera"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Profile Photo */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Profile Photo (Optional)</label>
        <div className="flex items-center gap-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
          {data.photo ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
              <img src={data.photo} alt="Profile" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-400 shrink-0 shadow-2xs">
              <User className="w-6 h-6" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-all shadow-2xs active:scale-95">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
            {data.photo && (
              <button 
                type="button" 
                onClick={() => updateData({ photo: '' })} 
                className="text-xs text-red-600 hover:text-red-700 font-medium text-left flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
        <input 
          type="text" 
          value={data.fullName || ''} 
          onChange={e => updateData({ fullName: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs font-medium"
          placeholder="Alex Rivera"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Professional Title</label>
        <input 
          type="text" 
          value={data.title || ''} 
          onChange={e => updateData({ title: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs"
          placeholder="Lead Product Designer / Computer Science Student"
        />
      </div>
    </div>
  );
}
