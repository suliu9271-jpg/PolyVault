/**
 * Alchemy API Service
 */
import axios from 'axios';

const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY;

// Check if API key is configured
if (!ALCHEMY_API_KEY) {
  console.warn('⚠️ Alchemy API key not configured! Please add REACT_APP_ALCHEMY_API_KEY to .env file');
}

const ALCHEMY_BASE_URL = ALCHEMY_API_KEY 
  ? `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : null;

/**
 * Get Alchemy API endpoint (REST API)
 * @param {string} method - API method
 * @returns {string} Complete API URL
 */
const getAlchemyEndpoint = (method) => {
  if (!ALCHEMY_API_KEY) {
    throw new Error('Alchemy API key not configured, please check .env file');
  }
  return `${ALCHEMY_BASE_URL}/${method}`;
};

/**
 * Get all NFTs held by an address
 * @param {string} address - Wallet address
 * @param {string} contractAddress - NFT contract address (optional, for filtering specific contract)
 * @param {number} pageSize - Number of items per page
 * @param {string} pageKey - Pagination key (optional)
 * @returns {Promise<Object>} NFT data
 */
export const getNFTs = async (address, contractAddress = null, pageSize = 100, pageKey = null) => {
  try {
    if (!ALCHEMY_API_KEY) {
      const errorMsg = 'Alchemy API key not configured. Please create .env file and add: REACT_APP_ALCHEMY_API_KEY=your_key';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!address) {
      throw new Error('Wallet address cannot be empty');
    }
    
    const params = {
      owner: address,
      'pageSize': pageSize,
      'withMetadata': true
    };
    
    if (contractAddress) {
      params['contractAddresses'] = [contractAddress];
    }
    
    if (pageKey) {
      params['pageKey'] = pageKey;
    }
    
    const endpoint = getAlchemyEndpoint('getNFTs');
    console.log('📡 Requesting NFT data:', endpoint);
    
    const response = await axios.get(endpoint, {
      params,
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ NFT data fetched successfully:', response.data?.ownedNfts?.length || 0, 'NFTs');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch NFTs:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Invalid API key, please check REACT_APP_ALCHEMY_API_KEY in .env file');
    } else if (error.response?.status === 429) {
      throw new Error('API request rate limit exceeded, please try again later');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout, please check network connection');
    }
    throw error;
  }
};

/**
 * Get NFT metadata
 * @param {string} contractAddress - NFT contract address
 * @param {string} tokenId - Token ID
 * @returns {Promise<Object>} NFT metadata
 */
export const getNFTMetadata = async (contractAddress, tokenId) => {
  try {
    if (!ALCHEMY_API_KEY) {
      const errorMsg = 'Alchemy API key not configured. Please create .env file and add: REACT_APP_ALCHEMY_API_KEY=your_key';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!contractAddress || !tokenId) {
      throw new Error('Contract address and Token ID cannot be empty');
    }
    
    const response = await axios.get(getAlchemyEndpoint('getNFTMetadata'), {
      params: {
        contractAddress: contractAddress,
        tokenId: tokenId
      },
      timeout: 30000 // 30 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch NFT metadata:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Invalid API key, please check REACT_APP_ALCHEMY_API_KEY in .env file');
    } else if (error.response?.status === 429) {
      throw new Error('API request rate limit exceeded, please try again later');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout, please check network connection');
    }
    throw error;
  }
};

/**
 * Get transaction history for an address
 * @param {string} address - Wallet address
 * @param {number} maxCount - Maximum number of results
 * @returns {Promise<Array>} Transaction array
 */
export const getAssetTransfers = async (address, maxCount = 50) => {
  try {
    if (!ALCHEMY_API_KEY) {
      const errorMsg = 'Alchemy API key not configured. Please create .env file and add: REACT_APP_ALCHEMY_API_KEY=your_key';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!address) {
      throw new Error('Wallet address cannot be empty');
    }
    
    console.log('📡 Requesting transaction history:', address);
    
    const response = await axios.post(ALCHEMY_BASE_URL, {
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getAssetTransfers',
      params: [
        {
          fromBlock: '0x0',
          toBlock: 'latest',
          fromAddress: address,
          maxCount: maxCount,
          excludeZeroValue: false,
          category: ['external', 'erc20', 'erc721', 'erc1155']
        }
      ]
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    const transfers = response.data.result?.transfers || [];
    console.log('✅ Transaction history fetched successfully:', transfers.length, 'transactions');
    return transfers;
  } catch (error) {
    console.error('❌ Failed to fetch transaction history:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Invalid API key, please check REACT_APP_ALCHEMY_API_KEY in .env file');
    } else if (error.response?.status === 429) {
      throw new Error('API request rate limit exceeded, please try again later');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout, please check network connection');
    }
    throw error;
  }
};

/**
 * Get all token balances held by an address
 * @param {string} address - Wallet address
 * @returns {Promise<Array>} Token balance array
 */
export const getTokenBalances = async (address) => {
  try {
    if (!ALCHEMY_API_KEY) {
      const errorMsg = 'Alchemy API key not configured. Please create .env file and add: REACT_APP_ALCHEMY_API_KEY=your_key';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!address) {
      throw new Error('Wallet address cannot be empty');
    }
    
    console.log('📡 Requesting token balances:', address);
    
    const response = await axios.post(ALCHEMY_BASE_URL, {
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getTokenBalances',
      params: [address]
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    const tokenData = response.data.result?.tokenBalances || [];
    
    // Filter out tokens with zero balance
    const validTokens = tokenData.filter(token => {
      const balance = BigInt(token.tokenBalance || '0');
      return balance > 0n;
    });
    
    console.log('✅ Token balances fetched successfully:', validTokens.length, 'tokens');
    return validTokens;
  } catch (error) {
    console.error('❌ Failed to fetch token balances:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Invalid API key, please check REACT_APP_ALCHEMY_API_KEY in .env file');
    } else if (error.response?.status === 429) {
      throw new Error('API request rate limit exceeded, please try again later');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout, please check network connection');
    }
    throw error;
  }
};

/**
 * Get token price (requires additional price API)
 * Note: Alchemy does not provide price data, returns null here, need to integrate other price API
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<number|null>} Token price (USD)
 */
export const getTokenPrice = async (tokenAddress) => {
  // Alchemy does not provide price data, need to integrate CoinGecko or other price API
  // Returns null here, actual usage requires calling other services
  return null;
};

