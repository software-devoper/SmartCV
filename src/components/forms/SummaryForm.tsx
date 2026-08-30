import React from 'react';
import { useCVStore } from '../../store';
import AIAssistButton from './AIAssistButton';
import CharacterCounter from './CharacterCounter';

export default function SummaryForm() {
  const { data, updateData } = useCVStore();
  const maxLength = 400;

  return (
    <div className="space-y-3">
      <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl shadow-2xs">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
          {data.userType === 'student' ? 'Academic / Career Objective' : 'Professional Summary'}
        </label>
        <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
          <textarea 
            value={data.summary || ''} 
            onChange={e => updateData({ summary: e.target.value })}
            maxLength={maxLength}
            className="w-full px-2 py-1 bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 min-h-[96px] resize-y leading-relaxed" 
            placeholder={
              data.userType === 'student' 
                ? "Motivated Computer Science senior with a strong foundation in distributed systems, seeking software engineering opportunities..." 
                : "Results-driven engineering leader with 8+ years of experience scaling cloud-native microservices, optimizing throughput..."
            }
          />
          <CharacterCounter current={(data.summary || '').length} max={maxLength} />
          <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
            <AIAssistButton 
              text={data.summary || ''} 
              intent="summary" 
              userType={data.userType}
              onSuggestionAccepted={(newText) => updateData({ summary: newText })} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
