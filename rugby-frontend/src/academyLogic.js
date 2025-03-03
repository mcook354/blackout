// academyLogic.js - Separate logic file for calculations
export const XP_THRESHOLDS = [
    { level: 9, xp: 980 },
    { level: 10, xp: 1130 },
    { level: 11, xp: 1290 },
    { level: 12, xp: 1462 },
    { level: 13, xp: 1645 },
    { level: 14, xp: 1839 },
    { level: 15, xp: 2043 },
    { level: 16, xp: 2259 },
    { level: 17, xp: 2485 },
    { level: 18, xp: 2722 },
    { level: 19, xp: 2970 },
    { level: 20, xp: 3230 },
    { level: 21, xp: 3500 },
    { level: 22, xp: 3780 },
    { level: 23, xp: 4072 },
    { level: 24, xp: 4375 },
    { level: 25, xp: 4689 },
    { level: 26, xp: 5013 },
    { level: 27, xp: 5349 },
    { level: 28, xp: 5695 },
    { level: 29, xp: 6052 },
    { level: 30, xp: 6420 },
    { level: 31, xp: 6800 },
    { level: 32, xp: 7190 },
    { level: 33, xp: 7590 },
    { level: 34, xp: 8002 },
    { level: 35, xp: 8425 },
    { level: 36, xp: 8859 },
    { level: 37, xp: 9303 },
    { level: 38, xp: 9759 },
    { level: 39, xp: 10225 },
    { level: 40, xp: 10702 },
    { level: 41, xp: 11190 },
    { level: 42, xp: 11690 },
    { level: 43, xp: 12200 },
    { level: 44, xp: 12720 },
    { level: 45, xp: 13252 },
  ];

  // 📌 Define skill categories per position
  export const SKILL_CATEGORIES = {
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
  
  // Convert skill level to XP
  const levelToXP = (level) => {
    const threshold = XP_THRESHOLDS.find((entry) => entry.level === level);
    return threshold ? threshold.xp : 0;
  };
  
  // Convert XP back to skill level
  const xpToLevel = (xp) => {
    let level = 9;
    for (let i = 0; i < XP_THRESHOLDS.length; i++) {
      if (xp >= XP_THRESHOLDS[i].xp) {
        level = XP_THRESHOLDS[i].level;
      } else {
        break;
      }
    }
    return level;
  };
  
  // Function to simulate 13 days of training
  export const calculateFinalLevels = (initialSkills, position) => {
    let updatedSkills = { ...initialSkills };
  
    // Get skill categories for the selected position
    const positionSkills = SKILL_CATEGORIES[position];
  
    for (let day = 0; day < 13; day++) {
      // Apply daily XP gains
      Object.keys(updatedSkills).forEach((skill) => {
        let xpGain = 0;
  
        if (positionSkills.category1.includes(skill)) {
          xpGain = 600; // Category 1 skills
        } else if (positionSkills.category2.includes(skill)) {
          xpGain = 450; // Category 2 skills
        } else if (positionSkills.category3.includes(skill)) {
          xpGain = 305; // Category 3 skills
        }
  
        // Convert current level to XP
        let currentXP = levelToXP(updatedSkills[skill]);
        currentXP += xpGain; // Apply XP gain
        updatedSkills[skill] = xpToLevel(currentXP); // Convert back to level
      });
  
      // Apply 14 random +50 XP boosts
      for (let i = 0; i < 14; i++) {
        const randomSkill = Object.keys(updatedSkills)[Math.floor(Math.random() * Object.keys(updatedSkills).length)];
        let currentXP = levelToXP(updatedSkills[randomSkill]);
        currentXP += 50;
        updatedSkills[randomSkill] = xpToLevel(currentXP);
      }
    }
  
    return updatedSkills;
  };
