import './index.css';

interface XBoardOptions {
  accounts?: string;
  limit?: number;
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'grid' | 'column';
  maxColumns?: number;
  refreshInterval?: number;
  apiUrl?: string;
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    name: string;
    profile_image_url?: string;
  };
  metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
  };
}

class XBoardWidget {
  private container: HTMLElement;
  private options: Required<XBoardOptions>;
  private refreshTimer?: number;
  private isLoading = false;

  constructor(container: HTMLElement | string, options: XBoardOptions = {}) {
    // コンテナの取得
    if (typeof container === 'string') {
      const element = document.querySelector(container) as HTMLElement;
      if (!element) {
        throw new Error(`Container element not found: ${container}`);
      }
      this.container = element;
    } else {
      this.container = container;
    }

    // デフォルトオプション
    this.options = {
      accounts: options.accounts || 'elonmusk,twitter',
      limit: options.limit || 10,
      theme: options.theme || 'auto',
      layout: options.layout || 'grid',
      maxColumns: options.maxColumns || 3,
      refreshInterval: options.refreshInterval || 30000,
      apiUrl: options.apiUrl || '/.netlify/functions/timeline'
    };

    this.init();
  }

  private init() {
    this.setupContainer();
    this.loadTweets();
    this.setupAutoRefresh();
    this.setupTheme();
  }

  private setupContainer() {
    this.container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    this.container.className = `xboard-widget ${this.options.theme === 'dark' ? 'dark' : ''}`;
  }

  private setupTheme() {
    if (this.options.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.updateTheme(prefersDark.matches ? 'dark' : 'light');
      
      prefersDark.addEventListener('change', (e) => {
        this.updateTheme(e.matches ? 'dark' : 'light');
      });
    }
  }

