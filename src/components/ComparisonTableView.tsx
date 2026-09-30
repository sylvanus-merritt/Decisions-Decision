import React, { useState } from 'react';
import { Plus, Sliders, Info, Trash2 } from 'lucide-react';
import { CriteriaRow, DecisionAnalysis } from '../types/decision';

interface ComparisonTableViewProps {
  decision: DecisionAnalysis;
  onUpdateDecision: (updated: DecisionAnalysis) => void;
}

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({
  decision,
  onUpdateDecision,
}) => {
  const { options, comparisonMatrix } = decision;
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Update criterion weight
  const handleWeightChange = (criteriaId: string, delta: number) => {
    const updated = comparisonMatrix.map((row) => {
      if (row.id !== criteriaId) return row;
      const newWeight = Math.min(5, Math.max(1, row.weight + delta));
      return { ...row, weight: newWeight };
    });
    onUpdateDecision({ ...decision, comparisonMatrix: updated });
  };

  // Update individual option score in cell
  const handleScoreChange = (
    criteriaId: string,
    optionId: string,
    newScore: number
  ) => {
    const updated = comparisonMatrix.map((row) => {
      if (row.id !== criteriaId) return row;
      const currentCell = row.optionScores[optionId] || { score: 5, note: '' };
      return {
        ...row,
        optionScores: {
          ...row.optionScores,
          [optionId]: {
            ...currentCell,
            score: Math.min(10, Math.max(1, newScore)),
          },
        },
      };
    });
    onUpdateDecision({ ...decision, comparisonMatrix: updated });
  };

  // Add custom criterion
  const handleAddCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriteriaName.trim()) return;

    const newRow: CriteriaRow = {
      id: 'crit-' + Date.now(),
      name: newCriteriaName.trim(),
      weight: 3,
      description: 'Custom criteria defined by decider.',
      optionScores: {},
    };

    options.forEach((opt) => {
      newRow.optionScores[opt.id] = {
        score: 6,
        note: 'Default baseline score.',
      };
    });

    onUpdateDecision({
      ...decision,
      comparisonMatrix: [...comparisonMatrix, newRow],
    });
    setNewCriteriaName('');
    setIsAdding(false);
  };

  const handleRemoveCriteria = (criteriaId: string) => {
    if (comparisonMatrix.length <= 1) return;
    onUpdateDecision({
      ...decision,
      comparisonMatrix: comparisonMatrix.filter((c) => c.id !== criteriaId),
    });
  };

  // Calculate weighted totals per option
  const totalWeight = comparisonMatrix.reduce((acc, row) => acc + row.weight, 0);

  const optionTotals: Record<string, number> = {};
  options.forEach((opt) => {
    let earned = 0;
    comparisonMatrix.forEach((row) => {
      const cell = row.optionScores[opt.id];
      const score = cell ? cell.score : 5;
      earned += score * row.weight;
    });
    const maxPossible = totalWeight * 10;
    optionTotals[opt.id] = maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : 50;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 border border-stone-200/90 rounded-xl shadow-xs">
        <div>
          <h3 className="text-base font-semibold text-stone-900">
            Multi-Criteria Decision Matrix
          </h3>
          <p className="text-xs text-stone-500">
            Adjust weights (1-5) and scores (1-10) to see how priorities sway the mathematical balance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Evaluation Factor</span>
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAddCriteria}
          className="p-3.5 bg-stone-100/80 border border-stone-200 rounded-xl flex items-center gap-2"
        >
          <input
            type="text"
            value={newCriteriaName}
            onChange={(e) => setNewCriteriaName(e.target.value)}
            placeholder="Criterion name (e.g., Relocation Overhead, Learning Curve)..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-800"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md"
          >
            Add Factor
          </button>
        </form>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto bg-white border border-stone-200/90 rounded-xl shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/80">
              <th className="py-3 px-4 text-xs font-semibold text-stone-700 w-1/3">
                Evaluation Criteria & Weight
              </th>
              {options.map((opt) => (
                <th key={opt.id} className="py-3 px-4 text-xs font-semibold text-stone-900">
                  <div className="flex items-center justify-between">
                    <span>{opt.title}</span>
                    <span className="text-[11px] font-mono text-stone-600">
                      Score: {optionTotals[opt.id]}%
                    </span>
                  </div>
                </th>
              ))}
              <th className="w-10 py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {comparisonMatrix.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50/50 transition-colors">
                {/* Criterion Name & Weight Slider */}
                <td className="py-3 px-4 align-top">
                  <div className="font-semibold text-stone-900 mb-0.5">
                    {row.name}
                  </div>
                  <div className="text-[11px] text-stone-500 mb-2">
                    {row.description}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                      Weight:
                    </span>
                    <div className="flex items-center gap-1 bg-stone-100 rounded px-1.5 py-0.5 text-stone-700">
                      <button
                        type="button"
                        onClick={() => handleWeightChange(row.id, -1)}
                        className="hover:text-stone-950 font-bold px-1"
                        title="Decrease weight"
                      >
                        -
                      </button>
                      <span className="font-semibold px-0.5">{row.weight}x</span>
                      <button
                        type="button"
                        onClick={() => handleWeightChange(row.id, 1)}
                        className="hover:text-stone-950 font-bold px-1"
                        title="Increase weight"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </td>

                {/* Option Columns */}
                {options.map((opt) => {
                  const cell = row.optionScores[opt.id] || { score: 5, note: '' };
                  return (
                    <td key={opt.id} className="py-3 px-4 align-top">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-stone-900">
                            {cell.score}
                          </span>
                          <span className="text-[10px] text-stone-400">/10</span>
                        </div>

                        {/* Quick score stepper */}
                        <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded px-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleScoreChange(row.id, opt.id, cell.score - 1)}
                            className="px-1 hover:text-stone-900 font-bold"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScoreChange(row.id, opt.id, cell.score + 1)}
                            className="px-1 hover:text-stone-900 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            cell.score >= 8
                              ? 'bg-emerald-600'
                              : cell.score >= 5
                              ? 'bg-amber-600'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${cell.score * 10}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-stone-600 leading-snug">
                        {cell.note}
                      </p>
                    </td>
                  );
                })}

                {/* Remove button */}
                <td className="py-3 px-2 align-top text-right">
                  {comparisonMatrix.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCriteria(row.id)}
                      className="text-stone-300 hover:text-stone-600 p-1"
                      title="Remove factor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {/* Summary Row */}
            <tr className="bg-stone-50 border-t-2 border-stone-200">
              <td className="py-4 px-4 font-semibold text-stone-900 text-sm">
                Composite Weighted Score
              </td>
              {options.map((opt) => (
                <td key={opt.id} className="py-4 px-4 font-bold text-base text-stone-900">
                  <div className="flex items-baseline gap-1">
                    <span>{optionTotals[opt.id]}</span>
                    <span className="text-xs text-stone-500 font-normal">/ 100</span>
                  </div>
                </td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
