import React, { useState } from "react";
import { calculateFinalLevels, SKILL_CATEGORIES } from "./academyLogic";
import "./Academy.css";

// Define all skills (this is used to generate input fields)
const ALL_SKILLS = [
  "Scrum", "Maul", "Rucking", "Counter-Rucking", "Lineout Jumping",
  "Lineout Throwing", "Tackling", "Passing", "Awareness",
  "Line-Breaking", "Kicking", "Catching"
];

const Academy = ({ players }) => {
  const [selectedPosition, setSelectedPosition] = useState("Prop");
  
  const [skillLevels, setSkillLevels] = useState(
    ALL_SKILLS.reduce((acc, skill) => ({ ...acc, [skill]: 9 }), {})
  );

  const [calculatedSkills, setCalculatedSkills] = useState(null);

  const handleSkillChange = (skill, value) => {
    setSkillLevels((prev) => ({
      ...prev,
      [skill]: Math.max(9, Math.min(45, Number(value)))
    }));
  };

  const handleCalculate = () => {
    const positionKey = selectedPosition.trim(); // Remove spaces
    if (!SKILL_CATEGORIES[positionKey]) {
      console.error("Error: Invalid position selected", positionKey);
      return;
    }
    setCalculatedSkills(calculateFinalLevels(skillLevels, selectedPosition));
  };

  // Function to compute the rating based on the selected position
  const getPlayerRating = () => {
    if (!calculatedSkills) return null; // If no results yet, return nothing
  
    const positionSkills = SKILL_CATEGORIES[selectedPosition];
  
    if (!positionSkills) return "No data available for this position.";
  
    // Get final levels of Category 1 & 2 skills
    const cat1Skills = positionSkills.category1.map(skill => calculatedSkills[skill] || 0);
    const cat2Skills = positionSkills.category2.map(skill => calculatedSkills[skill] || 0);
    
    // Compute average
    const allRelevantSkills = [...cat1Skills, ...cat2Skills];
    const avgFinalLevel = allRelevantSkills.length > 0
      ? allRelevantSkills.reduce((sum, level) => sum + level, 0) / allRelevantSkills.length
      : 0;
};  // ✅ Closing bracket added here

const getSkillLabel = (skill) => {
    if (!selectedPosition || !SKILL_CATEGORIES[selectedPosition]) return skill;
  
    const positionSkills = SKILL_CATEGORIES[selectedPosition];
  
    if (positionSkills.category1.includes(skill)) return `${skill} (cat 1)`;
    if (positionSkills.category2.includes(skill)) return `${skill} (cat 2)`;
    if (positionSkills.category3.includes(skill)) return `${skill} (cat 3)`;
  
    return `${skill} (other)`; // Skills not in cat 1, 2, or 3
};  

  const getTopPositions = () => {
    if (!calculatedSkills) return [];
  
    let positionRankings = [];
  
    // Loop through all positions and calculate the average Cat 1 & 2 skill levels
    Object.keys(SKILL_CATEGORIES).forEach(position => {
      const positionSkills = SKILL_CATEGORIES[position];
  
      const cat1 = positionSkills.category1.map(skill => calculatedSkills[skill] || 0);
      const cat2 = positionSkills.category2.map(skill => calculatedSkills[skill] || 0);
      const allSkills = [...cat1, ...cat2];
  
      if (allSkills.length > 0) {
        const avg = allSkills.reduce((sum, lvl) => sum + lvl, 0) / allSkills.length;
        const rating = getPlayerRatingForPosition(avg); // Get rating for this position
        positionRankings.push({ position, avg, rating });
      }
    });
  
    // Sort positions by highest average skill level
    positionRankings.sort((a, b) => b.avg - a.avg);
  
    // Return the top 3 positions
    return positionRankings.slice(0, 3);
  };

  const getPlayerRatingForPosition = (avgFinalLevel) => {
    if (avgFinalLevel >= 36) return "🌟 Elite Prospect";
    if (avgFinalLevel >= 32) return "🔥 Great Potential";
    if (avgFinalLevel >= 28) return "✅ Solid Player";
    if (avgFinalLevel >= 20) return "⚖️ Average Talent";
    return "🔴 Needs Development";
  };

  const getScoutingPriorities = (players) => {
    if (!players || players.length === 0) return [];
  
    let positionDepth = {};
  
    // Count players at each position by successor status
    players.forEach((player) => {
      const position = player.bestPosition; // Uses overridden position if changed
  
      if (!positionDepth[position]) {
        positionDepth[position] = { ready: 0, almostReady: 0, inDevelopment: 0 };
      }
  
      if (player.successorStatus === "Ready") {
        positionDepth[position].ready += 1;
      } else if (player.successorStatus === "Almost Ready") {
        positionDepth[position].almostReady += 1;
      } else {
        positionDepth[position].inDevelopment += 1;
      }
    });
  
    // Prioritize positions with the fewest "Ready" and "Almost Ready" players
    let sortedPositions = Object.entries(positionDepth)
      .sort((a, b) => {
        if (a[1].ready !== b[1].ready) return a[1].ready - b[1].ready;
        return a[1].almostReady - b[1].almostReady;
      })
      .map(([position, counts]) => ({
        position,
        ready: counts.ready,
        almostReady: counts.almostReady,
        inDevelopment: counts.inDevelopment
      }));
  
    return sortedPositions.slice(0, 3); // Return top 3 positions needing scouting
  };    

  return (
    
    <div className="academy-container">
    {players && players.length > 0 && (
    <div className="scouting-priorities">
        <h3>🔎 High-Priority Positions for Scouting</h3>
        <ul>
        {getScoutingPriorities(players).map((entry, index) => ( // ✅ Players now passed as an argument
            <li key={index}>
            <strong>{entry.position}</strong>: 
            {` Ready: ${entry.ready}, Almost Ready: ${entry.almostReady}, In Dev: ${entry.inDevelopment}`}
            </li>
        ))}
        </ul>
    </div>
    )}
      <h2>🎓 Academy Skill Progression Calculator</h2>

      <div className="form-group">
        <label>Select Position:</label>
        <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
          {Object.keys(SKILL_CATEGORIES).map((position) => (
            <option key={position} value={position}>{position}</option>
          ))}
        </select>
      </div>

      <div className="skill-inputs">
        {ALL_SKILLS.map((skill) => (
          <div key={skill} className="form-group">
            <label>{skill}:</label>
            <select
            value={skillLevels[skill]}
            onChange={(e) => handleSkillChange(skill, e.target.value)}
            >
            {Array.from({ length: 37 }, (_, i) => i + 9).map((level) => (
                <option key={level} value={level}>
                {level}
                </option>
            ))}
            </select>
          </div>
        ))}
      </div>

      <button className="calculate-button" onClick={handleCalculate}>Calculate</button>

      {calculatedSkills && (
        <div className="results-container">
          <h3>📊 Projected Skill Levels After 13 Days</h3>
          {calculatedSkills && (
            <div className="top-positions-container">
                <h3>🏆 Top 3 Positions Based on Projected Skills</h3>
                <ul>
                {getTopPositions().map((entry, index) => (
                    <li key={index}>
                    <strong>{entry.position}</strong>: {entry.rating} ({entry.avg.toFixed(1)})
                    </li>
                ))}
                </ul>
            </div>
            )}
          <table className="results-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Starting Level</th>
                <th>Final Level</th>
                <th>Soft Cap</th>
              </tr>
            </thead>
            <tbody>
            {ALL_SKILLS.map((skill) => {
                const finalLevel = calculatedSkills[skill];
                const softCap = finalLevel + 40; // Soft Cap Calculation

                let levelClass = "level-low";
                if (finalLevel >= 35) {
                levelClass = "level-veryhigh";
                } else if (finalLevel >= 30) {
                levelClass = "level-high";
                } else if (finalLevel >= 20) {
                levelClass = "level-medium";
                }

                return (
                <tr key={skill}>
                    <td>{getSkillLabel(skill)}</td>
                    <td>{skillLevels[skill]}</td>
                    <td className={levelClass}>{finalLevel}</td>
                    <td className="soft-cap">{softCap}</td>
                </tr>
                );
            })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Academy;
