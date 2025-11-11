/**
 * Swap component - Token exchange
 */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { formatTokenBalance } from '../utils/formatters';
import './Swap.css';

const Swap = ({ address, tokens = [] }) => {
  const [fromToken, setFromToken] = useState('MATIC');
  const [toToken, setToToken] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (window.ethereum && address) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
    }
  }, [address]);

  // Get token balance
  const getTokenBalance = (symbol) => {
    const token = tokens.find(t => t.symbol === symbol);
    if (!token) return '0';
    return formatTokenBalance(token.balance, token.decimals || 18);
  };

  // Calculate swap amount (simulated, actual implementation requires calling DEX API)
  const calculateSwap = async (amount, from, to) => {
    if (!amount || parseFloat(amount) <= 0) {
      setToAmount('');
      return;
    }

    try {
      // Should call actual DEX API to get exchange rate
      // Example: Using simple 1:1 rate (should get from QuickSwap or other DEX)
      const rate = 1; // Should get from API
      const calculated = (parseFloat(amount) * rate).toFixed(6);
      setToAmount(calculated);
    } catch (error) {
      console.error('Failed to calculate swap amount:', error);
      setError('Unable to get exchange rate');
    }
  };

  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      calculateSwap(fromAmount, fromToken, toToken);
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!address || !provider) {
      setError('Please connect wallet first');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter swap amount');
      return;
    }

    if (!toToken) {
      setError('Please select target token');
      return;
    }

    setIsSwapping(true);
    setError('');

    try {
      // Should call actual swap contract
      // Example code, actual implementation requires integrating QuickSwap or other DEX
      const signer = await provider.getSigner();
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Swap successful! (This is a demo, actual implementation requires connecting to DEX contract)');
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
      setError(error.message || 'Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwitchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken || 'MATIC');
    setToToken(temp === 'MATIC' ? '' : temp);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const availableTokens = ['MATIC', ...tokens.map(t => t.symbol).filter(Boolean)];

  return (
    <div className="swap-section">
      <div className="swap-header">
        <h2 className="swap-title">
          <svg className="swap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m0-6H4m6 0V4m0 16v-4m6-12h-4m4 0v4m0 4v4m-4-4h4"/>
          </svg>
          <span>Token Swap</span>
        </h2>
        <div className="swap-settings">
          <button className="settings-btn" title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="swap-content">
        <div className="swap-input-group">
          <div className="swap-input-header">
            <span className="swap-label">From</span>
            <span className="swap-balance">
              Balance: {getTokenBalance(fromToken)}
            </span>
          </div>
          <div className="swap-input-wrapper">
            <input
              type="number"
              className="swap-input"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              min="0"
              step="0.000001"
            />
            <div className="swap-token-selector">
              <select
                className="token-select"
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
              >
                {availableTokens.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="swap-switch-btn-wrapper">
          <button 
            className="swap-switch-btn"
            onClick={handleSwitchTokens}
            title="Switch Tokens"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </button>
        </div>

        <div className="swap-input-group">
          <div className="swap-input-header">
            <span className="swap-label">To</span>
            <span className="swap-balance">
              {toToken ? `Balance: ${getTokenBalance(toToken)}` : 'Select Token'}
            </span>
          </div>
          <div className="swap-input-wrapper">
            <input
              type="text"
              className="swap-input"
              placeholder="0.0"
              value={toAmount}
              readOnly
            />
            <div className="swap-token-selector">
              <select
                className="token-select"
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
              >
                <option value="">Select Token</option>
                {availableTokens.filter(t => t !== fromToken).map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && <div className="swap-error">{error}</div>}

        <div className="swap-info">
          <div className="swap-info-item">
            <span>Slippage Tolerance</span>
            <span>{slippage}%</span>
          </div>
          <div className="swap-info-item">
            <span>Estimated Gas Fee</span>
            <span>~0.01 MATIC</span>
          </div>
        </div>

        <button
          className="swap-execute-btn"
          onClick={handleSwap}
          disabled={isSwapping || !address || !fromAmount || !toToken}
        >
          {isSwapping ? (
            <>
              <span className="loading-spinner"></span>
              <span>Swapping...</span>
            </>
          ) : !address ? (
            'Please Connect Wallet'
          ) : (
            'Swap Now'
          )}
        </button>
      </div>
    </div>
  );
};

export default Swap;

