/**
 * Polygon blockchain API wrapper
 */
import axios from 'axios';

/**
 * Get Polygon mainnet RPC endpoint
 * @returns {string} RPC URL
 */
export const getPolygonRPCUrl = () => {
  return process.env.REACT_APP_POLYGON_RPC_URL || 'https://polygon-rpc.com';
};

/**
 * Get token balance via RPC call
 * @param {string} address - Wallet address
 * @param {string} tokenAddress - Token contract address (optional, empty for MATIC balance)
 * @returns {Promise<string>} Balance (hex string)
 */
export const getBalanceViaRPC = async (address, tokenAddress = null) => {
  try {
    const rpcUrl = getPolygonRPCUrl();
    
    if (!tokenAddress) {
      // Get native token (MATIC) balance
      const response = await axios.post(rpcUrl, {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      });
      return response.data.result;
    } else {
      // Get ERC-20 token balance
      const data = '0x70a08231' + address.slice(2).padStart(64, '0'); // balanceOf(address) function call
      const response = await axios.post(rpcUrl, {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: data
        }, 'latest'],
        id: 1
      });
      return response.data.result;
    }
  } catch (error) {
    console.error('RPC call failed:', error);
    throw error;
  }
};

/**
 * Get transaction history via block explorer API
 * Note: This requires PolygonScan API key
 * @param {string} address - Wallet address
 * @param {number} page - Page number
 * @param {number} offset - Number per page
 * @returns {Promise<Object>} Transaction history data
 */
export const getTransactionsViaAPI = async (address, page = 1, offset = 20) => {
  try {
    const apiKey = process.env.REACT_APP_POLYGONSCAN_API_KEY;
    if (!apiKey) {
      console.warn('PolygonScan API key not configured, unable to fetch transaction history');
      return { status: '0', message: 'API key not configured', result: [] };
    }
    
    const url = `https://api.polygonscan.com/api`;
    const response = await axios.get(url, {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: page,
        offset: offset,
        sort: 'desc',
        apikey: apiKey
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    throw error;
  }
};

/**
 * Get token transfer history
 * @param {string} address - Wallet address
 * @param {string} contractAddress - Token contract address (optional)
 * @param {number} page - Page number
 * @param {number} offset - Number per page
 * @returns {Promise<Object>} Token transfer history
 */
export const getTokenTransfers = async (address, contractAddress = null, page = 1, offset = 20) => {
  try {
    const apiKey = process.env.REACT_APP_POLYGONSCAN_API_KEY;
    if (!apiKey) {
      console.warn('PolygonScan API key not configured');
      return { status: '0', message: 'API key not configured', result: [] };
    }
    
    const url = `https://api.polygonscan.com/api`;
    const params = {
      module: 'account',
      action: 'tokentx',
      address: address,
      startblock: 0,
      endblock: 99999999,
      page: page,
      offset: offset,
      sort: 'desc',
      apikey: apiKey
    };
    
    if (contractAddress) {
      params.contractaddress = contractAddress;
    }
    
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch token transfer history:', error);
    throw error;
  }
};

