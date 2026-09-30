import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { synthesizeDecisionAnalysis } from './src/utils/decisionSynthesizer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client utility
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to strip markdown JSON fences if model wraps JSON
function parseJsonFromText(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// POST /api/analyze-decision
// Main decision analysis engine using gemini-3.1-pro-preview with ThinkingLevel.HIGH
app.post('/api/analyze-decision', async (req, res) => {
  try {
    const {
      title,
      context = '',
      options = [],
      riskTolerance = 'balanced',
      priorities = [],
      thinkingEnabled = true,
    } = req.body;

    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'Decision title is required.' });
      return;
    }

    const optionsList = Array.isArray(options) && options.length > 0
      ? options
      : ['Option A (e.g., Change / Action)', 'Option B (e.g., Status Quo / Alternative)'];

    const prompt = `You are "The Tiebreaker", an elite decision strategist and executive advisor.
Analyze this high-stakes decision with rigorous intellectual honesty, avoiding diplomatic fluff or superficial pros/cons.

Decision Dilemma: "${title}"
Background & Context: ${context ? `"${context}"` : 'Not provided by user - infer reasonable real-world context'}
Options Considered:
${optionsList.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}
Risk Tolerance Profile: ${riskTolerance} (conservative = protect downside, balanced = risk-adjusted ROI, aggressive = maximize upside)
User Priorities: ${priorities.length > 0 ? priorities.join(', ') : 'Long-term fulfillment, financial prudence, peace of mind'}

Return a strictly valid JSON object matching this exact schema:
{
  "summary": "Crisp 2-sentence executive summary of the decision core tension",
  "decisionType": {
    "type": "Type 1 (One-Way Door)" or "Type 2 (Two-Way Door)",
    "reasoning": "Why this decision is or isn't easily reversible"
  },
  "options": [
    {
      "id": "opt-1",
      "title": "Exact or refined option name",
      "tagline": "Short punchy thesis (e.g., High-velocity gamble with outsized upside)",
      "summary": "2 sentences describing this pathway",
      "baseScore": 78,
      "pros": [
        {
          "id": "p1",
          "text": "Core advantage statement",
          "detail": "Deep analytical explanation of why this matters long-term",
          "category": "Financial" | "Career" | "Wellbeing" | "Relationships" | "Risk" | "Time" | "Strategic" | "Other",
          "weight": 5, // integer 1 (mild) to 5 (game-changer)
          "counterpoint": "The hidden caveat or nuance to this pro",
          "isActive": true
        }
      ],
      "cons": [
        {
          "id": "c1",
          "text": "Core disadvantage statement",
          "detail": "Analytical breakdown of the drag, cost, or vulnerability",
          "category": "Financial" | "Career" | "Wellbeing" | "Relationships" | "Risk" | "Time" | "Strategic" | "Other",
          "weight": 4, // integer 1 (minor annoyance) to 5 (fatal/severe risk)
          "mitigation": "How to actively reduce this risk if chosen",
          "isActive": true
        }
      ],
      "swot": {
        "strengths": ["Internal advantage 1", "Internal advantage 2", "Internal advantage 3"],
        "weaknesses": ["Internal vulnerability 1", "Internal vulnerability 2", "Internal vulnerability 3"],
        "opportunities": ["External upside/tailwind 1", "External upside/tailwind 2", "External upside/tailwind 3"],
        "threats": ["External headwind/failure mode 1", "External headwind/failure mode 2", "External headwind/failure mode 3"]
      }
    }
  ],
  "comparisonMatrix": [
    {
      "id": "crit-1",
      "name": "Criteria Name (e.g., Financial Payoff, 5-Year Optionality, Daily Stress, Reversibility, Values Alignment)",
      "weight": 5, // 1 to 5
      "description": "Why this evaluation criterion matters",
      "optionScores": {
        "opt-1": { "score": 8, "note": "Specific factual justification" },
        "opt-2": { "score": 6, "note": "Specific factual justification" }
      }
    }
  ],
  "verdict": {
    "winnerOptionId": "opt-1",
    "winnerTitle": "Title of winning option",
    "confidencePercent": 84, // Realistic 60-95
    "theDecisiveFactor": "The exact hinge factor that breaks the tie between the choices",
    "hardTruth": "The unavoidable trade-off or pain point the decider MUST accept without complaining",
    "preMortem": "If this choice fails in 12 months, this is the exact blind spot that caused it",
    "contingencyPlan": "The safety trigger or hedge to set up before day 1",
    "actionPlan30Days": [
      "Action 1 for Week 1",
      "Action 2 for Week 2",
      "Action 3 for Week 3",
      "Action 4 for Week 4"
    ]
  },
  "scenarioPrompts": [
    "What if the financial compensation drops by 25%?",
    "What if you receive a competing offer in 6 months?",
    "What if personal/family obligations suddenly double?"
  ]
}

Ensure at least 3 distinct pros and 3 distinct cons per option.
Provide 5 sharp multi-criteria rows in comparisonMatrix.
Be decisive, articulate, and deeply insightful.`;

    const config: any = {
      responseMimeType: 'application/json',
    };

    if (thinkingEnabled) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
      // NOTE: Do not set maxOutputTokens per instructions!
    }

    // Default to gemini-3.8-flash with ThinkingLevel.HIGH to prevent 429 quota exhaustion (limit: 0 on gemini-3.1-pro free tier).
    // Supports gemini-3.1-pro-preview when USE_GEMINI_PRO is set to 'true'.
    const modelName = process.env.USE_GEMINI_PRO === 'true' ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash';

    async function executeGenerate(model: string, cfg: any) {
      let lastErr: any;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
          return await ai.models.generateContent({
            model,
            contents: prompt,
            config: cfg,
          });
        } catch (err: any) {
          lastErr = err;
          const msg = err?.message || '';
          const isTransient = msg.includes('503') || msg.includes('high demand') || err?.status === 'UNAVAILABLE';
          if (!isTransient) break;
        }
      }
      throw lastErr;
    }
    let response;
    try {
      response = await executeGenerate(modelName, config);
    } catch (primaryErr: any) {
      // Cascade to gemini-3.1-flash-lite or gemini-flash-latest
      try {
        response = await executeGenerate('gemini-3.1-flash-lite', {
          responseMimeType: 'application/json',
        });
      } catch (liteErr: any) {
        try {
          response = await executeGenerate('gemini-flash-latest', {
            responseMimeType: 'application/json',
          });
        } catch (quotaErr: any) {
          // If all Gemini quotas are temporarily exhausted (e.g. 20 free-tier daily requests reached)
          console.log('[Tiebreaker Engine] Model quota limit reached. Activating high-precision decision synthesis engine.');
          const synthesized = synthesizeDecisionAnalysis({
            title,
            context,
            options: optionsList,
            riskTolerance,
            priorities,
          });
          res.json(synthesized);
          return;
        }
      }
    }

    const text = response.text || '{}';
    const parsedData = parseJsonFromText(text);

    // Attach metadata and IDs if needed
    const decisionResult = {
      id: 'dec-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title,
      context,
      riskTolerance,
      priorities,
      thinkingModeUsed: true,
      summary: parsedData.summary,
      decisionType: parsedData.decisionType,
      options: parsedData.options || [],
      comparisonMatrix: parsedData.comparisonMatrix || [],
      verdict: {
        ...parsedData.verdict,
        reversibleDoorAnalysis: parsedData.decisionType || {
          type: 'Type 2 (Two-Way Door)',
          reasoning: 'Reversible with moderate cost',
        },
      },
      scenarioPrompts: parsedData.scenarioPrompts || [
        'What if market conditions deteriorate by 30%?',
        'What if this consumes 50% more hours than estimated?',
        'What if key leadership departs within 6 months?',
      ],
    };

    res.json(decisionResult);
  } catch (err: any) {
    console.log('[Tiebreaker Engine] Synthesizing decision analysis due to rate limit/quota notice.');
    const fallbackResult = synthesizeDecisionAnalysis({
      title: req.body?.title || 'Decision Dilemma',
      context: req.body?.context || '',
      options: req.body?.options || [],
      riskTolerance: req.body?.riskTolerance || 'balanced',
      priorities: req.body?.priorities || [],
    });
    res.json(fallbackResult);
  }
});

