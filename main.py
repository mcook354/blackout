import asyncio
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ✅ Replace with your actual Render PostgreSQL URL
DATABASE_URL = "postgresql://blackout_user:d3CtxemBmxcJ0KrMNr9sju9Gap3T5Q2B@dpg-cv02tiggph6c73c6h0hg-a/blackout"

# ✅ Set up the database connection
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()

# ✅ Explicitly list your frontend URL(s)
origins = [
    "https://blackout-topaz.vercel.app",  # ✅ Frontend on Vercel
    "http://localhost:3000",              # ✅ Local Development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 🔥 Only allow frontend and local dev
    allow_credentials=True,
    allow_methods=["*"],  # 🔥 Allow all HTTP methods
    allow_headers=["*"],  # 🔥 Allow all headers
)

# ✅ Add Player model BELOW the database setup and BEFORE API endpoints
class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    best_position = Column(String)
    age = Column(Integer)
    market_price = Column(Integer)

# ✅ Create tables in PostgreSQL (only runs if tables don't exist)
Base.metadata.create_all(bind=engine)

# ✅ Check that the BE is running
@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

# ✅ Fetch all players
@app.get("/players")
def get_players():
    db = SessionLocal()
    players = db.query(Player).all()
    db.close()
    return {"data": players}

# ✅ Add a new player
class PlayerCreate(BaseModel):
    first_name: str
    last_name: str
    best_position: str
    age: int
    market_price: int

@app.post("/players")
def add_player(player: PlayerCreate):
    db = SessionLocal()
    new_player = Player(**player.dict())
    db.add(new_player)
    db.commit()
    db.refresh(new_player)
    db.close()
    return {"message": "Player added", "player": new_player}

# ✅ Update player position
class PositionUpdate(BaseModel):
    new_position: str

@app.put("/players/{player_id}/update_position")
def update_position(player_id: int, update: PositionUpdate):
    db = SessionLocal()
    player = db.query(Player).filter(Player.id == player_id).first()

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player.best_position = update.new_position
    db.commit()
    db.refresh(player)
    db.close()

    return {"message": "Position updated", "player": player}

# ✅ API Setup
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYTM1MzE1Yi0zMDRhLTRhZTctOWNmZi1hNmVmYjlhOTYxZGUiLCJjbHVicyI6WyIzYWM4MGRjNy0zYzQ1LTQ5YzUtOWIyYS1lMmM5Yzg5NzIzNDIiLCIzY2VkYzA4NC02NDA3LTRmYzYtYmU5MC1mYmNhYTZmNWVmNjYiXSwic2Vzc2lvbkRhdGEiOnt9LCJkZXZpY2UiOiJub19kZXZpY2VfaWQiLCJzcG9ydCI6InJ1Z2J5IiwiaWF0IjoxNzM4MzQwNjE5LCJleHAiOjE3NDA5MzI2MTl9.YxfCDkqHsbBeyi4B7ch0iASXQkZ3OV_KwtLWDWLY_M4"
BASE_URL = "https://api.blackoutrugby.com/v1/"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

import random

