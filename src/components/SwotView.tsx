import React, { useState } from 'react';
import { Shield, AlertCircle, Compass, Zap } from 'lucide-react';
import { DecisionAnalysis } from '../types/decision';

interface SwotViewProps {
  decision: DecisionAnalysis;
}

export const SwotView: React.FC<SwotViewProps> = ({ decision }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    decision.options[0]?.id || ''
  );

  const activeOption =
    decision.options.find((o) => o.id === selectedOptionId) || decision.options[0];

  const swot = activeOption.swot || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Option Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 border border-stone-200/90 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {decision.options.map((opt, i) => {
            const isSelected = opt.id === activeOption.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOptionId(opt.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70'
                }`}
              >
                <span className="font-semibold mr-1.5">{String.fromCharCode(65 + i)}.</span>
                <span>{opt.title}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-stone-500">
          Internal Capabilities vs. External Dynamics
        </div>
      </div>

      {/* Option Title / Subtitle */}
      <div className="bg-stone-100/70 border border-stone-200/80 rounded-xl p-4">
        <h3 className="text-base font-semibold text-stone-900 mb-0.5">
          {activeOption.title}
        </h3>
        <p className="text-xs text-stone-600">
          Strategic Position & Vulnerability Assessment
        </p>
      </div>

      {/* 2x2 SWOT Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths (Internal Positive) */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Strengths (Internal Advantages)
            </h4>
          </div>
          <ul className="space-y-2.5">
            {swot.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses (Internal Negative) */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Weaknesses (Internal Drag & Gaps)
            </h4>
          </div>
          <ul className="space-y-2.5">
            {swot.weaknesses.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities (External Positive) */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
            <Compass className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Opportunities (External Tailwinds)
            </h4>
          </div>
          <ul className="space-y-2.5">
            {swot.opportunities.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Threats (External Negative) */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
            <Zap className="w-4 h-4 text-rose-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Threats (External Headwinds & Tail Risks)
            </h4>
          </div>
          <ul className="space-y-2.5">
            {swot.threats.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
