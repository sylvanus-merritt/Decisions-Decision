import React, { useState } from 'react';
import { X, GitFork, ArrowRight, Shield, Scale, Zap, Check, Plus, Trash2, Sparkles, HelpCircle } from 'lucide-react';
import { DecisionAnalysis, RiskTolerance } from '../types/decision';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDecision: DecisionAnalysis;
  existingVersionsCount: number;
  onCreateVersion: (params: {
    title: string;
    context: string;
    options: string[];
    riskTolerance: RiskTolerance;
    priorities: string[];
    versionLabel: string;
    versionNumber: number;
    parentId: string;
    rootDecisionId: string;
  }) => void;
  isLoading: boolean;
  loadingStepText: string;
}

const DEFAULT_PRIORITIES = [
  'Financial Growth',
  'Work-Life Peace',
  'Career Acceleration',
  'Family Well-being',
  'Long-term Optionality',
  'Skill Mastery',
  'Physical Health',
  'Daily Autonomy',
];

export const VersionModal: React.FC<VersionModalProps> = ({
  isOpen,
  onClose,
  currentDecision,
  existingVersionsCount,
  onCreateVersion,
  isLoading,
  loadingStepText,
}) => {
  if (!isOpen) return null;

  const nextVersionNum = existingVersionsCount + 1;

  const [title, setTitle] = useState(currentDecision.title);
  const [versionLabel, setVersionLabel] = useState(
    `Version ${nextVersionNum} (${
      currentDecision.riskTolerance === 'balanced'
        ? 'Conservative Shift'
        : currentDecision.riskTolerance === 'conservative'
        ? 'Aggressive Posture'
        : 'Balanced Stance'
    })`
  );
  const [context, setContext] = useState(currentDecision.context || '');
  const [options, setOptions] = useState<string[]>(
    currentDecision.options.map((o) => o.title)
  );
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(
    currentDecision.riskTolerance || 'balanced'
  );
  const [priorities, setPriorities] = useState<string[]>([
    ...currentDecision.priorities,
  ]);
  const [customPriority, setCustomPriority] = useState('');

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const togglePriority = (p: string) => {
    if (priorities.includes(p)) {
      setPriorities(priorities.filter((item) => item !== p));
    } else {
      setPriorities([...priorities, p]);
    }
  };

  const handleAddCustomPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPriority.trim() && !priorities.includes(customPriority.trim())) {
      setPriorities([...priorities, customPriority.trim()]);
      setCustomPriority('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!title.trim()) return;

    onCreateVersion({
      title: title.trim(),
      context: context.trim(),
      options: cleanOptions.length >= 2 ? cleanOptions : ['Option A', 'Option B'],
      riskTolerance,
      priorities,
      versionLabel: versionLabel.trim() || `Version ${nextVersionNum}`,
      versionNumber: nextVersionNum,
      parentId: currentDecision.id,
      rootDecisionId: currentDecision.rootDecisionId || currentDecision.id,
    });
  };

  // Detect differences from current decision
  const hasRiskChanged = riskTolerance !== currentDecision.riskTolerance;
  const hasContextChanged = context.trim() !== (currentDecision.context || '').trim();
  const hasPrioritiesChanged =
    priorities.length !== currentDecision.priorities.length ||
    priorities.some((p) => !currentDecision.priorities.includes(p));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 z-10 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center shrink-0">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-stone-900">
                  Create Decision Version / Branch
                </h3>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                  v{nextVersionNum}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Modify parameters or assumptions to see how the recommendation changes.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Version Label / Name */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              Version Label / Hypothesis Description
            </label>
            <input
              type="text"
              required
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="e.g. Version 2: With Conservative Risk, or Version 2: Remote Revoked"
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-800 text-stone-900"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Give this variation a descriptive title so you can distinguish it in the history drawer.
            </p>
          </div>

          {/* Quick Differences Tracker */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
            <span className="font-semibold text-stone-700 block mb-1 text-[11px] uppercase tracking-wide">
              Parameter Delta from Previous Version:
            </span>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {hasRiskChanged ? (
                <span className="text-amber-800 font-medium">
                  • Risk Profile: {currentDecision.riskTolerance} → <strong>{riskTolerance}</strong>
                </span>
              ) : (
                <span className="text-stone-400">• Risk Profile unchanged</span>
              )}

              {hasContextChanged ? (
                <span className="text-amber-800 font-medium">• Context / Constraints modified</span>
              ) : (
                <span className="text-stone-400">• Constraints unchanged</span>
              )}

              {hasPrioritiesChanged ? (
                <span className="text-amber-800 font-medium">• Priority drivers modified</span>
              ) : (
                <span className="text-stone-400">• Priorities unchanged</span>
              )}
            </div>
          </div>

          {/* Risk Profile Selection */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1.5">
              Risk Profile for this Version
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'conservative', title: 'Conservative', desc: 'Preserve Downside', icon: Shield },
                { id: 'balanced', title: 'Balanced', desc: 'Risk-Adjusted Return', icon: Scale },
                { id: 'aggressive', title: 'Aggressive', desc: 'Maximize Upside', icon: Zap },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = riskTolerance === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRiskTolerance(item.id as RiskTolerance)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-stone-500'}`} />
                      <span className="font-semibold text-xs">{item.title}</span>
                    </div>
                    <p className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context & Constraints */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              Modified Context, New Stakes, or Updated Assumptions
            </label>
            <textarea
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="What changed or what new constraints are you testing in this version? (e.g. Spouse got an offer, relocation stipend increased, budget slashed...)"
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-800 text-stone-900 resize-y"
            />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-stone-800">
                Options Under Consideration
              </label>
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add option</span>
                </button>
              )}
            </div>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold text-stone-400">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-800 text-stone-900"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1 text-stone-400 hover:text-stone-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Priorities */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1.5">
              Decision Drivers & Values
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {DEFAULT_PRIORITIES.map((p) => {
                const active = priorities.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePriority(p)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      active
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 inline mr-1" />}
                    {p}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customPriority}
                onChange={(e) => setCustomPriority(e.target.value)}
                placeholder="Add custom driver..."
                className="flex-1 px-3 py-1 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomPriority(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomPriority}
                className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md"
              >
                Add Driver
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{loadingStepText || 'Evaluating Version...'}</span>
                </>
              ) : (
                <>
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Analyze & Save as Version {nextVersionNum}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
