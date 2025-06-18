import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tweet } from '../../../packages/api/src/types';

const mockTweets: Tweet[] = [
  {
    id: '1',
    text: 'Welcome to XBoard! This is a sample tweet for development. 🚀',
    created_at: '2025-06-16T13:30:00.000Z',
    user: {
      id: '1',
      username: 'xboard_dev',
      name: 'XBoard Dev',
      profile_image_url: 'https://pbs.twimg.com/profile_images/1/default_profile_normal.png'
    },
    metrics: {
      retweet_count: 12,
      like_count: 45,
      reply_count: 8
    }
  },
  {
    id: '2',
    text: 'Just shipped a new feature! Multiple timeline support is now available. Check it out and let me know what you think! 💡 #development #react',
    created_at: '2025-06-16T12:15:00.000Z',
    user: {
      id: '2',
      username: 'tech_user',
      name: 'Tech User',
      profile_image_url: 'https://pbs.twimg.com/profile_images/1/default_profile_normal.png'
    },
    metrics: {
      retweet_count: 5,
      like_count: 23,
      reply_count: 3
    }
  },
  {
    id: '3',
    text: 'Beautiful sunset today! 🌅 Nature never fails to amaze me.',
    created_at: '2025-06-16T11:45:00.000Z',
    user: {
      id: '3',
      username: 'nature_lover',
      name: 'Nature Lover',
      profile_image_url: 'https://pbs.twimg.com/profile_images/1/default_profile_normal.png'
    },
    metrics: {
      retweet_count: 2,
      like_count: 67,
      reply_count: 12
    }
  }
];

function TweetCard({ tweet }: { tweet: Tweet }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
      <div className="flex items-start space-x-3">
        <img
          src={tweet.user.profile_image_url}
          alt={tweet.user.name}
          className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
              {tweet.user.name}
            </h3>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              @{tweet.user.username}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">·</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {formatDate(tweet.created_at)}
            </span>
          </div>
          <p className="text-gray-900 dark:text-white text-sm mt-1 leading-relaxed">
            {tweet.text}
          </p>
          {tweet.metrics && (
            <div className="flex items-center space-x-6 mt-3 text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs">{tweet.metrics.reply_count}</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2A8.003 8.003 0 0019.418 15M15 15H9" />
                </svg>
                <span className="text-xs">{tweet.metrics.retweet_count}</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-xs">{tweet.metrics.like_count}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [accounts] = useState('elonmusk,twitter'); // Test accounts
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['timeline', accounts],
    queryFn: async () => {
      const response = await fetch(`/.netlify/functions/timeline?accounts=${accounts}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }
      return response.json();
    },
    refetchInterval: 30000, // 30 seconds
    retry: 3,
  });
  
  const tweets = data?.tweets || mockTweets;
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            XBoard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Multiple X (Twitter) Timeline Widget
          </p>
          
          {/* Status indicator */}
          <div className="mt-4 flex items-center justify-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-2 text-blue-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">Loading...</span>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2 text-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Error loading timeline</span>
                <button 
                  onClick={() => refetch()}
                  className="text-sm underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-green-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Timeline loaded ({tweets.length} tweets)</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;