def predict_physical_attribute_growth(player):
    age = player["age"]
    attributes = player["physicalAttributes"]
    position = player["bestPosition"]

    # Training slots per position (from age 21 onwards)
    position_training = {
        "Prop": {"strength": 2, "agility": 2, "power": 2, "endurance": 1},
        "Hooker": {"strength": 2, "agility": 2, "power": 2, "endurance": 1},
        "Lock": {"strength": 2, "agility": 2, "power": 2, "endurance": 1},
        "Flanker": {"strength": 2, "agility": 2, "power": 2, "endurance": 1},
        "No8": {"strength": 2, "agility": 2, "power": 2, "endurance": 1},
        "Scrumhalf": {"acceleration": 2, "agility": 1, "speed": 2, "coordination": 2},
        "Flyhalf": {"acceleration": 2, "agility": 1, "speed": 2, "coordination": 2},
        "Winger": {"speed": 3, "acceleration": 2, "agility": 2},
        "Center": {"speed": 2, "power": 2, "acceleration": 2, "agility": 1}
    }

    training_slots = position_training.get(position, {attr: 1 for attr in attributes.keys()})

    training_multipliers = {
        (18, 20): 2.0,
        (21, 22): 2.0,
        (23, 28): 1.0
    }

    slot_gains = {
        1: (6, 9), 2: (8, 11), 3: (10, 13), 4: (12, 15), 5: (14, 17), 6: (16, 19), 7: (18, 21)
    }

    matches_per_day = 6  

    projected_attributes = {}

    for attr in attributes.keys():
        current_min = attributes[attr]
        current_max = attributes[attr]
        slots = training_slots.get(attr, 1)
        daily_gain_range = slot_gains.get(slots, (6, 9))

        for future_age in range(age, 29):
            training_multiplier = next((m for (low, high), m in training_multipliers.items() if low <= future_age <= high), 1.0)
            min_training_gain = (daily_gain_range[0] * 0.01) * 28 * training_multiplier
            max_training_gain = (daily_gain_range[1] * 0.01) * 28 * training_multiplier
            match_min_gain = (6 * 0.01) * 0.1 * matches_per_day * 28 * training_multiplier
            match_max_gain = (9 * 0.01) * 0.1 * matches_per_day * 28 * training_multiplier

            if future_age <= 22:
                min_gain = min_training_gain + match_min_gain
                max_gain = max_training_gain + match_max_gain
            else:
                min_gain = min_training_gain
                max_gain = max_training_gain
                
                # Apply birthday increases
            if future_age <= 28:
                if 19 <= future_age <= 22:
                    birthday_increase = sum(random.choices([0, 1, 2, 3, 4], weights=[0.5, 0.4, 0.1, 0, 0], k=1))
                else:
                    birthday_increase = sum(random.choices([0, 1, 2], weights=[0.5, 0.4, 0.1], k=1))
                min_gain += birthday_increase
                max_gain += birthday_increase

            current_min = min(current_min + min_gain, 100)
            current_max = min(current_max + max_gain, 100)

        projected_attributes[attr] = {"min": round(current_min, 2), "max": round(current_max, 2)}

    return projected_attributes

# Example Player Data
player_example = {
    "age": 19,
    "bestPosition": "Prop",
    "physicalAttributes": {
        "strength": 50,
        "agility": 40,
        "power": 45,
        "endurance": 38,
        "acceleration": 30,
        "speed": 35,
        "coordination": 33
    }
}

# Run Prediction
predicted_attributes = predict_physical_attribute_growth(player_example)
print("Predicted Physical Attributes at Age 29:", predicted_attributes)

# ✅ Async function to fetch player statistics
async def get_player_statistics(client, player_id):
    stats_url = f"{BASE_URL}player-statistics/{player_id}"
    try:
        response = await client.get(stats_url)
        if response.status_code == 200:
            stats_data = response.json()
            competitions = (
                stats_data.get("data", {}).get("attributes", {}).get("statistics", {}).get("competitions", {})
            )
            return {
                "friendlyMatchesPlayed": competitions.get("friendlyMatchesPlayed", 0),
                "ladderMatchesPlayed": competitions.get("ladderMatchesPlayed", 0),
            }
        else:
            return {"friendlyMatchesPlayed": 0, "ladderMatchesPlayed": 0}
    except Exception:
        return {"friendlyMatchesPlayed": 0, "ladderMatchesPlayed": 0}

# ✅ Async endpoint to fetch players and their stats in parallel
@app.get("/players")
async def get_players():
    players_url = f"{BASE_URL}players?filter%5Bclub%5D=3ac80dc7-3c45-49c5-9b2a-e2c9c8972342"

    async with httpx.AsyncClient(headers=HEADERS) as client:
        response = await client.get(players_url)

        if response.status_code != 200:
            return {"error": "Failed to fetch player data"}

        players_data = response.json().get("data", [])

        # ✅ Fetch player statistics asynchronously
        tasks = [
            get_player_statistics(client, player.get("id"))
            for player in players_data if player.get("id")
        ]
        stats_list = await asyncio.gather(*tasks)

        # ✅ Merge stats with player data & add predicted physical attributes
        for player, stats in zip(players_data, stats_list):
            player["statistics"] = stats

            # ✅ Predict only for players aged ≤ 25
            if player["attributes"]["age"] <= 25:
                player["attributes"]["predictedPhysicalAttributes"] = predict_physical_attribute_growth({
                    "age": player["attributes"]["age"],
                    "bestPosition": player["attributes"].get("bestPosition", "Unknown"),
                    "physicalAttributes": player["attributes"]["physicalAttributes"]
                })

        return {"data": players_data}
