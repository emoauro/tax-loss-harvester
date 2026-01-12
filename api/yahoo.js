export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { symbol, type, apikey } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol required' });
  }

  try {
    let url;
    let response;
    let data;
    
    if (type === 'splits') {
      // Use Alpha Vantage for splits (more accurate dates)
      if (!apikey) {
        return res.status(400).json({ error: 'API key required for splits. Get a free key at alphavantage.co' });
      }
      
      url = `https://www.alphavantage.co/query?function=SPLITS&symbol=${symbol}&apikey=${apikey}`;
      
      response = await fetch(url);
      data = await response.json();
      
      // Check for Alpha Vantage errors
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      if (data['Note']) {
        throw new Error('API rate limit reached. Please wait a minute and try again.');
      }
      
      // Transform Alpha Vantage format to our expected format
      const splits = data['data'] || [];
      
      return res.status(200).json({
        source: 'alphavantage',
        symbol: symbol.toUpperCase(),
        splits: splits.map(s => ({
          date: s.effective_date,
          ratio: parseFloat(s.split_ratio) || (parseFloat(s.split_to) / parseFloat(s.split_from)),
          splitFrom: parseFloat(s.split_from),
          splitTo: parseFloat(s.split_to)
        }))
      });
      
    } else {
      // Use Yahoo Finance for current prices (still reliable for this)
      url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;

      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      data = await response.json();
      return res.status(200).json(data);
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}