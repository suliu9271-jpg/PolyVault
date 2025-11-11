/**
 * Asset distribution chart component
 */
import React, { useMemo } from 'react';
import { formatTokenBalance } from '../utils/formatters';
import './AssetDistribution.css';

const AssetDistribution = ({ tokens = [] }) => {
  const chartData = useMemo(() => {
    if (tokens.length === 0) return [];
    
    // Calculate value percentage for each token
    const totalValue = tokens.reduce((sum, token) => {
      const balance = parseFloat(formatTokenBalance(token.balance, token.decimals, 18));
      const value = balance * (token.price || 0);
      return sum + value;
    }, 0);
    
    if (totalValue === 0) return [];
    
    return tokens
      .map(token => {
        const balance = parseFloat(formatTokenBalance(token.balance, token.decimals, 18));
        const value = balance * (token.price || 0);
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        
        return {
          symbol: token.symbol,
          name: token.name,
          value,
          percentage,
          balance
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Only show top 10
  }, [tokens]);

  if (chartData.length === 0) {
    return null;
  }

  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#30cfd0', '#330867'
  ];

  return (
    <div className="asset-distribution-section">
      <h2>Asset Distribution</h2>
      <div className="distribution-chart">
        <div className="chart-bars">
          {chartData.map((item, index) => {
            const color = colors[index % colors.length];
            return (
              <div key={index} className="chart-bar-item">
                <div className="bar-info">
                  <div className="bar-label">
                    <span className="bar-color" style={{ backgroundColor: color }}></span>
                    <span className="bar-symbol">{item.symbol}</span>
                    <span className="bar-percentage">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="bar-value">${item.value.toFixed(2)}</div>
                </div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="chart-legend">
          {chartData.slice(0, 6).map((item, index) => (
            <div key={index} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></span>
              <span className="legend-text">
                {item.symbol}: {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetDistribution;

