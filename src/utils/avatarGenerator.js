/**
 * 数字钱包头像生成器
 * 基于钱包地址生成独特的头像
 */
import { ethers } from 'ethers';

/**
 * 根据钱包地址生成确定性颜色
 * @param {string} address - 钱包地址
 * @returns {string} 十六进制颜色
 */
export const generateColorFromAddress = (address) => {
  if (!address) return '#667eea';
  
  // 移除0x前缀并取前6位
  const hash = address.slice(2, 8);
  return `#${hash}`;
};

/**
 * 生成渐变颜色对
 * @param {string} address - 钱包地址
 * @returns {Array<string>} [color1, color2]
 */
export const generateGradientColors = (address) => {
  if (!address) return ['#667eea', '#764ba2'];
  
  const color1 = generateColorFromAddress(address);
  // 生成第二个颜色（基于地址的后6位）
  const hash2 = address.slice(-6);
  const color2 = `#${hash2}`;
  
  return [color1, color2];
};

/**
 * 生成头像SVG
 * @param {string} address - 钱包地址
 * @param {number} size - 头像大小
 * @returns {string} SVG字符串
 */
export const generateAvatarSVG = (address, size = 120) => {
  if (!address) return '';
  
  const [color1, color2] = generateGradientColors(address);
  const pattern = address.slice(2, 10); // 用于生成图案
  
  // 基于地址生成简单的几何图案
  const shapes = [];
  for (let i = 0; i < 8; i++) {
    const char = pattern[i];
    const value = parseInt(char, 16);
    const x = (value % 4) * (size / 4);
    const y = Math.floor(value / 4) * (size / 4);
    const radius = (value % 3 + 1) * (size / 12);
    
    shapes.push(
      `<circle cx="${x + size/8}" cy="${y + size/8}" r="${radius}" fill="${i % 2 === 0 ? color1 : color2}" opacity="0.8"/>`
    );
  }
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${address.slice(2, 8)}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad-${address.slice(2, 8)})" rx="${size/4}"/>
      ${shapes.join('')}
    </svg>
  `;
};

/**
 * 获取NFT头像（如果地址持有NFT）
 * @param {string} address - 钱包地址
 * @param {Array} nfts - NFT列表
 * @returns {string|null} NFT图片URL
 */
export const getNFTAvatar = (address, nfts = []) => {
  if (!nfts || nfts.length === 0) return null;
  
  // 返回第一个NFT的图片作为头像
  const firstNFT = nfts.find(nft => nft.image);
  return firstNFT?.image || null;
};

/**
 * 生成头像数据URL
 * @param {string} address - 钱包地址
 * @param {Array} nfts - NFT列表
 * @returns {string} 头像数据URL
 */
export const generateAvatarDataURL = (address, nfts = []) => {
  // 优先使用NFT头像
  const nftAvatar = getNFTAvatar(address, nfts);
  if (nftAvatar) {
    return nftAvatar;
  }
  
  // 否则生成SVG头像
  const svg = generateAvatarSVG(address);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

