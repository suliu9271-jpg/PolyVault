/**
 * NFT gallery component - Virtual exhibition wall
 */
import React, { useState } from 'react';
import { formatAddress } from '../utils/formatters';
import './NFTGallery.css';

const NFTGallery = ({ nfts = [], onNFTClick }) => {
  const [viewMode, setViewMode] = useState('grid'); // grid, wall, showcase
  const [selectedNFT, setSelectedNFT] = useState(null);

  if (nfts.length === 0) {
    return (
      <div className="nft-gallery-section">
        <h2>NFT Gallery</h2>
        <div className="empty-gallery">
          <div className="empty-icon">🖼️</div>
          <p>No NFT collection</p>
        </div>
      </div>
    );
  }

  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
    if (onNFTClick) {
      onNFTClick(nft);
    }
  };

  return (
    <div className="nft-gallery-section">
      <div className="gallery-header">
        <h2>NFT Gallery</h2>
        <div className="view-mode-selector">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            ⬜
          </button>
          <button
            className={viewMode === 'wall' ? 'active' : ''}
            onClick={() => setViewMode('wall')}
            title="Wall View"
          >
            🖼️
          </button>
          <button
            className={viewMode === 'showcase' ? 'active' : ''}
            onClick={() => setViewMode('showcase')}
            title="Showcase View"
          >
            🎨
          </button>
        </div>
      </div>

      <div className={`gallery-container ${viewMode}`}>
        {nfts.map((nft, index) => (
          <div
            key={index}
            className={`nft-frame ${viewMode}`}
            onClick={() => handleNFTClick(nft)}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="frame-border">
              {nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.title}
                  className="nft-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="nft-placeholder">No Image</div>
              )}
              <div className="frame-label">
                <div className="nft-title">{nft.title}</div>
                <div className="nft-collection">{nft.collectionName}</div>
              </div>
            </div>
            {viewMode === 'showcase' && (
              <div className="showcase-info">
                <div className="info-item">
                  <span className="info-label">Token ID</span>
                  <span className="info-value">{nft.tokenId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contract</span>
                  <span className="info-value">{formatAddress(nft.contractAddress)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedNFT && (
        <div className="gallery-modal" onClick={() => setSelectedNFT(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedNFT(null)}>×</button>
            {selectedNFT.image && (
              <img src={selectedNFT.image} alt={selectedNFT.title} className="modal-image" />
            )}
            <div className="modal-info">
              <h3>{selectedNFT.title}</h3>
              <p className="modal-collection">{selectedNFT.collectionName}</p>
              {selectedNFT.description && (
                <p className="modal-description">{selectedNFT.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTGallery;

