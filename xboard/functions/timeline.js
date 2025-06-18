// Simple X API Timeline Function
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { accounts, limit = '10' } = event.queryStringParameters || {};
    
    if (!accounts) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'accounts parameter is required' }),
      };
    }

    console.log('Timeline API called with:', { accounts, limit });

    // Mock data (high-quality)
    const mockTweets = [
      {
        id: '1',
        text: 'Excited to announce our new AI features! The future of technology is here. #AI #Innovation',
        created_at: new Date().toISOString(),
        user: {
          id: '44196397',
          username: 'elonmusk',
          name: 'Elon Musk',
          profile_image_url: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_normal.jpg'
        },
        metrics: {
          retweet_count: 15420,
          like_count: 89532,
          reply_count: 3241
        }
      },
      {
        id: '2',
        text: 'Working on making the internet a better place for everyone 🌍 #OpenSource #WebDevelopment',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user: {
          id: '783214',
          username: 'twitter',
          name: 'Twitter',
          profile_image_url: 'https://pbs.twimg.com/profile_images/1488548719062654976/u6qfBBkF_normal.jpg'
        },
        metrics: {
          retweet_count: 8934,
          like_count: 45621,
          reply_count: 1820
        }
      },
      {
        id: '3',
        text: 'Beautiful morning! Time to build something amazing 🚀 #MondayMotivation #Startup',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        user: {
          id: '44196397',
          username: 'elonmusk', 
          name: 'Elon Musk',
          profile_image_url: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_normal.jpg'
        },
        metrics: {
          retweet_count: 2341,
          like_count: 12890,
          reply_count: 567
        }
      },
      {
        id: '4',
        text: 'Thrilled to see developers building amazing things with our API! Keep innovating 💡 #DeveloperCommunity',
        created_at: new Date(Date.now() - 10800000).toISOString(),
        user: {
          id: '783214',
          username: 'twitter',
          name: 'Twitter', 
          profile_image_url: 'https://pbs.twimg.com/profile_images/1488548719062654976/u6qfBBkF_normal.jpg'
        },
        metrics: {
          retweet_count: 5632,
          like_count: 23145,
          reply_count: 891
        }
      }
    ];

    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const response = {
      tweets: mockTweets.slice(0, limitNum)
    };

    console.log(`Returning ${response.tweets.length} tweets`);

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
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};