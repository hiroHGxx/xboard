export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    name: string;
    profile_image_url?: string;
  };
  media?: Array<{
    type: string;
    url: string;
  }>;
  metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
  };
}

export interface TimelineResponse {
  tweets: Tweet[];
  next_cursor?: string;
}

export interface WidgetConfig {
  accounts: string[];
  themeColor?: string;
  layout?: 'horizontal' | 'vertical';
  cols?: number;
}