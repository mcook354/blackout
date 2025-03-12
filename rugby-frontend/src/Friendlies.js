import React, { useState } from "react";

const Friendlies = ({ clubId }) => {
  const [opponents, setOpponents] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchRandomClubs = async () => {
    setStatusMessage("Loading...");
    try {
      const response = await fetch(`/friendlies/random-clubs?club_id=${clubId}&min_level=62&max_level=68`);
      const data = await response.json();
      if (data && data.data) {
        setOpponents(data.data);
        setStatusMessage("");
      } else {
        setStatusMessage("No opponents found.");
      }
    } catch (error) {
      setStatusMessage("Error fetching opponents.");
    }
  };

  const startFriendlyMatch = async () => {
    if (!selectedOpponent) return;
    
    setStatusMessage("Starting friendly match...");
    try {
      const response = await fetch("/friendlies/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiator_club: clubId,
          opponent_club: selectedOpponent,
          home_lineup: "your_home_lineup_id_here"
        })
      });

      const result = await response.json();
      if (response.ok) {
        setStatusMessage("✅ Friendly match started successfully!");
      } else {
        setStatusMessage(`❌ Failed: ${result.detail}`);
      }
    } catch (error) {
      setStatusMessage("❌ Error starting friendly match.");
    }
  };

  return (
    <div className="friendlies-container">
      <h2>Instant Friendly Matches</h2>
      
      <button onClick={fetchRandomClubs}>Find Opponents</button>
      {statusMessage && <p>{statusMessage}</p>}

      {opponents.length > 0 && (
        <ul>
          {opponents.map((club) => (
            <li key={club.id}>
              <input
                type="radio"
                name="opponent"
                value={club.id}
                onChange={() => setSelectedOpponent(club.id)}
              />
              {club.attributes.name}
            </li>
          ))}
        </ul>
      )}

      <button onClick={startFriendlyMatch} disabled={!selectedOpponent}>
        Start Match
      </button>
    </div>
  );
};

export default Friendlies;
