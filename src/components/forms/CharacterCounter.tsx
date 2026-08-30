import React from 'react';

interface CharacterCounterProps {
  current: number;
  max: number;
}

export default function CharacterCounter({ current, max }: CharacterCounterProps) {
  const isNearLimit = current > max * 0.9;
  return (
    <div className={`text-[10pt] font-medium text-right mt-1 ${isNearLimit ? 'text-red-500' : 'text-slate-400'}`}>
      {current} / {max}
    </div>
  );
}
