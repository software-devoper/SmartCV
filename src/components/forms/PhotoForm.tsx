import React from 'react';
import { useCVStore } from '../../store';
import { Upload, X, User } from 'lucide-react';

export default function PhotoForm() {
  const { data, updateData } = useCVStore();

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

  return (
    <div className="space-y-4">
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
    </div>
  );
}
