/**
 * DeFi protocol positions analysis component
 */
import React, { useState, useEffect } from 'react';
import { getAllDefiPositions, calculateDefiTotalValue } from '../services/defiService';
import { formatPrice } from '../utils/formatters';
import Loader from './Loader';
import './DefiPositions.css';

const DefiPositions = ({ address, onPositionsUpdate }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!address) return;
    
    const fetchPositions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const defiPositions = await getAllDefiPositions(address);
        setPositions(defiPositions);
        setTotalValue(calculateDefiTotalValue(defiPositions));
        // Use setTimeout to avoid updating parent component state during render
        setTimeout(() => {
          if (onPositionsUpdate) {
            onPositionsUpdate(defiPositions);
          }
        }, 0);
      } catch (err) {
        setError('Failed to fetch DeFi positions: ' + err.message);
        console.error('Failed to fetch DeFi positions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  if (!address) {
    return (
      <div className="defi-positions-section">
        <h2>DeFi Protocol Positions</h2>
        <p className="empty-message">Please enter a wallet address to view DeFi positions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="defi-positions-section">
        <h2>DeFi Protocol Positions</h2>
        <Loader message="Analyzing DeFi positions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="defi-positions-section">
        <h2>DeFi Protocol Positions</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="defi-positions-section">
      <div className="section-header">
        <h2>DeFi Protocol Positions</h2>
        {totalValue > 0 && (
          <div className="total-value-badge">
            Total Value: {formatPrice(totalValue)}
          </div>
        )}
      </div>
      
      {positions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p className="empty-message">No DeFi protocol positions found for this address</p>
          <p className="empty-subtitle">Supported protocols: Aave, QuickSwap, SushiSwap, etc.</p>
        </div>
      ) : (
        <div className="defi-grid">
          {positions.map((position, index) => (
            <div key={index} className="defi-card">
              <div className="defi-header">
                <div className="defi-logo">{position.logo}</div>
                <div className="defi-info">
                  <h3 className="defi-name">{position.name}</h3>
                  <span className="defi-type">{position.type}</span>
                </div>
              </div>
              
              {position.protocol === 'Aave' && (
                <div className="defi-details">
                  <div className="detail-row">
                    <span className="detail-label">Total Collateral</span>
                    <span className="detail-value">{formatPrice(position.totalCollateral)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Debt</span>
                    <span className="detail-value danger">{formatPrice(position.totalDebt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Available to Borrow</span>
                    <span className="detail-value success">{formatPrice(position.availableBorrow)}</span>
                  </div>
                  <div className="health-factor">
                    <span className="health-label">Health Factor</span>
                    <div className="health-bar">
                      <div 
                        className={`health-fill ${position.healthFactor > 1.5 ? 'safe' : position.healthFactor > 1 ? 'warning' : 'danger'}`}
                        style={{ width: `${Math.min((position.healthFactor / 3) * 100, 100)}%` }}
                      />
                      <span className="health-value">{position.healthFactor.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="ltv-info">
                    <span>LTV: {position.ltv.toFixed(2)}%</span>
                    <span>Liquidation Threshold: {position.liquidationThreshold.toFixed(2)}%</span>
                  </div>
                </div>
              )}
              
              {position.protocol === 'QuickSwap' && (
                <div className="defi-details">
                  <div className="detail-row">
                    <span className="detail-label">Liquidity Pools</span>
                    <span className="detail-value">{position.count}</span>
                  </div>
                  <div className="lp-positions">
                    {position.positions?.slice(0, 3).map((lp, idx) => (
                      <div key={idx} className="lp-item">
                        <span>{lp.pair?.token0?.symbol}/{lp.pair?.token1?.symbol}</span>
                      </div>
                    ))}
                    {position.count > 3 && (
                      <div className="lp-more">+{position.count - 3} more</div>
                    )}
                  </div>
                </div>
              )}
              
              {position.value !== undefined && (
                <div className="defi-value">
                  <span className="value-label">Net Value</span>
                  <span className="value-amount">{formatPrice(position.value)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DefiPositions;

