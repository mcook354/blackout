import React, { useState, useEffect } from "react";
import "./Ladders.css";

const Ladders = ({ clubId }) => {
  const [ladderClubs, setLadderClubs] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLadderClubs = async () => {
    if (!clubId) return;

    setLoading(true);
    setStatusMessage("");
    try {
      const response = await fetch(
        `https://blackout-it05.onrender.com/ladder/clubs?club_id=${clubId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch clubs: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("🔹 Ladder Clubs:", data);

      // ✅ Extract club list from response
      const clubs = data.data || [];
      setLadderClubs(clubs.filter((club) => club.attributes.isChallengeable));
    } catch (error) {
      console.error("❌ Error fetching ladder clubs:", error);
      setStatusMessage("❌ Failed to fetch opponents.");
    } finally {
      setLoading(false);
    }
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

      {statusMessage && <p className="status-message">{statusMessage}</p>}

      <button onClick={fetchLadderClubs} className="button">
        Find Opponents
      </button>

      {loading && <p>Loading available clubs...</p>}
      {statusMessage && <p className="status-message">{statusMessage}</p>}

      {ladderClubs.length > 0 ? (
        <div>
          <h3>Select an Opponent:</h3>
          <ul>
            {ladderClubs.map((club, index) => (
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