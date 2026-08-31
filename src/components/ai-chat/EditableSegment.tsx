import React from 'react';
import { Sparkles, Edit3 } from 'lucide-react';

interface EditableSegmentProps {
  segmentPath: string;
  segmentTitle: string;
  currentValue: any;
  onEdit: (path: string, title: string, value: any) => void;
  children: React.ReactNode;
  isBeingEdited?: boolean;
  className?: string;
}

export default function EditableSegment({
  segmentPath,
  segmentTitle,
  currentValue,
  onEdit,
  children,
  isBeingEdited = false,
  className = '',
}: EditableSegmentProps) {
  return (
    <div
      className={`group/segment relative rounded-lg transition-all duration-150 ${
        isBeingEdited
          ? 'ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
          : 'hover:ring-1.5 hover:ring-blue-400/80 hover:bg-blue-50/15'
      } ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(segmentPath, segmentTitle, currentValue);
      }}
    >
      {/* Edit with AI trigger overlay button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(segmentPath, segmentTitle, currentValue);
        }}
        className="opacity-0 group-hover/segment:opacity-100 transition-opacity absolute -top-2.5 -right-2.5 z-30 bg-blue-600 hover:bg-blue-700 text-white p-1 px-2 rounded-full shadow-md text-[10px] font-bold tracking-tight flex items-center gap-1 cursor-pointer pointer-events-auto active:scale-95"
        title={`Edit ${segmentTitle} with AI`}
      >
        <Sparkles className="w-2.5 h-2.5" />
        <span>Edit AI</span>
      </button>

      {children}
    </div>
  );
}
