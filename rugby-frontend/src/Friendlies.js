import React, { useState } from "react";

const Friendlies = ({ clubId }) => {
  const [randomClubs, setRandomClubs] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRandomClubs = async () => {
    if (!clubId) return;

    setLoading(true);
    setStatusMessage("");
    try {
      const response = await fetch(
        `https://blackout-it05.onrender.com/friendlies/random-clubs?club_id=${clubId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch clubs: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("🔹 Random Clubs:", data);

      // ✅ Extract club list from response
      const clubs = data?.data?.relationships?.clubs?.data || [];
      setRandomClubs(clubs);
    } catch (error) {
      console.error("❌ Error fetching random clubs:", error);
      setStatusMessage("❌ Failed to fetch opponents.");
    } finally {
      setLoading(false);
    }
  };

  const startFriendlyMatch = async () => {
    if (!selectedOpponent) {
      setStatusMessage("⚠️ Please select an opponent first.");
      return;
    }

    setStatusMessage("⏳ Starting friendly match...");
    try {
      const response = await fetch(
        "https://blackout-it05.onrender.com/friendlies/start-match",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/vnd.api+json",
          },
          body: JSON.stringify({
            initiator_club: clubId,
            opponent_club: selectedOpponent,
          }),
        }
      );

      const result = await response.json();
      console.log("🏉 Start Match Response:", result);

      if (response.ok) {
        setStatusMessage("✅ Friendly match started successfully!");
      } else {
        setStatusMessage(`❌ Failed: ${result.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Error starting match:", error);
      setStatusMessage("❌ Error starting friendly match.");
    }
  };

  return (
    <div className="friendlies-container">
      <h2>⚔️ Instant Friendly Matches</h2>

      <button onClick={fetchRandomClubs} className="button">
        Find Opponents
      </button>

      {loading && <p>Loading available clubs...</p>}
      {statusMessage && <p className="status-message">{statusMessage}</p>}

      {randomClubs.length > 0 ? (
        <div>
          <h3>Select an Opponent:</h3>
          <ul>
            {randomClubs.map((club, index) => (
              <li key={club.id}>
                <input
                  type="radio"
                  name="opponent"
                  value={club.id}
                  onChange={() => setSelectedOpponent(club.id)}
                />
                <label> Club {index + 1}</label>
              </li>
            ))}
          </ul>

          <button onClick={startFriendlyMatch} disabled={!selectedOpponent} className="button">
            Start Match
          </button>
        </div>
      ) : (
        !loading && <p>No available opponents found.</p>
      )}
    </div>
  );
};

export default Friendlies;
