/**
 * Asset sharing component
 */
import React, { useState } from 'react';
import { formatAddress, formatPrice } from '../utils/formatters';
import './ShareAssets.css';

const ShareAssets = ({ address, tokens = [], nfts = [], totalValue = 0 }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    showBalance: true,
    showTokens: true,
    showNFTs: true,
    showAddress: true
  });

  const generateShareText = () => {
    let text = '🔷 My Polygon On-Chain Assets\n\n';
    
    if (shareOptions.showAddress) {
      text += `Wallet Address: ${address}\n`;
    }
    
    if (shareOptions.showBalance && totalValue > 0) {
      text += `Total Asset Value: ${formatPrice(totalValue)}\n`;
    }
    
    if (shareOptions.showTokens && tokens.length > 0) {
      text += `\nToken Types: ${tokens.length}\n`;
      tokens.slice(0, 5).forEach(token => {
        text += `  • ${token.symbol}\n`;
      });
    }
    
    if (shareOptions.showNFTs && nfts.length > 0) {
      text += `\nNFT Collection: ${nfts.length}\n`;
    }
    
    text += '\n#Web3 #Polygon #DeFi';
    
    return text;
  };

  const handleShare = async (platform) => {
    const shareText = generateShareText();
    const shareUrl = window.location.href;

    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
      setShowShareMenu(false);
      return;
    }

    if (platform === 'twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank');
    } else if (platform === 'telegram') {
      const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
      window.open(url, '_blank');
    }
    
    setShowShareMenu(false);
  };

  if (!address) return null;

  return (
    <div className="share-assets-section">
      <button
        className="share-button"
        onClick={() => setShowShareMenu(!showShareMenu)}
      >
        <span>📤</span>
        <span>Share Assets</span>
      </button>

      {showShareMenu && (
        <div className="share-menu">
          <div className="share-options">
            <label className="option-item">
              <input
                type="checkbox"
                checked={shareOptions.showBalance}
                onChange={(e) => setShareOptions({ ...shareOptions, showBalance: e.target.checked })}
              />
              <span>Show Total Assets</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={shareOptions.showTokens}
                onChange={(e) => setShareOptions({ ...shareOptions, showTokens: e.target.checked })}
              />
              <span>Show Tokens</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={shareOptions.showNFTs}
                onChange={(e) => setShareOptions({ ...shareOptions, showNFTs: e.target.checked })}
              />
              <span>Show NFTs</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={shareOptions.showAddress}
                onChange={(e) => setShareOptions({ ...shareOptions, showAddress: e.target.checked })}
              />
              <span>Show Address</span>
            </label>
          </div>

          <div className="share-platforms">
            <button className="platform-button" onClick={() => handleShare('copy')}>
              📋 Copy
            </button>
            <button className="platform-button" onClick={() => handleShare('twitter')}>
              🐦 Twitter
            </button>
            <button className="platform-button" onClick={() => handleShare('telegram')}>
              ✈️ Telegram
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareAssets;

