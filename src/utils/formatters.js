/**
 * 数据格式化工具函数
 */

/**
 * 格式化以太坊地址，显示前6位和后4位
 * @param {string} address - 钱包地址
 * @returns {string} 格式化后的地址
 */
export const formatAddress = (address) => {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * 格式化代币余额，保留指定小数位
 * @param {string|number} balance - 代币余额（wei单位）
 * @param {number} decimals - 代币精度
 * @param {number} displayDecimals - 显示的小数位数，默认4位
 * @returns {string} 格式化后的余额
 */
export const formatTokenBalance = (balance, decimals = 18, displayDecimals = 4) => {
  if (!balance) return '0';
  const divisor = BigInt(10 ** decimals);
  const balanceBigInt = BigInt(balance);
  const wholePart = balanceBigInt / divisor;
  const fractionalPart = balanceBigInt % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.slice(0, displayDecimals).replace(/0+$/, '');
  
  return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
};

/**
 * 格式化价格，添加货币符号
 * @param {number|string} price - 价格
 * @param {string} symbol - 货币符号，默认USD
 * @returns {string} 格式化后的价格
 */
export const formatPrice = (price, symbol = 'USD') => {
  if (!price || price === '0' || price === 0) return 'N/A';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return 'N/A';
  
  if (numPrice < 0.01) {
    return `$${numPrice.toFixed(6)}`;
  }
  return `$${numPrice.toFixed(2)}`;
};

/**
 * 格式化日期时间
 * @param {number|string|Date} timestamp - 时间戳或日期对象
 * @returns {string} 格式化后的日期时间
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * 格式化相对时间（如：2小时前）
 * @param {number|string|Date} timestamp - 时间戳或日期对象
 * @returns {string} 相对时间字符串
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  
  return formatDateTime(timestamp);
};

/**
 * 格式化Gas费用
 * @param {string|number} gasUsed - 使用的Gas
 * @param {string|number} gasPrice - Gas价格（wei）
 * @returns {string} 格式化后的Gas费用（MATIC）
 */
export const formatGasFee = (gasUsed, gasPrice) => {
  if (!gasUsed || !gasPrice) return 'N/A';
  const fee = BigInt(gasUsed) * BigInt(gasPrice);
  return formatTokenBalance(fee.toString(), 18, 6) + ' MATIC';
};

/**
 * 验证以太坊地址格式
 * @param {string} address - 地址字符串
 * @returns {boolean} 是否为有效地址
 */
export const isValidAddress = (address) => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

