
export interface KeyPoint {
  text: string;
  subPoints?: string[];
}

export type SafetyTag = 'FUNDAMENTAL' | 'ESSENTIAL' | 'ADVANCED' | 'CRITICAL';

export interface Topic {
  id: string;
  title: string;
  description: string;
  tag: SafetyTag;
  safetyImpact: string;
  practicalRelevance: string;
  keyPoints: KeyPoint[];
}

export interface SkillPhase {
  id: string;
  title: string;
  timeframe: string;
  description: string;
}

export interface SafetyModule {
  id: string;
  title: string; 
  shortTitle: string; 
  topics: Topic[];
  skillProgression: SkillPhase[];
}

export const modulesData: SafetyModule[] = [
  {
    id: 'module1',
    shortTitle: 'Module 1',
    title: 'Module 1: Fundamentals of Safety & PPE',
    topics: [
      {
        id: 'topic1-1',
        title: 'Understanding Arborist Hazards',
        description: 'Identifying common risks in tree care operations: electrical, falls, cuts.',
        tag: 'FUNDAMENTAL',
        safetyImpact: 'High - Reduces likelihood of common accidents by fostering awareness.',
        practicalRelevance: 'Daily application in all job site assessments and pre-work checks.',
        keyPoints: [
          { text: 'Recognize electrical hazards from overhead and underground lines.' },
          { text: 'Assess fall risks before climbing any tree; check tree stability.' },
          { text: 'Understand dangers of cutting tools; maintain safe distances.' },
          { text: 'Proper use of Personal Protective Equipment (PPE) is mandatory.' },
        ],
      },
      {
        id: 'topic1-2',
        title: 'Personal Protective Equipment (PPE)',
        description: 'Selection, use, and maintenance of essential PPE for arborists.',
        tag: 'ESSENTIAL',
        safetyImpact: 'Critical - PPE is the last line of defense against injury.',
        practicalRelevance: 'Mandatory for all tasks; specific PPE for specific hazards.',
        keyPoints: [
          { text: 'Hard hat, eye protection, hearing protection, gloves, and chainsaw-resistant legwear are standard.' },
          { text: 'Inspect PPE before each use for damage or wear.' },
          { text: 'Ensure proper fit and understand limitations of PPE.' },
          { text: 'Store PPE correctly to maintain its integrity.' },
        ],
      },
    ],
    skillProgression: [
      { 
        id: 'phase1-1', 
        title: 'Awareness & PPE Basics', 
        timeframe: 'Week 1-2', 
        description: 'Introduction to basic safety concepts, hazard identification, and correct use of standard PPE.' 
      },
      { 
        id: 'phase1-2', 
        title: 'Job Site Setup', 
        timeframe: 'Week 3-4', 
        description: 'Learn to establish safe work zones, traffic control, and emergency preparedness.' 
      },
      {
        id: 'phase1-3',
        title: 'Emergency Procedures',
        timeframe: 'Month 2',
        description: 'Practice aerial rescue basics and emergency response protocols.'
      },
      {
        id: 'phase1-4',
        title: 'Tool Inspection',
        timeframe: 'Month 2-3',
        description: 'Detailed inspection routines for all climbing and cutting equipment.'
      }
    ],
  },
  {
    id: 'module2',
    shortTitle: 'Module 2',
    title: 'Module 2: Chainsaw Operation & Maintenance',
    topics: [
      {
        id: 'topic2-1',
        title: 'Safe Chainsaw Handling',
        description: 'Proper techniques for starting, operating, and shutting down chainsaws.',
        tag: 'CRITICAL',
        safetyImpact: 'Very High - Mitigates risks of severe lacerations and kickback injuries.',
        practicalRelevance: 'Core skill for nearly all arborist cutting tasks.',
        keyPoints: [
          { text: 'Always use two hands to operate a chainsaw.' },
          { text: 'Maintain a firm grip and balanced stance.' },
          { text: 'Be aware of kickback zones and how to avoid them.' },
          { text: 'Engage chain brake when not cutting or moving.' },
        ],
      },
      {
        id: 'topic2-2',
        title: 'Chainsaw Maintenance',
        description: 'Routine checks, chain sharpening, and basic troubleshooting.',
        tag: 'ESSENTIAL',
        safetyImpact: 'Medium - Well-maintained saws are safer and more efficient.',
        practicalRelevance: 'Daily and weekly checks to ensure operational safety.',
        keyPoints: [
          { text: 'Check chain tension, sharpness, and lubrication regularly.' },
          { text: 'Clean air filter and inspect spark plug.' },
          { text: 'Ensure all safety features (chain brake, throttle interlock) are functional.' },
        ],
      },
    ],
    skillProgression: [
      { 
        id: 'phase2-1', 
        title: 'Basic Cuts & Handling', 
        timeframe: 'Week 1-2 (Post-Module 1)', 
        description: 'Practice on ground-level wood, focusing on stance, grip, and reactive forces.' 
      },
      { 
        id: 'phase2-2', 
        title: 'Felling & Limbing Techniques', 
        timeframe: 'Week 3-4', 
        description: 'Learn controlled felling and efficient, safe limbing methods under supervision.' 
      },
      {
        id: 'phase2-3',
        title: 'Advanced Rigging',
        timeframe: 'Month 2-3',
        description: 'Introduction to rigging for lowering limbs and sections of wood safely.'
      },
      {
        id: 'phase2-4',
        title: 'Complex Tree Removal',
        timeframe: 'Month 4-6',
        description: 'Supervised participation in removing trees in confined spaces or near obstacles.'
      },
      {
        id: 'phase2-5',
        title: 'Storm Damage Response',
        timeframe: 'Month 6+',
        description: 'Techniques for safely addressing trees damaged by storms, including tension wood.'
      }
    ],
  },
  {
    id: 'module3',
    shortTitle: 'Module 3',
    title: 'Module 3: Climbing & Aerial Operations',
    topics: [
      {
        id: 'topic3-1',
        title: 'Knot Tying & Rope Management',
        description: 'Essential knots for climbing and rigging, plus rope care.',
        tag: 'FUNDAMENTAL',
        safetyImpact: 'Critical - Incorrect knots or damaged ropes can lead to catastrophic falls.',
        practicalRelevance: 'Foundation for all climbing and aerial lift operations.',
        keyPoints: [
          { text: 'Master climbing knots (e.g., Blake\'s Hitch, Prusik) and rigging knots.' },
          { text: 'Inspect ropes daily for wear, cuts, or chemical damage.' },
          { text: 'Understand rope strength, load limits, and safe working loads.' },
        ],
      },
       {
        id: 'topic3-2',
        title: 'Aerial Lift Operations',
        description: 'Safe setup, operation, and emergency procedures for aerial lifts.',
        tag: 'ADVANCED',
        safetyImpact: 'High - Prevents tip-overs, falls, and electrical contact from lifts.',
        practicalRelevance: 'Essential for tasks where climbing is not feasible or efficient.',
        keyPoints: [
          { text: 'Conduct pre-operational checks on the lift vehicle and equipment.' },
          { text: 'Assess ground conditions and set up outriggers correctly.' },
          { text: 'Maintain safe distances from power lines; understand approach distances.' },
          { text: 'Know emergency lowering procedures and rescue plans.' },
        ],
      }
    ],
    skillProgression: [
      { 
        id: 'phase3-1', 
        title: 'Basic Climbing Techniques', 
        timeframe: 'Month 2-3', 
        description: 'Ascent, descent, and work positioning with basic climbing systems.' 
      },
      {
        id: 'phase3-2',
        title: 'Aerial Rescue Drills',
        timeframe: 'Month 4-5',
        description: 'Regular practice of self-rescue and partner rescue techniques from ropes.'
      },
      {
        id: 'phase3-3',
        title: 'Advanced Work Positioning',
        timeframe: 'Month 6+',
        description: 'Utilizing advanced techniques for optimal positioning during complex tasks.'
      },
      {
        id: 'phase3-4',
        title: 'SRT/SRS Climbing',
        timeframe: 'Year 1+',
        description: 'Introduction to Stationary Rope Technique (SRT) or Stationary Rope System (SRS) climbing.'
      }
    ],
  },
];

export const getTagClassName = (tag: SafetyTag): string => {
  switch (tag) {
    case 'FUNDAMENTAL':
      return 'safety-tag-fundamental';
    case 'ESSENTIAL':
      return 'safety-tag-essential';
    case 'ADVANCED':
      return 'safety-tag-advanced';
    case 'CRITICAL':
      return 'safety-tag-critical';
    default:
      return 'bg-gray-500 text-white';
  }
};
