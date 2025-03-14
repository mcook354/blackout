import React, { useState, useEffect } from "react";
import "./Ladders.css";

const Ladders = ({ clubId }) => {
  const [ladderClubs, setLadderClubs] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const findOpponents = () => {
    fetch(`https://blackout-it05.onrender.com/ladder/clubs`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Ladder Clubs from BE:", data);
        const clubs = data.data || []; // Corrected exactly here
        setLadderClubs(clubs.filter((club) => club.attributes.isChallengeable)); // Clearly filter here directly
      })
      .catch((err) => console.error("Error fetching ladder clubs:", err));
  };

  const startLadderMatch = async () => {
    if (!selectedOpponent) {
      setStatusMessage("⚠️ Please select an opponent first.");
      return;
    }

    setStatusMessage("⏳ Starting ladder match...");
    try {
      const response = await fetch(
        "https://blackout-it05.onrender.com/ladder/start-match",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/vnd.api+json",
          },
          body: JSON.stringify({
            challenger_club: clubId,
            challengee_club: selectedOpponent,
          }),
        }
      );

      const result = await response.json();
      console.log("🏉 Start Match Response:", result);

      if (response.ok) {
        setStatusMessage("✅ Ladder match started successfully!");
      } else {
        setStatusMessage(`❌ Failed: ${result.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Error starting match:", error);
      setStatusMessage("❌ Error starting ladder match.");
    }
  };

  return (
    <div className="ladder-container">
      <h2>🪜 Instant Ladder Matches</h2>
  
      <button className="ladder-button" onClick={findOpponents}>Find Opponents</button>
  
      {ladderClubs.length > 0 ? (
        <div>
          <h3>Select an Opponent:</h3>
          <ul>
            {ladderClubs.map((club) => (
              <li key={club.id}>
                <input
                  type="radio"
                  name="opponent"
                  value={club.id}
                  onChange={() => setSelectedOpponent(club.id)}
                />
                {club.id} (Rank: {club.attributes.rank})
              </li>
            ))}
          </ul>
          <button onClick={startLadderMatch} disabled={!selectedOpponent} className="button">
            Start Match
          </button>
        </div>
      ) : (
        !loading && <p>No available opponents found.</p>
      )}
    </div>
  );
};

export default Ladders;