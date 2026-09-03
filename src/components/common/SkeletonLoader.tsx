import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'resume';
  dark?: boolean;
}

export function Skeleton({ className = '', variant = 'rectangular', dark = false }: SkeletonProps) {
  const shimmerClass = dark ? 'skeleton-shimmer-dark' : 'skeleton-shimmer';

  if (variant === 'circular') {
    return <div className={`rounded-full ${shimmerClass} ${className}`} />;
  }

  if (variant === 'text') {
    return <div className={`h-4 rounded-md ${shimmerClass} ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl border ${dark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'} space-y-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${shimmerClass}`} />
          <div className="space-y-1.5 flex-1">
            <div className={`h-4 w-3/4 rounded-md ${shimmerClass}`} />
            <div className={`h-3 w-1/2 rounded-md ${shimmerClass}`} />
          </div>
        </div>
        <div className={`h-3 w-full rounded-md ${shimmerClass}`} />
        <div className={`h-3 w-5/6 rounded-md ${shimmerClass}`} />
        <div className="pt-2 flex justify-between items-center">
          <div className={`h-3 w-20 rounded-md ${shimmerClass}`} />
          <div className={`h-7 w-20 rounded-lg ${shimmerClass}`} />
        </div>
      </div>
    );
  }

  if (variant === 'resume') {
    return (
      <div className={`w-full bg-white rounded-lg p-6 sm:p-8 space-y-4 shadow-sm border border-slate-200 ${className}`}>
        {/* Header */}
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <div className="h-7 w-1/3 rounded-md skeleton-shimmer" />
          <div className="h-4 w-1/4 rounded-md skeleton-shimmer" />
          <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
        </div>
        {/* Sections */}
        <div className="space-y-3 pt-2">
          <div className="h-5 w-24 rounded-md skeleton-shimmer" />
          <div className="h-3 w-full rounded-md skeleton-shimmer" />
          <div className="h-3 w-11/12 rounded-md skeleton-shimmer" />
        </div>
        <div className="space-y-3 pt-3">
          <div className="h-5 w-28 rounded-md skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-1/2 rounded-md skeleton-shimmer" />
            <div className="h-3 w-full rounded-md skeleton-shimmer" />
            <div className="h-3 w-4/5 rounded-md skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return <div className={`rounded-xl ${shimmerClass} ${className}`} />;
}

export default Skeleton;
