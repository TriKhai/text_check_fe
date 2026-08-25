import React from 'react';

/** Simple loading indicator used while the AI response is being fetched */
export function Loader() {
  return (
    <div className="space-y-3 pt-2 animate-pulse">
      <div className="h-4 w-11/12 rounded bg-slate-200" />
      <div className="h-4 w-full rounded bg-slate-200" />
      <div className="h-4 w-8/12 rounded bg-slate-200" />
    </div>
  );
}
