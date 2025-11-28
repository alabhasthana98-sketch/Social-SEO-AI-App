export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter_x' | 'facebook';
export type Mode = 'creator' | 'editor' | 'competitor_spy' | 'trend_hunter';

export interface FilterState {
  niche: string;
  geography: string;
  targetAudience: string;
  targetLanguage: string;
  targetDemographics: string;
}

export interface SocialSEOResult {
  platform: Platform;
  mode: Mode;
  primary_goal: string;
  hook: string;
  title?: string;
  caption: string;
  description?: string;
  hashtags: string[];
  recommended_post_format: string;
  recommended_length: {
    video_seconds?: number;
    caption_max_characters?: number;
  };
  posting_strategy: {
    recommended_posting_time_local: string;
    suggested_frequency_per_week: number;
    cross_posting_tips: string;
  };
  trend_metadata?: {
    trend_detected: boolean;
    trend_name?: string;
    trend_source?: string;
    how_to_apply_trend?: string;
  };
  competitor_insights?: {
    cta_strategy: string;
    visual_theme: string;
  };
  brand_guard?: {
    brand_safe: boolean;
    violations_detected: string[];
    notes: string;
  };
  sentiment_analysis: {
    overall_tone: string;
    vibe_badge: string;
  };
  spy_mode_notes?: string;
  notes?: string;
}

export interface TrendIdea {
  idea_title: string;
  idea_description: string;
  why_it_works: string;
  suggested_platforms: Platform[];
}

export interface TrendHunterResponse {
  trend_hunter_ideas: TrendIdea[];
}
