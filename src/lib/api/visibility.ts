// Type definitions for visibility platform details.
// Kept for components in src/components/visibility/ that import these types.

export interface PlatformSubScores {
  [key: string]: number;
}

export interface GoogleDetails {
  brand_search_results?: Array<{
    position: number;
    url: string;
    title?: string;
    snippet?: string;
    is_brand: boolean;
  }>;
  site_index_estimate?: number;
  brand_rank_position?: number | null;
  brand_results_count?: number;
  total_results_checked?: number;
  has_knowledge_panel?: boolean;
  in_ai_overview?: boolean;
  sub_scores?: PlatformSubScores;
  method?: string;
  reasoning?: string;
  error?: string;
}

export interface RedditPost {
  title: string;
  subreddit: string;
  upvotes: number;
  comments: number;
  url: string;
}

export interface RedditDetails {
  posts?: RedditPost[];
  subreddits?: string[];
  total_mentions?: number;
  total_upvotes?: number;
  total_comments?: number;
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
    modifier: number;
  };
  sub_scores?: PlatformSubScores;
  error?: string;
}

export interface WebMention {
  url: string;
  title: string;
  snippet: string;
  platform_type: "blog" | "news" | "forum" | "social" | "review" | "other";
  domain: string;
}

export interface WebMentionsDetails {
  mentions?: WebMention[];
  total_mentions?: number;
  platform_counts?: Record<string, number>;
  sub_scores?: PlatformSubScores;
  method?: string;
  reasoning?: string;
  error?: string;
}