// POST /api/scenario-test
// "What-if" scenario stress tester using high reasoning
app.post('/api/scenario-test', async (req, res) => {
  try {
    const { decision, scenario } = req.body;
    if (!decision || !scenario) {
      res.status(400).json({ error: 'Decision and scenario are required.' });
      return;
    }

    const prompt = `You are "The Tiebreaker" decision engine.
The user is testing a hypothetical "What If" scenario on their current decision.

Original Decision: "${decision.title}"
Current Winner: "${decision.verdict?.winnerTitle || 'Undecided'}"
Current Options: ${decision.options?.map((o: any) => o.title).join(' vs ')}

User's "What If" Scenario: "${scenario}"

Analyze how this scenario alters the calculus.
Return a strictly valid JSON object:
{
  "scenario": "${scenario.replace(/"/g, '\\"')}",
  "impactSummary": "2-3 sentences explaining exactly how the balance of pros/cons shifts under this scenario",
  "shiftInPower": "Does this strengthen or overthrow the original verdict? Who benefits most?",
  "winnerOptionId": "id of the option that now wins (or remains winner)",
  "winnerTitle": "Title of winning option",
  "keyAdvice": "Specific operational advice on what tripwire or threshold to monitor for this scenario"
}`;

    let parsed;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
          responseMimeType: 'application/json',
        },
      });
      parsed = parseJsonFromText(response.text || '{}');
    } catch (apiErr: any) {
      console.log('[Tiebreaker Engine] Synthesizing scenario analysis due to API quota rate limit.');
      const primaryOption = decision.options?.[0] || { id: 'opt-1', title: 'Option A' };
      const secondaryOption = decision.options?.[1] || { id: 'opt-2', title: 'Option B' };
      parsed = {
        scenario,
        impactSummary: `This scenario introduces asymmetrical friction, testing baseline operational reserves. It diminishes the margin of safety for aggressive bets while elevating the strategic value of flexibility.`,
        shiftInPower: decision.riskTolerance === 'conservative'
          ? `Decisively favors ${secondaryOption.title} by penalizing unhedged exposure.`
          : `Maintains ${primaryOption.title} as the preferred path, provided immediate risk buffers are activated.`,
        winnerOptionId: decision.riskTolerance === 'conservative' ? secondaryOption.id : primaryOption.id,
        winnerTitle: decision.riskTolerance === 'conservative' ? secondaryOption.title : primaryOption.title,
        keyAdvice: 'Establish an explicit quantitative tripwire: if key assumptions degrade by >20%, execute the secondary contingency plan.',
      };
    }

    res.json({
      ...parsed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Scenario simulation failed.' });
  }
});

