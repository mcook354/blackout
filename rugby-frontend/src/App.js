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

  useEffect(() => {
    fetch("https://blackout-it05.onrender.com/players")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setPlayers(data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
        setLoading(false);
      });
  }, []);

  const handlePositionChange = async (playerId, newPosition) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId ? { ...player, bestPosition: newPosition } : player
      )
    );

    try {
      await fetch(`https://blackout-it05.onrender.com/players/${playerId}/update_position`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_position: newPosition }),
      });
    } catch (error) {
      console.error("Failed to update position", error);
    }
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

      <button onClick={() => setShowLogic(!showLogic)} className="button">
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
