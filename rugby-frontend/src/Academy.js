import React, { useState } from "react";
import { calculateFinalLevels } from "./academyLogic";
import "./Academy.css";

// 📌 Define skill categories per position
const SKILL_CATEGORIES = {
  Prop: {
    category1: ["Scrum"],
    category2: ["Maul", "Rucking"],
    category3: ["Counter-Rucking", "Lineout Jumping", "Tackling"],
  },
  Hooker: {
    category1: ["Lineout Throwing"],
    category2: ["Scrum", "Rucking"],
    category3: ["Counter-Rucking", "Maul", "Tackling"],
  },
  Lock: {
    category1: ["Lineout Jumping"],
    category2: ["Scrum", "Maul"],
    category3: ["Counter-Rucking", "Rucking", "Tackling"],
  },
  Flanker: {
    category1: ["Counter-Rucking"],
    category2: ["Rucking", "Tackling"],
    category3: ["Scrum", "Lineout Jumping", "Maul"],
  },
  "Number 8": {
    category1: ["Rucking"],
    category2: ["Scrum", "Tackling"],
    category3: ["Lineout Jumping", "Maul", "Counter-Rucking"],
  },
  "Scrum-Half": {
    category1: ["Passing"],
    category2: ["Awareness", "Line-Breaking"],
    category3: ["Catching", "Kicking", "Tackling"],
  },
  "Fly-Half": {
    category1: ["Kicking"],
    category2: ["Passing", "Awareness"],
    category3: ["Tackling", "Catching", "Line-Breaking"],
  },
  Center: {
    category1: ["Tackling"],
    category2: ["Passing", "Line-Breaking"],
    category3: ["Kicking", "Catching", "Awareness"],
  },
  Wing: {
    category1: ["Line-Breaking"],
    category2: ["Passing", "Catching"],
    category3: ["Kicking", "Tackling", "Awareness"],
  },
  "Full-Back": {
    category1: ["Catching"],
    category2: ["Kicking", "Tackling"],
    category3: ["Passing", "Line-Breaking", "Awareness"],
  },
};

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
    const results = calculateFinalLevels(skillLevels, SKILL_CATEGORIES[selectedPosition]);
  
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
