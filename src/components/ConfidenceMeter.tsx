import React, { useState } from 'react';
import { Gauge, Info, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Sparkles, Sliders } from 'lucide-react';
import { DecisionAnalysis } from '../types/decision';

interface ConfidenceMeterProps {
  decision: DecisionAnalysis;
  onRefineInput?: () => void;
}

interface DepthSignal {
  name: string;
  score: 'High' | 'Moderate' | 'Basic';
  impactText: string;
  detail: string;
  isPositive: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  decision,
  onRefineInput,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { context, options, priorities, riskTolerance, verdict } = decision;

  // Evaluate input depth signals
  const contextLength = (context || '').trim().length;
  const hasNumbers = /\d+/.test(context || '');
  const hasTimeline = /(month|year|week|day|deadline|timeline|quarter|q[1-4]|friday|tomorrow|soon)/i.test(context || '');
  const hasFinancials = /(\$|salary|equity|cost|budget|mortgage|rent|bonus|income|debt|rate)/i.test(context || '');
  const priorityCount = (priorities || []).length;
  const optionsCount = (options || []).length;

  const signals: DepthSignal[] = [
    {
      name: 'Contextual Specificity & Stakes',
      score: contextLength > 150 && (hasNumbers || hasTimeline || hasFinancials)
        ? 'High'
        : contextLength > 50
        ? 'Moderate'
        : 'Basic',
      impactText:
        contextLength > 150
          ? 'Deep constraints, timelines, or financial specifics detected'
          : contextLength > 50
          ? 'Moderate background provided, minimal numbers or hard constraints'
          : 'Minimal background provided; analysis relies primarily on generic domain heuristics',
      detail:
        hasFinancials && hasTimeline
          ? 'Financial and timeline constraints explicitly anchored the reasoning.'
          : hasFinancials
          ? 'Financial numbers provided a solid quantitative basis.'
          : hasTimeline
          ? 'Timeline urgency factored into reversibility analysis.'
          : 'Adding specific salary, budget, or deadline figures will sharpen the verdict.',
      isPositive: contextLength > 100,
    },
    {
      name: 'Priority & Value Weighting',
      score: priorityCount >= 3 ? 'High' : priorityCount >= 1 ? 'Moderate' : 'Basic',
      impactText:
        priorityCount >= 3
          ? `${priorityCount} explicit decision drivers selected`
          : priorityCount >= 1
          ? `${priorityCount} driver selected`
          : 'Default priorities assumed',
      detail:
        priorityCount >= 2
          ? 'Weights criteria directly against your stated life and career values.'
          : 'Selecting 2-3 specific priorities helps the engine weigh trade-offs accurately.',
      isPositive: priorityCount >= 2,
    },
    {
      name: 'Option Space Diversity',
      score: optionsCount >= 3 ? 'High' : 'Moderate',
      impactText:
        optionsCount >= 3
          ? `${optionsCount} distinct pathways evaluated simultaneously`
          : 'Standard binary dilemma (A vs. B)',
      detail:
        optionsCount >= 3
          ? 'Evaluating 3+ choices reduces false-binary trap and uncovers third-way compromises.'
          : 'Standard binary choices are crisp, but adding a third staged/hybrid option can reveal better paths.',
      isPositive: optionsCount >= 2,
    },
    {
      name: 'Risk Posture Calibration',
      score: riskTolerance ? 'High' : 'Moderate',
      impactText: `Calibrated to ${riskTolerance || 'balanced'} risk profile`,
      detail:
        riskTolerance === 'conservative'
          ? 'Heavily penalizes irreversible downsides and worst-case failure modes.'
          : riskTolerance === 'aggressive'
          ? 'Maximizes asymmetric upside potential and long-term optionality.'
          : 'Balances risk-adjusted return and short-term peace of mind.',
      isPositive: true,
    },
  ];

  // Calculate composite calibrated confidence score based on input depth + model verdict
  let depthBonus = 0;
  if (contextLength > 150) depthBonus += 6;
  if (hasNumbers || hasFinancials) depthBonus += 4;
  if (hasTimeline) depthBonus += 3;
  if (priorityCount >= 2) depthBonus += 4;
  if (optionsCount >= 3) depthBonus += 3;

