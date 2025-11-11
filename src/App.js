/**
 * Main application entry file
 */
import React, { useState, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import ThemeToggle from './components/ThemeToggle';
import WalletAvatar from './components/WalletAvatar';
import AssetOverview from './components/AssetOverview';
import AssetDistribution from './components/AssetDistribution';
import PortfolioBubble from './components/PortfolioBubble';
import TokenBalance from './components/TokenBalance';
import DefiPositions from './components/DefiPositions';
import YieldStats from './components/YieldStats';
import AssetHealthReport from './components/AssetHealthReport';
import TransactionHistory from './components/TransactionHistory';
import NFTGallery from './components/NFTGallery';
import NFTCollection from './components/NFTCollection';
import AchievementSystem from './components/AchievementSystem';
import ShareAssets from './components/ShareAssets';
import Swap from './components/Swap';
import './App.css';

function App() {
  const [address, setAddress] = useState('');
  const [tokens, setTokens] = useState([]);
  const [defiPositions, setDefiPositions] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const handleAddressSubmit = useCallback((newAddress) => {
    setAddress(newAddress);
    setTokens([]); // Reset token list
    setDefiPositions([]); // Reset DeFi positions
    setNfts([]); // Reset NFT list
    setTransactions([]); // Reset transaction list
  }, []);

  const handleTokensUpdate = useCallback((newTokens) => {
    setTokens(newTokens);
  }, []);

  const handleDefiPositionsUpdate = useCallback((newPositions) => {
    setDefiPositions(newPositions);
  }, []);

  const handleNFTsUpdate = useCallback((newNFTs) => {
    setNfts(newNFTs);
  }, []);

  const handleTransactionsUpdate = useCallback((newTransactions) => {
    setTransactions(newTransactions);
  }, []);

  // Calculate total asset value
  const totalValue = tokens.reduce((sum, token) => {
    try {
      const balance = parseFloat(token.balance || '0') / Math.pow(10, token.decimals || 18);
      const price = parseFloat(token.price || 0);
      if (!isNaN(balance) && !isNaN(price)) {
        return sum + balance * price;
      }
    } catch (err) {
      console.warn('⚠️ Error calculating token value:', err);
    }
    return sum;
  }, 0);

  return (
    <ErrorBoundary>
      <div className="App">
        <ThemeToggle />
        <Header onAddressSubmit={handleAddressSubmit} currentAddress={address} />
        <main className="main-content">
          <div className="container">
            {/* Share Assets - Fixed at top */}
            {address && (
              <ShareAssets 
                address={address} 
                tokens={tokens} 
                nfts={nfts} 
                totalValue={totalValue}
              />
            )}
            
            {address && (
              <div className="wallet-profile">
                <WalletAvatar address={address} nfts={nfts} size={100} />
                <div className="profile-info">
                  <h3>Wallet Profile</h3>
                  <p className="wallet-address">{address}</p>
                </div>
              </div>
            )}
            
            {/* Swap Function - Display when address exists */}
            {address && <Swap address={address} tokens={tokens} />}
            
            {/* Asset Overview - Always display if address exists */}
            {address && <AssetOverview tokens={tokens} />}
            
            {/* Asset Distribution Chart - Display when tokens exist */}
            {address && tokens.length > 0 && <AssetDistribution tokens={tokens} />}
            
            {/* Portfolio Bubble Chart - Display when tokens or NFTs exist */}
            {address && (tokens.length > 0 || nfts.length > 0) && (
              <PortfolioBubble tokens={tokens} nfts={nfts} />
            )}
            
            {/* Token Balance - Always display */}
            <TokenBalance address={address} onTokensUpdate={handleTokensUpdate} />
            
            {/* DeFi Positions - Always display */}
            <DefiPositions address={address} onPositionsUpdate={handleDefiPositionsUpdate} />
            
            {/* Yield Statistics - Display when address exists */}
            {address && <YieldStats tokens={tokens} defiPositions={defiPositions} />}
            
            {/* Asset Health Report - Display when address exists */}
            {address && (
              <AssetHealthReport 
                tokens={tokens} 
                transactions={transactions} 
                defiPositions={defiPositions} 
              />
            )}
            
            {/* Transaction History - Always display */}
            <TransactionHistory 
              address={address} 
              onTransactionsUpdate={handleTransactionsUpdate}
            />
            
            {/* NFT Gallery - Display when NFTs exist */}
            {address && nfts.length > 0 && (
              <NFTGallery nfts={nfts} />
            )}
            
            {/* NFT Collection - Always display */}
            <NFTCollection address={address} onNFTsUpdate={handleNFTsUpdate} />
            
            {/* Achievement System - Display when address exists */}
            {address && (
              <AchievementSystem 
                tokens={tokens}
                nfts={nfts}
                transactions={transactions}
                defiPositions={defiPositions}
              />
            )}
          </div>
        </main>
        <footer className="footer">
          <p>Polygon On-Chain Asset Dashboard - Professional DeFi Asset Management Tool</p>
          <p className="footer-note">
            Data sourced from Polygon blockchain network | Supports Aave, QuickSwap and other DeFi protocols | Price data from CoinGecko
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;

