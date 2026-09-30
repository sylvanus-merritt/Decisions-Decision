import { DecisionPreset } from '../types/decision';

export const DECISION_PRESETS: DecisionPreset[] = [
  {
    id: 'career-startup-vs-bigtech',
    title: 'Accept Startup Role vs. Stay at Tech Giant',
    subtitle: 'High equity upside & autonomy vs. high cash compensation & stability',
    category: 'Career & Work',
    context:
      'I have been at a FAANG company for 4 years as a Senior Software Engineer with great pay and predictable hours. An early-stage Series A startup offered me a Lead role with 1.2% equity and a 20% base salary cut. I want to build things from scratch, but my spouse and I are planning to start a family in two years.',
    options: ['Join Series A Startup as Lead', 'Stay at Current Tech Giant', 'Stay & Build an Internal Venture or Side Project'],
    priorities: ['Long-term Wealth Creation', 'Personal Growth & Autonomy', 'Family Stability & Stress Levels'],
    riskTolerance: 'balanced',
  },
  {
    id: 'housing-rent-vs-buy',
    title: 'Buy a Fixer-Upper House vs. Keep Renting & Invest',
    subtitle: 'Real estate equity & stability vs. portfolio liquidity & zero maintenance',
    category: 'Personal Finance',
    context:
      'Current rent is $2,800/mo in an urban center with zero commute. A 3-bed home 25 miles out is available for $680,000, requiring roughly $45,000 in immediate renovations and a 6.8% mortgage rate ($4,400/mo all-in). Remaining cash would go into equity index funds if we stay renting.',
    options: ['Buy the Suburban Fixer-Upper', 'Stay Renting & Maximize Index Fund Investing', 'Wait 18 Months for Rates & Inventory to Shift'],
    priorities: ['Net Worth Growth in 7 Years', 'Quality of Daily Life / Commute', 'Financial Liquidity & Flexibility'],
    riskTolerance: 'conservative',
  },
  {
    id: 'life-relocation',
    title: 'Relocate Abroad to Berlin vs. Stay in Hometown',
    subtitle: 'International adventure & culture vs. proximity to family & established network',
    category: 'Life & Adventure',
    context:
      'Received an internal transfer opportunity to the Berlin office for 3 years. It covers relocation and visa sponsorship. However, parents are aging in Chicago and my closest friends live within a 20-minute drive. I worry I will regret never living abroad before turning 35.',
    options: ['Relocate to Berlin on 3-Year Contract', 'Stay in Chicago & Take Extended 4-Week Sabbaticals', 'Reject Now but Re-evaluate in 2 Years'],
    priorities: ['Memorable Life Experience', 'Family Closeness & Support', 'Career Global Exposure'],
    riskTolerance: 'aggressive',
  },
  {
    id: 'tech-stack-architecture',
    title: 'Modular Monolith vs. Microservices Rewrite',
    subtitle: 'Operational simplicity & single deploy unit vs. independent team velocity',
    category: 'Engineering Architecture',
    context:
      'Our SaaS application has grown to 45 engineers and 8 squads. Deployments are slowing down due to shared migrations and tangled domain logic. Some teams are lobbying to break out into independent Go microservices with Kafka, while seniors argue for strict modular monolith boundaries in TypeScript.',
    options: ['Refactor into Strict Modular Monolith', 'Decompose Core Domains into Microservices', 'Hybrid: Extract Only High-Throughput Ingestion Service'],
    priorities: ['Developer Productivity & Time-to-Market', 'Infrastructure Simplicity & Cost', 'Failure Domain Isolation'],
    riskTolerance: 'balanced',
  },
];
