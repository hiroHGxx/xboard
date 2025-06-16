import { Handler } from '@netlify/functions';
import { Tweet, TimelineResponse } from '../src/types';

// Mock data for development
const mockTweets: Tweet[] = [
  {
    id: '1',
    text: 'Welcome to XBoard! This is a sample tweet for development.',
    created_at: new Date().toISOString(),
    user: {
      id: '1',
      username: 'xboard_dev',
      name: 'XBoard Dev',
      profile_image_url: 'https://via.placeholder.com/40'
    },
    metrics: {
      retweet_count: 5,
      like_count: 12,
      reply_count: 3
    }
  },
  {
    id: '2',
    text: 'Multiple timeline support coming soon! 🚀',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: '2',
      username: 'twitter_user',
      name: 'Twitter User',
      profile_image_url: 'https://via.placeholder.com/40'
    },
    metrics: {
      retweet_count: 2,
      like_count: 8,
      reply_count: 1
    }
  }
];

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { accounts, limit = '20' } = event.queryStringParameters || {};
    
    if (!accounts) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'accounts parameter is required' }),
      };
    }

    const limitNum = Math.min(parseInt(limit, 10), 50);
    
    // For now, return mock data regardless of accounts
    const response: TimelineResponse = {
      tweets: mockTweets.slice(0, limitNum),
    };

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, s-maxage=30',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Timeline API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};