import React, { useState, useMemo, useEffect } from 'react';
import { Upload, TrendingUp, TrendingDown, DollarSign, RefreshCw, AlertCircle, AlertTriangle, Copy, Check, HelpCircle, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';

// ============================================
// IMPORT HELPER COMPONENT
// ============================================

const ImportHelper = ({ onClose }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(false);
  const [expandedSection, setExpandedSection] = useState('prompt');

  const requiredFormat = `Date,Symbol,Transaction Type,Units,Unit Price,Amount
2024-01-15,AAPL,PURCHASED,10,185.50,1855.00
2024-02-20,AAPL,SOLD,5,192.30,961.50
2024-03-10,TSLA,PURCHASED,20,175.00,3500.00
2024-03-15,AAPL250117C00200000,BUY_TO_OPEN,2,5.50,1100.00
2024-04-01,AAPL250117C00200000,SELL_TO_CLOSE,2,8.25,1650.00`;

  const llmPrompt = `I need you to convert my brokerage transaction history into a specific CSV format for a tax loss harvesting tool.

**REQUIRED OUTPUT FORMAT:**
The CSV must have exactly these columns in this order:
- Date (YYYY-MM-DD format)
- Symbol (stock ticker, e.g., AAPL, TSLA)
- Transaction Type (see valid types below)
- Units (number of shares/contracts, always positive)
- Unit Price (price per share/contract)
- Amount (total transaction value, always positive)

**VALID TRANSACTION TYPES:**
For stocks:
- PURCHASED (buying shares)
- SOLD (selling shares)

For options:
- BUY_TO_OPEN (buying to open a long position)
- SELL_TO_CLOSE (selling to close a long position)
- SELL_TO_OPEN (selling to open a short position)
- BUY_TO_CLOSE (buying to close a short position)
- EXPIRED (option expired worthless)
- EXERCISE (exercised an option)
- ASSIGNMENT (assigned on a short option)

**OPTION SYMBOL FORMAT:**
Options should use OCC format: SYMBOL + YYMMDD + C/P + STRIKE(padded to 8 digits)
Example: AAPL250117C00200000 = AAPL Jan 17, 2025 $200 Call

**IMPORTANT RULES:**
1. Skip dividends, interest, fees, transfers, journals, and deposits
2. All numbers should be positive (no negative signs)
3. Dates must be YYYY-MM-DD format
4. Include header row
5. Use commas as delimiters
6. If a field is missing, calculate it (Amount = Units × Unit Price)

**EXAMPLE OUTPUT:**
Date,Symbol,Transaction Type,Units,Unit Price,Amount
2024-01-15,AAPL,PURCHASED,10,185.50,1855.00
2024-02-20,AAPL,SOLD,5,192.30,961.50
2024-03-10,MSFT,PURCHASED,15,410.25,6153.75
2024-03-15,AAPL250117C00200000,BUY_TO_OPEN,2,5.50,1100.00

**HERE IS MY BROKERAGE DATA TO CONVERT:**
[PASTE YOUR TRANSACTION DATA HERE]

Please convert this data to the required CSV format. Output ONLY the CSV with no additional text or markdown formatting.`;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'prompt') {
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
      } else {
        setCopiedFormat(true);
        setTimeout(() => setCopiedFormat(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const Section = ({ id, title, children, defaultOpen = false }) => {
    const isOpen = expandedSection === id;
    return (
      <div style={{ marginBottom: '16px', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px', overflow: 'hidden' }}>
        <button
          onClick={() => setExpandedSection(isOpen ? null : id)}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: 'none',
            color: '#f1f5f9',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {title}
          {isOpen ? <ChevronUp style={{ width: '20px', height: '20px' }} /> : <ChevronDown style={{ width: '20px', height: '20px' }} />}
        </button>
        {isOpen && (
          <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.5)' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: '#1e293b', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(51, 65, 85, 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#1e293b', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HelpCircle style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Import Helper</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Quick Start */}
          <div style={{ padding: '20px', background: 'linear-gradient(to right, rgba(37, 99, 235, 0.2), rgba(139, 92, 246, 0.2))', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#60a5fa' }}>🚀 Quick Start</h3>
            <ol style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', lineHeight: '1.8' }}>
              <li>Copy the LLM prompt below</li>
              <li>Open ChatGPT, Claude, or any AI assistant</li>
              <li>Paste the prompt and add your brokerage data at the end</li>
              <li>Save the AI's response as a .csv file</li>
              <li>Upload the CSV here</li>
            </ol>
          </div>

          {/* LLM Prompt Section */}
          <Section id="prompt" title="📋 LLM Conversion Prompt" defaultOpen>
            <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
              Copy this prompt and paste it into ChatGPT, Claude, or any AI assistant. Then paste your brokerage data at the end where indicated.
            </p>
            <div style={{ position: 'relative' }}>
              <pre style={{ 
                background: '#0f172a', 
                padding: '16px', 
                borderRadius: '8px', 
                overflow: 'auto', 
                maxHeight: '300px',
                fontSize: '12px',
                lineHeight: '1.5',
                color: '#e2e8f0',
                border: '1px solid #334155'
              }}>
                {llmPrompt}
              </pre>
              <button
                onClick={() => copyToClipboard(llmPrompt, 'prompt')}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '8px 16px',
                  background: copiedPrompt ? '#10b981' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {copiedPrompt ? <><Check style={{ width: '14px', height: '14px' }} /> Copied!</> : <><Copy style={{ width: '14px', height: '14px' }} /> Copy Prompt</>}
              </button>
            </div>
          </Section>

          {/* Required Format Section */}
          <Section id="format" title="📄 Required CSV Format">
            <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
              Your CSV file must have exactly these columns in this order. Here's an example:
            </p>
            <div style={{ position: 'relative' }}>
              <pre style={{ 
                background: '#0f172a', 
                padding: '16px', 
                borderRadius: '8px', 
                overflow: 'auto',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#e2e8f0',
                border: '1px solid #334155'
              }}>
                {requiredFormat}
              </pre>
              <button
                onClick={() => copyToClipboard(requiredFormat, 'format')}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '8px 16px',
                  background: copiedFormat ? '#10b981' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {copiedFormat ? <><Check style={{ width: '14px', height: '14px' }} /> Copied!</> : <><Copy style={{ width: '14px', height: '14px' }} /> Copy Example</>}
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Column Details:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ textAlign: 'left', padding: '8px', color: '#94a3b8' }}>Column</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: '#94a3b8' }}>Format</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: '#94a3b8' }}>Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}><td style={{ padding: '8px' }}>Date</td><td style={{ padding: '8px', color: '#94a3b8' }}>YYYY-MM-DD</td><td style={{ padding: '8px', fontFamily: 'monospace', color: '#60a5fa' }}>2024-01-15</td></tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}><td style={{ padding: '8px' }}>Symbol</td><td style={{ padding: '8px', color: '#94a3b8' }}>Ticker symbol</td><td style={{ padding: '8px', fontFamily: 'monospace', color: '#60a5fa' }}>AAPL</td></tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}><td style={{ padding: '8px' }}>Transaction Type</td><td style={{ padding: '8px', color: '#94a3b8' }}>See list below</td><td style={{ padding: '8px', fontFamily: 'monospace', color: '#60a5fa' }}>PURCHASED</td></tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}><td style={{ padding: '8px' }}>Units</td><td style={{ padding: '8px', color: '#94a3b8' }}>Positive number</td><td style={{ padding: '8px', fontFamily: 'monospace', color: '#60a5fa' }}>10</td></tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}><td style={{ padding: '8px' }}>Unit Price</td><td style={{ padding: '8px', color: '#94a3b8' }}>Price per share</td><td style={{ padding: '8px', fontFamily: 'monospace', color: '#60a5fa' }}>185.50</td></tr>
                  <tr><td style={{ padding: '8px' }}>Amount</td><td style={{ padding: '8px', color: '#94a3b8' }}>Total value</td><td style={{ padding: '8px', fontFamily: 'monospace', color: '#60a5fa' }}>1855.00</td></tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Transaction Types Section */}
          <Section id="types" title="🏷️ Transaction Types">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '12px', color: '#34d399' }}>Stocks</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <code style={{ color: '#34d399' }}>PURCHASED</code>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Buy shares</span>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <code style={{ color: '#f87171' }}>SOLD</code>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Sell shares</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '12px', color: '#818cf8' }}>Options</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <code style={{ color: '#818cf8' }}>BUY_TO_OPEN</code>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Open long</span>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <code style={{ color: '#818cf8' }}>SELL_TO_CLOSE</code>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Close long</span>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <code style={{ color: '#818cf8' }}>SELL_TO_OPEN</code>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Open short</span>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <code style={{ color: '#818cf8' }}>BUY_TO_CLOSE</code>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Close short</span>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <code style={{ color: '#818cf8' }}>EXPIRED</code>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Expired worthless</span>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <code style={{ color: '#818cf8' }}>EXERCISE</code>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Exercised option</span>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <code style={{ color: '#818cf8' }}>ASSIGNMENT</code>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Assigned on short</span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Options Symbols Section */}
          <Section id="options" title="📊 Options Symbol Format">
            <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
              Options use the OCC (Options Clearing Corporation) format. The LLM prompt will handle this conversion for you.
            </p>
            <div style={{ padding: '16px', background: '#0f172a', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', marginBottom: '12px' }}>
                <span style={{ color: '#60a5fa' }}>AAPL</span>
                <span style={{ color: '#fb923c' }}>250117</span>
                <span style={{ color: '#34d399' }}>C</span>
                <span style={{ color: '#f87171' }}>00200000</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
                <div><span style={{ color: '#60a5fa' }}>●</span> Underlying: AAPL</div>
                <div><span style={{ color: '#fb923c' }}>●</span> Date: Jan 17, 2025</div>
                <div><span style={{ color: '#34d399' }}>●</span> Type: Call (C/P)</div>
                <div><span style={{ color: '#f87171' }}>●</span> Strike: $200.00</div>
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px' }}>
              The strike price is stored as the price × 1000, padded to 8 digits. So $200 becomes 00200000.
            </p>
          </Section>

          {/* Tips Section */}
          <Section id="tips" title="💡 Tips & Troubleshooting">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <strong style={{ color: '#34d399' }}>Skip non-trade rows:</strong>
                <span style={{ color: '#94a3b8', marginLeft: '8px' }}>The LLM will automatically skip dividends, interest, fees, and transfers.</span>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                <strong style={{ color: '#60a5fa' }}>Multiple accounts:</strong>
                <span style={{ color: '#94a3b8', marginLeft: '8px' }}>You can upload multiple CSV files, one for each brokerage account.</span>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(251, 146, 60, 0.1)', borderRadius: '8px', borderLeft: '3px solid #fb923c' }}>
                <strong style={{ color: '#fb923c' }}>Date format issues:</strong>
                <span style={{ color: '#94a3b8', marginLeft: '8px' }}>Make sure dates are YYYY-MM-DD. The LLM prompt handles conversion from MM/DD/YYYY.</span>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>
                <strong style={{ color: '#a78bfa' }}>Large files:</strong>
                <span style={{ color: '#94a3b8', marginLeft: '8px' }}>If your file is very large, split it into chunks and convert each separately, then combine.</span>
              </div>
            </div>
          </Section>

          {/* Close button */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(to right, #2563eb, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Got it, let me prepare my file
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaxLossHarvester = () => {
// Load initial state from localStorage
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('tlh_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('tlh_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPrices, setCurrentPrices] = useState(() => {
    const saved = localStorage.getItem('tlh_prices');
    return saved ? JSON.parse(saved) : {};
  });
  const [stockSplits, setStockSplits] = useState(() => {
    const saved = localStorage.getItem('tlh_splits');
    return saved ? JSON.parse(saved) : [];
  });
  const [tickerChanges, setTickerChanges] = useState(() => {
    const saved = localStorage.getItem('tlh_tickerChanges');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('overview');
  const [editingPrice, setEditingPrice] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showImportHelper, setShowImportHelper] = useState(false);
  const [lotsSortConfig, setLotsSortConfig] = useState({ key: 'purchaseDate', direction: 'asc' });
  const [showSplitForm, setShowSplitForm] = useState(false);
  const [showTickerChangeForm, setShowTickerChangeForm] = useState(false);
  const [splitSymbol, setSplitSymbol] = useState('');
  const [splitDate, setSplitDate] = useState('');
  const [splitRatio, setSplitRatio] = useState('');
  const [oldTicker, setOldTicker] = useState('');
  const [newTicker, setNewTicker] = useState('');
  const [changeDate, setChangeDate] = useState('');
  const [changeRatio, setChangeRatio] = useState('1');
  const [fetchingPrices, setFetchingPrices] = useState(false);
  const [dismissedWashSaleAlert, setDismissedWashSaleAlert] = useState(false);
  const [fetchingSplits, setFetchingSplits] = useState(false);
  const [priceErrors, setPriceErrors] = useState({});
  const [splitFetchSymbol, setSplitFetchSymbol] = useState('');
  const [lastPriceFetch, setLastPriceFetch] = useState(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('tlh_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('tlh_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('tlh_prices', JSON.stringify(currentPrices));
  }, [currentPrices]);

  useEffect(() => {
    localStorage.setItem('tlh_splits', JSON.stringify(stockSplits));
  }, [stockSplits]);

  useEffect(() => {
    localStorage.setItem('tlh_tickerChanges', JSON.stringify(tickerChanges));
  }, [tickerChanges]);

  // ============================================
  // OPTIONS PARSING UTILITIES
  // ============================================
  
  // Parse option symbol to extract components
  // Formats: "AAPL 250117C00200000", "AAPL250117C00200000", "-AAPL250117C200"
  const parseOptionSymbol = (symbol) => {
    if (!symbol) return null;
    
    // Clean up the symbol
    const cleanSymbol = symbol.replace(/^-/, '').replace(/\s+/g, '').toUpperCase();
    
    // Option symbol regex: UNDERLYING + YYMMDD + C/P + STRIKE (with optional decimal handling)
    // Standard OCC format: AAPL250117C00200000 (strike is price * 1000, 8 digits)
    const occMatch = cleanSymbol.match(/^([A-Z]+)(\d{6})([CP])(\d{8})$/);
    if (occMatch) {
      const [, underlying, dateStr, optionType, strikeStr] = occMatch;
      const year = 2000 + parseInt(dateStr.substring(0, 2));
      const month = parseInt(dateStr.substring(2, 4)) - 1;
      const day = parseInt(dateStr.substring(4, 6));
      const strike = parseInt(strikeStr) / 1000;
      
      return {
        isOption: true,
        underlying,
        expiration: new Date(year, month, day),
        optionType: optionType === 'C' ? 'CALL' : 'PUT',
        strike,
        originalSymbol: symbol
      };
    }
    
    // Shorter format: AAPL250117C200
    const shortMatch = cleanSymbol.match(/^([A-Z]+)(\d{6})([CP])(\d+\.?\d*)$/);
    if (shortMatch) {
      const [, underlying, dateStr, optionType, strikeStr] = shortMatch;
      const year = 2000 + parseInt(dateStr.substring(0, 2));
      const month = parseInt(dateStr.substring(2, 4)) - 1;
      const day = parseInt(dateStr.substring(4, 6));
      const strike = parseFloat(strikeStr);
      
      return {
        isOption: true,
        underlying,
        expiration: new Date(year, month, day),
        optionType: optionType === 'C' ? 'CALL' : 'PUT',
        strike,
        originalSymbol: symbol
      };
    }
    
    return null; // Not an option
  };

  // Check if a symbol is an option
  const isOptionSymbol = (symbol) => {
    return parseOptionSymbol(symbol) !== null;
  };

  // Get underlying symbol from option or return the symbol itself
  const getUnderlyingSymbol = (symbol) => {
    const parsed = parseOptionSymbol(symbol);
    return parsed ? parsed.underlying : symbol;
  };

  // Format option for display
  const formatOptionDisplay = (symbol) => {
    const parsed = parseOptionSymbol(symbol);
    if (!parsed) return symbol;
    
    const expStr = parsed.expiration.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    return `${parsed.underlying} ${expStr} $${parsed.strike} ${parsed.optionType}`;
  };

  // ============================================
  // WASH SALE DETECTION
  // ============================================
  
  const WASH_SALE_WINDOW = 30; // days before and after

  // Check if a date is within the wash sale window of a sale date
  const isWithinWashSaleWindow = (purchaseDate, saleDate) => {
    const diffMs = Math.abs(purchaseDate - saleDate);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= WASH_SALE_WINDOW;
  };

  // ============================================
  // API FUNCTIONS
  // ============================================

  // Fetch previous day's closing price from Yahoo Finance
  const fetchStockPrice = async (symbol) => {
    try {
      if (isOptionSymbol(symbol)) {
        throw new Error('Options prices not available via API');
      }
      
      const response = await fetch(`/api/yahoo?symbol=${encodeURIComponent(symbol)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.chart?.error) {
        throw new Error(data.chart.error.description || 'Unknown error');
      }
      
      const result = data.chart?.result?.[0];
      if (!result) {
        throw new Error('No data returned');
      }
      
      const closes = result.indicators?.quote?.[0]?.close;
      if (!closes || closes.length < 2) {
        const lastClose = result.meta?.previousClose || result.meta?.regularMarketPrice;
        if (lastClose) {
          return { price: lastClose, date: 'previous close' };
        }
        throw new Error('No price data available');
      }
      
      const validCloses = closes.filter(c => c !== null);
      const previousClose = validCloses[validCloses.length - 1];
      
      if (!previousClose) {
        throw new Error('No valid closing price');
      }
      
      return { price: previousClose, date: 'previous close' };
    } catch (error) {
      throw new Error(`${symbol}: ${error.message}`);
    }
  };

  // Fetch all prices for open positions
  const fetchAllPrices = async () => {
    const symbols = allPositionDetails
      .filter(p => !isOptionSymbol(p.symbol)) // Skip options
      .map(p => p.symbol);
    if (symbols.length === 0) return;
    
    setFetchingPrices(true);
    setPriceErrors({});
    
    const newPrices = { ...currentPrices };
    const errors = {};
    
    for (const symbol of symbols) {
      try {
        const { price } = await fetchStockPrice(symbol);
        newPrices[symbol] = price;
      } catch (error) {
        errors[symbol] = error.message;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setCurrentPrices(newPrices);
    setPriceErrors(errors);
    setLastPriceFetch(new Date());
    setFetchingPrices(false);
  };

  // Fetch single price
  const fetchSinglePrice = async (symbol) => {
    setFetchingPrices(true);
    setPriceErrors(prev => ({ ...prev, [symbol]: null }));
    
    try {
      const { price } = await fetchStockPrice(symbol);
      setCurrentPrices(prev => ({ ...prev, [symbol]: price }));
    } catch (error) {
      setPriceErrors(prev => ({ ...prev, [symbol]: error.message }));
    }
    
    setFetchingPrices(false);
  };

  // Fetch stock splits from Yahoo Finance
 const fetchStockSplits = async (symbol, showAlerts = true) => {
    if (!symbol) return;
    
    setFetchingSplits(true);
    const upperSymbol = symbol.toUpperCase();
    
    try {
      const response = await fetch(`/api/yahoo?symbol=${encodeURIComponent(upperSymbol)}&type=splits`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.chart?.error) {
        throw new Error(data.chart.error.description || 'Unknown error');
      }
      
      const result = data.chart?.result?.[0];
      const splits = result?.events?.splits;
      
      if (!splits || Object.keys(splits).length === 0) {
        // No alert for "no splits found" - that's normal for most stocks
        setFetchingSplits(false);
        return;
      }
      
      const newSplits = Object.entries(splits).map(([timestamp, splitData]) => ({
        symbol: upperSymbol,
        date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
        ratio: splitData.numerator / splitData.denominator,
        numerator: splitData.numerator,
        denominator: splitData.denominator
      }));
      
      const existingSplitKeys = new Set(
        stockSplits.map(s => `${s.symbol}-${s.date}`)
      );
      
      const splitsToAdd = newSplits.filter(
        s => !existingSplitKeys.has(`${s.symbol}-${s.date}`)
      );
      
      if (splitsToAdd.length > 0) {
        setStockSplits(prev => [...prev, ...splitsToAdd]);
        if (showAlerts) {
          alert(`Added ${splitsToAdd.length} split(s) for ${upperSymbol}`);
        }
      }
      
      setSplitFetchSymbol('');
    } catch (error) {
      if (showAlerts) {
        alert(`Error fetching splits for ${upperSymbol}: ${error.message}`);
      }
    }
    
    setFetchingSplits(false);
  };

  // ============================================
  // CSV PARSING
  // ============================================

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    return lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i]?.replace(/"/g, '') || '';
      });
      return obj;
    });
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    let allTransactions = [];
    let accountsList = [];
    let filesProcessed = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const parsed = parseCSV(e.target.result);
        allTransactions = [...allTransactions, ...parsed];
        accountsList.push({ 
          name: file.name.replace('.csv', ''), 
          transactionCount: parsed.length 
        });
        filesProcessed++;

        if (filesProcessed === files.length) {
          setTransactions(allTransactions);
          setAccounts(accountsList);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleAddMoreFiles = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    let newTransactions = [];
    let newAccountsList = [];
    let filesProcessed = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const parsed = parseCSV(e.target.result);
        newTransactions = [...newTransactions, ...parsed];
        newAccountsList.push({ 
          name: file.name.replace('.csv', ''), 
          transactionCount: parsed.length 
        });
        filesProcessed++;

        if (filesProcessed === files.length) {
          setTransactions([...transactions, ...newTransactions]);
          setAccounts([...accounts, ...newAccountsList]);
        }
      };
      reader.readAsText(file);
    });
    
    event.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset? All data will be cleared.')) {
      // Clear localStorage
      localStorage.removeItem('tlh_transactions');
      localStorage.removeItem('tlh_accounts');
      localStorage.removeItem('tlh_prices');
      localStorage.removeItem('tlh_splits');
      localStorage.removeItem('tlh_tickerChanges');
      
      // Reset state
      setTransactions([]);
      setAccounts([]);
      setCurrentPrices({});
      setStockSplits([]);
      setTickerChanges([]);
      setActiveView('overview');
      setSelectedSymbol(null);
      setPriceErrors({});
      setLastPriceFetch(null);
      setDismissedWashSaleAlert(false);
      setShowImportHelper(false);
      setFilterType('all');
      setSelectedYear('all');
      setSortConfig({ key: null, direction: 'asc' });
      setLotsSortConfig({ key: 'purchaseDate', direction: 'asc' });
    }
  };

  const updateCurrentPrice = (symbol, price) => {
    setCurrentPrices(prev => ({
      ...prev,
      [symbol]: parseFloat(price) || 0
    }));
    setEditingPrice(null);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const addStockSplit = () => {
    if (!splitSymbol || !splitDate || !splitRatio) return;
    setStockSplits([...stockSplits, {
      symbol: splitSymbol.toUpperCase(),
      date: splitDate,
      ratio: parseFloat(splitRatio)
    }]);
    setSplitSymbol('');
    setSplitDate('');
    setSplitRatio('');
    setShowSplitForm(false);
  };

  const removeSplit = (index) => {
    setStockSplits(stockSplits.filter((_, i) => i !== index));
  };

  const addTickerChange = () => {
    if (!oldTicker || !newTicker || !changeDate) return;
    setTickerChanges([...tickerChanges, {
      oldSymbol: oldTicker.toUpperCase(),
      newSymbol: newTicker.toUpperCase(),
      date: changeDate,
      ratio: parseFloat(changeRatio) || 1
    }]);
    // Clear price errors for the old ticker since it's being remapped
    setPriceErrors(prev => {
      const updated = { ...prev };
      delete updated[oldTicker.toUpperCase()];
      return updated;
    });
    // Clear any stored price for the old ticker
    setCurrentPrices(prev => {
      const updated = { ...prev };
      delete updated[oldTicker.toUpperCase()];
      return updated;
    });
    setOldTicker('');
    setNewTicker('');
    setChangeDate('');
    setChangeRatio('1');
    setShowTickerChangeForm(false);
  };

  const removeTickerChange = (index) => {
    setTickerChanges(tickerChanges.filter((_, i) => i !== index));
  };

  // ============================================
  // MAIN PROCESSING LOGIC
  // ============================================

  const processedData = useMemo(() => {
    const positions = {};
    const optionsPositions = {};
    const closedPositions = [];
    const closedOptionsPositions = [];
    const washSales = [];

    // Normalize transaction types
    const normalizeTransactionType = (type) => {
      const upper = (type || '').toUpperCase().replace(/\s+/g, '_');
      
      // Stock transactions
      if (['PURCHASED', 'BUY', 'BOUGHT'].includes(upper)) return 'PURCHASED';
      if (['SOLD', 'SELL'].includes(upper)) return 'SOLD';
      
      // Options transactions
      if (['BUY_TO_OPEN', 'BTO', 'BOUGHT_TO_OPEN'].includes(upper)) return 'BUY_TO_OPEN';
      if (['SELL_TO_CLOSE', 'STC', 'SOLD_TO_CLOSE'].includes(upper)) return 'SELL_TO_CLOSE';
      if (['SELL_TO_OPEN', 'STO', 'SOLD_TO_OPEN'].includes(upper)) return 'SELL_TO_OPEN';
      if (['BUY_TO_CLOSE', 'BTC', 'BOUGHT_TO_CLOSE'].includes(upper)) return 'BUY_TO_CLOSE';
      if (['EXPIRED', 'EXPIRATION'].includes(upper)) return 'EXPIRED';
      if (['EXERCISE', 'EXERCISED'].includes(upper)) return 'EXERCISE';
      if (['ASSIGNMENT', 'ASSIGNED'].includes(upper)) return 'ASSIGNMENT';
      
      return upper;
    };

    const sorted = [...transactions]
      .filter(t => t.Symbol && t['Transaction Type'])
      .sort((a, b) => new Date(a.Date) - new Date(b.Date));

    // Apply ticker changes to transactions (for stocks only, not options)
    const adjustedTransactions = sorted.map(transaction => {
      let symbol = transaction.Symbol;
      const transactionDate = new Date(transaction.Date);
      
      // Only apply ticker changes to non-option symbols
      if (!isOptionSymbol(symbol)) {
        tickerChanges.forEach(change => {
          if (change.oldSymbol === symbol && new Date(change.date) > transactionDate) {
            symbol = change.newSymbol;
          }
        });
      }
      
      return { ...transaction, Symbol: symbol };
    });

    // First pass: Process all transactions
    adjustedTransactions.forEach(transaction => {
      const symbol = transaction.Symbol;
      const type = normalizeTransactionType(transaction['Transaction Type']);
      const units = parseFloat(transaction.Units) || 0;
      const price = parseFloat(transaction['Unit Price']) || 0;
      const date = new Date(transaction.Date);
      const amount = parseFloat(transaction.Amount?.replace(/[$,]/g, '')) || 0;
      
      const isOption = isOptionSymbol(symbol);
      const optionInfo = isOption ? parseOptionSymbol(symbol) : null;

      // ============================================
      // OPTIONS HANDLING
      // ============================================
      if (isOption) {
        if (!optionsPositions[symbol]) {
          optionsPositions[symbol] = { lots: [], totalContracts: 0, isShort: false };
        }

        // BUY TO OPEN - Long option position
        if (type === 'BUY_TO_OPEN' || (type === 'PURCHASED' && isOption)) {
          const contracts = Math.abs(units);
          optionsPositions[symbol].lots.push({
            symbol,
            underlying: optionInfo.underlying,
            optionType: optionInfo.optionType,
            strike: optionInfo.strike,
            expiration: optionInfo.expiration,
            purchaseDate: date,
            contracts,
            costBasis: Math.abs(amount),
            unitPrice: price,
            isShort: false
          });
          optionsPositions[symbol].totalContracts += contracts;
          optionsPositions[symbol].isShort = false;
        }
        
        // SELL TO CLOSE - Close long option position
        else if (type === 'SELL_TO_CLOSE' || (type === 'SOLD' && isOption && !optionsPositions[symbol].isShort)) {
          let remainingContracts = Math.abs(units);
          const salePrice = price || (Math.abs(amount) / Math.abs(units));
          
          while (remainingContracts > 0 && optionsPositions[symbol].lots.length > 0) {
            const oldestLot = optionsPositions[symbol].lots[0];
            
            if (oldestLot.contracts <= remainingContracts) {
              const daysHeld = Math.floor((date - oldestLot.purchaseDate) / (1000 * 60 * 60 * 24));
              const proceeds = oldestLot.contracts * salePrice * 100; // Options are 100 shares per contract
              const pnl = proceeds - oldestLot.costBasis;
              
              closedOptionsPositions.push({
                ...oldestLot,
                saleDate: date,
                salePrice,
                proceeds,
                pnl,
                daysHeld,
                taxStatus: daysHeld >= 365 ? 'LT' : 'ST',
                closeType: 'SELL_TO_CLOSE'
              });
              
              remainingContracts -= oldestLot.contracts;
              optionsPositions[symbol].lots.shift();
            } else {
              const daysHeld = Math.floor((date - oldestLot.purchaseDate) / (1000 * 60 * 60 * 24));
              const soldContracts = remainingContracts;
              const soldCost = (oldestLot.costBasis / oldestLot.contracts) * soldContracts;
              const proceeds = soldContracts * salePrice * 100;
              const pnl = proceeds - soldCost;
              
              closedOptionsPositions.push({
                ...oldestLot,
                contracts: soldContracts,
                costBasis: soldCost,
                saleDate: date,
                salePrice,
                proceeds,
                pnl,
                daysHeld,
                taxStatus: daysHeld >= 365 ? 'LT' : 'ST',
                closeType: 'SELL_TO_CLOSE'
              });
              
              oldestLot.contracts -= soldContracts;
              oldestLot.costBasis -= soldCost;
              remainingContracts = 0;
            }
          }
          
          optionsPositions[symbol].totalContracts = optionsPositions[symbol].lots.reduce((sum, lot) => sum + lot.contracts, 0);
        }
        
        // SELL TO OPEN - Short option position (writing options)
        else if (type === 'SELL_TO_OPEN') {
          const contracts = Math.abs(units);
          const premium = Math.abs(amount);
          
          optionsPositions[symbol].lots.push({
            symbol,
            underlying: optionInfo.underlying,
            optionType: optionInfo.optionType,
            strike: optionInfo.strike,
            expiration: optionInfo.expiration,
            purchaseDate: date,
            contracts,
            costBasis: 0, // No cost basis for short options, premium is received
            premium,
            unitPrice: price,
            isShort: true
          });
          optionsPositions[symbol].totalContracts += contracts;
          optionsPositions[symbol].isShort = true;
        }
        
        // BUY TO CLOSE - Close short option position
        else if (type === 'BUY_TO_CLOSE') {
          let remainingContracts = Math.abs(units);
          const closePrice = price || (Math.abs(amount) / Math.abs(units));
          
          while (remainingContracts > 0 && optionsPositions[symbol].lots.length > 0) {
            const oldestLot = optionsPositions[symbol].lots[0];
            
            if (oldestLot.contracts <= remainingContracts) {
              const daysHeld = Math.floor((date - oldestLot.purchaseDate) / (1000 * 60 * 60 * 24));
              const closeCost = oldestLot.contracts * closePrice * 100;
              const pnl = oldestLot.premium - closeCost; // Profit = premium received - cost to close
              
              closedOptionsPositions.push({
                ...oldestLot,
                saleDate: date,
                salePrice: closePrice,
                proceeds: oldestLot.premium,
                closeCost,
                pnl,
                daysHeld,
                taxStatus: daysHeld >= 365 ? 'LT' : 'ST',
                closeType: 'BUY_TO_CLOSE'
              });
              
              remainingContracts -= oldestLot.contracts;
              optionsPositions[symbol].lots.shift();
            } else {
              const daysHeld = Math.floor((date - oldestLot.purchaseDate) / (1000 * 60 * 60 * 24));
              const closedContracts = remainingContracts;
              const premiumPortion = (oldestLot.premium / oldestLot.contracts) * closedContracts;
              const closeCost = closedContracts * closePrice * 100;
              const pnl = premiumPortion - closeCost;
              
              closedOptionsPositions.push({
                ...oldestLot,
                contracts: closedContracts,
                premium: premiumPortion,
                saleDate: date,
                salePrice: closePrice,
                proceeds: premiumPortion,
                closeCost,
                pnl,
                daysHeld,
                taxStatus: daysHeld >= 365 ? 'LT' : 'ST',
                closeType: 'BUY_TO_CLOSE'
              });
              
              oldestLot.contracts -= closedContracts;
              oldestLot.premium -= premiumPortion;
              remainingContracts = 0;
            }
          }
          
          optionsPositions[symbol].totalContracts = optionsPositions[symbol].lots.reduce((sum, lot) => sum + lot.contracts, 0);
        }
        
        // EXPIRED - Option expired worthless
        else if (type === 'EXPIRED') {
          while (optionsPositions[symbol].lots.length > 0) {
            const lot = optionsPositions[symbol].lots.shift();
            const daysHeld = Math.floor((date - lot.purchaseDate) / (1000 * 60 * 60 * 24));
            
            closedOptionsPositions.push({
              ...lot,
              saleDate: date,
              salePrice: 0,
              proceeds: lot.isShort ? lot.premium : 0, // Short options: keep full premium; Long options: lose everything
              pnl: lot.isShort ? lot.premium : -lot.costBasis,
              daysHeld,
              taxStatus: daysHeld >= 365 ? 'LT' : 'ST',
              closeType: 'EXPIRED'
            });
          }
          optionsPositions[symbol].totalContracts = 0;
        }
        
        // EXERCISE - Exercised a long option (converts to stock)
        else if (type === 'EXERCISE') {
          while (optionsPositions[symbol].lots.length > 0) {
            const lot = optionsPositions[symbol].lots.shift();
            const underlyingSymbol = lot.underlying;
            const shares = lot.contracts * 100;
            
            if (!positions[underlyingSymbol]) {
              positions[underlyingSymbol] = { lots: [], totalUnits: 0 };
            }
            
            // For calls: cost basis = strike price * shares + option premium paid
            // For puts: this creates a sale, handled differently
            if (lot.optionType === 'CALL') {
              const stockCostBasis = (lot.strike * shares) + lot.costBasis;
              positions[underlyingSymbol].lots.push({
                symbol: underlyingSymbol,
                purchaseDate: date,
                units: shares,
                costBasis: stockCostBasis,
                unitPrice: lot.strike + (lot.costBasis / shares),
                fromExercise: true,
                exercisedOption: symbol
              });
              positions[underlyingSymbol].totalUnits += shares;
            }
            // PUT exercise means you're selling shares at strike price
            // This is more complex - would need existing shares
          }
          optionsPositions[symbol].totalContracts = 0;
        }
        
        // ASSIGNMENT - Assigned on a short option
        else if (type === 'ASSIGNMENT') {
          while (optionsPositions[symbol].lots.length > 0) {
            const lot = optionsPositions[symbol].lots.shift();
            const underlyingSymbol = lot.underlying;
            const shares = lot.contracts * 100;
            
            if (!positions[underlyingSymbol]) {
              positions[underlyingSymbol] = { lots: [], totalUnits: 0 };
            }
            
            // For short puts: you buy shares at strike, premium reduces cost basis
            if (lot.optionType === 'PUT') {
              const stockCostBasis = (lot.strike * shares) - lot.premium;
              positions[underlyingSymbol].lots.push({
                symbol: underlyingSymbol,
                purchaseDate: date,
                units: shares,
                costBasis: stockCostBasis,
                unitPrice: lot.strike - (lot.premium / shares),
                fromAssignment: true,
                assignedOption: symbol
              });
              positions[underlyingSymbol].totalUnits += shares;
            }
            // Short call assignment means you sell shares at strike
            // Would need to close existing stock position
          }
          optionsPositions[symbol].totalContracts = 0;
        }
      }
      
      // ============================================
      // STOCK HANDLING
      // ============================================
      else {
        if (!positions[symbol]) {
          positions[symbol] = { lots: [], totalUnits: 0 };
        }

        if (type === 'PURCHASED') {
          let adjustedUnits = units;
          let adjustedPrice = price;
          
          stockSplits
            .filter(split => split.symbol === symbol && new Date(split.date) > date)
            .forEach(split => {
              adjustedUnits = adjustedUnits * split.ratio;
              adjustedPrice = adjustedPrice / split.ratio;
            });

          tickerChanges
            .filter(change => change.newSymbol === symbol && new Date(change.date) > date)
            .forEach(change => {
              adjustedUnits = adjustedUnits * change.ratio;
              adjustedPrice = adjustedPrice / change.ratio;
            });

          positions[symbol].lots.push({
            symbol,
            purchaseDate: date,
            units: adjustedUnits,
            costBasis: Math.abs(amount),
            unitPrice: adjustedPrice,
          });
          positions[symbol].totalUnits += adjustedUnits;
        } else if (type === 'SOLD') {
          let remainingUnits = Math.abs(units);
          const salePrice = price || (Math.abs(amount) / Math.abs(units));
          
          while (remainingUnits > 0 && positions[symbol].lots.length > 0) {
            const oldestLot = positions[symbol].lots[0];
            
            if (oldestLot.units <= remainingUnits) {
              const daysHeld = Math.floor((date - oldestLot.purchaseDate) / (1000 * 60 * 60 * 24));
              const proceeds = oldestLot.units * salePrice;
              const pnl = proceeds - oldestLot.costBasis;
              
              closedPositions.push({
                ...oldestLot,
                saleDate: date,
                salePrice,
                proceeds,
                pnl,
                daysHeld,
                taxStatus: daysHeld >= 365 ? 'LT' : 'ST',
              });
              
              remainingUnits -= oldestLot.units;
              positions[symbol].lots.shift();
            } else {
              const daysHeld = Math.floor((date - oldestLot.purchaseDate) / (1000 * 60 * 60 * 24));
              const soldUnits = remainingUnits;
              const soldCost = (oldestLot.costBasis / oldestLot.units) * soldUnits;
              const proceeds = soldUnits * salePrice;
              const pnl = proceeds - soldCost;
              
              closedPositions.push({
                ...oldestLot,
                units: soldUnits,
                costBasis: soldCost,
                saleDate: date,
                salePrice,
                proceeds,
                pnl,
                daysHeld,
                taxStatus: daysHeld >= 365 ? 'LT' : 'ST',
              });
              
              oldestLot.units -= soldUnits;
              oldestLot.costBasis -= soldCost;
              remainingUnits = 0;
            }
          }
          
          positions[symbol].totalUnits -= Math.abs(units);
        }
      }
    });

    // ============================================
    // WASH SALE DETECTION (Second Pass)
    // ============================================
    
    // For each closed position with a loss, check for wash sales
    closedPositions.forEach(closedPos => {
      if (closedPos.pnl >= 0) return; // Only check losses
      
      const saleDate = closedPos.saleDate;
      const symbol = closedPos.symbol;
      
      // Find replacement purchases within 30 days before or after
      const replacementPurchases = [];
      
      // Check open lots
      if (positions[symbol]) {
        positions[symbol].lots.forEach(lot => {
          if (isWithinWashSaleWindow(lot.purchaseDate, saleDate)) {
            replacementPurchases.push({
              type: 'open',
              lot,
              date: lot.purchaseDate,
              units: lot.units
            });
          }
        });
      }
      
      // Check other closed positions (repurchases that were later sold)
      closedPositions.forEach(otherClosed => {
        if (otherClosed === closedPos) return;
        if (otherClosed.symbol !== symbol) return;
        if (isWithinWashSaleWindow(otherClosed.purchaseDate, saleDate) && 
            otherClosed.purchaseDate > closedPos.purchaseDate) {
          replacementPurchases.push({
            type: 'closed',
            lot: otherClosed,
            date: otherClosed.purchaseDate,
            units: otherClosed.units
          });
        }
      });
      
      if (replacementPurchases.length > 0) {
        // Calculate disallowed loss
        const totalReplacementUnits = replacementPurchases.reduce((sum, p) => sum + p.units, 0);
        const washSaleUnits = Math.min(closedPos.units, totalReplacementUnits);
        const disallowedLoss = (Math.abs(closedPos.pnl) / closedPos.units) * washSaleUnits;
        
        closedPos.washSale = {
          isWashSale: true,
          disallowedLoss,
          washSaleUnits,
          replacementPurchases: replacementPurchases.map(p => ({
            date: p.date,
            units: p.units
          })),
          adjustedPnL: closedPos.pnl + disallowedLoss // Less negative (loss reduced)
        };
        
        washSales.push({
          symbol,
          saleDate,
          originalLoss: closedPos.pnl,
          disallowedLoss,
          washSaleUnits,
          closedPosition: closedPos
        });
        
        // Adjust cost basis of replacement lots
        replacementPurchases.forEach(replacement => {
          if (replacement.type === 'open') {
            const adjustmentPerUnit = disallowedLoss / totalReplacementUnits;
            const lotAdjustment = adjustmentPerUnit * replacement.lot.units;
            replacement.lot.costBasis += lotAdjustment;
            replacement.lot.washSaleAdjustment = (replacement.lot.washSaleAdjustment || 0) + lotAdjustment;
          }
        });
      }
    });

    // Add days held and tax status to open lots
    Object.values(positions).forEach(position => {
      position.lots.forEach(lot => {
        const daysHeld = Math.floor((currentDate - lot.purchaseDate) / (1000 * 60 * 60 * 24));
        lot.daysHeld = daysHeld;
        lot.taxStatus = daysHeld >= 365 ? 'LT' : 'ST';
        lot.daysToLT = Math.max(0, 365 - daysHeld);
      });
    });

    // Calculate gains/losses
    const stGains = closedPositions
      .filter(p => p.taxStatus === 'ST')
      .reduce((sum, p) => sum + (p.washSale ? p.washSale.adjustedPnL : p.pnl), 0);
    
    const ltGains = closedPositions
      .filter(p => p.taxStatus === 'LT')
      .reduce((sum, p) => sum + (p.washSale ? p.washSale.adjustedPnL : p.pnl), 0);

    const optionsStGains = closedOptionsPositions
      .filter(p => p.taxStatus === 'ST')
      .reduce((sum, p) => sum + p.pnl, 0);
    
    const optionsLtGains = closedOptionsPositions
      .filter(p => p.taxStatus === 'LT')
      .reduce((sum, p) => sum + p.pnl, 0);

    const allYears = [...new Set([
      ...closedPositions.map(p => p.saleDate.getFullYear()),
      ...closedOptionsPositions.map(p => p.saleDate.getFullYear())
    ])].sort((a, b) => b - a);

    // Calculate position details for Set Prices
    const allPositionDetails = Object.entries(positions)
      .filter(([symbol, data]) => data.totalUnits > 0.0001)
      .map(([symbol, data]) => {
        const totalCost = data.lots.reduce((sum, lot) => sum + lot.costBasis, 0);
        const currentPrice = currentPrices[symbol] || 0;
        const totalValue = data.totalUnits * currentPrice;
        const unrealizedPnL = totalValue - totalCost;
        const washSaleAdjustment = data.lots.reduce((sum, lot) => sum + (lot.washSaleAdjustment || 0), 0);
        
        return {
          symbol,
          totalUnits: data.totalUnits,
          totalCost,
          currentPrice,
          totalValue,
          unrealizedPnL,
          lots: data.lots,
          hasPriceSet: currentPrices[symbol] !== undefined,
          washSaleAdjustment,
          isOption: false
        };
      })
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    // Options position details
    const allOptionsDetails = Object.entries(optionsPositions)
      .filter(([symbol, data]) => data.totalContracts > 0)
      .map(([symbol, data]) => {
        const totalCost = data.lots.reduce((sum, lot) => sum + (lot.costBasis || 0), 0);
        const totalPremium = data.lots.reduce((sum, lot) => sum + (lot.premium || 0), 0);
        
        return {
          symbol,
          displayName: formatOptionDisplay(symbol),
          totalContracts: data.totalContracts,
          totalCost,
          totalPremium,
          lots: data.lots,
          isShort: data.isShort,
          isOption: true
        };
      })
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    const totalWashSaleDisallowed = washSales.reduce((sum, ws) => sum + ws.disallowedLoss, 0);

    return { 
      positions, 
      optionsPositions,
      closedPositions, 
      closedOptionsPositions,
      stGains: stGains + optionsStGains, 
      ltGains: ltGains + optionsLtGains, 
      stockStGains: stGains,
      stockLtGains: ltGains,
      optionsStGains,
      optionsLtGains,
      allYears, 
      allPositionDetails,
      allOptionsDetails,
      washSales,
      totalWashSaleDisallowed
    };
  }, [transactions, currentPrices, stockSplits, tickerChanges, currentDate]);

  const { 
    positions, 
    optionsPositions,
    closedPositions, 
    closedOptionsPositions,
    stGains, 
    ltGains, 
    stockStGains,
    stockLtGains,
    optionsStGains,
    optionsLtGains,
    allYears, 
    allPositionDetails,
    allOptionsDetails,
    washSales,
    totalWashSaleDisallowed
  } = processedData;

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderOverview = () => {
    const totalRealizedPnL = stGains + ltGains;
    const totalUnrealizedPnL = allPositionDetails.reduce((sum, p) => sum + p.unrealizedPnL, 0);
    const positionsWithPrices = allPositionDetails.filter(p => p.hasPriceSet);
    const totalTransactions = accounts.reduce((sum, acc) => sum + acc.transactionCount, 0);

    const taxLossOpportunities = positionsWithPrices
      .filter(p => p.unrealizedPnL < 0)
      .sort((a, b) => a.unrealizedPnL - b.unrealizedPnL)
      .slice(0, 10);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Account Summary */}
        <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Accounts Loaded</h3>
            <div style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}>
              <span style={{ color: '#60a5fa', fontWeight: '600' }}>{totalTransactions.toLocaleString()}</span>
              <span style={{ color: '#94a3b8', marginLeft: '4px' }}>total transactions</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {accounts.map((acc, i) => (
              <div key={i} style={{ padding: '12px 16px', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '8px' }}>
                <div style={{ fontWeight: '600' }}>{acc.name}</div>
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>{acc.transactionCount} transactions</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wash Sale Alert */}
        {washSales.length > 0 && !dismissedWashSaleAlert && (
          <div style={{ padding: '20px', background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.3)', borderRadius: '12px', position: 'relative' }}>
            <button
              onClick={() => setDismissedWashSaleAlert(true)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '20px',
                lineHeight: '1',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
              onMouseOver={(e) => e.target.style.color = '#f1f5f9'}
              onMouseOut={(e) => e.target.style.color = '#94a3b8'}
            >
              ×
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <AlertTriangle style={{ width: '24px', height: '24px', color: '#fb923c' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fb923c' }}>Wash Sales Detected</h3>
            </div>
            <p style={{ color: '#94a3b8', marginBottom: '12px' }}>
              {washSales.length} wash sale{washSales.length > 1 ? 's' : ''} detected. 
              Total disallowed loss: <span style={{ color: '#f87171', fontWeight: '600' }}>${totalWashSaleDisallowed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Disallowed losses have been added to the cost basis of replacement shares. See Tax Summary for details.
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Total Realized P&L</h3>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: totalRealizedPnL >= 0 ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>
              {totalRealizedPnL >= 0 ? '+' : ''}${totalRealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
              {closedPositions.length + closedOptionsPositions.length} closed positions
              {closedOptionsPositions.length > 0 && (
                <span style={{ marginLeft: '8px', color: '#818cf8' }}>
                  ({closedOptionsPositions.length} options)
                </span>
              )}
            </div>
          </div>

          <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Total Unrealized P&L</h3>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: positionsWithPrices.length === 0 ? '#94a3b8' : totalUnrealizedPnL >= 0 ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>
              {positionsWithPrices.length === 0 ? '—' : `${totalUnrealizedPnL >= 0 ? '+' : ''}$${totalUnrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
              {positionsWithPrices.length === 0 ? 'Set prices to calculate' : `${allPositionDetails.length} open positions`}
              {allOptionsDetails.length > 0 && (
                <span style={{ marginLeft: '8px', color: '#818cf8' }}>
                  + {allOptionsDetails.length} options
                </span>
              )}
            </div>
          </div>

          <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Short-Term Gains (All Time)</h3>
              <span style={{ padding: '4px 12px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>ST</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: stGains >= 0 ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>
              {stGains >= 0 ? '+' : ''}${stGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
              {closedPositions.filter(p => p.taxStatus === 'ST').length + closedOptionsPositions.filter(p => p.taxStatus === 'ST').length} positions
            </div>
          </div>

          <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Long-Term Gains (All Time)</h3>
              <span style={{ padding: '4px 12px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>LT</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: ltGains >= 0 ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>
              {ltGains >= 0 ? '+' : ''}${ltGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
              {closedPositions.filter(p => p.taxStatus === 'LT').length + closedOptionsPositions.filter(p => p.taxStatus === 'LT').length} positions
            </div>
          </div>
        </div>

        {/* Options Summary (if any) */}
        {(closedOptionsPositions.length > 0 || allOptionsDetails.length > 0) && (
          <div style={{ padding: '24px', background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#818cf8' }}>Options Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Open Options</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{allOptionsDetails.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Closed Options</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{closedOptionsPositions.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Options P&L</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: (optionsStGains + optionsLtGains) >= 0 ? '#34d399' : '#f87171' }}>
                  {(optionsStGains + optionsLtGains) >= 0 ? '+' : ''}${(optionsStGains + optionsLtGains).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 10 Tax Loss Harvest Opportunities */}
        <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Top 10 Tax Loss Harvest Opportunities</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Positions with the largest unrealized losses</p>
            </div>
            {positionsWithPrices.length === 0 && (
              <span style={{ padding: '6px 12px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '8px', fontSize: '12px' }}>
                Set prices in "Set Prices" tab to see opportunities
              </span>
            )}
          </div>
          
          {taxLossOpportunities.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Rank</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Symbol</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Units</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Cost Basis</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Current Value</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Unrealized Loss</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>% Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {taxLossOpportunities.map((pos, index) => {
                    const pctLoss = ((pos.unrealizedPnL / pos.totalCost) * 100);
                    return (
                      <tr key={pos.symbol} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>#{index + 1}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '600' }}>
                          {pos.symbol}
                          {pos.washSaleAdjustment > 0 && (
                            <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '4px', fontSize: '10px' }}>
                              WS
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{pos.totalUnits.toFixed(4)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>${pos.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>${pos.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#f87171' }}>
                          ${pos.unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#f87171' }}>
                          {pctLoss.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : positionsWithPrices.length > 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#34d399' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>No tax loss opportunities!</div>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>All your positions are currently in profit.</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              <div style={{ fontSize: '14px' }}>Set current prices for your positions to identify tax loss harvest opportunities.</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPriceManager = () => {
    const positionsNeedingPrices = allPositionDetails.filter(p => !p.hasPriceSet);
    const positionsWithPrices = allPositionDetails.filter(p => p.hasPriceSet);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Stock Splits */}
        <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Stock Splits</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Adjust historical positions for stock splits</p>
            </div>
            <button
              onClick={() => setShowSplitForm(!showSplitForm)}
              style={{
                padding: '8px 16px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {showSplitForm ? 'Cancel' : '+ Add Manually'}
            </button>
          </div>

          {showSplitForm && (
            <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(51, 65, 85, 0.3)', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px' }}>Add split manually:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g., AAPL"
                    value={splitSymbol}
                    onChange={(e) => setSplitSymbol(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: '#334155', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Split Date</label>
                  <input
                    type="date"
                    value={splitDate}
                    onChange={(e) => setSplitDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: '#334155', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Ratio (e.g., 2 for 2:1)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="2"
                    value={splitRatio}
                    onChange={(e) => setSplitRatio(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: '#334155', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={addStockSplit}
                    style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fetch All Splits Table */}
          {allPositionDetails.filter(p => !isOptionSymbol(p.symbol)).length > 0 && (
            <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#10b981' }}>Fetch Splits for Open Positions</span>
                  <span style={{ marginLeft: '12px', fontSize: '14px', color: '#94a3b8' }}>
                    {stockSplits.length > 0 ? `${[...new Set(stockSplits.map(s => s.symbol))].length} symbols have splits` : 'No splits fetched yet'}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    const symbols = allPositionDetails
                      .filter(p => !isOptionSymbol(p.symbol))
                      .map(p => p.symbol);
                    setFetchingSplits(true);
                    for (const symbol of symbols) {
                      await fetchStockSplits(symbol, false);
                      await new Promise(resolve => setTimeout(resolve, 300));
                    }
                    setFetchingSplits(false);
                  }}
                  disabled={fetchingSplits}
                  style={{
                    padding: '8px 16px',
                    background: fetchingSplits ? '#475569' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: fetchingSplits ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {fetchingSplits && <RefreshCw style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />}
                  {fetchingSplits ? 'Fetching...' : 'Fetch All Splits'}
                </button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontWeight: '500', fontSize: '13px' }}>Symbol</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', color: '#94a3b8', fontWeight: '500', fontSize: '13px' }}>Units</th>
                      <th style={{ textAlign: 'center', padding: '8px 12px', color: '#94a3b8', fontWeight: '500', fontSize: '13px' }}>Splits Found</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', color: '#94a3b8', fontWeight: '500', fontSize: '13px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPositionDetails
                      .filter(p => !isOptionSymbol(p.symbol))
                      .map(pos => {
                        const symbolSplits = stockSplits.filter(s => s.symbol === pos.symbol);
                        const hasSplits = symbolSplits.length > 0;
                        return (
                          <tr key={pos.symbol} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                            <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: '600' }}>{pos.symbol}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '14px', color: '#94a3b8' }}>{pos.totalUnits.toFixed(4)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              {hasSplits ? (
                                <span style={{ 
                                  padding: '4px 10px', 
                                  background: 'rgba(16, 185, 129, 0.2)', 
                                  color: '#34d399', 
                                  borderRadius: '12px', 
                                  fontSize: '12px',
                                  fontWeight: '500'
                                }}>
                                  {symbolSplits.length} split{symbolSplits.length > 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span style={{ 
                                  padding: '4px 10px', 
                                  background: 'rgba(100, 116, 139, 0.2)', 
                                  color: '#94a3b8', 
                                  borderRadius: '12px', 
                                  fontSize: '12px' 
                                }}>
                                  None
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                              <button
                                onClick={() => fetchStockSplits(pos.symbol)}
                                disabled={fetchingSplits}
                                style={{
                                  padding: '4px 12px',
                                  background: 'transparent',
                                  color: '#10b981',
                                  border: '1px solid rgba(16, 185, 129, 0.5)',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: fetchingSplits ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {hasSplits ? 'Refresh' : 'Fetch'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Existing Splits List */}
          {stockSplits.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px' }}>Recorded Splits ({stockSplits.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stockSplits
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((split, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(51, 65, 85, 0.3)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '16px', minWidth: '60px' }}>{split.symbol}</span>
                      <span style={{ color: '#94a3b8', fontSize: '14px' }}>{new Date(split.date).toLocaleDateString()}</span>
                      <span style={{ 
                        padding: '4px 10px', 
                        background: 'rgba(59, 130, 246, 0.2)', 
                        color: '#60a5fa', 
                        borderRadius: '6px', 
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {split.ratio}:1
                      </span>
                    </div>
                    <button
                      onClick={() => removeSplit(index)}
                      style={{ color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px 8px' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {stockSplits.length === 0 && !showSplitForm && allPositionDetails.filter(p => !isOptionSymbol(p.symbol)).length === 0 && (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>No stock splits configured</p>
          )}
        </div>

        {/* Ticker Changes */}
        <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Ticker Changes</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Handle SPAC conversions, mergers, or ticker symbol changes (manual entry only)</p>
            </div>
            <button
              onClick={() => setShowTickerChangeForm(!showTickerChangeForm)}
              style={{
                padding: '8px 16px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {showTickerChangeForm ? 'Cancel' : '+ Add Change'}
            </button>
          </div>

          {showTickerChangeForm && (
            <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(51, 65, 85, 0.3)', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Old Ticker</label>
                  <input
                    type="text"
                    placeholder="e.g., PSTH"
                    value={oldTicker}
                    onChange={(e) => setOldTicker(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: '#334155', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>New Ticker</label>
                  <input
                    type="text"
                    placeholder="e.g., UMG"
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: '#334155', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Change Date</label>
                  <input
                    type="date"
                    value={changeDate}
                    onChange={(e) => setChangeDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: '#334155', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Share Ratio</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1"
                    value={changeRatio}
                    onChange={(e) => setChangeRatio(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: '#334155', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={addTickerChange}
                    style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Share ratio: 1 for no change, 2 if you got 2 new shares for each old share, 0.5 if you got 1 new for every 2 old
              </p>
            </div>
          )}

          {tickerChanges.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tickerChanges.map((change, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(51, 65, 85, 0.3)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '18px' }}>{change.oldSymbol} → {change.newSymbol}</span>
                    <span style={{ color: '#94a3b8' }}>Change Date: {new Date(change.date).toLocaleDateString()}</span>
                    {change.ratio !== 1 && (
                      <span style={{ color: '#94a3b8' }}>Ratio: {change.ratio}:1</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeTickerChange(index)}
                    style={{ color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : !showTickerChangeForm && (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>No ticker changes configured</p>
          )}
        </div>

        {/* Price Header with Fetch All Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Current Prices</h2>
            <p style={{ color: '#94a3b8', marginTop: '4px' }}>
              Set current market prices to calculate unrealized P&L
              {lastPriceFetch && (
                <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                  · Last fetched: {lastPriceFetch.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Prices Set</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {positionsWithPrices.length} / {allPositionDetails.length}
              </div>
            </div>
            {allPositionDetails.length > 0 && (
              <button
                onClick={fetchAllPrices}
                disabled={fetchingPrices}
                style={{
                  padding: '12px 20px',
                  background: fetchingPrices ? '#475569' : 'linear-gradient(to right, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: fetchingPrices ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw style={{ width: '16px', height: '16px', animation: fetchingPrices ? 'spin 1s linear infinite' : 'none' }} />
                {fetchingPrices ? 'Fetching...' : 'Fetch All Prices'}
              </button>
            )}
          </div>
        </div>

        {/* Price Errors */}
        {Object.keys(priceErrors).length > 0 && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
              <span style={{ fontWeight: '600', color: '#ef4444' }}>Some prices could not be fetched:</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(priceErrors).map(([symbol, error]) => (
                <span key={symbol} style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '4px', fontSize: '12px', color: '#fca5a5' }}>
                  {error}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
              These may be delisted, options, ETFs, or have non-standard symbols. You can set prices manually below.
            </p>
          </div>
        )}

        {/* Positions Needing Prices */}
        {positionsNeedingPrices.length > 0 && (
          <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Positions Needing Prices
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#94a3b8' }}>
                (or use Fetch All Prices above)
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {positionsNeedingPrices.map(pos => (
                <div key={pos.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(51, 65, 85, 0.3)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '18px' }}>
                      {pos.symbol}
                      {pos.washSaleAdjustment > 0 && (
                        <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '4px', fontSize: '10px' }}>
                          WS +${pos.washSaleAdjustment.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      {pos.totalUnits.toFixed(4)} units · ${pos.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cost basis
                    </div>
                    {priceErrors[pos.symbol] && (
                      <div style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>
                        ⚠ {priceErrors[pos.symbol]}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!isOptionSymbol(pos.symbol) && (
                      <button
                        onClick={() => fetchSinglePrice(pos.symbol)}
                        disabled={fetchingPrices}
                        style={{ padding: '8px 12px', background: '#334155', color: '#94a3b8', border: '1px solid #475569', borderRadius: '8px', fontWeight: '500', cursor: fetchingPrices ? 'not-allowed' : 'pointer', fontSize: '12px' }}
                      >
                        Fetch
                      </button>
                    )}
                    {editingPrice === pos.symbol ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateCurrentPrice(pos.symbol, e.target.value);
                            } else if (e.key === 'Escape') {
                              setEditingPrice(null);
                            }
                          }}
                          style={{ width: '128px', padding: '8px 12px', background: '#334155', border: '1px solid #3b82f6', borderRadius: '8px', textAlign: 'right', fontFamily: 'monospace', color: '#f1f5f9', outline: 'none' }}
                          id={`price-input-${pos.symbol}`}
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`price-input-${pos.symbol}`);
                            updateCurrentPrice(pos.symbol, input.value);
                          }}
                          style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setEditingPrice(null)}
                          style={{ padding: '8px 12px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingPrice(pos.symbol)}
                        style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                      >
                        Set Price
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positions with Prices */}
        {positionsWithPrices.length > 0 && (
          <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Positions with Prices</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Symbol</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Units</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Cost Basis</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Current Price</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Current Value</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Unrealized P&L</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {positionsWithPrices.map(pos => (
                    <tr key={pos.symbol} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '600' }}>
                        {pos.symbol}
                        {pos.washSaleAdjustment > 0 && (
                          <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '4px', fontSize: '10px' }}>
                            WS
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>{pos.totalUnits.toFixed(4)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>${pos.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {editingPrice === pos.symbol ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <span style={{ color: '#94a3b8' }}>$</span>
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={pos.currentPrice}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateCurrentPrice(pos.symbol, e.target.value);
                                } else if (e.key === 'Escape') {
                                  setEditingPrice(null);
                                }
                              }}
                              style={{ width: '96px', padding: '4px 8px', background: '#334155', border: '1px solid #3b82f6', borderRadius: '4px', textAlign: 'right', fontFamily: 'monospace', color: '#f1f5f9', outline: 'none' }}
                              id={`price-edit-${pos.symbol}`}
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(`price-edit-${pos.symbol}`);
                                updateCurrentPrice(pos.symbol, input.value);
                              }}
                              style={{ padding: '4px 8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontFamily: 'monospace' }}>${pos.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>${pos.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: pos.unrealizedPnL >= 0 ? '#34d399' : '#f87171' }}>
                        {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => setEditingPrice(pos.symbol)}
                          style={{ color: '#60a5fa', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Open Options Positions */}
        {allOptionsDetails.length > 0 && (
          <div style={{ padding: '24px', background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#818cf8' }}>Open Options Positions</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
              Options prices must be set manually (API doesn't support options)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {allOptionsDetails.map(opt => (
                <div key={opt.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(51, 65, 85, 0.3)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{opt.displayName}</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      {opt.totalContracts} contract{opt.totalContracts > 1 ? 's' : ''} · 
                      {opt.isShort ? ` Premium: $${opt.totalPremium.toFixed(2)}` : ` Cost: $${opt.totalCost.toFixed(2)}`}
                    </div>
                  </div>
                  <span style={{ padding: '4px 8px', background: opt.isShort ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: opt.isShort ? '#f87171' : '#34d399', borderRadius: '4px', fontSize: '12px' }}>
                    {opt.isShort ? 'SHORT' : 'LONG'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTaxLots = () => {
    const openPositions = Object.entries(positions)
      .filter(([symbol, data]) => data.totalUnits > 0.0001)
      .map(([symbol, data]) => ({ symbol, ...data }));

    const allLots = openPositions.flatMap(p => p.lots);
    
    const groupedLTLots = {};
    const individualSTLots = [];
    
    allLots.forEach(lot => {
      if (lot.taxStatus === 'LT') {
        if (!groupedLTLots[lot.symbol]) {
          groupedLTLots[lot.symbol] = {
            symbol: lot.symbol,
            units: 0,
            costBasis: 0,
            taxStatus: 'LT',
            lotCount: 0,
            oldestDate: lot.purchaseDate,
            isGrouped: true,
            washSaleAdjustment: 0,
            daysToLT: 0
          };
        }
        groupedLTLots[lot.symbol].units += lot.units;
        groupedLTLots[lot.symbol].costBasis += lot.costBasis;
        groupedLTLots[lot.symbol].lotCount += 1;
        groupedLTLots[lot.symbol].washSaleAdjustment += (lot.washSaleAdjustment || 0);
        if (lot.purchaseDate < groupedLTLots[lot.symbol].oldestDate) {
          groupedLTLots[lot.symbol].oldestDate = lot.purchaseDate;
        }
      } else {
        individualSTLots.push(lot);
      }
    });

    const ltGroupedArray = Object.values(groupedLTLots);
    
    // Calculate unrealized P&L and other derived values for each lot
    const enrichLot = (lot) => {
      const currentPrice = currentPrices[lot.symbol] || 0;
      const currentValue = lot.units * currentPrice;
      const unrealizedPnL = currentPrice > 0 ? currentValue - lot.costBasis : null;
      const daysHeld = lot.isGrouped 
        ? Math.floor((currentDate - lot.oldestDate) / (1000 * 60 * 60 * 24))
        : lot.daysHeld;
      return {
        ...lot,
        currentPrice,
        currentValue,
        unrealizedPnL,
        daysHeld,
        avgCost: lot.costBasis / lot.units,
        displayDate: lot.isGrouped ? lot.oldestDate : lot.purchaseDate
      };
    };
    
    const filteredLots = filterType === 'all' 
      ? [...individualSTLots, ...ltGroupedArray]
      : filterType === 'st' 
        ? individualSTLots 
        : ltGroupedArray;

    const enrichedLots = filteredLots.map(enrichLot);

    // Sort lots based on lotsSortConfig
    const sortedLots = [...enrichedLots].sort((a, b) => {
      const { key, direction } = lotsSortConfig;
      let aVal, bVal;
      
      switch (key) {
        case 'symbol':
          aVal = a.symbol;
          bVal = b.symbol;
          return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'units':
          aVal = a.units;
          bVal = b.units;
          break;
        case 'costBasis':
          aVal = a.costBasis;
          bVal = b.costBasis;
          break;
        case 'avgCost':
          aVal = a.avgCost;
          bVal = b.avgCost;
          break;
        case 'currentPrice':
          aVal = a.currentPrice || 0;
          bVal = b.currentPrice || 0;
          break;
        case 'unrealizedPnL':
          aVal = a.unrealizedPnL ?? -Infinity;
          bVal = b.unrealizedPnL ?? -Infinity;
          break;
        case 'purchaseDate':
          aVal = a.displayDate?.getTime() || 0;
          bVal = b.displayDate?.getTime() || 0;
          break;
        case 'daysHeld':
          aVal = a.daysHeld || 0;
          bVal = b.daysHeld || 0;
          break;
        case 'daysToLT':
          aVal = a.daysToLT ?? 0;
          bVal = b.daysToLT ?? 0;
          break;
        case 'taxStatus':
          aVal = a.taxStatus;
          bVal = b.taxStatus;
          return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        default:
          return 0;
      }
      
      if (direction === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });

    const handleLotsSort = (key) => {
      setLotsSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Open Tax Lots</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setFilterType('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                background: filterType === 'all' ? '#2563eb' : 'rgba(51, 65, 85, 0.5)',
                color: filterType === 'all' ? 'white' : '#94a3b8'
              }}
            >
              All ({allLots.length})
            </button>
            <button 
              onClick={() => setFilterType('st')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                background: filterType === 'st' ? '#fb923c' : 'rgba(51, 65, 85, 0.5)',
                color: filterType === 'st' ? 'white' : '#94a3b8'
              }}
            >
              Short-Term ({individualSTLots.length})
            </button>
            <button 
              onClick={() => setFilterType('lt')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                background: filterType === 'lt' ? '#3b82f6' : 'rgba(51, 65, 85, 0.5)',
                color: filterType === 'lt' ? 'white' : '#94a3b8'
              }}
            >
              Long-Term ({ltGroupedArray.length})
            </button>
          </div>
        </div>

        <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <th 
                    onClick={() => handleLotsSort('symbol')}
                    style={{ textAlign: 'left', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Symbol {lotsSortConfig.key === 'symbol' && <span style={{ color: '#60a5fa' }}>{lotsSortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th 
                    onClick={() => handleLotsSort('units')}
                    style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Units {lotsSortConfig.key === 'units' && <span style={{ color: '#60a5fa' }}>{lotsSortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th 
                    onClick={() => handleLotsSort('costBasis')}
                    style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Cost Basis {lotsSortConfig.key === 'costBasis' && <span style={{ color: '#60a5fa' }}>{lotsSortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th 
                    onClick={() => handleLotsSort('avgCost')}
                    style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Avg Cost {lotsSortConfig.key === 'avgCost' && <span style={{ color: '#60a5fa' }}>{lotsSortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th 
                    onClick={() => handleLotsSort('currentPrice')}
                    style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Current {lotsSortConfig.key === 'currentPrice' && <span style={{ color: '#60a5fa' }}>{lotsSortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th 
                    onClick={() => handleLotsSort('unrealizedPnL')}
                    style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Unrealized P&L {lotsSortConfig.key === 'unrealizedPnL' && <span style={{ color: '#60a5fa' }}>{lotsSortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th 
                    onClick={() => handleLotsSort('purchaseDate')}
                    style={{ textAlign: 'left', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Purchase Date {lotsSortConfig.key === 'purchaseDate' && <span style={{ color: '#60a5fa' }}>{lotsSortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th 
                    onClick={() => handleLotsSort('daysHeld')}
                    style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Days Held {lotsSortConfig.key === 'daysHeld' && <span style={{ color: '#60a5fa' }}>{lotsSortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th 
                    onClick={() => handleLotsSort('daysToLT')}
                    style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Days to LT {lotsSortConfig.key === 'daysToLT' && <span style={{ color: '#60a5fa' }}>{lotsSortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th 
                    onClick={() => handleLotsSort('taxStatus')}
                    style={{ textAlign: 'center', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Status {lotsSortConfig.key === 'taxStatus' && <span style={{ color: '#60a5fa' }}>{lotsSortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedLots.map((lot, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #1e293b', height: '52px' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '600', verticalAlign: 'middle' }}>
                      {lot.symbol}
                      {lot.isGrouped && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b' }}>
                          ({lot.lotCount} lots)
                        </span>
                      )}
                      {lot.washSaleAdjustment > 0 && (
                        <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '4px', fontSize: '10px' }}>
                          WS
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                      {lot.units.toFixed(4)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                      ${lot.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                      ${lot.avgCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'middle', color: lot.currentPrice > 0 ? '#f1f5f9' : '#64748b' }}>
                      {lot.currentPrice > 0 ? `$${lot.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td style={{ 
                      padding: '12px 16px', 
                      textAlign: 'right', 
                      verticalAlign: 'middle',
                      fontWeight: lot.unrealizedPnL !== null ? '600' : '400',
                      color: lot.unrealizedPnL === null ? '#64748b' : lot.unrealizedPnL >= 0 ? '#34d399' : '#f87171'
                    }}>
                      {lot.unrealizedPnL !== null 
                        ? `${lot.unrealizedPnL >= 0 ? '+' : ''}$${lot.unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '—'
                      }
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      {lot.isGrouped 
                        ? <span>{lot.oldestDate.toLocaleDateString()} <span style={{ color: '#64748b', fontSize: '12px' }}>(oldest)</span></span>
                        : lot.purchaseDate.toLocaleDateString()
                      }
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                      {lot.isGrouped ? `${lot.daysHeld}+` : lot.daysHeld}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'middle', color: lot.taxStatus === 'LT' ? '#64748b' : '#fb923c' }}>
                      {lot.taxStatus === 'LT' ? '—' : lot.daysToLT}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: lot.taxStatus === 'LT' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(251, 146, 60, 0.2)',
                        color: lot.taxStatus === 'LT' ? '#3b82f6' : '#fb923c'
                      }}>
                        {lot.taxStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {sortedLots.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No {filterType === 'st' ? 'short-term' : filterType === 'lt' ? 'long-term' : ''} tax lots found
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPositionDetail = () => {
    const openPositions = Object.entries(positions)
      .filter(([symbol, data]) => data.totalUnits > 0.0001)
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    if (selectedSymbol) {
      const position = openPositions.find(p => p.symbol === selectedSymbol);
      if (!position) return null;

      const currentPrice = currentPrices[selectedSymbol] || 0;
      const totalCost = position.lots.reduce((sum, lot) => sum + lot.costBasis, 0);
      const totalValue = position.totalUnits * currentPrice;
      const unrealizedPnL = totalValue - totalCost;
      const totalWashSaleAdj = position.lots.reduce((sum, lot) => sum + (lot.washSaleAdjustment || 0), 0);

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSelectedSymbol(null)}
              style={{ padding: '8px 16px', background: 'rgba(51, 65, 85, 0.5)', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              ← Back
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedSymbol} Position Detail</h2>
            {totalWashSaleAdj > 0 && (
              <span style={{ padding: '4px 12px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '8px', fontSize: '12px' }}>
                Wash Sale Adjustment: +${totalWashSaleAdj.toFixed(2)}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Total Units</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>{position.totalUnits.toFixed(4)}</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Cost Basis</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Current Value</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px', color: currentPrice ? 'inherit' : '#64748b' }}>
                {currentPrice ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Set price'}
              </div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Unrealized P&L</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px', color: currentPrice ? (unrealizedPnL >= 0 ? '#34d399' : '#f87171') : '#64748b' }}>
                {currentPrice ? `${unrealizedPnL >= 0 ? '+' : ''}$${unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              </div>
            </div>
          </div>

          <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Tax Lots (FIFO Order)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Purchase Date</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Units</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Cost Basis</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Unit Cost</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Days Held</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Status</th>
                    {currentPrice > 0 && (
                      <th style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Unrealized P&L</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {position.lots.map((lot, index) => {
                    const lotValue = lot.units * currentPrice;
                    const lotPnL = lotValue - lot.costBasis;
                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '12px 16px' }}>
                          {lot.purchaseDate.toLocaleDateString()}
                          {lot.fromExercise && <span style={{ marginLeft: '8px', color: '#818cf8', fontSize: '11px' }}>(exercised)</span>}
                          {lot.fromAssignment && <span style={{ marginLeft: '8px', color: '#818cf8', fontSize: '11px' }}>(assigned)</span>}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{lot.units.toFixed(4)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          ${lot.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {lot.washSaleAdjustment > 0 && (
                            <div style={{ fontSize: '11px', color: '#fb923c' }}>
                              (incl. WS +${lot.washSaleAdjustment.toFixed(2)})
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>${(lot.costBasis / lot.units).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{lot.daysHeld}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: lot.taxStatus === 'LT' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(251, 146, 60, 0.2)',
                            color: lot.taxStatus === 'LT' ? '#3b82f6' : '#fb923c'
                          }}>
                            {lot.taxStatus}
                          </span>
                          {lot.daysToLT > 0 && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                              {lot.daysToLT}d to LT
                            </div>
                          )}
                        </td>
                        {currentPrice > 0 && (
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: lotPnL >= 0 ? '#34d399' : '#f87171' }}>
                            {lotPnL >= 0 ? '+' : ''}${lotPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Position Detail</h2>
          <p style={{ color: '#94a3b8', marginTop: '4px' }}>Click a position to view tax lot details</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {openPositions.map(position => {
            const currentPrice = currentPrices[position.symbol] || 0;
            const totalCost = position.lots.reduce((sum, lot) => sum + lot.costBasis, 0);
            const totalValue = position.totalUnits * currentPrice;
            const unrealizedPnL = totalValue - totalCost;
            const stLots = position.lots.filter(l => l.taxStatus === 'ST').length;
            const ltLots = position.lots.filter(l => l.taxStatus === 'LT').length;
            const hasWashSale = position.lots.some(l => l.washSaleAdjustment > 0);

            return (
              <div 
                key={position.symbol}
                onClick={() => setSelectedSymbol(position.symbol)}
                style={{ 
                  padding: '20px', 
                  background: 'rgba(30, 41, 59, 0.5)', 
                  border: '1px solid rgba(51, 65, 85, 0.6)', 
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '20px' }}>
                    {position.symbol}
                    {hasWashSale && (
                      <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '4px', fontSize: '10px' }}>
                        WS
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {stLots > 0 && (
                      <span style={{ padding: '2px 8px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                        {stLots} ST
                      </span>
                    )}
                    {ltLots > 0 && (
                      <span style={{ padding: '2px 8px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                        {ltLots} LT
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                  {position.totalUnits.toFixed(4)} units · ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cost
                </div>
                {currentPrice > 0 && (
                  <div style={{ fontSize: '18px', fontWeight: '600', color: unrealizedPnL >= 0 ? '#34d399' : '#f87171' }}>
                    {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTaxSummary = () => {
    // Filter closed positions by selected year (or all)
    const yearStockPositions = selectedYear === 'all' 
      ? closedPositions 
      : closedPositions.filter(p => p.saleDate.getFullYear() === selectedYear);
    
    const yearOptionsPositions = selectedYear === 'all'
      ? closedOptionsPositions
      : closedOptionsPositions.filter(p => p.saleDate.getFullYear() === selectedYear);

    const yearPositions = [...yearStockPositions, ...yearOptionsPositions];
    
    const yearStGains = yearPositions
      .filter(p => p.taxStatus === 'ST' && (p.washSale ? p.washSale.adjustedPnL : p.pnl) > 0)
      .reduce((sum, p) => sum + (p.washSale ? p.washSale.adjustedPnL : p.pnl), 0);
    
    const yearStLosses = yearPositions
      .filter(p => p.taxStatus === 'ST' && (p.washSale ? p.washSale.adjustedPnL : p.pnl) < 0)
      .reduce((sum, p) => sum + (p.washSale ? p.washSale.adjustedPnL : p.pnl), 0);
    
    const yearLtGains = yearPositions
      .filter(p => p.taxStatus === 'LT' && (p.washSale ? p.washSale.adjustedPnL : p.pnl) > 0)
      .reduce((sum, p) => sum + (p.washSale ? p.washSale.adjustedPnL : p.pnl), 0);
    
    const yearLtLosses = yearPositions
      .filter(p => p.taxStatus === 'LT' && (p.washSale ? p.washSale.adjustedPnL : p.pnl) < 0)
      .reduce((sum, p) => sum + (p.washSale ? p.washSale.adjustedPnL : p.pnl), 0);

    const netStGains = yearStGains + yearStLosses;
    const netLtGains = yearLtGains + yearLtLosses;
    const totalNetGains = netStGains + netLtGains;

    // Wash sales for selected year
    const yearWashSales = selectedYear === 'all'
      ? washSales
      : washSales.filter(ws => ws.saleDate.getFullYear() === selectedYear);
    
    const yearDisallowedLoss = yearWashSales.reduce((sum, ws) => sum + ws.disallowedLoss, 0);

    // Group by ticker for the breakdown table
    const tickerGroups = {};
    yearPositions.forEach(p => {
      const displaySymbol = isOptionSymbol(p.symbol) ? formatOptionDisplay(p.symbol) : p.symbol;
      if (!tickerGroups[displaySymbol]) {
        tickerGroups[displaySymbol] = { stGains: 0, stLosses: 0, ltGains: 0, ltLosses: 0, totalPnL: 0, hasWashSale: false, isOption: isOptionSymbol(p.symbol) };
      }
      const pnl = p.washSale ? p.washSale.adjustedPnL : p.pnl;
      tickerGroups[displaySymbol].totalPnL += pnl;
      if (p.washSale) tickerGroups[displaySymbol].hasWashSale = true;
      if (p.taxStatus === 'ST') {
        if (pnl >= 0) tickerGroups[displaySymbol].stGains += pnl;
        else tickerGroups[displaySymbol].stLosses += pnl;
      } else {
        if (pnl >= 0) tickerGroups[displaySymbol].ltGains += pnl;
        else tickerGroups[displaySymbol].ltLosses += pnl;
      }
    });

    let groupedArray = Object.entries(tickerGroups).map(([symbol, data]) => ({ symbol, ...data }));
    const tickerCount = groupedArray.length;
    
    if (sortConfig.key) {
      groupedArray.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (sortConfig.direction === 'asc') {
          return aVal - bVal;
        }
        return bVal - aVal;
      });
    } else {
      groupedArray.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    const displayLabel = selectedYear === 'all' ? 'All Time' : selectedYear;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Tax Summary</h2>
            <p style={{ color: '#94a3b8', marginTop: '4px' }}>Realized gains and losses by tax year</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSelectedYear('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                background: selectedYear === 'all' ? 'linear-gradient(to right, #8b5cf6, #a78bfa)' : 'rgba(51, 65, 85, 0.5)',
                color: selectedYear === 'all' ? 'white' : '#94a3b8'
              }}
            >
              All Time
            </button>
            {allYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  background: selectedYear === year ? '#2563eb' : 'rgba(51, 65, 85, 0.5)',
                  color: selectedYear === year ? 'white' : '#94a3b8'
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Wash Sale Summary for selected period */}
        {yearWashSales.length > 0 && (
          <div style={{ padding: '16px', background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.3)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle style={{ width: '16px', height: '16px', color: '#fb923c' }} />
              <span style={{ fontWeight: '600', color: '#fb923c' }}>Wash Sales ({displayLabel})</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              {yearWashSales.length} wash sale{yearWashSales.length > 1 ? 's' : ''} · 
              Disallowed loss: <span style={{ color: '#f87171', fontWeight: '600' }}>${yearDisallowedLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ padding: '2px 8px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>ST</span>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Gains</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399' }}>
              +${yearStGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ padding: '2px 8px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>ST</span>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Losses</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f87171' }}>
              ${yearStLosses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ padding: '2px 8px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>LT</span>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Gains</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399' }}>
              +${yearLtGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ padding: '2px 8px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>LT</span>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Losses</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f87171' }}>
              ${yearLtLosses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Net Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ padding: '20px', background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.3)', borderRadius: '12px' }}>
            <div style={{ fontSize: '14px', color: '#fb923c', marginBottom: '8px' }}>Net Short-Term</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: netStGains >= 0 ? '#34d399' : '#f87171' }}>
              {netStGains >= 0 ? '+' : ''}${netStGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }}>
            <div style={{ fontSize: '14px', color: '#3b82f6', marginBottom: '8px' }}>Net Long-Term</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: netLtGains >= 0 ? '#34d399' : '#f87171' }}>
              {netLtGains >= 0 ? '+' : ''}${netLtGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px' }}>
            <div style={{ fontSize: '14px', color: '#a78bfa', marginBottom: '8px' }}>Total Net {displayLabel}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: totalNetGains >= 0 ? '#34d399' : '#f87171' }}>
              {totalNetGains >= 0 ? '+' : ''}${totalNetGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Breakdown by Ticker */}
        {groupedArray.length > 0 && (
          <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Breakdown by Ticker</h3>
              <span style={{ padding: '6px 12px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', fontSize: '14px' }}>
                <span style={{ color: '#60a5fa', fontWeight: '600' }}>{tickerCount}</span>
                <span style={{ color: '#94a3b8', marginLeft: '4px' }}>{tickerCount === 1 ? 'ticker' : 'tickers'} traded</span>
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#94a3b8', fontWeight: '500' }}>Symbol</th>
                    <th 
                      onClick={() => handleSort('totalPnL')}
                      style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                    >
                      Total P&L {sortConfig.key === 'totalPnL' && <span style={{ color: '#60a5fa' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th 
                      onClick={() => handleSort('stGains')}
                      style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                    >
                      ST Gains {sortConfig.key === 'stGains' && <span style={{ color: '#60a5fa' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th 
                      onClick={() => handleSort('stLosses')}
                      style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                    >
                      ST Losses {sortConfig.key === 'stLosses' && <span style={{ color: '#60a5fa' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th 
                      onClick={() => handleSort('ltGains')}
                      style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                    >
                      LT Gains {sortConfig.key === 'ltGains' && <span style={{ color: '#60a5fa' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th 
                      onClick={() => handleSort('ltLosses')}
                      style={{ textAlign: 'right', padding: '12px 16px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
                    >
                      LT Losses {sortConfig.key === 'ltLosses' && <span style={{ color: '#60a5fa' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedArray.map((ticker) => (
                    <tr key={ticker.symbol} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '600' }}>
                        {ticker.symbol}
                        {ticker.isOption && (
                          <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(129, 140, 248, 0.2)', color: '#818cf8', borderRadius: '4px', fontSize: '10px' }}>
                            OPT
                          </span>
                        )}
                        {ticker.hasWashSale && (
                          <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', borderRadius: '4px', fontSize: '10px' }}>
                            WS
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: ticker.totalPnL >= 0 ? '#34d399' : '#f87171' }}>
                        {ticker.totalPnL >= 0 ? '+' : ''}${ticker.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {ticker.stGains > 0 ? <span style={{ color: '#34d399' }}>${ticker.stGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : <span style={{ color: '#475569' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {ticker.stLosses < 0 ? <span style={{ color: '#f87171' }}>${ticker.stLosses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : <span style={{ color: '#475569' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {ticker.ltGains > 0 ? <span style={{ color: '#34d399' }}>${ticker.ltGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : <span style={{ color: '#475569' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {ticker.ltLosses < 0 ? <span style={{ color: '#f87171' }}>${ticker.ltLosses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : <span style={{ color: '#475569' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b)', color: '#f1f5f9', padding: '40px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      {showImportHelper && <ImportHelper onClose={() => setShowImportHelper(false)} />}
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', background: 'linear-gradient(to right, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tax Loss Harvester
          </h1>
          {transactions.length > 0 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowImportHelper(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: '500', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', border: '1px solid rgba(59, 130, 246, 0.3)' }}
              >
                <HelpCircle style={{ width: '16px', height: '16px' }} />
                Import Help
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(to right, #2563eb, #3b82f6)', color: 'white', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <Upload style={{ width: '16px', height: '16px' }} />
                Add More Files
                <input type="file" accept=".csv" multiple onChange={handleAddMoreFiles} style={{ display: 'none' }} />
              </label>
              <button
                onClick={handleReset}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                Reset
              </button>
            </div>
          )}
        </div>
        <p style={{ color: '#94a3b8', marginBottom: '32px' }}>FIFO tracking · Options · Wash sales · Capital gains analysis</p>

        {transactions.length === 0 ? (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(30, 41, 59, 0.5)', border: '2px dashed rgba(59, 130, 246, 0.5)', borderRadius: '16px', marginBottom: '16px' }}>
              <Upload style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#60a5fa' }} />
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Upload Transaction History</h2>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Upload CSV files in the required format (see Import Help)</p>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(to right, #2563eb, #3b82f6)', color: 'white', fontWeight: '600', borderRadius: '8px', cursor: 'pointer' }}>
                <Upload style={{ width: '20px', height: '20px' }} />
                Select CSV Files
                <input type="file" accept=".csv" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
            <button
              onClick={() => setShowImportHelper(true)}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: '#a78bfa'
              }}
            >
              <HelpCircle style={{ width: '20px', height: '20px' }} />
              <span style={{ fontWeight: '600' }}>Need help converting your brokerage data?</span>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>Get an AI prompt to convert any format</span>
            </button>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'rgba(15, 23, 42, 0.5)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <button 
                onClick={() => setActiveView('overview')}
                style={{ 
                  padding: '12px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontWeight: '500', 
                  borderRadius: '10px', 
                  border: 'none', 
                  cursor: 'pointer',
                  background: activeView === 'overview' ? 'linear-gradient(to right, #2563eb, #3b82f6)' : 'transparent',
                  color: activeView === 'overview' ? 'white' : '#cbd5e1'
                }}
              >
                <TrendingUp style={{ width: '16px', height: '16px' }} />
                Overview
              </button>
              <button 
                onClick={() => setActiveView('prices')}
                style={{ 
                  padding: '12px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontWeight: '500', 
                  borderRadius: '10px', 
                  border: 'none', 
                  cursor: 'pointer',
                  background: activeView === 'prices' ? 'linear-gradient(to right, #2563eb, #3b82f6)' : 'transparent',
                  color: activeView === 'prices' ? 'white' : '#cbd5e1'
                }}
              >
                <DollarSign style={{ width: '16px', height: '16px' }} />
                Set Prices
              </button>
              <button 
                onClick={() => setActiveView('detail')}
                style={{ 
                  padding: '12px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontWeight: '500', 
                  borderRadius: '10px', 
                  border: 'none', 
                  cursor: 'pointer',
                  background: activeView === 'detail' ? 'linear-gradient(to right, #2563eb, #3b82f6)' : 'transparent',
                  color: activeView === 'detail' ? 'white' : '#cbd5e1'
                }}
              >
                <TrendingUp style={{ width: '16px', height: '16px' }} />
                Position Detail
              </button>
              <button 
                onClick={() => setActiveView('lots')}
                style={{ 
                  padding: '12px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontWeight: '500', 
                  borderRadius: '10px', 
                  border: 'none', 
                  cursor: 'pointer',
                  background: activeView === 'lots' ? 'linear-gradient(to right, #2563eb, #3b82f6)' : 'transparent',
                  color: activeView === 'lots' ? 'white' : '#cbd5e1'
                }}
              >
                <TrendingDown style={{ width: '16px', height: '16px' }} />
                Tax Lots
              </button>
              <button 
                onClick={() => setActiveView('tax')}
                style={{ 
                  padding: '12px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontWeight: '500', 
                  borderRadius: '10px', 
                  border: 'none', 
                  cursor: 'pointer',
                  background: activeView === 'tax' ? 'linear-gradient(to right, #2563eb, #3b82f6)' : 'transparent',
                  color: activeView === 'tax' ? 'white' : '#cbd5e1'
                }}
              >
                <DollarSign style={{ width: '16px', height: '16px' }} />
                Tax Summary
              </button>
            </div>

            {/* Content */}
            {activeView === 'overview' && renderOverview()}
            {activeView === 'prices' && renderPriceManager()}
            {activeView === 'detail' && renderPositionDetail()}
            {activeView === 'lots' && renderTaxLots()}
            {activeView === 'tax' && renderTaxSummary()}
        </>
      )}
      
      {/* Buy Me a Coffee Footer */}
      <div style={{ 
        marginTop: '48px', 
        paddingTop: '24px', 
        borderTop: '1px solid rgba(51, 65, 85, 0.6)',
        textAlign: 'center'
      }}>
        <a 
          href="https://buymeacoffee.com/emoauro" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(to right, #FFDD00, #FBB034)',
            color: '#000000',
            fontWeight: '600',
            borderRadius: '12px',
            textDecoration: 'none',
            fontSize: '15px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 12px rgba(251, 176, 52, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(251, 176, 52, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 176, 52, 0.3)';
          }}
        >
          <span style={{ fontSize: '20px' }}>☕</span>
          Buy me a coffee
        </a>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '12px' }}>
          If this tool saved you time, consider supporting its development!
        </p>
      </div>
    </div>
  </div>
);
};

export default TaxLossHarvester;
