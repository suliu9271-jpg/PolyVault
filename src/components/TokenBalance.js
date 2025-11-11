/**
 * Token balance display component
 */
import React, { useState, useEffect } from 'react';
import { getPolygonProvider, getNativeBalance, getTokenBalance } from '../utils/ethersUtils';
import { getTokenBalances } from '../services/alchemyService';
import { getTokenPriceBySymbol, getMultipleTokenPrices } from '../services/priceService';
import { formatTokenBalance, formatPrice, formatAddress } from '../utils/formatters';
import Loader from './Loader';
import './TokenBalance.css';

const TokenBalance = ({ address, onTokensUpdate }) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;
    
    const fetchBalances = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const provider = getPolygonProvider();
        const allTokens = [];
        
        // Get native token (MATIC) balance
        try {
          console.log('📡 Fetching MATIC balance...');
          const maticBalance = await getNativeBalance(address, provider);
          allTokens.push({
            name: 'Polygon',
            symbol: 'MATIC',
            balance: maticBalance,
            decimals: 18,
            address: 'native',
            price: null
          });
          console.log('✅ MATIC balance fetched successfully');
        } catch (err) {
          console.error('❌ Failed to fetch MATIC balance:', err.message);
          setError('Failed to fetch MATIC balance: ' + err.message);
        }
        
        // Get ERC-20 token balances (using Alchemy)
        try {
          const tokenBalances = await getTokenBalances(address);
          
          if (tokenBalances.length === 0) {
            console.log('ℹ️ No ERC-20 tokens found for this address');
          } else {
            console.log(`📦 Found ${tokenBalances.length} tokens, fetching details...`);
            
            // Get detailed information for each token
            const tokenPromises = tokenBalances.map(async (token) => {
              try {
                // Note: Alchemy returns token format as { contractAddress, tokenBalance }
                const contractAddress = token.contractAddress || token.contract?.address;
                if (!contractAddress) {
                  console.warn('⚠️ Token missing contract address:', token);
                  return null;
                }
                
                const tokenInfo = await getTokenBalance(
                  contractAddress,
                  address,
                  provider
                );
                return {
                  ...tokenInfo,
                  price: null // Will fetch price later
                };
              } catch (err) {
                console.error(`⚠️ Failed to fetch token info ${token.contractAddress || 'unknown'}:`, err.message);
                return null;
              }
            });
            
            const tokenInfos = await Promise.all(tokenPromises);
            const validTokens = tokenInfos.filter(t => t !== null);
            allTokens.push(...validTokens);
            console.log(`✅ Successfully fetched details for ${validTokens.length} tokens`);
          }
        } catch (err) {
          console.error('❌ Failed to fetch ERC-20 token balances:', err.message);
          // If Alchemy is unavailable, continue showing MATIC balance
          if (err.message.includes('API key not configured')) {
            setError('API key not configured. Please create .env file and add REACT_APP_ALCHEMY_API_KEY');
          }
        }
        
        // Get prices for all tokens
        try {
          const symbols = allTokens.map(t => t.symbol).filter(Boolean);
          if (symbols.length > 0) {
            const prices = await getMultipleTokenPrices(symbols);
            
            // Update token prices
            if (prices && typeof prices === 'object') {
              allTokens.forEach(token => {
                if (token.symbol && prices[token.symbol]) {
                  token.price = prices[token.symbol];
                }
              });
            }
          }
        } catch (priceError) {
          console.warn('⚠️ Failed to fetch token prices:', priceError.message);
          // Price fetch failure doesn't affect token balance display
        }
        
        setTokens(allTokens);
        // Use setTimeout to avoid updating parent component state during render
        setTimeout(() => {
          if (onTokensUpdate) {
            onTokensUpdate(allTokens);
          }
        }, 0);
      } catch (err) {
        setError('Failed to fetch token balances: ' + err.message);
        console.error('Failed to fetch token balances:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  if (!address) {
    return (
      <div className="token-balance-section">
        <h2>Token Balance</h2>
        <p className="empty-message">Please enter a wallet address to view token balances</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="token-balance-section">
        <h2>Token Balance</h2>
        <Loader message="Loading token balances..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="token-balance-section">
        <h2>Token Balance</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="token-balance-section">
      <h2>Token Balance</h2>
      {tokens.length === 0 ? (
        <p className="empty-message">No token balances found for this address</p>
      ) : (
        <div className="tokens-grid">
          {tokens.map((token, index) => {
            const balance = formatTokenBalance(token.balance || '0', token.decimals || 18);
            const usdValue = token.price && balance ? (parseFloat(balance) * parseFloat(token.price)).toFixed(2) : null;
            
            return (
              <div key={index} className="token-card">
                <div className="token-header">
                  <div className="token-symbol">{token.symbol}</div>
                  {token.address !== 'native' && (
                    <div className="token-address">{formatAddress(token.address)}</div>
                  )}
                </div>
                <div className="token-name">{token.name}</div>
                <div className="token-balance">
                  <span className="balance-value">{balance}</span>
                  <span className="balance-symbol">{token.symbol}</span>
                </div>
                {token.price && (
                  <div className="token-price-info">
                    <div className="token-price">
                      {formatPrice(token.price)}
                    </div>
                    {usdValue && (
                      <div className="token-usd-value">
                        Value: ${usdValue}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TokenBalance;

