import { DecisionAnalysis, RiskTolerance, FactorCategory } from '../types/decision';

interface SynthesizerInput {
  title: string;
  context?: string;
  options: string[];
  riskTolerance: RiskTolerance;
  priorities: string[];
}

export function synthesizeDecisionAnalysis(input: SynthesizerInput): DecisionAnalysis {
  const { title, context = '', options = [], riskTolerance = 'balanced', priorities = [] } = input;

  const cleanOptions = options.length >= 2 ? options : ['Option A (Action/Change)', 'Option B (Status Quo/Alternative)'];

  // Detect decision domain & reversibility
  const lowerTitle = (title + ' ' + context).toLowerCase();
  const isHighStakes = /(buy|house|home|mortgage|marriage|divorce|quit|relocate|abroad|country|surgery|child|kid|invest.*entire)/i.test(lowerTitle);
  const isCareer = /(job|offer|promotion|career|startup|company|salary|role|manager|boss)/i.test(lowerTitle);
  const isTech = /(stack|rust|go|python|monolith|microservice|database|postgres|aws|code)/i.test(lowerTitle);

  const decisionType = isHighStakes
    ? {
        type: 'Type 1 (One-Way Door)' as const,
        reasoning: 'Substantial switching and unwinding costs. Reversing this choice requires significant capital, time, or emotional energy.',
      }
    : {
        type: 'Type 2 (Two-Way Door)' as const,
        reasoning: 'Reversible or adjustable within 90–180 days with moderate overhead. Can be treated as an empirical experiment.',
      };

  // Build options
  const analyzedOptions = cleanOptions.map((optTitle, index) => {
    const isFirst = index === 0;
    const isLast = index === cleanOptions.length - 1;

    let prosList = [
      {
        id: `p-${index}-1`,
        text: isFirst ? 'Direct momentum toward the desired change' : 'Preserves existing baseline stability & operational continuity',
        detail: isFirst
          ? 'Proactively resolves the current friction point rather than allowing passive inertia to decide.'
          : 'Avoids sudden transition friction and leverages compounding advantages already in place.',
        category: (isCareer ? 'Career' : 'Strategic') as FactorCategory,
        weight: 5,
        counterpoint: isFirst ? 'Requires immediate energy expenditure during the transition phase.' : 'Risks stagnation if external conditions shift.',
        isActive: true,
      },
      {
        id: `p-${index}-2`,
        text: isFirst ? 'Higher upside ceiling & learning acceleration' : 'Predictable downside with lower cognitive load',
        detail: isFirst
          ? 'Exposes you to fresh problems, expanding your long-term personal resilience and optionality.'
          : 'Frees mental bandwidth to focus on external projects, relationships, or secondary priorities.',
        category: (isFirst ? 'Career' : 'Wellbeing') as FactorCategory,
        weight: 4,
        counterpoint: isFirst ? 'Higher variance in short-term outcomes.' : 'Ceiling is constrained by existing parameters.',
        isActive: true,
      },
      {
        id: `p-${index}-3`,
        text: 'Strong alignment with stated long-term goals',
        detail: `Directly advances your commitment to ${priorities.length > 0 ? priorities[0] : 'sustainable growth'}.`,
        category: 'Strategic' as FactorCategory,
        weight: 4,
        isActive: true,
      },
    ];

    let consList = [
      {
        id: `c-${index}-1`,
        text: isFirst ? 'Transition risk and temporary ramp-up cost' : 'Opportunity cost of deferred growth',
        detail: isFirst
          ? 'Uncertainty during the initial 90 days while adjusting to new dynamics.'
          : 'Continuing along this path may forfeit a rare window of opportunity.',
        category: (isFirst ? 'Risk' : 'Time') as FactorCategory,
        weight: 4,
        mitigation: isFirst
          ? 'Establish clear 30-day milestones and a financial/operational safety buffer.'
          : 'Set a hard calendar tripwire (e.g. 6 months) to re-evaluate if conditions stall.',
        isActive: true,
      },
      {
        id: `c-${index}-2`,
        text: isFirst ? 'Potential for short-term stress spike' : 'Risk of creeping dissatisfaction',
        detail: isFirst
          ? 'Unfamiliar expectations can induce temporary burnout if boundaries are not enforced.'
          : 'Unresolved underlying tensions may resurface more urgently down the road.',
        category: 'Wellbeing' as FactorCategory,
        weight: 3,
        mitigation: isFirst ? 'Schedule strict weekly recovery routines.' : 'Address specific micro-frustrations proactively.',
        isActive: true,
      },
      {
        id: `c-${index}-3`,
        text: isFirst ? 'Asymmetric information gap' : 'Compounding status quo inertia',
        detail: isFirst
          ? 'You do not know what you do not know until you are inside the new reality.'
          : 'Comfort makes it increasingly difficult to initiate bold moves later.',
        category: 'Strategic' as FactorCategory,
        weight: 3,
        mitigation: isFirst ? 'Interview peers who have made an identical transition.' : 'Commit to an intentional 6-month trial.',
        isActive: true,
      },
    ];

    return {
      id: `opt-${index + 1}`,
      title: optTitle,
      tagline: isFirst ? 'High-growth trajectory with initial friction' : 'Defensive stability with predictable parameters',
      summary: `A pathway prioritizing ${isFirst ? 'catalytic upside and change' : 'risk mitigation and compounding current assets'}.`,
      pros: prosList,
      cons: consList,
      swot: {
        strengths: [
          isFirst ? 'Direct agency in reshaping outcomes' : 'Proven track record & zero onboarding ramp',
          isFirst ? 'Eliminates "what if" regret' : 'Maximum predictability and lower volatility',
          'Clear strategic boundaries',
        ],
        weaknesses: [
          isFirst ? 'Short-term execution vulnerability' : 'Capped upside within existing structure',
          isFirst ? 'Steep initial learning curve' : 'Vulnerable to internal boredom or friction',
          'Requires disciplined boundary setting',
        ],
        opportunities: [
          isFirst ? 'Accelerates network and reputational capital' : 'Allows compounding capital/energy in secondary pursuits',
          'Unlocks subsequent high-value doors',
          'Clarifies personal values under pressure',
        ],
        threats: [
          isFirst ? 'Unforeseen cultural or environmental mismatch' : 'Market or organizational shifts rendering choice obsolete',
          'Overcommitment during initial ramp',
          'Second-order fatigue if unmanaged',
        ],
      },
      baseScore: isFirst ? (riskTolerance === 'aggressive' ? 84 : 76) : (riskTolerance === 'conservative' ? 82 : 74),
    };
  });

  // Comparison criteria
  const comparisonMatrix = [
    {
      id: 'crit-1',
      name: 'Long-Term Growth & Optionality',
      weight: 5,
      description: 'Does this pathway expand future high-leverage choices in 3–5 years?',
      optionScores: analyzedOptions.reduce((acc, opt, i) => {
        acc[opt.id] = {
          score: i === 0 ? 9 : 6,
          note: i === 0 ? 'Creates asymmetric learning and expansive future options.' : 'Solid, but stays within known bounds.',
        };
        return acc;
      }, {} as any),
    },
    {
      id: 'crit-2',
      name: 'Downside Protection & Safety',
      weight: riskTolerance === 'conservative' ? 5 : 4,
      description: 'How protected are you if worst-case assumptions materialize?',
      optionScores: analyzedOptions.reduce((acc, opt, i) => {
        acc[opt.id] = {
          score: i === 0 ? (riskTolerance === 'conservative' ? 6 : 7) : 9,
          note: i === 0 ? 'Requires a 3-month buffer to safely absorb volatility.' : 'Extremely safe; established safety net.',
        };
        return acc;
      }, {} as any),
    },
    {
      id: 'crit-3',
      name: 'Daily Friction & Stress Balance',
      weight: 4,
      description: 'Impact on daily peace of mind, energy reserves, and relationships.',
      optionScores: analyzedOptions.reduce((acc, opt, i) => {
        acc[opt.id] = {
          score: i === 0 ? 6 : 8,
          note: i === 0 ? 'High initial cognitive overhead during transition.' : 'Predictable rhythm with minimal surprise.',
        };
        return acc;
      }, {} as any),
    },
    {
      id: 'crit-4',
      name: 'Alignment with Key Priorities',
      weight: 5,
      description: `Direct fit with: ${priorities.slice(0, 2).join(', ') || 'Core personal values'}.`,
      optionScores: analyzedOptions.reduce((acc, opt, i) => {
        acc[opt.id] = {
          score: i === 0 ? 8 : 7,
          note: i === 0 ? 'Strong proactive match for long-term aspirations.' : 'Adequate, though compromises on growth velocity.',
        };
        return acc;
      }, {} as any),
    },
    {
      id: 'crit-5',
      name: 'Reversibility & Exit Velocity',
      weight: 4,
      description: 'Can you unwind or pivot without catastrophic loss if needed?',
      optionScores: analyzedOptions.reduce((acc, opt, i) => {
        acc[opt.id] = {
          score: i === 0 ? 7 : 8,
          note: i === 0 ? 'Type 2 door if staged properly with clear checkpoints.' : 'High baseline control.',
        };
        return acc;
      }, {} as any),
    },
  ];

  // Determine winner based on risk posture
  let winnerIndex = 0;
  if (riskTolerance === 'conservative' && cleanOptions.length > 1) {
    winnerIndex = 1; // Favors stability for conservative profiles
  } else {
    winnerIndex = 0; // Favors proactive choice for balanced/aggressive
  }

  const winningOption = analyzedOptions[winnerIndex];

  return {
    id: 'dec-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title,
    context,
    riskTolerance,
    priorities,
    thinkingModeUsed: true,
    summary: `This decision balances the immediate comfort of ${cleanOptions[1] || 'the status quo'} against the high-leverage growth potential of ${cleanOptions[0]}. The tiebreaker hinges on whether your current season calls for capital compounding or catalytic repositioning.`,
    options: analyzedOptions,
    comparisonMatrix,
    verdict: {
      winnerOptionId: winningOption.id,
      winnerTitle: winningOption.title,
      confidencePercent: riskTolerance === 'conservative' ? 82 : 86,
      theDecisiveFactor:
        winnerIndex === 0
          ? 'The cost of inaction and deferred regret over 3 years outweighs the temporary discomfort of the 90-day transition.'
          : 'Preserving capital stability and mental reserves provides stronger optionality than taking on uncompensated transition risk today.',
      hardTruth:
        winnerIndex === 0
          ? 'You will experience moments of second-guessing and cognitive fatigue during month one. You must accept this toll upfront.'
          : 'You must consciously prevent stability from turning into complacency by creating fresh challenges within your current baseline.',
      preMortem:
        winnerIndex === 0
          ? 'If you regret this choice in 12 months, it will be because you underestimated the initial operational friction and failed to protect personal recovery time.'
          : 'If you regret this choice in 12 months, it will be because you realized the window for bold repositioning closed while you remained comfortable.',
      contingencyPlan:
        winnerIndex === 0
          ? 'Establish a 90-day review checkpoint with predefined success metrics; if unmet, initiate a planned pivot.'
          : 'Set a mandatory 6-month calendar review to re-assess whether external constraints have shifted.',
      actionPlan30Days: [
        'Week 1: Document all non-negotiable boundaries, financial thresholds, and baseline criteria.',
        'Week 2: Communicate decision clearly to key stakeholders and close remaining open loops.',
        'Week 3: Build the operational 90-day ramp and protect dedicated weekly focus blocks.',
        'Week 4: Execute first milestone review and audit energy levels against expectations.',
      ],
      reversibleDoorAnalysis: decisionType,
    },
    scenarioPrompts: [
      'What if financial compensation drops or inflation rises by 20%?',
      'What if family or personal obligations demand 15 additional hours weekly?',
      'What if a competing high-value opportunity surfaces in 6 months?',
    ],
  };
}
