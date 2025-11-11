/**
 * Infura API service
 */
import axios from 'axios';
import { ethers } from 'ethers';

const INFURA_API_KEY = process.env.REACT_APP_INFURA_API_KEY;
const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID || INFURA_API_KEY;

/**
 * Get Infura Polygon RPC URL
 * @returns {string} RPC URL
 */
export const getInfuraRPCUrl = () => {
  if (!INFURA_PROJECT_ID) {
    throw new Error('Infura Project ID not configured');
  }
  return `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;
};

/**
 * Get Infura provider instance
 * @returns {ethers.JsonRpcProvider} Provider instance
 */
export const getInfuraProvider = () => {
  const rpcUrl = getInfuraRPCUrl();
  return new ethers.JsonRpcProvider(rpcUrl);
};

/**
 * Get native token (MATIC) balance
 * @param {string} address - Wallet address
 * @returns {Promise<string>} Balance in wei
 */
export const getNativeBalance = async (address) => {
  try {
    const provider = getInfuraProvider();
    const balance = await provider.getBalance(address);
    return balance.toString();
  } catch (error) {
    console.error('Failed to fetch native token balance:', error);
    throw error;
  }
};

/**
 * Get transaction details
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Transaction details
 */
export const getTransaction = async (txHash) => {
  try {
    const provider = getInfuraProvider();
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
      status: receipt?.status === 1 ? 'success' : 'failed',
      data: tx.data
    };
  } catch (error) {
    console.error('Failed to fetch transaction details:', error);
    throw error;
  }
};

/**
 * Get block information
 * @param {number|string} blockNumber - Block number or 'latest'
 * @returns {Promise<Object>} Block information
 */
export const getBlock = async (blockNumber = 'latest') => {
  try {
    const provider = getInfuraProvider();
    const block = await provider.getBlock(blockNumber);
    return block;
  } catch (error) {
    console.error('Failed to fetch block information:', error);
    throw error;
  }
};

/**
 * Note: Infura mainly provides RPC services, does not directly provide advanced APIs for NFT and token balance queries
 * Need to use ethers.js with Infura RPC to query
 * Or use Infura's NFT API (if available)
 */

/**
 * Check if Infura service is available
 * @returns {boolean} Whether Infura is configured
 */
export const isInfuraAvailable = () => {
  return !!INFURA_PROJECT_ID;
};

