import React, { useState } from "react";

const Friendlies = ({ clubId }) => {
  const [opponents, setOpponents] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchRandomClubs = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/friendlies/random-clubs?club_id=${clubId}&instant=true&levelRange=62,68`
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch clubs: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Random Clubs:", data);
      setRandomClubs(data);
    } catch (error) {
      console.error("Error fetching random clubs:", error);
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
