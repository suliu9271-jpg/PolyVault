/**
 * Yield statistics component
 */
import React, { useState, useEffect } from 'react';
import { formatPrice } from '../utils/formatters';
import './YieldStats.css';

const YieldStats = ({ tokens = [], defiPositions = [] }) => {
  const [yieldData, setYieldData] = useState({
    totalYield: 0,
    estimatedAPY: 0,
    yieldSources: []
  });

  useEffect(() => {
    // Calculate yield data
    const calculateYield = () => {
      let totalYield = 0;
      const sources = [];
      
      // Calculate yield from DeFi positions
      defiPositions.forEach(position => {
        if (position.protocol === 'Aave') {
          // Aave yield rate (simplified calculation)
          const estimatedYield = (position.totalCollateral - position.totalDebt) * 0.05; // Assume 5% APY
          totalYield += estimatedYield;
          sources.push({
            protocol: position.name,
            yield: estimatedYield,
            apy: 5.2,
            type: 'Lending'
          });
        }
        
        if (position.protocol === 'QuickSwap') {
          // QuickSwap liquidity mining yield (simplified)
          const estimatedYield = (position.value || 0) * 0.15; // Assume 15% APY
          totalYield += estimatedYield;
          sources.push({
            protocol: position.name,
            yield: estimatedYield,
            apy: 15.5,
            type: 'Liquidity'
          });
        }
      });
      
      // Calculate average APY
      const avgAPY = sources.length > 0
        ? sources.reduce((sum, s) => sum + s.apy, 0) / sources.length
        : 0;
      
      setYieldData({
        totalYield,
        estimatedAPY: avgAPY,
        yieldSources: sources
      });
    };
    
    calculateYield();
  }, [tokens, defiPositions]);

  if (yieldData.totalYield === 0 && yieldData.yieldSources.length === 0) {
    return null;
  }

  return (
    <div className="yield-stats-section">
      <h2>Yield Statistics</h2>
      <div className="yield-overview">
        <div className="yield-card">
          <div className="yield-label">Estimated Annual Yield</div>
          <div className="yield-value">{formatPrice(yieldData.totalYield)}</div>
          <div className="yield-subtitle">Based on current positions</div>
        </div>
        <div className="yield-card">
          <div className="yield-label">Average APY</div>
          <div className="yield-value apy">{yieldData.estimatedAPY.toFixed(2)}%</div>
          <div className="yield-subtitle">Annual Percentage Yield</div>
        </div>
      </div>
      
      {yieldData.yieldSources.length > 0 && (
        <div className="yield-sources">
          <h3>Yield Sources</h3>
          <div className="sources-list">
            {yieldData.yieldSources.map((source, index) => (
              <div key={index} className="source-item">
                <div className="source-header">
                  <span className="source-protocol">{source.protocol}</span>
                  <span className="source-type">{source.type}</span>
                </div>
                <div className="source-details">
                  <span className="source-yield">{formatPrice(source.yield)}/year</span>
                  <span className="source-apy">{source.apy}% APY</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YieldStats;