  // Base confidence from model (typically 75-88), calibrated against real input depth
  const rawModelConfidence = verdict?.confidencePercent || 80;
  const calibratedConfidence = Math.min(
    95,
    Math.max(62, Math.round(rawModelConfidence * 0.75 + (50 + depthBonus * 1.5) * 0.25))
  );

  const getConfidenceTier = (score: number) => {
    if (score >= 85) return { label: 'High Conviction', color: 'text-emerald-700', bg: 'bg-emerald-500', barBg: 'bg-emerald-100', desc: 'Sufficiently detailed constraints enable definitive recommendation.' };
    if (score >= 75) return { label: 'Moderate Conviction', color: 'text-amber-700', bg: 'bg-amber-500', barBg: 'bg-amber-100', desc: 'Clear recommendation, but adding missing constraints could test edge cases.' };
    return { label: 'Directional Guidance', color: 'text-stone-700', bg: 'bg-stone-500', barBg: 'bg-stone-100', desc: 'Heuristic recommendation; input lacked specific financial or timeline parameters.' };
  };

  const tier = getConfidenceTier(calibratedConfidence);

  return (
    <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-stone-100 text-stone-800 rounded-lg shrink-0 mt-0.5">
            <Gauge className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">
                AI Confidence Meter
              </h3>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className={`text-xs font-semibold ${tier.color}`}>
                {tier.label}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Calibrated by the completeness, quantitative specifics, and constraints in your input.
            </p>
          </div>
        </div>

        {/* Big Score Callout */}
        <div className="flex items-baseline gap-2 self-start sm:self-center">
          <span className="text-3xl font-serif-quote font-bold text-stone-900 tracking-tight">
            {calibratedConfidence}%
          </span>
          <span className="text-xs text-stone-500">
            confidence score
          </span>
        </div>
      </div>

      {/* Visual Multi-Segment Meter */}
      <div className="mt-4 space-y-2">
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex gap-1 p-0.5">
          {/* Low / Directional Band (0-65) */}
          <div
            className={`h-full rounded-l-full transition-all duration-500 ${
              calibratedConfidence >= 60 ? 'bg-amber-400' : 'bg-stone-300'
            }`}
            style={{ width: '40%' }}
          />
          {/* Moderate Band (65-80) */}
          <div
            className={`h-full transition-all duration-500 ${
              calibratedConfidence >= 75 ? 'bg-amber-500' : 'bg-stone-200'
            }`}
            style={{ width: '35%' }}
          />
          {/* High Conviction Band (80-100) */}
          <div
            className={`h-full rounded-r-full transition-all duration-500 ${
              calibratedConfidence >= 85 ? 'bg-emerald-600' : 'bg-stone-200'
            }`}
            style={{ width: '25%' }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-wider font-semibold px-0.5">
          <span>Directional (60%)</span>
          <span>Moderate Conviction (75%)</span>
          <span className="text-right">High Conviction (85%+)</span>
        </div>
      </div>

      {/* Expandable Input Depth Factor Breakdown */}
      <div className="mt-4 pt-3 border-t border-stone-100">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs text-stone-600 hover:text-stone-900 font-medium py-1 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-stone-500" />
            <span>
              Input Depth Breakdown ({signals.filter((s) => s.score === 'High').length} of {signals.length} Signals Strong)
            </span>
          </div>
          <div className="flex items-center gap-1 text-stone-400">
            <span>{isExpanded ? 'Hide Details' : 'View Factors'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3 pt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {signals.map((sig, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50/70 border border-stone-200/80 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">
                      {sig.name}
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        sig.score === 'High'
                          ? 'text-emerald-700'
                          : sig.score === 'Moderate'
                          ? 'text-amber-700'
                          : 'text-stone-500'
                      }`}
                    >
                      {sig.score} Depth
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    {sig.impactText}
                  </p>
                  <p className="text-[11px] text-stone-400 italic">
                    {sig.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Practical Advice to Increase Confidence */}
            {calibratedConfidence < 85 && (
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg flex items-start gap-2.5 text-[11px] text-amber-900">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">
                    Want to increase conviction to 90%+?
                  </span>
                  <span>
                    Include hard constraints in your context: specific dollar values, non-negotiable family/health boundaries, or precise drop-dead dates.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
