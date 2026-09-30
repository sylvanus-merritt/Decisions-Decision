import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DecisionForm } from './components/DecisionForm';
import { VerdictView } from './components/VerdictView';
import { ProsConsView } from './components/ProsConsView';
import { ComparisonTableView } from './components/ComparisonTableView';
import { SwotView } from './components/SwotView';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { SavedDecisionsDrawer } from './components/SavedDecisionsDrawer';
import { VersionModal } from './components/VersionModal';
import { DecisionAnalysis, RiskTolerance } from './types/decision';
import { calculateDynamicOptionScore } from './utils/scoreCalculator';
import { generateMarkdownReport, downloadMarkdown } from './utils/exportUtils';
import {
  Award,
  Scale,
  TableProperties,
  Compass,
  Sparkles,
  Share2,
  Check,
  Download,
  AlertCircle,
  ArrowLeft,
  GitFork,
} from 'lucide-react';

const STORAGE_KEY = 'the_tiebreaker_saved_decisions';

export default function App() {
  const [activeDecision, setActiveDecision] = useState<DecisionAnalysis | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'verdict' | 'proscons' | 'comparison' | 'swot' | 'scenarios'
  >('verdict');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [decisionToFork, setDecisionToFork] = useState<DecisionAnalysis | null>(null);

  // Load saved decisions from localStorage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedDecisions(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved decisions from localStorage:', e);
    }
  }, []);

  // Save to localStorage whenever decisions change
  const persistDecisions = (decisions: DecisionAnalysis[]) => {
    setSavedDecisions(decisions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
    } catch (e) {
      console.warn('Failed to persist decisions:', e);
    }
  };

  const handleCreateDecision = async (params: {
    title: string;
    context: string;
    options: string[];
    riskTolerance: RiskTolerance;
    priorities: string[];
    thinkingEnabled: boolean;
  }) => {
    setError(null);
    setIsLoading(true);
    setLoadingStepText('Structuring dilemma and options...');

    // Loading steps rotation
    const stepTimer1 = setTimeout(() => {
      setLoadingStepText('Engaging Gemini 3.1 Pro high-reasoning engine...');
    }, 1800);
    const stepTimer2 = setTimeout(() => {
      setLoadingStepText('Synthesizing risk-weighted pros & cons...');
    }, 4500);
    const stepTimer3 = setTimeout(() => {
      setLoadingStepText('Constructing SWOT matrices & multi-criteria scores...');
    }, 7500);
    const stepTimer4 = setTimeout(() => {
      setLoadingStepText('Deriving the Tiebreaker decisive recommendation...');
    }, 11000);

    try {
      const res = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const decisionData: DecisionAnalysis = await res.json();
      setActiveDecision(decisionData);
      setActiveTab('verdict');

      // Add to saved decisions list
      const updatedList = [
        decisionData,
        ...savedDecisions.filter((d) => d.id !== decisionData.id),
      ];
      persistDecisions(updatedList);
    } catch (err: any) {
      const msg = err?.message || '';
      const cleanMsg = msg.includes('quota') || msg.includes('429')
        ? 'API rate limit cooldown in progress. Please retry in a few moments.'
        : msg || 'Failed to complete analysis. Please try again.';
      setError(cleanMsg);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  const handleUpdateDecision = (updated: DecisionAnalysis) => {
    setActiveDecision(updated);
    const updatedList = savedDecisions.map((d) => (d.id === updated.id ? updated : d));
    persistDecisions(updatedList);
  };

  const handleDeleteDecision = (id: string) => {
    const filtered = savedDecisions.filter((d) => d.id !== id);
    persistDecisions(filtered);
    if (activeDecision?.id === id) {
      setActiveDecision(null);
    }
  };

  const handleOpenForkModal = (decision?: DecisionAnalysis) => {
    setDecisionToFork(decision || activeDecision);
    setIsVersionModalOpen(true);
  };

  const handleCreateVersion = async (params: {
    title: string;
    context: string;
    options: string[];
    riskTolerance: RiskTolerance;
    priorities: string[];
    versionLabel: string;
    versionNumber: number;
    parentId: string;
    rootDecisionId: string;
  }) => {
    setError(null);
    setIsLoading(true);
    setLoadingStepText(`Evaluating variation: ${params.versionLabel}...`);

    try {
      const res = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: params.title,
          context: params.context,
          options: params.options,
          riskTolerance: params.riskTolerance,
          priorities: params.priorities,
          thinkingEnabled: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate decision variation');
      }

      const rawResult = await res.json();
      const versionedDecision: DecisionAnalysis = {
        ...rawResult,
        id: 'dec-' + Date.now(),
        versionNumber: params.versionNumber,
        versionLabel: params.versionLabel,
        parentId: params.parentId,
        rootDecisionId: params.rootDecisionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [versionedDecision, ...savedDecisions];
      persistDecisions(updatedList);
      setActiveDecision(versionedDecision);
      setIsVersionModalOpen(false);
    } catch (err: any) {
      const msg = err?.message || '';
      setError(msg || 'Failed to create new version');
    } finally {
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  const handleCopySummary = () => {
    if (!activeDecision) return;
    const md = generateMarkdownReport(activeDecision);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadReport = () => {
    if (!activeDecision) return;
    const md = generateMarkdownReport(activeDecision);
    const safeTitle = activeDecision.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 30);
    downloadMarkdown(`Tiebreaker_${safeTitle}.md`, md);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      {/* Global Header */}
      <Header
        onNewDecision={() => {
          setActiveDecision(null);
          setError(null);
        }}
        onOpenHistory={() => setIsDrawerOpen(true)}
        onPrint={activeDecision ? handlePrint : undefined}
        savedCount={savedDecisions.length}
        hasActiveDecision={Boolean(activeDecision)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {error && (
          <div className="max-w-4xl mx-auto mt-6 px-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-rose-900">
                  Decision Analysis Error
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs text-rose-500 hover:text-rose-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!activeDecision ? (
          /* Decision Input View */
          <DecisionForm
            onSubmit={handleCreateDecision}
            isLoading={isLoading}
            loadingStepText={loadingStepText}
          />
        ) : (
          /* Active Decision Analysis View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
            {/* Top Bar with Return Link, Title, Versions & Dynamic Scores */}
            <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveDecision(null)}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 font-medium transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Decision Input</span>
                    </button>
                    {activeDecision.versionLabel && (
                      <>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
                          v{activeDecision.versionNumber || 1}: {activeDecision.versionLabel}
                        </span>
                      </>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-serif-quote font-medium text-stone-900 leading-snug">
                    {activeDecision.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span>Profile: <strong className="text-stone-700 capitalize">{activeDecision.riskTolerance}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>{activeDecision.options.length} options evaluated</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeDecision.verdict.reversibleDoorAnalysis?.type}</span>
                  </div>

                  {/* Version Switcher Strip if multiple versions exist for this dilemma */}
                  {(() => {
                    const activeRootId = activeDecision.rootDecisionId || activeDecision.id;
                    const siblingVersions = savedDecisions
                      .filter((d) => (d.rootDecisionId || d.id) === activeRootId)
                      .sort((a, b) => (a.versionNumber || 1) - (b.versionNumber || 1));
                    if (siblingVersions.length <= 1) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 mt-2">
                        <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                          <GitFork className="w-3 h-3 text-amber-700" />
                          <span>Versions ({siblingVersions.length}):</span>
                        </span>
                        {siblingVersions.map((v, i) => {
                          const isSelected = v.id === activeDecision.id;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setActiveDecision(v)}
                              className={`px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                              }`}
                            >
                              <span className="font-bold">v{v.versionNumber || i + 1}</span>
                              <span className="truncate max-w-[120px]">
                                {v.versionLabel || `v${i + 1}`}
                              </span>
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => handleOpenForkModal(activeDecision)}
                          className="px-2 py-0.5 text-[11px] rounded bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200/80 flex items-center gap-1"
                        >
                          <GitFork className="w-2.5 h-2.5" />
                          <span>+ New Version</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Option Live Score Tallies */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                  {activeDecision.options.map((opt) => {
                    const score = calculateDynamicOptionScore(opt, activeDecision);
                    const isWinner = opt.id === activeDecision.verdict.winnerOptionId;
                    return (
                      <div
                        key={opt.id}
                        className={`px-3 py-1.5 rounded-lg border text-left transition-all ${
                          isWinner
                            ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {isWinner && <Award className="w-3 h-3 text-amber-600" />}
                          <span className="text-[11px] font-semibold text-stone-800 truncate max-w-[120px]">
                            {opt.title}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-sm font-bold text-stone-900">{score}%</span>
                          <span className="text-[10px] text-stone-400">weighted</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-stone-100 text-xs">
                {/* Clean Segmented Tabs (conforming to zero-pill rules) */}
                <div className="flex flex-wrap items-center gap-1 bg-stone-100/90 p-1 rounded-lg">
                  {[
                    { id: 'verdict', label: 'The Verdict', icon: Award },
                    { id: 'proscons', label: 'Pros & Cons', icon: Scale },
                    { id: 'comparison', label: 'Comparison Matrix', icon: TableProperties },
                    { id: 'swot', label: 'SWOT Analysis', icon: Compass },
                    { id: 'scenarios', label: 'What-If Simulator', icon: Sparkles },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                          isActive
                            ? 'bg-white text-stone-900 shadow-xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-md transition-colors"
                    title="Copy full executive summary in Markdown format"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenForkModal(activeDecision)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-900 hover:text-stone-950 bg-amber-100 hover:bg-amber-200/90 rounded-md transition-colors border border-amber-200"
                    title="Create a new version with modified parameters"
                  >
                    <GitFork className="w-3.5 h-3.5 text-amber-800" />
                    <span>New Version</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-md transition-colors"
                    title="Download complete decision report as .md file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Active View Container */}
            <div className="transition-all duration-150">
              {activeTab === 'verdict' && (
                <VerdictView
                  decision={activeDecision}
                  onSelectTab={(tab) => setActiveTab(tab)}
                  onRefineInput={() => setActiveDecision(null)}
                />
              )}

              {activeTab === 'proscons' && (
                <ProsConsView
                  decision={activeDecision}
                  onUpdateDecision={handleUpdateDecision}
                />
              )}

              {activeTab === 'comparison' && (
                <ComparisonTableView
                  decision={activeDecision}
                  onUpdateDecision={handleUpdateDecision}
                />
              )}

              {activeTab === 'swot' && (
                <SwotView decision={activeDecision} />
              )}

              {activeTab === 'scenarios' && (
                <ScenarioSimulator
                  decision={activeDecision}
                  onUpdateDecision={handleUpdateDecision}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-brand font-semibold text-stone-800 tracking-wider">
              THE TIEBREAKER
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Intellectual honesty & decision clarity</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Powered by Gemini 3.1 Pro Preview with High Thinking Level
          </div>
        </div>
      </footer>

      {/* Saved Decisions Drawer */}
      <SavedDecisionsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={(dec) => {
          setActiveDecision(dec);
          setActiveTab('verdict');
        }}
        onDeleteDecision={handleDeleteDecision}
        onForkDecision={handleOpenForkModal}
        activeId={activeDecision?.id}
      />

      {/* Version Creation Modal */}
      {(decisionToFork || activeDecision) && (
        <VersionModal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          currentDecision={decisionToFork || activeDecision!}
          existingVersionsCount={
            savedDecisions.filter(
              (d) =>
                (d.rootDecisionId || d.id) ===
                ((decisionToFork || activeDecision!).rootDecisionId || (decisionToFork || activeDecision!).id)
            ).length || 1
          }
          onCreateVersion={handleCreateVersion}
          isLoading={isLoading}
          loadingStepText={loadingStepText}
        />
      )}
    </div>
  );
}
