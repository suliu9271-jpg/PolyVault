/**
 * On-chain achievement system component
 */
import React, { useState, useEffect } from 'react';
import { checkAchievements, getRarityColor } from '../services/achievementService';
import './AchievementSystem.css';

const AchievementSystem = ({ tokens = [], nfts = [], transactions = [], defiPositions = [] }) => {
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useEffect(() => {
    const userData = { tokens, nfts, transactions, defiPositions };
    const userAchievements = checkAchievements(userData);
    setAchievements(userAchievements);
  }, [tokens, nfts, transactions, defiPositions]);

  if (achievements.length === 0) {
    return null;
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="achievement-system-section">
      <div className="achievement-header">
        <h2>On-Chain Achievements</h2>
        <div className="achievement-progress">
          <span className="progress-text">{unlockedCount}/{totalCount}</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.rarity} ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            onClick={() => setSelectedAchievement(achievement)}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-info">
              <div className="achievement-title">{achievement.title}</div>
              <div className="achievement-description">{achievement.description}</div>
            </div>
            {achievement.unlocked && (
              <div className="achievement-badge">✓</div>
            )}
          </div>
        ))}
      </div>

      {selectedAchievement && (
        <div className="achievement-modal" onClick={() => setSelectedAchievement(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedAchievement(null)}>×</button>
            <div className="modal-icon">{selectedAchievement.icon}</div>
            <h3>{selectedAchievement.title}</h3>
            <p>{selectedAchievement.description}</p>
            <div className={`rarity-badge ${selectedAchievement.rarity}`}>
              {selectedAchievement.rarity.toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementSystem;

