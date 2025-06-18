// X API v2 Timeline Function
const X_API_BASE = 'https://api.twitter.com/2';

// Helper function to get user IDs from usernames
const getUserIdsByUsernames = async (usernames, bearerToken) => {
  const url = `${X_API_BASE}/users/by?usernames=${usernames.join(',')}&user.fields=id,username`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`X API users lookup error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const userMap = {};
  
  if (data.data) {
    data.data.forEach((user) => {
      userMap[user.username] = user.id;
    });
  }
  
  return userMap;
};

// Helper function to get tweets from X API
const getTweetsFromAPI = async (usernamesOrIds, limit) => {
  const bearerToken = process.env.X_BEARER_TOKEN;
  
  if (!bearerToken) {
    console.warn('X_BEARER_TOKEN not found, using mock data');
    return getMockTweets(limit);
  }

  try {
    console.log('Fetching tweets for users:', usernamesOrIds);
    
    // Check if inputs are usernames or IDs (assuming usernames don't contain only numbers)
    const areUsernames = usernamesOrIds.some(input => isNaN(Number(input)));
    
    let userIds = [];
    
    if (areUsernames) {
      // Convert usernames to user IDs
      const userMap = await getUserIdsByUsernames(usernamesOrIds, bearerToken);
      userIds = usernamesOrIds.map(username => userMap[username]).filter(Boolean);
      console.log('Resolved user IDs:', userIds);
    } else {
      userIds = usernamesOrIds;
    }
    
    if (userIds.length === 0) {
      throw new Error('No valid user IDs found');
    }
    
    // For now, fetch from the first user (can be extended for multiple users)
    const userId = userIds[0];
    const userFields = 'id,name,username,profile_image_url';
    const tweetFields = 'id,text,created_at,public_metrics';
    
    const url = `${X_API_BASE}/users/${userId}/tweets?max_results=${Math.min(limit, 10)}&tweet.fields=${tweetFields}&user.fields=${userFields}&expansions=author_id`;
    
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('X API error response:', errorText);
      throw new Error(`X API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('X API response data:', JSON.stringify(data, null, 2));
    
    if (!data.data || data.data.length === 0) {
      console.warn('No tweets found in X API response');
      return getMockTweets(limit);
    }
    
    // Transform X API response to our Tweet format
    const tweets = data.data.map((tweet) => {
      const user = data.includes?.users?.find((u) => u.id === tweet.author_id) || {
        id: tweet.author_id,
        username: 'unknown',
        name: 'Unknown User'
      };
      
      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          profile_image_url: user.profile_image_url
        },
        metrics: tweet.public_metrics ? {
          retweet_count: tweet.public_metrics.retweet_count,
          like_count: tweet.public_metrics.like_count,
          reply_count: tweet.public_metrics.reply_count
        } : undefined
      };
    });
    
    console.log(`Successfully fetched ${tweets.length} tweets from X API`);
    return tweets;
  } catch (error) {
    console.error('Failed to fetch from X API:', error);
    return getMockTweets(limit);
  }
};

// Get mock tweets (fallback)
const getMockTweets = (limit) => {
  return [
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
  ].slice(0, limit);
};

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

    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const accountList = accounts.split(',').map(account => account.trim());
    
    // Fetch tweets from X API
    const tweets = await getTweetsFromAPI(accountList, limitNum);
    
    const response = {
      tweets
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