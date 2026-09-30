import React, { useState } from 'react';
import { X, Trash2, Calendar, Award, ArrowRight, GitFork, Shield, Scale, Zap, Layers } from 'lucide-react';
import { DecisionAnalysis } from '../types/decision';

interface SavedDecisionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionAnalysis[];
  onSelectDecision: (decision: DecisionAnalysis) => void;
  onDeleteDecision: (id: string) => void;
  activeId?: string;
  onForkDecision?: (decision: DecisionAnalysis) => void;
}

export const SavedDecisionsDrawer: React.FC<SavedDecisionsDrawerProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  activeId,
  onForkDecision,
}) => {
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  if (!isOpen) return null;

  // Group decisions by rootDecisionId || id
  const groups: Record<string, DecisionAnalysis[]> = {};
  savedDecisions.forEach((dec) => {
    const rootId = dec.rootDecisionId || dec.id;
    if (!groups[rootId]) groups[rootId] = [];
    groups[rootId].push(dec);
  });

  // Sort each group so earliest version is first or latest version is first
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => (a.versionNumber || 1) - (b.versionNumber || 1));
  });

  const getRiskIcon = (risk: string) => {
    if (risk === 'conservative') return <Shield className="w-3 h-3 text-emerald-600" />;
    if (risk === 'aggressive') return <Zap className="w-3 h-3 text-amber-600" />;
    return <Scale className="w-3 h-3 text-stone-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col border-l border-stone-200">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900">
                Decision History & Versions
              </h3>
            </div>
            <p className="text-xs text-stone-500">
              {savedDecisions.length} total version{savedDecisions.length === 1 ? '' : 's'} across {Object.keys(groups).length} dilemma{Object.keys(groups).length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View mode toggle */}
        {savedDecisions.length > 0 && (
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span className="text-[11px] font-medium text-stone-500">View Mode:</span>
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-md p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Grouped by Dilemma
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Chronological
              </button>
            </div>
          </div>
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {savedDecisions.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              No saved decisions yet. Create a decision to track and compare versions.
            </div>
          ) : viewMode === 'grouped' ? (
            /* Grouped View with Versions Tree */
            Object.entries(groups).map(([rootId, versions]) => {
              const primary = versions[0];
              const hasMultipleVersions = versions.length > 1;

              return (
                <div
                  key={rootId}
                  className="bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-xs"
                >
                  {/* Root Dilemma Header */}
                  <div className="p-3.5 bg-stone-50/80 border-b border-stone-200/80 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-stone-500">
                        <Layers className="w-3.5 h-3.5 text-stone-500" />
                        <span className="font-semibold text-stone-700">
                          {versions.length} {versions.length === 1 ? 'Version' : 'Versions'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{primary.options.length} options</span>
                      </div>
                      <h4
                        onClick={() => {
                          onSelectDecision(versions[versions.length - 1]);
                          onClose();
                        }}
                        className="text-xs font-semibold text-stone-900 hover:text-amber-900 cursor-pointer line-clamp-2"
                      >
                        {primary.title}
                      </h4>
                    </div>

                    {onForkDecision && (
                      <button
                        type="button"
                        onClick={() => {
                          onForkDecision(versions[versions.length - 1]);
                          onClose();
                        }}
                        className="text-[11px] font-semibold text-stone-700 hover:text-stone-950 bg-white border border-stone-200/90 hover:border-stone-400 px-2 py-1 rounded flex items-center gap-1 shrink-0"
                        title="Create new version from this decision"
                      >
                        <GitFork className="w-3 h-3 text-amber-700" />
                        <span>Branch</span>
                      </button>
                    )}
                  </div>

                  {/* Versions List */}
                  <div className="divide-y divide-stone-100">
                    {versions.map((ver, idx) => {
                      const isCurrent = ver.id === activeId;
                      const dateStr = new Date(ver.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                        <div
                          key={ver.id}
                          className={`p-3 text-left transition-colors flex items-center justify-between gap-2 ${
                            isCurrent
                              ? 'bg-amber-50/50'
                              : 'hover:bg-stone-50/70'
                          }`}
                        >
                          <div
                            onClick={() => {
                              onSelectDecision(ver);
                              onClose();
                            }}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold text-stone-900 bg-stone-200/80 px-1.5 py-0.2 rounded">
                                v{ver.versionNumber || idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-stone-800 hover:text-amber-900 truncate max-w-[200px]">
                                {ver.versionLabel || `Version ${ver.versionNumber || idx + 1}`}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] text-amber-700 font-bold ml-1">
                                  (Active)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-stone-500">
                              <span className="flex items-center gap-1">
                                {getRiskIcon(ver.riskTolerance)}
                                <span className="capitalize">{ver.riskTolerance}</span>
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[130px] font-medium text-stone-700">
                                Winner: {ver.verdict?.winnerTitle}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{dateStr}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectDecision(ver);
                                onClose();
                              }}
                              className="text-[11px] font-medium text-stone-700 hover:text-stone-900 px-2 py-1 rounded bg-stone-100 hover:bg-stone-200"
                            >
                              Load
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteDecision(ver.id);
                              }}
                              className="text-stone-300 hover:text-rose-600 p-1"
                              title="Delete this version"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            /* Flat Chronological List */
            savedDecisions.map((dec) => {
              const isCurrent = dec.id === activeId;
              const dateStr = new Date(dec.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={dec.id}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded">
                          v{dec.versionNumber || 1}
                        </span>
                        {dec.versionLabel && (
                          <span className="text-[11px] font-medium text-amber-800">
                            {dec.versionLabel}
                          </span>
                        )}
                      </div>
                      <h4
                        onClick={() => {
                          onSelectDecision(dec);
                          onClose();
                        }}
                        className="text-xs font-semibold text-stone-900 hover:text-amber-900 cursor-pointer line-clamp-2"
                      >
                        {dec.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDecision(dec.id);
                      }}
                      className="text-stone-300 hover:text-rose-600 p-1 shrink-0"
                      title="Delete decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>{dateStr}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{dec.riskTolerance}</span>
                    <span aria-hidden="true">·</span>
                    <span>{dec.options.length} options</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                    <div className="flex items-center gap-1 text-stone-700 truncate max-w-[200px]">
                      <Award className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{dec.verdict?.winnerTitle}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectDecision(dec);
                        onClose();
                      }}
                      className="text-xs font-medium text-stone-800 hover:text-stone-950 flex items-center gap-0.5"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
