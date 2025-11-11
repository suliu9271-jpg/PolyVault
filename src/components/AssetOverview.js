/**
 * Asset overview component - Displays total value statistics
 */
import React, { useState, useEffect } from 'react';
import { formatPrice, formatTokenBalance } from '../utils/formatters';
import { getTokenPriceBySymbol, getMultipleTokenPrices } from '../services/priceService';
import './AssetOverview.css';

const AssetOverview = ({ tokens = [] }) => {
  const [totalValue, setTotalValue] = useState(0);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokens.length === 0) {
      setTotalValue(0);
      return;
    }

    const fetchPrices = async () => {
      setLoading(true);
      try {
        // Get all token symbols
        const symbols = tokens.map(t => t.symbol).filter(Boolean);
        
        // Batch fetch prices
        const tokenPrices = await getMultipleTokenPrices(symbols);
        setPrices(tokenPrices);
        
        // Calculate total value
        let total = 0;
        tokens.forEach(token => {
          const balance = formatTokenBalance(token.balance, token.decimals, 18);
          const balanceNum = parseFloat(balance) || 0;
          const price = tokenPrices[token.symbol] || 0;
          total += balanceNum * price;
        });
        
        setTotalValue(total);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [tokens]);

  if (tokens.length === 0) {
    return null;
  }

  return (
    <div className="asset-overview">
      <div className="overview-card total-value">
        <div className="overview-label">Total Asset Value</div>
        <div className="overview-value">
          {loading ? (
            <span className="loading-dots">Calculating...</span>
          ) : (
            formatPrice(totalValue)
          )}
        </div>
        <div className="overview-subtitle">USD</div>
      </div>
      
      <div className="overview-card token-count">
        <div className="overview-label">Token Types</div>
        <div className="overview-value">{tokens.length}</div>
        <div className="overview-subtitle">Tokens</div>
      </div>
      
      <div className="overview-card top-token">
        <div className="overview-label">Primary Asset</div>
        <div className="overview-value">
          {tokens.length > 0 ? tokens[0].symbol : '-'}
        </div>
        <div className="overview-subtitle">
          {tokens.length > 0 && prices[tokens[0].symbol] 
            ? formatPrice(prices[tokens[0].symbol])
            : 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default AssetOverview;

