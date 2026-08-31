import React from 'react';
import { Sparkles } from 'lucide-react';

interface ResumeShimmerLoaderProps {
  statusText?: string;
}

export default function ResumeShimmerLoader({ statusText = "Crafting your professional resume..." }: ResumeShimmerLoaderProps) {
  return (
    <div className="w-full h-full min-h-[750px] bg-white rounded-lg p-8 sm:p-12 space-y-8 animate-pulse relative overflow-hidden">
      {/* Dynamic Status Banner */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2 bg-blue-600/90 backdrop-blur-md text-white rounded-full shadow-lg border border-blue-400/40 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
        <span>{statusText}</span>
      </div>

      {/* Header Block Shimmer */}
      <div className="flex flex-col items-center space-y-3 pt-6 pb-6 border-b border-slate-100">
        <div className="w-20 h-20 rounded-full bg-slate-200" />
        <div className="h-8 w-64 bg-slate-200 rounded-md" />
        <div className="h-4 w-44 bg-slate-200 rounded-md" />
        <div className="flex gap-4 pt-2">
          <div className="h-3 w-28 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-3 w-32 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Summary Block Shimmer */}
      <div className="space-y-2">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="h-3.5 w-full bg-slate-100 rounded" />
        <div className="h-3.5 w-11/12 bg-slate-100 rounded" />
        <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
      </div>

      {/* Experience Block Shimmer */}
      <div className="space-y-4 pt-2">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        
        {/* Item 1 */}
        <div className="space-y-2 pl-2 border-l-2 border-slate-200">
          <div className="flex justify-between">
            <div className="h-4 w-52 bg-slate-200 rounded" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </div>
          <div className="h-3.5 w-36 bg-slate-200 rounded" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-10/12 bg-slate-100 rounded" />
            <div className="h-3 w-11/12 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Item 2 */}
        <div className="space-y-2 pl-2 border-l-2 border-slate-200">
          <div className="flex justify-between">
            <div className="h-4 w-44 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
          <div className="h-3.5 w-32 bg-slate-200 rounded" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-9/12 bg-slate-100 rounded" />
          </div>
        </div>
      </div>

      {/* Skills & Education Block Shimmer */}
      <div className="grid grid-cols-2 gap-6 pt-2">
        <div className="space-y-3">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 bg-slate-200 rounded-md" />
            <div className="h-6 w-20 bg-slate-200 rounded-md" />
            <div className="h-6 w-14 bg-slate-200 rounded-md" />
            <div className="h-6 w-24 bg-slate-200 rounded-md" />
            <div className="h-6 w-18 bg-slate-200 rounded-md" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-3.5 w-32 bg-slate-100 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}
