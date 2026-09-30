import React from 'react';
import { Scale, History, PlusCircle, Printer, Sparkles } from 'lucide-react';

interface HeaderProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onPrint?: () => void;
  savedCount: number;
  hasActiveDecision: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDecision,
  onOpenHistory,
  onPrint,
  savedCount,
  hasActiveDecision,
}) => {
  return (
    <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onNewDecision}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-brand font-semibold text-lg tracking-wider text-stone-900">
                THE TIEBREAKER
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium tracking-wide uppercase">
              Executive Decision Intelligence
            </p>
          </div>
        </div>

        {/* Engine status indicator (Clean typographic metadata, zero-pill discipline) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Gemini 3.1 Pro Preview</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="text-stone-700 font-medium">High Thinking Mode Active</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveDecision && onPrint && (
            <button
              onClick={onPrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-md transition-colors"
              title="Print or export to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-md transition-colors"
            title="Saved decisions"
          >
            <History className="w-3.5 h-3.5" />
            <span>Saved ({savedCount})</span>
          </button>

          <button
            onClick={onNewDecision}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Decision</span>
          </button>
        </div>
      </div>
    </header>
  );
};
