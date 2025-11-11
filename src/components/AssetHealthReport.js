/**
 * On-chain asset health report component
 */
import React, { useMemo } from 'react';
import { formatPrice, formatTokenBalance } from '../utils/formatters';
import './AssetHealthReport.css';

const AssetHealthReport = ({ tokens = [], transactions = [], defiPositions = [] }) => {
  const report = useMemo(() => {
    // Calculate total value
    const totalValue = tokens.reduce((sum, token) => {
      const balance = parseFloat(formatTokenBalance(token.balance, token.decimals, 18));
      return sum + balance * (token.price || 0);
    }, 0);

    // Calculate asset diversity
    const diversity = tokens.length > 0 ? Math.min(100, (tokens.length / 10) * 100) : 0;

    // Calculate DeFi participation
    const defiValue = defiPositions.reduce((sum, pos) => sum + (pos.value || 0), 0);
    const defiRatio = totalValue > 0 ? (defiValue / totalValue) * 100 : 0;

    // Calculate transaction activity
    const recentTransactions = transactions.filter(tx => {
      const txTime = tx.timestamp * 1000;
      const daysAgo = (Date.now() - txTime) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    }).length;
    const activityScore = Math.min(100, (recentTransactions / 20) * 100);

    // Risk assessment
    const riskFactors = [];
    if (defiPositions.some(pos => pos.healthFactor && pos.healthFactor < 1.5)) {
      riskFactors.push('Low DeFi health factor');
    }
    if (tokens.length === 1) {
      riskFactors.push('High asset concentration');
    }
    const riskLevel = riskFactors.length === 0 ? 'Low' : riskFactors.length === 1 ? 'Medium' : 'High';

    // Overall score
    const overallScore = (diversity * 0.3 + defiRatio * 0.2 + activityScore * 0.3 + (riskLevel === 'Low' ? 100 : riskLevel === 'Medium' ? 60 : 30) * 0.2);

    return {
      totalValue,
      diversity,
      defiRatio,
      activityScore,
      riskLevel,
      riskFactors,
      overallScore: Math.round(overallScore)
    };
  }, [tokens, transactions, defiPositions]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="asset-health-report-section">
      <h2>Asset Health Report</h2>
      
      <div className="report-overview">
        <div className="overall-score-card">
          <div className="score-circle" style={{ 
            background: `conic-gradient(${getScoreColor(report.overallScore)} 0% ${report.overallScore}%, #e0e0e0 ${report.overallScore}% 100%)`
          }}>
            <div className="score-inner">
              <div className="score-value">{report.overallScore}</div>
              <div className="score-label">{getScoreLabel(report.overallScore)}</div>
            </div>
          </div>
        </div>

        <div className="report-metrics">
          <div className="metric-item">
            <div className="metric-label">Total Asset Value</div>
            <div className="metric-value">{formatPrice(report.totalValue)}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Asset Diversity</div>
            <div className="metric-value">{report.diversity.toFixed(0)}%</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">DeFi Participation</div>
            <div className="metric-value">{report.defiRatio.toFixed(1)}%</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Transaction Activity</div>
            <div className="metric-value">{report.activityScore.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      <div className="report-details">
        <div className="detail-section">
          <h3>Risk Assessment</h3>
          <div className={`risk-badge ${report.riskLevel.toLowerCase()}`}>
            {report.riskLevel} Risk
          </div>
          {report.riskFactors.length > 0 && (
            <ul className="risk-factors">
              {report.riskFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="detail-section">
          <h3>Recommendations</h3>
          <ul className="recommendations">
            {report.diversity < 50 && (
              <li>💡 Consider increasing asset diversity to reduce concentration risk</li>
            )}
            {report.defiRatio < 20 && (
              <li>💡 Consider participating in DeFi protocols to earn yield</li>
            )}
            {report.activityScore < 50 && (
              <li>💡 Increasing transaction activity can improve asset liquidity</li>
            )}
            {report.riskLevel === 'High' && (
              <li>⚠️ Pay attention to risk factors and optimize asset allocation</li>
            )}
            {report.overallScore >= 80 && (
              <li>✅ Asset allocation is good, keep it up</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssetHealthReport;

