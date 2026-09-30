import React from 'react';
import { Award, AlertTriangle, ShieldCheck, DoorOpen, CalendarCheck, Lightbulb, Compass, ArrowRight } from 'lucide-react';
import { DecisionAnalysis } from '../types/decision';
import { ConfidenceMeter } from './ConfidenceMeter';

interface VerdictViewProps {
  decision: DecisionAnalysis;
  onSelectTab: (tab: 'proscons' | 'comparison' | 'swot' | 'scenarios') => void;
  onRefineInput?: () => void;
}

export const VerdictView: React.FC<VerdictViewProps> = ({ decision, onSelectTab, onRefineInput }) => {
  const { verdict, options } = decision;
  const winningOption = options.find((o) => o.id === verdict.winnerOptionId) || options[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Primary Verdict Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-10 shadow-md relative overflow-hidden border border-stone-800">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                The Tiebreaker Recommendation
              </span>
            </div>

            <div className="text-xs text-stone-400">
              Confidence Level: <span className="text-amber-200 font-semibold">{verdict.confidencePercent}%</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-quote font-normal text-white tracking-tight mb-2">
            {verdict.winnerTitle || winningOption?.title}
          </h2>

          <p className="text-sm sm:text-base text-stone-300 font-serif-quote italic max-w-3xl leading-relaxed mb-6">
            "{winningOption?.tagline || winningOption?.summary}"
          </p>

          {/* The Decisive Factor Callout */}
          <div className="bg-stone-800/80 rounded-xl p-4 sm:p-5 border border-stone-700/80">
            <div className="flex items-start gap-3">
              <Compass className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-200 uppercase tracking-wide mb-1">
                  The Decisive Factor (Why This Breaks the Tie)
                </h4>
                <p className="text-sm text-stone-200 leading-relaxed">
                  {verdict.theDecisiveFactor}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Confidence Meter based on depth of input data provided */}
      <ConfidenceMeter decision={decision} onRefineInput={onRefineInput} />

      {/* Analytical Triad: Hard Truth, Pre-Mortem, Contingency Hedge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Hard Truth */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-stone-700">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                The Hard Truth (The Trade-Off)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {verdict.hardTruth}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
            Accepting this cost upfront removes future remorse.
          </div>
        </div>

        {/* Pre-Mortem */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-stone-700">
              <Lightbulb className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                12-Month Pre-Mortem
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {verdict.preMortem}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
            Identifying failure modes before you commit.
          </div>
        </div>

        {/* Contingency Plan */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                The Safety Hedge
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {verdict.contingencyPlan}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
            Operational insurance to protect your downside.
          </div>
        </div>
      </div>

      {/* Decision Architecture & Reversibility */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-stone-100 text-stone-800 rounded-lg shrink-0">
            <DoorOpen className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                {verdict.reversibleDoorAnalysis?.type || 'Type 2 (Two-Way Door)'}
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500">Reversibility Calculus</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {verdict.reversibleDoorAnalysis?.reasoning ||
                'Most decisions can be unwound or adjusted if new evidence emerges within 90 days. Treat this as an experiment rather than a permanent verdict.'}
            </p>
          </div>
        </div>
      </div>

      {/* 30-Day Execution Roadmap */}
      {verdict.actionPlan30Days && verdict.actionPlan30Days.length > 0 && (
        <div className="bg-white border border-stone-200/90 rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
              Immediate 30-Day Execution Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {verdict.actionPlan30Days.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-lg"
              >
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-stone-700 leading-snug">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep-Dive Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200/80 text-xs text-stone-600">
        <span>Dive deeper into the supporting evidence:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('proscons')}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-md transition-colors"
          >
            Inspect Pros & Cons →
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('comparison')}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-md transition-colors"
          >
            Comparison Matrix →
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('swot')}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-md transition-colors"
          >
            SWOT Analysis →
          </button>
        </div>
      </div>
    </div>
  );
};
