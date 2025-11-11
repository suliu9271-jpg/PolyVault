/**
 * Ethers.js utility functions
 */
import { ethers } from 'ethers';

// ERC-20 token standard ABI (only essential methods)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)'
];

// ERC-721 NFT standard ABI
const ERC721_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)'
];

/**
 * Get Polygon network provider
 * @param {string} rpcUrl - RPC URL (optional, uses environment variable or default)
 * @returns {ethers.JsonRpcProvider} Provider instance
 */
export const getPolygonProvider = (rpcUrl = null) => {
  const url = rpcUrl || 
    process.env.REACT_APP_POLYGON_RPC_URL || 
    'https://polygon-rpc.com';
  return new ethers.JsonRpcProvider(url);
};

/**
 * Get native token (MATIC) balance
 * @param {string} address - Wallet address
 * @param {ethers.JsonRpcProvider} provider - Provider instance
 * @returns {Promise<string>} Balance in wei
 */
export const getNativeBalance = async (address, provider) => {
  try {
    const balance = await provider.getBalance(address);
    return balance.toString();
  } catch (error) {
    console.error('Failed to fetch native token balance:', error);
    throw error;
  }
};

/**
 * Get ERC-20 token balance
 * @param {string} tokenAddress - Token contract address
 * @param {string} walletAddress - Wallet address
 * @param {ethers.JsonRpcProvider} provider - Provider instance
 * @returns {Promise<{balance: string, decimals: number, symbol: string, name: string}>} Token information
 */
export const getTokenBalance = async (tokenAddress, walletAddress, provider) => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [balance, decimals, symbol, name] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.decimals(),
      tokenContract.symbol(),
      tokenContract.name()
    ]);
    
    return {
      balance: balance.toString(),
      decimals: Number(decimals),
      symbol: symbol || 'UNKNOWN',
      name: name || 'Unknown Token',
      address: tokenAddress
    };
  } catch (error) {
    console.error(`Failed to fetch token balance (${tokenAddress}):`, error);
    throw error;
  }
};

/**
 * Get all ERC-20 token balances for a wallet address
 * @param {string} walletAddress - Wallet address
 * @param {string[]} tokenAddresses - Array of token contract addresses
 * @param {ethers.JsonRpcProvider} provider - Provider instance
 * @returns {Promise<Array>} Array of token information
 */
export const getAllTokenBalances = async (walletAddress, tokenAddresses, provider) => {
  const promises = tokenAddresses.map(address => 
    getTokenBalance(address, walletAddress, provider).catch(error => {
      console.error(`Failed to query token ${address}:`, error);
      return null;
    })
  );
  
  const results = await Promise.all(promises);
  return results.filter(result => result !== null && result.balance !== '0');
};

/**
 * Get transaction history
 * @param {string} address - Wallet address
 * @param {ethers.JsonRpcProvider} provider - Provider instance
 * @param {number} limit - Limit number of transactions returned
 * @returns {Promise<Array>} Array of transaction records
 */
export const getTransactionHistory = async (address, provider, limit = 50) => {
  try {
    // Note: ethers.js v6 does not directly support getting transaction history
    // Need to use Alchemy or Infura APIs to fetch
    // Returns empty array here, actual implementation should be in service layer
    return [];
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    throw error;
  }
};

/**
 * Get transaction details
 * @param {string} txHash - Transaction hash
 * @param {ethers.JsonRpcProvider} provider - Provider instance
 * @returns {Promise<Object>} Transaction details
 */
export const getTransactionDetails = async (txHash, provider) => {
  try {
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      gasLimit: tx.gasLimit.toString(),
      gasPrice: tx.gasPrice?.toString() || '0',
      gasUsed: receipt?.gasUsed?.toString() || '0',
      blockNumber: receipt?.blockNumber || null,
      timestamp: null, // Need to get via block number
      status: receipt?.status === 1 ? 'success' : 'failed',
      data: tx.data
    };
  } catch (error) {
    console.error('Failed to fetch transaction details:', error);
    throw error;
  }
};

/**
 * Get block timestamp
 * @param {number} blockNumber - Block number
 * @param {ethers.JsonRpcProvider} provider - Provider instance
 * @returns {Promise<number>} Timestamp
 */
export const getBlockTimestamp = async (blockNumber, provider) => {
  try {
    const block = await provider.getBlock(blockNumber);
    return block?.timestamp || 0;
  } catch (error) {
    console.error('Failed to fetch block timestamp:', error);
    return 0;
  }
};

/**
 * Get NFT contract instance
 * @param {string} nftAddress - NFT contract address
 * @param {ethers.JsonRpcProvider} provider - Provider instance
 * @returns {ethers.Contract} NFT contract instance
 */
export const getNFTContract = (nftAddress, provider) => {
  return new ethers.Contract(nftAddress, ERC721_ABI, provider);
};

/**
 * Get number of NFTs held by address
 * @param {string} nftAddress - NFT contract address
 * @param {string} walletAddress - Wallet address
 * @param {ethers.JsonRpcProvider} provider - Provider instance
 * @returns {Promise<number>} Number of NFTs
 */
export const getNFTBalance = async (nftAddress, walletAddress, provider) => {
  try {
    const nftContract = getNFTContract(nftAddress, provider);
    const balance = await nftContract.balanceOf(walletAddress);
    return Number(balance);
  } catch (error) {
    console.error('Failed to fetch NFT balance:', error);
    return 0;
  }
};

