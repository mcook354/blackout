import React, { useState } from "react";
import "./PlayerCard.css"; // Ensure CSS reflects the necessary changes

const TARGET_PHYSICALS = {
  Prop: { strength: 90, power: 80, endurance: 80, coordination: 60, agility: 60, acceleration: 60, speed: 60 },
  Hooker: { strength: 90, power: 80, endurance: 70, coordination: 80, agility: 60, acceleration: 60, speed: 60 },
  Lock: { strength: 80, power: 90, endurance: 80, coordination: 60, agility: 70, acceleration: 60, speed: 60 },
  Flanker: { strength: 90, power: 80, endurance: 70, coordination: 60, agility: 80, acceleration: 60, speed: 60 },
  No8: { strength: 80, power: 90, endurance: 80, coordination: 60, agility: 70, acceleration: 60, speed: 60 },
  Scrumhalf: { strength: 60, power: 60, endurance: 60, coordination: 60, agility: 90, acceleration: 80, speed: 80 },
  Flyhalf: { strength: 60, power: 60, endurance: 60, coordination: 90, agility: 70, acceleration: 80, speed: 80 },
  Center: { strength: 60, power: 90, endurance: 60, coordination: 70, agility: 70, acceleration: 80, speed: 90 },
  Wing: { strength: 60, power: 80, endurance: 60, coordination: 60, agility: 80, acceleration: 80, speed: 90 },
  Fullback: { strength: 60, power: 80, endurance: 60, coordination: 80, agility: 70, acceleration: 90, speed: 80 },
};

const PlayerCard = ({ player, onPositionChange, allPositions }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(player.bestPosition);
  const [tooltip, setTooltip] = useState({ visible: false, content: "", x: 0, y: 0 });

  const handleChange = (e) => {
    const newPosition = e.target.value;
    setSelectedPosition(newPosition);
    onPositionChange(player.id, newPosition === "Reset" ? player.originalBestPosition : newPosition);
  };

  const targetLevels = TARGET_PHYSICALS[player.bestPosition] || {};
  const physicalAttributes = player.physicalAttributes || {};
  const predictedAttributes = player.predictedPhysicalAttributes || {};

  // Remove Height and Weight
  const filteredAttributes = Object.fromEntries(
    Object.entries(physicalAttributes).filter(([key]) => !["height", "weight", "baseweight"].includes(key.toLowerCase()))
  );

  return (
    <div className="player-card">
      <div className="player-card-header">
        <h2>{player.firstName} {player.lastName}</h2>
        <h2><span className="player-level">(Lvl: {player.bestLevel})</span></h2>

        <select value={selectedPosition} onChange={handleChange} className="position-dropdown">
          <option value="Reset">Reset to Original</option>
          {allPositions.map((pos) => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>
      </div>

      {player.alternativePositions.length > 0 && (
        <p className="alternative-positions">
          <strong>Alternative position(s):</strong> {player.alternativePositions
            .map((pos) => `${pos.position.charAt(0).toUpperCase() + pos.position.slice(1)} (${pos.level})`)
            .join(", ")}
        </p>
      )}

      <p>Age: {player.age}</p>
      {player.age <= 25 && (
        <p className="predicted-peak">🌟 Predicted Peak Level: {player.predictedPeakLevel}</p>
      )}

      <p className="player-market-price">Market Price: ${player.marketPrice.toLocaleString()}</p>

      <div className="player-statistics">
        <p>🏟️ Friendly Matches: {player.statistics.friendlyMatchesPlayed}</p>
        <p>🏆 Ladder Matches: {player.statistics.ladderMatchesPlayed}</p>
      </div>

      <button className="expand-button" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "Hide Details ▲" : "Show Details ▼"}
      </button>

      {isExpanded && (
        <div className="player-details">
          {/* Physical Attributes - Full Width */}
          <div className="attributes-section full-width">
            <h3>🏋️ Physical Attributes</h3>
            <div className="progress-bar-container">
              {Object.entries(filteredAttributes).map(([attr, value]) => {
                const minLevel = predictedAttributes[attr]?.min || value;
                const maxLevel = predictedAttributes[attr]?.max || value;
                const progress = (value / 100) * 100;
                const minProgress = (minLevel / 100) * 100;
                const maxProgress = (maxLevel / 100) * 100;

                return (
                  <div 
                    key={attr} 
                    className="attribute-bar"
                    onMouseEnter={(e) => setTooltip({
                      visible: true,
                      content: `Min: ${minLevel}, Max: ${maxLevel}`,
                      x: e.clientX,
                      y: e.clientY
                    })}
                    onMouseLeave={() => setTooltip({ visible: false })}
                  >
                    <span>{attr.charAt(0).toUpperCase() + attr.slice(1)}: {value}</span>
                    <div className="progress-bar">
                      <div className="progress-range" style={{ left: `${minProgress}%`, width: `${maxProgress - minProgress}%` }}></div>
                      <div className="progress-indicator" style={{ left: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skill Levels - Below Physical Attributes */}
          <div className="attributes-section">
            <h3>🏉 Skill Levels</h3>
            <ul className="attributes-list">
              {Object.entries(player.skillLevels).map(([skill, value]) => (
                <li key={skill}>{skill.charAt(0).toUpperCase() + skill.slice(1)}: {value}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip.visible && (
        <div className="tooltip" style={{ top: tooltip.y, left: tooltip.x }}>
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
