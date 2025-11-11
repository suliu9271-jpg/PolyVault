/**
 * Portfolio bubble chart component
 */
import React, { useMemo, useRef, useEffect } from 'react';
import { formatTokenBalance } from '../utils/formatters';
import './PortfolioBubble.css';

const PortfolioBubble = ({ tokens = [], nfts = [] }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const data = useMemo(() => {
    const items = [];
    
    // Add tokens
    tokens.forEach(token => {
      const balance = parseFloat(formatTokenBalance(token.balance, token.decimals, 18));
      const value = balance * (token.price || 0);
      if (value > 0) {
        items.push({
          id: token.address || token.symbol,
          name: token.symbol,
          value,
          type: 'token',
          color: getTokenColor(token.symbol)
        });
      }
    });
    
    // Add NFTs (simplified, each NFT as a bubble)
    if (nfts.length > 0) {
      const nftValue = nfts.length * 10; // Simplified valuation
      items.push({
        id: 'nft-collection',
        name: `NFT Collection (${nfts.length})`,
        value: nftValue,
        type: 'nft',
        color: '#f39c12'
      });
    }
    
    // Sort by value
    return items.sort((a, b) => b.value - a.value);
  }, [tokens, nfts]);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Calculate bubble size and position
    const maxValue = Math.max(...data.map(d => d.value));
    const bubbles = data.map((item, index) => {
      const radius = Math.sqrt(item.value / maxValue) * 80 + 20;
      const angle = (index / data.length) * Math.PI * 2;
      const distance = width * 0.3;
      const x = width / 2 + Math.cos(angle) * distance;
      const y = height / 2 + Math.sin(angle) * distance;
      
      return {
        ...item,
        radius,
        x,
        y,
        targetX: x,
        targetY: y,
        vx: 0,
        vy: 0
      };
    });
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update bubble positions (simple physics simulation)
      bubbles.forEach((bubble, i) => {
        // Collision detection
        bubbles.forEach((other, j) => {
          if (i !== j) {
            const dx = bubble.x - other.x;
            const dy = bubble.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = bubble.radius + other.radius;
            
            if (distance < minDistance) {
              const angle = Math.atan2(dy, dx);
              const targetX = other.x + Math.cos(angle) * minDistance;
              const targetY = other.y + Math.sin(angle) * minDistance;
              
              bubble.vx += (targetX - bubble.x) * 0.01;
              bubble.vy += (targetY - bubble.y) * 0.01;
            }
          }
        });
        
        // Boundary detection
        if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > width) {
          bubble.vx *= -0.8;
        }
        if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > height) {
          bubble.vy *= -0.8;
        }
        
        // Update position
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;
        bubble.vx *= 0.95; // Friction
        bubble.vy *= 0.95;
        
        // Draw bubble
        const gradient = ctx.createRadialGradient(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          0,
          bubble.x,
          bubble.y,
          bubble.radius
        );
        gradient.addColorStop(0, lightenColor(bubble.color, 0.3));
        gradient.addColorStop(1, bubble.color);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = darkenColor(bubble.color, 0.2);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(12, bubble.radius * 0.15)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bubble.name, bubble.x, bubble.y);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="portfolio-bubble-section">
        <h2>Portfolio Bubble Chart</h2>
        <p className="empty-message">No asset data available</p>
      </div>
    );
  }

  return (
    <div className="portfolio-bubble-section">
      <h2>Portfolio Bubble Chart</h2>
      <div className="bubble-container">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="bubble-canvas"
        />
        <div className="bubble-legend">
          {data.slice(0, 8).map((item, index) => (
            <div key={item.id} className="legend-item">
              <span
                className="legend-dot"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="legend-text">
                {item.name}: ${item.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getTokenColor = (symbol) => {
  const colors = {
    'MATIC': '#8247e5',
    'USDC': '#3e73c4',
    'USDT': '#26a17b',
    'WETH': '#627eea',
    'WBTC': '#f7931a',
    'DAI': '#f5ac37'
  };
  return colors[symbol] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
};

const lightenColor = (color, amount) => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount * 255);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount * 255);
  const b = Math.min(255, (num & 0x0000FF) + amount * 255);
  return `rgb(${r}, ${g}, ${b})`;
};

const darkenColor = (color, amount) => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount * 255);
  const g = Math.max(0, ((num >> 8) & 0x00FF) - amount * 255);
  const b = Math.max(0, (num & 0x0000FF) - amount * 255);
  return `rgb(${r}, ${g}, ${b})`;
};

export default PortfolioBubble;

