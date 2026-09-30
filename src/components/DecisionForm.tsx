import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, Wand2, Shield, Scale, Zap, Check, HelpCircle, Sparkles } from 'lucide-react';
import { DECISION_PRESETS } from '../data/presets';
import { DecisionPreset, RiskTolerance } from '../types/decision';

interface DecisionFormProps {
  onSubmit: (params: {
    title: string;
    context: string;
    options: string[];
    riskTolerance: RiskTolerance;
    priorities: string[];
    thinkingEnabled: boolean;
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

export const DecisionForm: React.FC<DecisionFormProps> = ({
  onSubmit,
  isLoading,
  loadingStepText,
}) => {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('balanced');
  const [priorities, setPriorities] = useState<string[]>([
    'Financial Growth',
    'Work-Life Peace',
  ]);
  const [customPriority, setCustomPriority] = useState('');
  const [thinkingEnabled, setThinkingEnabled] = useState(true);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

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

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
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

  const loadPreset = (preset: DecisionPreset) => {
    setTitle(preset.title);
    setContext(preset.context);
    setOptions([...preset.options]);
    setRiskTolerance(preset.riskTolerance);
    setPriorities([...preset.priorities]);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleSuggest = async () => {
    if (!title.trim()) {
      setSuggestionError('Please enter a dilemma or decision question first.');
      return;
    }
    setSuggestionError(null);
    setIsSuggesting(true);

    try {
      const res = await fetch('/api/suggest-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: title }),
      });
      if (!res.ok) throw new Error('Suggestion request failed');
      const data = await res.json();

      if (data.refinedTitle) setTitle(data.refinedTitle);
      if (data.suggestedContext && !context) setContext(data.suggestedContext);
      if (Array.isArray(data.options) && data.options.length >= 2) {
        setOptions(data.options);
      }
      if (Array.isArray(data.suggestedPriorities) && data.suggestedPriorities.length > 0) {
        setPriorities(data.suggestedPriorities);
      }
    } catch (err: any) {
      setSuggestionError('Could not auto-suggest options. You can type them manually below.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      context: context.trim(),
      options: cleanOptions.length >= 2 ? cleanOptions : ['Option A', 'Option B'],
      riskTolerance,
      priorities,
      thinkingEnabled,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-amber-800 font-semibold mb-2">
          Structured Decision Intelligence
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-quote font-medium text-stone-900 tracking-tight mb-4">
          When the choice is too close to call.
        </h1>
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          The Tiebreaker deconstructs hard life, career, and strategic dilemmas into weighted pros & cons, a multi-criteria scoring matrix, deep SWOT analysis, and a decisive recommendation.
        </p>
      </div>

      {/* Preset Inspiration Cards */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3 text-xs text-stone-500 font-medium">
          <span>Or test drive with real-world scenarios:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DECISION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset)}
              className="text-left p-3.5 bg-white border border-stone-200/90 hover:border-stone-400 rounded-lg transition-all hover:shadow-xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-amber-800">
                  {preset.category}
                </span>
                <span className="text-[11px] text-stone-400 group-hover:text-stone-700 transition-colors">
                  Load scenario →
                </span>
              </div>
              <h4 className="text-sm font-semibold text-stone-900 group-hover:text-stone-950">
                {preset.title}
              </h4>
              <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                {preset.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Card */}
      <div className="bg-white border border-stone-200/80 rounded-xl p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dilemma Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="decision-title" className="block text-sm font-semibold text-stone-900">
                What is the decision you need to make? <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleSuggest}
                disabled={isSuggesting || !title.trim()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-900 hover:text-amber-950 disabled:opacity-40 transition-colors"
                title="AI can formulate clear options & priorities from your question"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isSuggesting ? 'Formulating...' : 'Auto-breakdown dilemma'}</span>
              </button>
            </div>
            <input
              id="decision-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Should I accept the senior role at the startup or stay at the tech giant?"
              className="w-full px-4 py-2.5 text-sm bg-stone-50/70 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-stone-800 transition-all text-stone-900 placeholder:text-stone-400"
            />
            {suggestionError && (
              <p className="mt-1 text-xs text-rose-600">{suggestionError}</p>
            )}
          </div>

          {/* Options List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-stone-900">
                The Options Considered
              </label>
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another option</span>
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-semibold text-stone-400 text-center">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} (e.g., ${
                      idx === 0
                        ? 'Take the new job offer'
                        : idx === 1
                        ? 'Stay at current role'
                        : 'Negotiate hybrid arrangement'
                    })`}
                    className="flex-1 px-3.5 py-2 text-sm bg-stone-50/70 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-stone-800 transition-all text-stone-900 placeholder:text-stone-400"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-stone-400 hover:text-stone-700 transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Context & Background */}
          <div>
            <label htmlFor="decision-context" className="block text-sm font-semibold text-stone-900 mb-1">
              Context, Constraints & Stakes <span className="text-xs font-normal text-stone-500">(Optional but recommended)</span>
            </label>
            <textarea
              id="decision-context"
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="What are the stakes, timeline, financial figures, dependent people, or personal fears at play? (e.g., Need to make a decision by Friday, spouse prefers stability, $20k salary difference...)"
              className="w-full px-4 py-2.5 text-sm bg-stone-50/70 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-stone-800 transition-all text-stone-900 placeholder:text-stone-400 resize-y"
            />
          </div>

          {/* Risk Tolerance Profile */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-2">
              Your Risk Profile for This Decision
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'conservative',
                  title: 'Conservative',
                  desc: 'Protect downside, avoid regret, prioritize stability',
                  icon: Shield,
                },
                {
                  id: 'balanced',
                  title: 'Balanced',
                  desc: 'Pragmatic risk-adjusted return & optionality',
                  icon: Scale,
                },
                {
                  id: 'aggressive',
                  title: 'Aggressive',
                  desc: 'Maximize upside potential, embrace calculated volatility',
                  icon: Zap,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = riskTolerance === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRiskTolerance(item.id as RiskTolerance)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-stone-500'}`} />
                      <span className="text-xs font-semibold">{item.title}</span>
                    </div>
                    <p className={`text-[11px] leading-tight ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Priorities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-stone-900">
                Key Decision Drivers & Values
              </label>
              <span className="text-xs text-stone-500">
                {priorities.length} selected
              </span>
            </div>

            {/* Priority interactive buttons */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {DEFAULT_PRIORITIES.map((p) => {
                const active = priorities.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePriority(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      active
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 inline mr-1" />}
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Custom Priority Write-in */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customPriority}
                onChange={(e) => setCustomPriority(e.target.value)}
                placeholder="Add custom priority (e.g., Zero commute, Equity upside)..."
                className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-800 text-stone-900 placeholder:text-stone-400"
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
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-md transition-colors"
              >
                Add Driver
              </button>
            </div>
          </div>

          {/* Thinking Mode Indicator & Toggle */}
          <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-stone-900">
                  Gemini 3.1 Pro High-Thinking Reasoning
                </span>
                <p className="text-[11px] text-stone-500">
                  Applies maximum deliberative thinking level to uncover cognitive biases, second-order consequences, and hidden trade-offs.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setThinkingEnabled(!thinkingEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                thinkingEnabled ? 'bg-stone-900' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  thinkingEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="w-full py-3.5 px-6 rounded-lg text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                  <span>{loadingStepText || 'Analyzing Decision Matrix...'}</span>
                </>
              ) : (
                <>
                  <span>Break the Tie & Generate Full Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
