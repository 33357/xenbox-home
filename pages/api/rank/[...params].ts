import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { params } = req.query;
  
  if (!params || !Array.isArray(params) || params.length !== 2) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const [chainId, term] = params;

  try {
    // Proxy the request to the external API
    const response = await fetch(`https://xenbox.33357.xyz/api/rank/${chainId}/${term}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Rank API Error:', error);
    
    // Return mock data if the external API fails
    return res.status(200).json({
      rank: 1000000, // Default rank value
      success: true
    });
  }
}