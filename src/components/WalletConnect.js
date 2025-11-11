/**
 * Wallet connection component - Supports MetaMask and other Web3 wallets
 */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './WalletConnect.css';

const WalletConnect = ({ onAddressChange, onConnected }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // Check if wallet is already connected
  useEffect(() => {
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    if (!window.ethereum) {
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
        setIsConnected(true);
        if (onAddressChange) {
          onAddressChange(address);
        }
        if (onConnected) {
          onConnected(true);
        }
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress('');
      if (onAddressChange) {
        onAddressChange('');
      }
      if (onConnected) {
        onConnected(false);
      }
    } else {
      setAddress(accounts[0]);
      if (onAddressChange) {
        onAddressChange(accounts[0]);
      }
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or other Web3 wallet');
      alert('Please install MetaMask wallet extension first');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Request wallet connection
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const polygonChainId = '0x89'; // Polygon Mainnet

      if (chainId !== polygonChainId) {
        try {
          // Try to switch to Polygon network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: polygonChainId }],
          });
        } catch (switchError) {
          // If network doesn't exist, add network
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: polygonChainId,
                chainName: 'Polygon Mainnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com/']
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const connectedAddress = await signer.getAddress();
      
      setAddress(connectedAddress);
      setIsConnected(true);
      
      if (onAddressChange) {
        onAddressChange(connectedAddress);
      }
      if (onConnected) {
        onConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    if (onAddressChange) {
      onAddressChange('');
    }
    if (onConnected) {
      onConnected(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="wallet-connect-connected">
        <div className="wallet-address-display">
          <span className="wallet-status-dot"></span>
          <span className="wallet-address-text">{formatAddress(address)}</span>
        </div>
        <button 
          className="wallet-disconnect-btn"
          onClick={disconnectWallet}
          title="Disconnect"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect-section">
      <button
        className="wallet-connect-btn"
        onClick={connectWallet}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <span className="loading-spinner"></span>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg className="wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </button>
      {error && <div className="wallet-error">{error}</div>}
    </div>
  );
};

export default WalletConnect;