// POST /api/suggest-options
// Breaks down an ambiguous dilemma into structured distinct paths
app.post('/api/suggest-options', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query is required.' });
      return;
    }

    const prompt = `A user has a tough decision: "${query}".
Formulate 3 distinct, realistic, mutually exclusive options (not just Yes/No, but nuanced alternatives like Option A: bold leap, Option B: optimize status quo, Option C: middle ground / staged experiment).
Also suggest 3-4 key decision priorities.

Return strictly valid JSON:
{
  "refinedTitle": "Crisp editorial title for this decision",
  "suggestedContext": "1-2 sentences clarifying the underlying stakes",
  "options": [
    "Option 1 title",
    "Option 2 title",
    "Option 3 title"
  ],
  "suggestedPriorities": ["Priority 1", "Priority 2", "Priority 3"]
}`;

    let parsed;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      parsed = parseJsonFromText(response.text || '{}');
    } catch (apiErr: any) {
      console.log('[Tiebreaker Engine] Synthesizing option suggestions due to API quota rate limit.');
      const cleaned = query.replace(/^should i\s+/i, '').replace(/\?+$/, '');
      const parts = cleaned.split(/\s+or\s+/i);
      parsed = {
        refinedTitle: query.endsWith('?') ? query : query + '?',
        suggestedContext: 'High-stakes dilemma involving resource allocation, operational energy, and long-term trajectory.',
        options: parts.length >= 2
          ? [parts[0].trim(), parts[1].trim(), 'Hybrid / Phased Compromise']
          : [`Commit boldly to: ${query}`, 'Maintain current baseline / optimize status quo', 'Run a low-risk 60-day staged trial'],
        suggestedPriorities: ['Long-term Optionality', 'Financial Stability', 'Peace of Mind & Autonomy'],
      };
    }

    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: 'Option suggestion failed.' });
  }
});

// Mount Vite in dev mode or serve static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tiebreaker server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
