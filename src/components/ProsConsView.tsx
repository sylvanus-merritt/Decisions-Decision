import React, { useState } from 'react';
import { Plus, Check, X, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react';
import { DecisionAnalysis, FactorCategory, ProConItem } from '../types/decision';

interface ProsConsViewProps {
  decision: DecisionAnalysis;
  onUpdateDecision: (updated: DecisionAnalysis) => void;
}

const CATEGORIES: FactorCategory[] = [
  'Financial',
  'Career',
  'Wellbeing',
  'Relationships',
  'Risk',
  'Time',
  'Strategic',
  'Other',
];

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  decision,
  onUpdateDecision,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    decision.options[0]?.id || ''
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [newProText, setNewProText] = useState('');
  const [newProCategory, setNewProCategory] = useState<FactorCategory>('Strategic');
  const [isAddingPro, setIsAddingPro] = useState(false);

  const [newConText, setNewConText] = useState('');
  const [newConCategory, setNewConCategory] = useState<FactorCategory>('Strategic');
  const [isAddingCon, setIsAddingCon] = useState(false);

  const activeOption =
    decision.options.find((o) => o.id === selectedOptionId) || decision.options[0];

  const handleToggleItem = (
    type: 'pros' | 'cons',
    itemId: string
  ) => {
    const updatedOptions = decision.options.map((opt) => {
      if (opt.id !== activeOption.id) return opt;
      return {
        ...opt,
        [type]: opt[type].map((item: ProConItem) =>
          item.id === itemId ? { ...item, isActive: !item.isActive } : item
        ),
      };
    });
    onUpdateDecision({ ...decision, options: updatedOptions });
  };

  const handleWeightChange = (
    type: 'pros' | 'cons',
    itemId: string,
    delta: number
  ) => {
    const updatedOptions = decision.options.map((opt) => {
      if (opt.id !== activeOption.id) return opt;
      return {
        ...opt,
        [type]: opt[type].map((item: ProConItem) => {
          if (item.id !== itemId) return item;
          const newWeight = Math.min(5, Math.max(1, (item.weight || 3) + delta));
          return { ...item, weight: newWeight };
        }),
      };
    });
    onUpdateDecision({ ...decision, options: updatedOptions });
  };

  const handleAddPro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProText.trim()) return;

    const newItem: ProConItem = {
      id: 'custom-pro-' + Date.now(),
      text: newProText.trim(),
      detail: 'Added by decider during evaluation.',
      category: newProCategory,
      weight: 4,
      isActive: true,
      isUserAdded: true,
    };

    const updatedOptions = decision.options.map((opt) => {
      if (opt.id !== activeOption.id) return opt;
      return { ...opt, pros: [newItem, ...opt.pros] };
    });

    onUpdateDecision({ ...decision, options: updatedOptions });
    setNewProText('');
    setIsAddingPro(false);
  };

  const handleAddCon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConText.trim()) return;

    const newItem: ProConItem = {
      id: 'custom-con-' + Date.now(),
      text: newConText.trim(),
      detail: 'Added by decider during evaluation.',
      category: newConCategory,
      weight: 4,
      mitigation: 'Monitor and review quarterly.',
      isActive: true,
      isUserAdded: true,
    };

    const updatedOptions = decision.options.map((opt) => {
      if (opt.id !== activeOption.id) return opt;
      return { ...opt, cons: [newItem, ...opt.cons] };
    });

    onUpdateDecision({ ...decision, options: updatedOptions });
    setNewConText('');
    setIsAddingCon(false);
  };

  const filteredPros = activeOption.pros.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter
  );
  const filteredCons = activeOption.cons.filter(
    (c) => categoryFilter === 'all' || c.category === categoryFilter
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Option Selector Segmented Control */}
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

        {/* Category Filter */}
        <div className="flex items-center gap-2 text-xs text-stone-500 self-end sm:self-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
          <span>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 text-stone-800 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Option Tagline & Summary */}
      <div className="bg-stone-100/70 border border-stone-200/80 rounded-xl p-4">
        <h3 className="text-base font-semibold text-stone-900 mb-0.5">
          {activeOption.title}
        </h3>
        <p className="text-xs text-stone-600">
          {activeOption.tagline} — {activeOption.summary}
        </p>
      </div>

      {/* Side-by-Side Pros and Cons Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pros Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                Pros & Upsides ({filteredPros.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingPro(!isAddingPro)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pro</span>
            </button>
          </div>

          {/* Add Pro Inline Form */}
          {isAddingPro && (
            <form
              onSubmit={handleAddPro}
              className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2.5"
            >
              <input
                type="text"
                value={newProText}
                onChange={(e) => setNewProText(e.target.value)}
                placeholder="Enter pro or advantage..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600"
                autoFocus
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={newProCategory}
                  onChange={(e) => setNewProCategory(e.target.value as FactorCategory)}
                  className="text-xs bg-white border border-stone-200 rounded px-2 py-1 text-stone-700"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingPro(false)}
                    className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md"
                  >
                    Save Pro
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Pros List */}
          <div className="space-y-3">
            {filteredPros.map((pro) => (
              <div
                key={pro.id}
                className={`p-4 rounded-xl border transition-all ${
                  pro.isActive
                    ? 'bg-white border-stone-200/90 shadow-xs'
                    : 'bg-stone-50 border-stone-200/40 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleItem('pros', pro.id)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        pro.isActive
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                      title={pro.isActive ? 'Active in score' : 'Ignored in score'}
                    >
                      {pro.isActive && <Check className="w-3 h-3 stroke-3" />}
                    </button>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900 leading-snug">
                        {pro.text}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                        <span>{pro.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>Impact: {pro.weight}/5</span>
                        {pro.isUserAdded && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-800 font-medium">Custom</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Weight Controls */}
                  <div className="flex items-center gap-1 bg-stone-100 rounded px-1.5 py-0.5 text-xs text-stone-600">
                    <button
                      type="button"
                      onClick={() => handleWeightChange('pros', pro.id, -1)}
                      className="hover:text-stone-900 font-bold px-1"
                      title="Decrease weight"
                    >
                      -
                    </button>
                    <span className="font-semibold px-0.5">{pro.weight}</span>
                    <button
                      type="button"
                      onClick={() => handleWeightChange('pros', pro.id, 1)}
                      className="hover:text-stone-900 font-bold px-1"
                      title="Increase weight"
                    >
                      +
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-600 pl-6 leading-relaxed mb-2">
                  {pro.detail}
                </p>

                {pro.counterpoint && (
                  <div className="ml-6 pl-2.5 border-l-2 border-amber-300 text-[11px] text-stone-500 italic">
                    <span className="font-medium text-stone-600 not-italic">Nuance: </span>
                    {pro.counterpoint}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cons Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                Cons & Liabilities ({filteredCons.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingCon(!isAddingCon)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 hover:text-rose-950 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Con</span>
            </button>
          </div>

          {/* Add Con Inline Form */}
          {isAddingCon && (
            <form
              onSubmit={handleAddCon}
              className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-xl space-y-2.5"
            >
              <input
                type="text"
                value={newConText}
                onChange={(e) => setNewConText(e.target.value)}
                placeholder="Enter con or risk..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-600"
                autoFocus
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={newConCategory}
                  onChange={(e) => setNewConCategory(e.target.value as FactorCategory)}
                  className="text-xs bg-white border border-stone-200 rounded px-2 py-1 text-stone-700"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingCon(false)}
                    className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-md"
                  >
                    Save Con
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Cons List */}
          <div className="space-y-3">
            {filteredCons.map((con) => (
              <div
                key={con.id}
                className={`p-4 rounded-xl border transition-all ${
                  con.isActive
                    ? 'bg-white border-stone-200/90 shadow-xs'
                    : 'bg-stone-50 border-stone-200/40 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleItem('cons', con.id)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        con.isActive
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                      title={con.isActive ? 'Active in score' : 'Ignored in score'}
                    >
                      {con.isActive && <Check className="w-3 h-3 stroke-3" />}
                    </button>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900 leading-snug">
                        {con.text}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                        <span>{con.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>Severity: {con.weight}/5</span>
                        {con.isUserAdded && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-800 font-medium">Custom</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Weight Controls */}
                  <div className="flex items-center gap-1 bg-stone-100 rounded px-1.5 py-0.5 text-xs text-stone-600">
                    <button
                      type="button"
                      onClick={() => handleWeightChange('cons', con.id, -1)}
                      className="hover:text-stone-900 font-bold px-1"
                      title="Decrease severity"
                    >
                      -
                    </button>
                    <span className="font-semibold px-0.5">{con.weight}</span>
                    <button
                      type="button"
                      onClick={() => handleWeightChange('cons', con.id, 1)}
                      className="hover:text-stone-900 font-bold px-1"
                      title="Increase severity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-600 pl-6 leading-relaxed mb-2">
                  {con.detail}
                </p>

                {con.mitigation && (
                  <div className="ml-6 pl-2.5 border-l-2 border-emerald-400 text-[11px] text-stone-500">
                    <span className="font-semibold text-emerald-800">Tactical Mitigation: </span>
                    {con.mitigation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
