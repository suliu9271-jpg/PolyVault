/**
 * On-chain achievement system service
 */
import { formatTokenBalance } from '../utils/formatters';

/**
 * Check and calculate user achievements
 * @param {Object} data - User data
 * @returns {Array} Achievement list
 */
export const checkAchievements = (data) => {
  const { tokens = [], nfts = [], transactions = [], defiPositions = [] } = data;
  const achievements = [];

  // Calculate total value
  const totalValue = tokens.reduce((sum, token) => {
    const balance = parseFloat(formatTokenBalance(token.balance, token.decimals, 18));
    return sum + balance * (token.price || 0);
  }, 0);

  // Achievement 1: First token holder
  if (tokens.length > 0) {
    achievements.push({
      id: 'first-token',
      title: 'Token Holder',
      description: 'First time holding tokens',
      icon: '🪙',
      rarity: 'common',
      unlocked: true
    });
  }

  // Achievement 2: Asset value milestones
  if (totalValue >= 1000) {
    achievements.push({
      id: 'thousandaire',
      title: 'Thousandaire',
      description: 'Asset value exceeds $1,000',
      icon: '💰',
      rarity: 'common',
      unlocked: true
    });
  }
  if (totalValue >= 10000) {
    achievements.push({
      id: 'ten-thousandaire',
      title: 'Ten Thousandaire',
      description: 'Asset value exceeds $10,000',
      icon: '💎',
      rarity: 'rare',
      unlocked: true
    });
  }
  if (totalValue >= 100000) {
    achievements.push({
      id: 'hundred-thousandaire',
      title: 'Hundred Thousandaire',
      description: 'Asset value exceeds $100,000',
      icon: '👑',
      rarity: 'epic',
      unlocked: true
    });
  }

  // Achievement 3: NFT Collector
  if (nfts.length >= 1) {
    achievements.push({
      id: 'nft-collector',
      title: 'NFT Collector',
      description: 'Own at least 1 NFT',
      icon: '🖼️',
      rarity: 'common',
      unlocked: true
    });
  }
  if (nfts.length >= 10) {
    achievements.push({
      id: 'nft-enthusiast',
      title: 'NFT Enthusiast',
      description: 'Own at least 10 NFTs',
      icon: '🎨',
      rarity: 'rare',
      unlocked: true
    });
  }
  if (nfts.length >= 50) {
    achievements.push({
      id: 'nft-whale',
      title: 'NFT Whale',
      description: 'Own at least 50 NFTs',
      icon: '🐋',
      rarity: 'epic',
      unlocked: true
    });
  }

  // Achievement 4: DeFi Participant
  if (defiPositions.length > 0) {
    achievements.push({
      id: 'defi-participant',
      title: 'DeFi Participant',
      description: 'Participate in DeFi protocols',
      icon: '🏦',
      rarity: 'common',
      unlocked: true
    });
  }

  // Achievement 5: Trading Activity
  if (transactions.length >= 10) {
    achievements.push({
      id: 'active-trader',
      title: 'Active Trader',
      description: 'Complete at least 10 transactions',
      icon: '📊',
      rarity: 'common',
      unlocked: true
    });
  }
  if (transactions.length >= 100) {
    achievements.push({
      id: 'power-trader',
      title: 'Power Trader',
      description: 'Complete at least 100 transactions',
      icon: '⚡',
      rarity: 'rare',
      unlocked: true
    });
  }

  // Achievement 6: Asset Diversity
  if (tokens.length >= 5) {
    achievements.push({
      id: 'diversified',
      title: 'Diversified',
      description: 'Hold at least 5 different tokens',
      icon: '🌈',
      rarity: 'rare',
      unlocked: true
    });
  }

  // Achievement 7: Long-term Holder
  if (transactions.length > 0) {
    const oldestTx = transactions[transactions.length - 1];
    if (oldestTx && oldestTx.timestamp) {
      const daysSince = (Date.now() - oldestTx.timestamp * 1000) / (1000 * 60 * 60 * 24);
      if (daysSince >= 30) {
        achievements.push({
          id: 'long-term-holder',
          title: 'Long-term Holder',
          description: 'Hold assets for more than 30 days',
          icon: '⏰',
          rarity: 'common',
          unlocked: true
        });
      }
    }
  }

  return achievements;
};

/**
 * Get achievement rarity color
 * @param {string} rarity - Rarity level
 * @returns {string} Color
 */
export const getRarityColor = (rarity) => {
  const colors = {
    common: '#95a5a6',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f39c12'
  };
  return colors[rarity] || colors.common;
};

