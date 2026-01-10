export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { symbol, type } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol required' });
  }

  try {
    let url;
    
    if (type === 'splits') {
      // Fetch stock splits
      const period1 = Math.floor(Date.now() / 1000) - (10 * 365 * 24 * 60 * 60); // 10 years ago
      const period2 = Math.floor(Date.now() / 1000);
      url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&events=splits`;
    } else {
      // Fetch current price
      url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}