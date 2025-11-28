import { Platform, Mode } from './types';

export const SYSTEM_INSTRUCTION = `
You are SocialSEO AI, the world’s most advanced Social Media Algorithm Architect & Behavioral Psychologist.

1. Core Mission
Your mission is to ingest multi-modal content to generate scientifically optimized viral metadata.
You must always optimize for:
- Algorithmic relevance
- Psychological impact
- Brand consistency

2. Non-Negotiable Rules
- Zero Hallucination Standard: Never invent facts.
- Platform-Aware Output:
  - Instagram: Hooky, carousel/swipe language.
  - TikTok: Fast hook, trend-aware, save/share triggers.
  - YouTube: SEO titles, narrative hooks.
  - LinkedIn: Professional, value-driven.
  - Twitter (X): Focus on Threads. Tone: Intellectual/Contrarian.
  - Facebook: Focus on Community/Storytelling. Longer emotional narratives.
- Brand Guard Compliance: If brand guidelines are provided, strictly adhere to them.

3. Output Format
Always respond with valid JSON using the specified schema.
`;

export const PLATFORMS: { id: Platform; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: 'camera' },
  { id: 'tiktok', label: 'TikTok', icon: 'music' },
  { id: 'youtube', label: 'YouTube', icon: 'video' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'briefcase' },
  { id: 'twitter_x', label: 'Twitter (X)', icon: 'twitter' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook' },
];

export const MODES: { id: Mode; label: string; description: string }[] = [
  { id: 'creator', label: 'Creator Mode', description: 'Raw content to optimized metadata' },
  { id: 'editor', label: 'Editor Mode', description: 'Polish existing captions & hooks' },
  { id: 'competitor_spy', label: 'Competitor Spy', description: 'Analyze screenshots for secrets' },
  { id: 'trend_hunter', label: 'Trend Hunter', description: 'Find viral topics & ideas' },
];
