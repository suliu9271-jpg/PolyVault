/**
 * Header component with wallet address input and wallet connection
 */
import React, { useState } from 'react';
import { isValidAddress } from '../utils/formatters';
import WalletConnect from './WalletConnect';
import './Header.css';

const Header = ({ onAddressSubmit, currentAddress }) => {
  const [address, setAddress] = useState(currentAddress || '');
  const [error, setError] = useState('');
  const [useWalletConnect, setUseWalletConnect] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    
    if (!isValidAddress(address.trim())) {
      setError('Invalid wallet address format');
      return;
    }
    
    onAddressSubmit(address.trim());
  };

  const handleChange = (e) => {
    setAddress(e.target.value);
    if (error) setError('');
  };

  const handleWalletConnect = (connectedAddress) => {
    if (connectedAddress) {
      setAddress(connectedAddress);
      setUseWalletConnect(true);
      onAddressSubmit(connectedAddress);
    } else {
      setUseWalletConnect(false);
      setAddress('');
      onAddressSubmit('');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-title">
          <div className="header-logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <h1>Polygon On-Chain Asset Dashboard</h1>
          </div>
          <p>Professional DeFi & NFT Asset Management Platform</p>
        </div>
        <div className="header-actions">
          <div className="wallet-connect-wrapper">
            <WalletConnect 
              onAddressChange={handleWalletConnect}
              onConnected={setUseWalletConnect}
            />
          </div>
          {!useWalletConnect && (
            <form onSubmit={handleSubmit} className="address-form">
              <div className="input-group">
                <input
                  type="text"
                  value={address}
                  onChange={handleChange}
                  placeholder="Or enter wallet address (0x...)"
                  className={`address-input ${error ? 'error' : ''}`}
                />
                <button type="submit" className="submit-button">
                  Query
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </form>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

