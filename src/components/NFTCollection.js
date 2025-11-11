/**
 * NFT collection display component
 */
import React, { useState, useEffect } from 'react';
import { getNFTs, getNFTMetadata } from '../services/alchemyService';
import { formatAddress } from '../utils/formatters';
import Loader from './Loader';
import './NFTCollection.css';

const NFTCollection = ({ address, onNFTsUpdate }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);

  useEffect(() => {
    if (!address) return;
    
    const fetchNFTs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const nftData = await getNFTs(address, null, 100);
        const nftList = nftData.ownedNfts || [];
        
        // Process NFT data
        const processedNFTs = nftList
          .filter(nft => nft && (nft.contract?.address || nft.contractAddress)) // Filter invalid NFTs
          .map(nft => {
            const tokenId = nft.id?.tokenId || nft.tokenId || nft.token_id || 'unknown';
            const contractAddress = nft.contract?.address || nft.contractAddress;
            return {
              contractAddress: contractAddress,
              tokenId: tokenId,
              title: nft.title || `#${tokenId}`,
              description: nft.description || '',
              image: nft.media?.[0]?.gateway || nft.media?.[0]?.raw || nft.image || null,
              collectionName: nft.contract?.name || nft.collectionName || 'Unknown Collection',
              tokenType: nft.id?.tokenMetadata?.tokenType || nft.tokenType || 'ERC721',
              metadata: nft.metadata || {}
            };
          });
        
        setNfts(processedNFTs);
        // Use setTimeout to avoid updating parent component state during render
        setTimeout(() => {
          if (onNFTsUpdate) {
            onNFTsUpdate(processedNFTs);
          }
        }, 0);
      } catch (err) {
        const errorMessage = err?.message || 'Unknown error';
        setError('Failed to fetch NFTs: ' + errorMessage);
        console.error('❌ Failed to fetch NFTs:', err);
        // Even if fetch fails, set empty array to avoid showing error state
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
  };

  const closeModal = () => {
    setSelectedNFT(null);
  };

  if (!address) {
    return (
      <div className="nft-collection-section">
        <h2>NFT Collection</h2>
        <p className="empty-message">Please enter a wallet address to view NFT collection</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="nft-collection-section">
        <h2>NFT Collection</h2>
        <Loader message="Loading NFT collection..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="nft-collection-section">
        <h2>NFT Collection</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="nft-collection-section">
        <h2>NFT Collection</h2>
        {nfts.length === 0 ? (
          <p className="empty-message">No NFTs found for this address</p>
        ) : (
          <>
            <div className="nft-count">Total {nfts.length} NFTs</div>
            <div className="nfts-grid">
              {nfts.map((nft, index) => (
                <div
                  key={index}
                  className="nft-card"
                  onClick={() => handleNFTClick(nft)}
                >
                  <div className="nft-image-container">
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
                      <div className="nft-image-placeholder">No Image</div>
                    )}
                  </div>
                  <div className="nft-info">
                    <div className="nft-title">{nft.title}</div>
                    <div className="nft-collection">{nft.collectionName}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedNFT && (
        <div className="nft-modal" onClick={closeModal}>
          <div className="nft-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="nft-modal-close" onClick={closeModal}>×</button>
            <div className="nft-modal-body">
              <div className="nft-modal-image">
                {selectedNFT.image ? (
                  <img
                    src={selectedNFT.image}
                    alt={selectedNFT.title}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="nft-image-placeholder-large">No Image</div>
                )}
              </div>
              <div className="nft-modal-info">
                <h3>{selectedNFT.title}</h3>
                <div className="nft-modal-detail">
                  <span className="detail-label">Collection:</span>
                  <span className="detail-value">{selectedNFT.collectionName}</span>
                </div>
                <div className="nft-modal-detail">
                  <span className="detail-label">Token ID:</span>
                  <span className="detail-value">{selectedNFT.tokenId}</span>
                </div>
                <div className="nft-modal-detail">
                  <span className="detail-label">Contract Address:</span>
                  <a
                    href={`https://polygonscan.com/address/${selectedNFT.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    {formatAddress(selectedNFT.contractAddress)}
                  </a>
                </div>
                {selectedNFT.description && (
                  <div className="nft-modal-description">
                    <span className="detail-label">Description:</span>
                    <p>{selectedNFT.description}</p>
                  </div>
                )}
                <div className="nft-modal-actions">
                  <a
                    href={`https://polygonscan.com/token/${selectedNFT.contractAddress}?a=${selectedNFT.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-button"
                  >
                    View on PolygonScan
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NFTCollection;

