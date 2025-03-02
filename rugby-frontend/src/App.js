import React, { useState, useEffect } from "react";
import PlayerCard from "./components/PlayerCard";
import "./App.css"; // ✅ Import the CSS for dark theme


const allPositions = [
  "Prop", "Hooker", "Lock", "Flanker", "No8",
  "Scrumhalf", "Flyhalf", "Center", "Wing", "Fullback"
];

const App = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogic, setShowLogic] = useState(false);
  const [clubId, setClubId] = useState("3ac80dc7-3c45-49c5-9b2a-e2c9c8972342"); // Default club
  const clubOptions = [
    { id: "3ac80dc7-3c45-49c5-9b2a-e2c9c8972342", name: "Crushers" },
    { id: "3cedc084-6407-4fc6-be90-fbcaa6f5ef66", name: "Graunchers" }
  ];

  useEffect(() => {
    fetch(`https://blackout-it05.onrender.com/players?club_id=${clubId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const processedPlayers = data.data.map((player) => {
            const levels = player.attributes.levels || [];
            const bestPositionData = levels.find((pos) => pos.isBest);
            const bestPosition = bestPositionData?.position || "Unknown";
            const bestLevel = bestPositionData?.level || 0;

            const alternativePositions = levels
              .filter((pos) => !pos.isBest && pos.level >= bestLevel - 2)
              .map((pos) => ({ position: pos.position, level: pos.level }));

            // Retrieve stored position override from localStorage
            const storedPosition = localStorage.getItem(`player-${player.id}-position`);

            return {
              id: player.id,
              firstName: player.attributes.firstName,
              lastName: player.attributes.lastName,
              originalBestPosition: bestPosition.charAt(0).toUpperCase() + bestPosition.slice(1),
              bestPosition: storedPosition || bestPosition.charAt(0).toUpperCase() + bestPosition.slice(1), // ✅ Apply stored override
              bestLevel,
              age: player.attributes.age,
              successorStatus: getSuccessorStatus(bestLevel),
              alternativePositions,
              marketPrice: player.attributes.marketPrice,
              physicalAttributes: player.attributes.physicalAttributes,
              predictedPhysicalAttributes: player.attributes.predictedPhysicalAttributes || {},
              skillLevels: player.attributes.skillLevels,
              statistics: player.statistics || {
                friendlyMatchesPlayed: 0,
                ladderMatchesPlayed: 0,
              },
            };
          });
          setPlayers(processedPlayers);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
        setLoading(false);
      });
  }, [clubId]);

  const getSuccessorStatus = (level) => {
    if (level >= 78) return "Ready";
    if (level >= 70) return "Almost Ready";
    return "In Development";
  };

  const handlePositionChange = (playerId, newPosition) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId ? { ...player, bestPosition: newPosition } : player
      )
    );
    localStorage.setItem(`player-${playerId}-position`, newPosition); // ✅ Store change
  };

  const groupedPlayers = players.reduce((acc, player) => {
    acc[player.bestPosition] = acc[player.bestPosition] || [];
    acc[player.bestPosition].push(player);
    return acc;
  }, {});

  Object.keys(groupedPlayers).forEach((position) => {
    groupedPlayers[position].sort((a, b) => b.bestLevel - a.bestLevel);
  });

  return (
    <div className="app-container">
      <h1>🏉 Blackout Rugby Manager</h1>
      <label>Select Club:</label>
      <select value={clubId} onChange={(e) => setClubId(e.target.value)}>
        {clubOptions.map((club) => (
          <option key={club.id} value={club.id}>
            {club.name}
          </option>
        ))}
      </select>

      <button
        onClick={() => setShowLogic(!showLogic)}
        className="button"
      >
        {showLogic ? "Hide Logic Explanation ▲" : "Show Logic Explanation ▼"}
      </button>

      {showLogic && (
        <div className="expandable-section">
          <h2>📋 Successor Status Logic:</h2>
          <ul>
            <li><strong>Ready:</strong> Level 78+ (can immediately start)</li>
            <li><strong>Almost Ready:</strong> Level 70–77 (ready next season)</li>
            <li><strong>In Development:</strong> Level below 70 (future potential)</li>
          </ul>
        </div>
      )}

      {loading ? (
        <p>Loading players...</p>
      ) : (
        allPositions.map((position) => (
          <div key={position} className="expandable-section">
            <h2>{position}</h2>

            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Age</th>
                  <th>Successor Status</th>
                </tr>
              </thead>
              <tbody>
                {groupedPlayers[position]?.map((player) => (
                  <tr key={player.id}>
                    <td>{player.firstName} {player.lastName}</td>
                    <td>{player.bestLevel}</td>
                    <td>{player.age}</td>
                    <td>{player.successorStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="player-card-grid">
              {groupedPlayers[position]?.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onPositionChange={handlePositionChange}
                  allPositions={allPositions}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default App;
