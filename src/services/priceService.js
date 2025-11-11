/**
 * Token price service - Uses CoinGecko API
 */
import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// CoinGecko ID mapping for common tokens on Polygon network
const TOKEN_ID_MAP = {
  'MATIC': 'matic-network',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'WETH': 'weth',
  'WBTC': 'wrapped-bitcoin',
  'DAI': 'dai',
  'AAVE': 'aave',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'CRV': 'curve-dao-token'
};

/**
 * Get token price by symbol
 * @param {string} symbol - Token symbol
 * @returns {Promise<number|null>} Token price in USD
 */
export const getTokenPriceBySymbol = async (symbol) => {
  try {
    const tokenId = TOKEN_ID_MAP[symbol.toUpperCase()];
    if (!tokenId) {
      // If not in mapping, try direct search
      return await searchTokenPrice(symbol);
    }
    
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: tokenId,
        vs_currencies: 'usd'
      },
      timeout: 30000 // 30 second timeout
    });
    
    return response.data[tokenId]?.usd || null;
  } catch (error) {
    console.error(`Failed to fetch ${symbol} price:`, error);
    return null;
  }
};

/**
 * Get multiple token prices in batch
 * @param {string[]} symbols - Array of token symbols
 * @returns {Promise<Object>} Token price object {symbol: price}
 */
export const getMultipleTokenPrices = async (symbols) => {
  try {
    const tokenIds = symbols
      .map(s => TOKEN_ID_MAP[s.toUpperCase()])
      .filter(Boolean);
    
    if (tokenIds.length === 0) return {};
    
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: tokenIds.join(','),
        vs_currencies: 'usd'
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Build reverse mapping
    const idToSymbol = {};
    Object.entries(TOKEN_ID_MAP).forEach(([symbol, id]) => {
      idToSymbol[id] = symbol;
    });
    
    const prices = {};
    Object.entries(response.data).forEach(([id, data]) => {
      const symbol = idToSymbol[id];
      if (symbol) {
        prices[symbol] = data.usd;
      }
    });
    
    return prices;
  } catch (error) {
    console.error('Failed to fetch multiple token prices:', error);
    return {};
  }
};

/**
 * Search token price by symbol
 * @param {string} symbol - Token symbol
 * @returns {Promise<number|null>} Token price
 */
const searchTokenPrice = async (symbol) => {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/search`, {
      params: {
        query: symbol
      }
    });
    
    if (response.data.coins && response.data.coins.length > 0) {
      const coinId = response.data.coins[0].id;
      const priceResponse = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd'
        }
      });
      
      return priceResponse.data[coinId]?.usd || null;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to search ${symbol} price:`, error);
    return null;
  }
};

/**
 * Get token price with 24h change
 * @param {string} symbol - Token symbol
 * @returns {Promise<{price: number, change24h: number}|null>} Price and 24h change
 */
export const getTokenPriceWithChange = async (symbol) => {
  try {
    const tokenId = TOKEN_ID_MAP[symbol.toUpperCase()];
    if (!tokenId) return null;
    
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: tokenId,
        vs_currencies: 'usd',
        include_24hr_change: true
      }
    });
    
    const data = response.data[tokenId];
    if (!data) return null;
    
    return {
      price: data.usd,
      change24h: data.usd_24h_change || 0
    };
  } catch (error) {
    console.error(`Failed to fetch ${symbol} price change:`, error);
    return null;
  }
};

