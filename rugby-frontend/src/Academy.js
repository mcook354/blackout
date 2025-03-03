import React, { useState } from "react";
import { calculateFinalLevels, SKILL_CATEGORIES } from "./academyLogic";
import "./Academy.css";

// Define all skills (this is used to generate input fields)
const ALL_SKILLS = [
  "Scrum", "Maul", "Rucking", "Counter-Rucking", "Lineout Jumping",
  "Lineout Throwing", "Tackling", "Passing", "Awareness",
  "Line-Breaking", "Kicking", "Catching"
];

const Academy = () => {
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
    const results = calculateFinalLevels(skillLevels, SKILL_CATEGORIES[selectedPosition]);
    setCalculatedSkills(results);
    console.log("Calculating skill progression...");
  };
  
    // Ensure we are sending valid data
    console.log("Skill Levels:", skillLevels);
    console.log("Selected Position:", selectedPosition);
    console.log("Skill Categories:", SKILL_CATEGORIES[selectedPosition]);
  
    // Run the XP calculation logic
    const results = calculateFinalLevels(skillLevels, selectedPosition);
  
    console.log("Calculation Results:", results); // Check if results are valid
  
    if (results) {
      setCalculatedSkills({ ...results }); // Ensure state triggers UI update
    } else {
      console.error("Error: Calculation returned undefined");
    }

  return (
    <div className="academy-container">
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
            <input
              type="number"
              value={skillLevels[skill]}
              onChange={(e) => handleSkillChange(skill, e.target.value)}
              min="9"
              max="45"
            />
          </div>
        ))}
      </div>

      <button className="calculate-button" onClick={handleCalculate}>Calculate</button>

      {calculatedSkills && (
        <div className="results-container">
          <h3>📊 Projected Skill Levels After 13 Days</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Starting Level</th>
                <th>Final Level</th>
              </tr>
            </thead>
            <tbody>
              {ALL_SKILLS.map((skill) => (
                <tr key={skill}>
                  <td>{skill}</td>
                  <td>{skillLevels[skill]}</td>
                  <td>{calculatedSkills[skill]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Academy;
