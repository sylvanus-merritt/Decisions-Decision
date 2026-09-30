import React, { useState } from 'react';
import { Sparkles, ArrowRight, History, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DecisionAnalysis, ScenarioTestResult } from '../types/decision';

interface ScenarioSimulatorProps {
  decision: DecisionAnalysis;
  onUpdateDecision: (updated: DecisionAnalysis) => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  decision,
  onUpdateDecision,
}) => {
  const [customScenario, setCustomScenario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scenarioHistory = decision.scenarioHistory || [];

  const runScenario = async (scenarioText: string) => {
    if (!scenarioText.trim()) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/scenario-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          scenario: scenarioText.trim(),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Scenario simulation failed');
      }

      const result: ScenarioTestResult = await res.json();
      const updatedHistory = [result, ...scenarioHistory];

      onUpdateDecision({
        ...decision,
        scenarioHistory: updatedHistory,
      });
      setCustomScenario('');
    } catch (err: any) {
      setError(err?.message || 'Could not evaluate scenario.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runScenario(customScenario);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Box */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-semibold text-stone-900">
            "What-If" Scenario Stress-Testing
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
          Decisions don't happen in a vacuum. Simulate unforeseen changes—budget cuts, timeline shocks, policy reversals, or personal disruptions—to discover which option remains robust under pressure.
        </p>

        {/* Pre-Generated Scenario Prompts */}
        {decision.scenarioPrompts && decision.scenarioPrompts.length > 0 && (
          <div className="space-y-2 mb-6">
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
              Suggested Scenarios for This Decision:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {decision.scenarioPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => runScenario(prompt)}
                  className="text-left p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs text-stone-800 transition-colors flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="line-clamp-2">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 shrink-0 ml-1.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Scenario Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="custom-scenario" className="block text-xs font-semibold text-stone-800 uppercase tracking-wide">
            Or Test a Custom Scenario:
          </label>
          <div className="flex items-center gap-2">
            <input
              id="custom-scenario"
              type="text"
              value={customScenario}
              onChange={(e) => setCustomScenario(e.target.value)}
              placeholder="e.g., What if the compensation package is delayed by 6 months?"
              className="flex-1 px-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-800 text-stone-900 placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={isLoading || !customScenario.trim()}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <span>Simulate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </form>
      </div>

      {/* Scenario Simulation Results History */}
      {scenarioHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 uppercase tracking-wider">
            <History className="w-4 h-4 text-stone-500" />
            <span>Tested Scenarios ({scenarioHistory.length})</span>
          </div>

          <div className="space-y-4">
            {scenarioHistory.map((res, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <h4 className="text-sm font-semibold text-stone-900">
                      "{res.scenario}"
                    </h4>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Winner under this scenario: <span className="font-semibold text-stone-800">{res.winnerTitle}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-stone-700 block mb-1">
                      Calculus Shift & Dynamics:
                    </span>
                    <p className="text-stone-600 leading-relaxed">
                      {res.impactSummary}
                    </p>
                    <p className="text-stone-500 italic mt-1">
                      {res.shiftInPower}
                    </p>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                    <span className="font-semibold text-stone-800 block mb-1">
                      Operational Tripwire Advice:
                    </span>
                    <p className="text-stone-600 leading-relaxed">
                      {res.keyAdvice}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
