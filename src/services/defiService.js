/**
 * DeFi service - Query DeFi protocol positions and interactions
 */
import axios from 'axios';
import { ethers } from 'ethers';
import { getPolygonProvider } from '../utils/ethersUtils';

// Common DeFi protocol addresses (Polygon network)
const DEFI_PROTOCOLS = {
  AAVE: {
    name: 'Aave',
    address: '0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf',
    logo: '🦇',
    type: 'lending'
  },
  QUICKSWAP: {
    name: 'QuickSwap',
    address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    logo: '🦎',
    type: 'dex'
  },
  SUSHI: {
    name: 'SushiSwap',
    address: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    logo: '🍣',
    type: 'dex'
  },
  CURVE: {
    name: 'Curve Finance',
    address: '0x0000000000000000000000000000000000000000', // Need actual address
    logo: '📈',
    type: 'stablecoin'
  },
  BALANCER: {
    name: 'Balancer',
    address: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    logo: '⚖️',
    type: 'dex'
  }
};

// Aave V3 contract addresses (Polygon)
const AAVE_V3_POOL = '0x794a61358D6845594F94dc1DB02A252b5b4814aD';
const AAVE_V3_DATA_PROVIDER = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';

// Aave V3 ABI (simplified)
const AAVE_ABI = [
  'function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
  'function getUserReservesData(address provider, address user) view returns (tuple(address underlyingAsset, uint256 scaledATokenBalance, bool usageAsCollateralEnabledOnUser, uint128 stableBorrowRate, uint128 variableBorrowRate, uint128 liquidityRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)[])'
];

/**
 * Get Aave position information
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} Aave position data
 */
export const getAavePositions = async (address) => {
  try {
    const provider = getPolygonProvider();
    const aavePool = new ethers.Contract(AAVE_V3_POOL, AAVE_ABI, provider);
    
    // Get user account data
    const accountData = await aavePool.getUserAccountData(address);
    
    // Convert to readable format
    const totalCollateral = ethers.formatUnits(accountData.totalCollateralBase, 8); // Aave uses 8 decimal precision
    const totalDebt = ethers.formatUnits(accountData.totalDebtBase, 8);
    const availableBorrow = ethers.formatUnits(accountData.availableBorrowsBase, 8);
    const healthFactor = ethers.formatUnits(accountData.healthFactor, 18);
    
    return {
      protocol: 'Aave',
      totalCollateral: parseFloat(totalCollateral),
      totalDebt: parseFloat(totalDebt),
      availableBorrow: parseFloat(availableBorrow),
      healthFactor: parseFloat(healthFactor),
      ltv: parseFloat(ethers.formatUnits(accountData.ltv, 4)),
      liquidationThreshold: parseFloat(ethers.formatUnits(accountData.currentLiquidationThreshold, 4))
    };
  } catch (error) {
    console.error('Failed to fetch Aave positions:', error);
    return null;
  }
};

/**
 * Get QuickSwap liquidity pool positions
 * @param {string} address - Wallet address
 * @returns {Promise<Array>} Liquidity pool position list
 */
export const getQuickSwapPositions = async (address) => {
  try {
    // Use The Graph or query contracts directly
    // This returns mock data, actual implementation should query QuickSwap LP token balances
    const response = await axios.get(`https://api.thegraph.com/subgraphs/name/quickswap/quickswap-polygon`, {
      params: {
        query: `
          {
            user(id: "${address.toLowerCase()}") {
              liquidityPositions {
                pair {
                  token0 { symbol }
                  token1 { symbol }
                }
                liquidityTokenBalance
              }
            }
          }
        `
      }
    });
    
    // Process returned data
    return response.data?.data?.user?.liquidityPositions || [];
  } catch (error) {
    console.error('Failed to fetch QuickSwap positions:', error);
    return [];
  }
};

/**
 * Get all DeFi protocol positions
 * @param {string} address - Wallet address
 * @returns {Promise<Array>} DeFi position list
 */
export const getAllDefiPositions = async (address) => {
  const positions = [];
  
  // Get Aave positions
  try {
    const aavePosition = await getAavePositions(address);
    if (aavePosition && (aavePosition.totalCollateral > 0 || aavePosition.totalDebt > 0)) {
      positions.push({
        ...DEFI_PROTOCOLS.AAVE,
        ...aavePosition,
        value: aavePosition.totalCollateral - aavePosition.totalDebt
      });
    }
  } catch (error) {
    console.error('Failed to fetch Aave positions:', error);
  }
  
  // Get QuickSwap positions
  try {
    const quickswapPositions = await getQuickSwapPositions(address);
    if (quickswapPositions.length > 0) {
      positions.push({
        ...DEFI_PROTOCOLS.QUICKSWAP,
        positions: quickswapPositions,
        count: quickswapPositions.length
      });
    }
  } catch (error) {
    console.error('Failed to fetch QuickSwap positions:', error);
  }
  
  return positions;
};

/**
 * Get DeFi protocol interaction history
 * @param {string} address - Wallet address
 * @returns {Promise<Array>} Interaction history
 */
export const getDefiInteractions = async (address) => {
  // Can fetch interaction history from Alchemy or The Graph
  // Simplified implementation, returns empty array
  return [];
};

/**
 * Calculate total DeFi value
 * @param {Array} positions - DeFi position list
 * @returns {number} Total value
 */
export const calculateDefiTotalValue = (positions) => {
  return positions.reduce((total, position) => {
    return total + (position.value || 0);
  }, 0);
};