  private updateTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      this.container.classList.add('dark');
    } else {
      this.container.classList.remove('dark');
    }
  }

  private async loadTweets() {
    this.setLoading(true);
    
    try {
      const response = await fetch(
        `${this.options.apiUrl}?accounts=${this.options.accounts}&limit=${this.options.limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }
      
      const data = await response.json();
      this.renderTweets(data.tweets || []);
    } catch (error) {
      console.warn('XBoard: Failed to load tweets, using fallback data', error);
      this.renderTweets(this.getFallbackTweets());
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
    if (loading) {
      this.container.innerHTML = this.getLoadingHTML();
    }
  }

  private renderTweets(tweets: Tweet[]) {
    const gridClass = this.options.layout === 'grid' 
      ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${this.options.maxColumns}`
      : 'flex flex-col';
    
    this.container.innerHTML = `
      <div class="xboard-container bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
        <div class="${gridClass} gap-4">
          ${tweets.map(tweet => this.renderTweet(tweet)).join('')}
        </div>
      </div>
    `;
  }

  private renderTweet(tweet: Tweet): string {
    const timeAgo = this.formatTimeAgo(tweet.created_at);
    
    return `
      <div class="xboard-tweet bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
        <div class="flex items-start space-x-3">
          <img
            src="${tweet.user.profile_image_url || 'https://via.placeholder.com/40x40/cccccc/666666?text=?'}"
            alt="${tweet.user.name}"
            class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"
            onerror="this.src='https://via.placeholder.com/40x40/cccccc/666666?text=?'"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <h3 class="font-bold text-gray-900 dark:text-white text-sm truncate">
                ${tweet.user.name}
              </h3>
              <span class="text-gray-500 dark:text-gray-400 text-sm">
                @${tweet.user.username}
              </span>
              <span class="text-gray-500 dark:text-gray-400 text-sm">·</span>
              <span class="text-gray-500 dark:text-gray-400 text-sm">
                ${timeAgo}
              </span>
            </div>
            <p class="text-gray-900 dark:text-white text-sm mt-1 leading-relaxed">
              ${this.formatTweetText(tweet.text)}
            </p>
            ${tweet.metrics ? this.renderMetrics(tweet.metrics) : ''}
          </div>
        </div>
      </div>
    `;
  }

  private renderMetrics(metrics: Tweet['metrics']): string {
    if (!metrics) return '';
    
    return `
      <div class="flex items-center space-x-6 mt-3 text-gray-500 dark:text-gray-400">
        <div class="flex items-center space-x-1 hover:text-blue-500 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span class="text-xs">${this.formatNumber(metrics.reply_count)}</span>
        </div>
        <div class="flex items-center space-x-1 hover:text-green-500 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2A8.003 8.003 0 0019.418 15M15 15H9" />
          </svg>
          <span class="text-xs">${this.formatNumber(metrics.retweet_count)}</span>
        </div>
        <div class="flex items-center space-x-1 hover:text-red-500 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span class="text-xs">${this.formatNumber(metrics.like_count)}</span>
        </div>
      </div>
    `;
  }

  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString();
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  private formatTweetText(text: string): string {
    // Simple hashtag and mention formatting
    return text
      .replace(/#(\w+)/g, '<span class="text-blue-500">#$1</span>')
      .replace(/@(\w+)/g, '<span class="text-blue-500">@$1</span>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener" class="text-blue-500 hover:underline">$1</a>');
  }

  private getLoadingHTML(): string {
    return `
      <div class="xboard-container bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
        <div class="flex items-center justify-center space-x-2 text-blue-500">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span class="text-sm">Loading timeline...</span>
        </div>
      </div>
    `;
  }

  private setupAutoRefresh() {
    if (this.options.refreshInterval > 0) {
      this.refreshTimer = window.setInterval(() => {
        if (!this.isLoading) {
          this.loadTweets();
        }
      }, this.options.refreshInterval);
    }
  }

  private getFallbackTweets(): Tweet[] {
    return [
      {
        id: '1',
        text: 'Welcome to XBoard! 🚀 Multiple X timeline widget for your website.',
        created_at: new Date().toISOString(),
        user: {
          id: '1',
          username: 'xboard',
          name: 'XBoard'
        },
        metrics: {
          retweet_count: 12,
          like_count: 45,
          reply_count: 8
        }
      }
    ];
  }

  // Public methods
  public refresh() {
    this.loadTweets();
  }

  public updateOptions(newOptions: Partial<XBoardOptions>) {
    this.options = { ...this.options, ...newOptions };
    this.loadTweets();
  }

  public destroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    this.container.innerHTML = '';
  }
}

// Global API
declare global {
  interface Window {
    XBoard: {
      create: (container: HTMLElement | string, options?: XBoardOptions) => XBoardWidget;
    };
  }
}

// Export for global usage
window.XBoard = {
  create: (container: HTMLElement | string, options?: XBoardOptions) => {
    return new XBoardWidget(container, options);
  }
};

// Auto-initialization for data attributes
document.addEventListener('DOMContentLoaded', () => {
  const widgets = document.querySelectorAll('[data-xboard]');
  widgets.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const options: XBoardOptions = {};
    
    // Parse data attributes
    if (htmlElement.dataset.accounts) options.accounts = htmlElement.dataset.accounts;
    if (htmlElement.dataset.limit) options.limit = parseInt(htmlElement.dataset.limit);
    if (htmlElement.dataset.theme) options.theme = htmlElement.dataset.theme as 'light' | 'dark' | 'auto';
    if (htmlElement.dataset.layout) options.layout = htmlElement.dataset.layout as 'grid' | 'column';
    if (htmlElement.dataset.maxColumns) options.maxColumns = parseInt(htmlElement.dataset.maxColumns);
    if (htmlElement.dataset.refreshInterval) options.refreshInterval = parseInt(htmlElement.dataset.refreshInterval);
    
    new XBoardWidget(htmlElement, options);
  });
});

export { XBoardWidget, type XBoardOptions };