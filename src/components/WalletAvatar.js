/**
 * Digital wallet avatar component
 */
import React, { useState, useEffect } from 'react';
import { generateAvatarDataURL, getNFTAvatar } from '../utils/avatarGenerator';
import './WalletAvatar.css';

const WalletAvatar = ({ address, nfts = [], size = 120, showBadge = true }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isNFT, setIsNFT] = useState(false);

  useEffect(() => {
    if (!address) return;
    
    // Prefer NFT avatar
    const nftAvatar = getNFTAvatar(address, nfts);
    if (nftAvatar) {
      setAvatarUrl(nftAvatar);
      setIsNFT(true);
    } else {
      // Generate address-based avatar
      const avatar = generateAvatarDataURL(address);
      setAvatarUrl(avatar);
      setIsNFT(false);
    }
  }, [address, nfts]);

  if (!address) return null;

  return (
    <div className="wallet-avatar-container" style={{ width: size, height: size }}>
      <div className="wallet-avatar-wrapper">
        <img
          src={avatarUrl}
          alt="Wallet Avatar"
          className={`wallet-avatar ${isNFT ? 'nft-avatar' : 'generated-avatar'}`}
          style={{ width: size, height: size }}
          onError={(e) => {
            // If NFT image fails to load, use generated avatar
            const fallback = generateAvatarDataURL(address);
            e.target.src = fallback;
            setIsNFT(false);
          }}
        />
        {showBadge && isNFT && (
          <div className="nft-badge" title="NFT Avatar">
            ✨
          </div>
        )}
        {showBadge && !isNFT && (
          <div className="generated-badge" title="Generated Avatar">
            🎨
          </div>
        )}
      </div>
      {address && (
        <div className="wallet-address-tooltip">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      )}
    </div>
  );
};

export default WalletAvatar;

