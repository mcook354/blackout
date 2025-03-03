import React, { useState } from "react";
import "./Academy.css"; // Import styles

const positions = [
  { name: "Prop", category1: "Scrum", category2: ["Maul", "Rucking"], category3: ["Counter-Rucking", "Lineout Jumping", "Tackling"] },
  { name: "Hooker", category1: "Lineout Throwing", category2: ["Scrum", "Rucking"], category3: ["Counter-Rucking", "Maul", "Tackling"] },
  { name: "Lock", category1: "Lineout Jumping", category2: ["Scrum", "Maul"], category3: ["Counter-Rucking", "Rucking", "Tackling"] },
  { name: "Flanker", category1: "Counter-Rucking", category2: ["Ruck", "Tackling"], category3: ["Scrum", "Lineout Jumping", "Maul"] },
  { name: "Number 8", category1: "Rucking", category2: ["Scrum", "Tackling"], category3: ["Lineout Jumping", "Maul", "Counter-Rucking"] },
  { name: "Scrum-Half", category1: "Passing", category2: ["Awareness", "Line-Breaking"], category3: ["Catching", "Kicking", "Tackling"] },
  { name: "Fly-Half", category1: "Kicking", category2: ["Passing", "Awareness"], category3: ["Tackling", "Catching", "Line-Breaking"] },
  { name: "Center", category1: "Tackling", category2: ["Passing", "Line-Breaking"], category3: ["Kicking", "Catching", "Awareness"] },
  { name: "Wing", category1: "Line-Breaking", category2: ["Passing", "Catching"], category3: ["Kicking", "Tackling", "Awareness"] },
  { name: "Full-Back", category1: "Catching", category2: ["Kicking", "Tackling"], category3: ["Passing", "Line-Breaking", "Awareness"] },
];

const allSkills = [
  "Scrum", "Lineout Throwing", "Lineout Jumping", "Counter-Rucking", "Rucking", "Passing", "Kicking", 
  "Tackling", "Maul", "Ruck", "Awareness", "Line-Breaking", "Catching"
];

const Academy = () => {
  const [selectedPosition, setSelectedPosition] = useState(positions[0].name);
  const [skillLevels, setSkillLevels] = useState(
    allSkills.reduce((acc, skill) => ({ ...acc, [skill]: 0 }), {}) // Initialize all skills to 0
  );

  const handleSkillChange = (skill, value) => {
    setSkillLevels((prev) => ({ ...prev, [skill]: Number(value) }));
  };

  return (
    <div className="academy-container">
      <h2>🏉 Academy Player Growth Calculator</h2>
      
      {/* Position Selection */}
      <div className="form-group">
        <label>Player Position:</label>
        <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
          {positions.map((pos) => (
            <option key={pos.name} value={pos.name}>{pos.name}</option>
          ))}
        </select>
      </div>

      {/* Skill Input Table */}
      <div className="skill-table">
        <h3>Enter Starting Skill Levels:</h3>
        <table>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Starting Level</th>
            </tr>
          </thead>
          <tbody>
            {allSkills.map((skill) => (
              <tr key={skill}>
                <td>{skill}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="45"
                    value={skillLevels[skill]}
                    onChange={(e) => handleSkillChange(skill, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculate Button (Logic to be added later) */}
      <button className="calculate-button">Calculate Growth</button>
    </div>
  );
};

export default Academy;
