import asyncio
import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# ✅ PostgreSQL Connection
DATABASE_URL = "postgresql://blackout_user:d3CtxemBmxcJ0KrMNr9sju9Gap3T5Q2B@dpg-cv02tiggph6c73c6h0hg-a/blackout"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()

# ✅ Allow Frontend Access
origins = [
    "https://blackout-topaz.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Define Database Models
class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    best_position = Column(String)
    age = Column(Integer)
    market_price = Column(Integer)

    statistics = relationship("PlayerStatistics", back_populates="player", uselist=False)

class PlayerStatistics(Base):
    __tablename__ = "player_statistics"
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    friendly_matches = Column(Integer, default=0)
    ladder_matches = Column(Integer, default=0)

    player = relationship("Player", back_populates="statistics")

# ✅ Create Tables if They Don't Exist
Base.metadata.create_all(bind=engine)

# ✅ Blackout API Details
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYTM1MzE1Yi0zMDRhLTRhZTctOWNmZi1hNmVmYjlhOTYxZGUiLCJjbHVicyI6WyIzYWM4MGRjNy0zYzQ1LTQ5YzUtOWIyYS1lMmM5Yzg5NzIzNDIiLCIzY2VkYzA4NC02NDA3LTRmYzYtYmU5MC1mYmNhYTZmNWVmNjYiXSwic2Vzc2lvbkRhdGEiOnt9LCJkZXZpY2UiOiJub19kZXZpY2VfaWQiLCJzcG9ydCI6InJ1Z2J5IiwiaWF0IjoxNzM4MzQwNjE5LCJleHAiOjE3NDA5MzI2MTl9.YxfCDkqHsbBeyi4B7ch0iASXQkZ3OV_KwtLWDWLY_M4"
BASE_URL = "https://api.blackoutrugby.com/v1/"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# ✅ Fetch Player Statistics from Blackout API
async def get_player_statistics(client, player_id):
    stats_url = f"{BASE_URL}player-statistics/{player_id}"
    try:
        response = await client.get(stats_url)
        if response.status_code == 200:
            stats_data = response.json()
            competitions = stats_data.get("data", {}).get("attributes", {}).get("statistics", {}).get("competitions", {})
            return {
                "friendlyMatchesPlayed": competitions.get("friendlyMatchesPlayed", 0),
                "ladderMatchesPlayed": competitions.get("ladderMatchesPlayed", 0),
            }
        return {"friendlyMatchesPlayed": 0, "ladderMatchesPlayed": 0}
    except Exception:
        return {"friendlyMatchesPlayed": 0, "ladderMatchesPlayed": 0}

# ✅ Fetch & Store Players from Blackout API
async def fetch_and_store_players():
    async with httpx.AsyncClient(headers=HEADERS) as client:
        response = await client.get(f"{BASE_URL}players?filter%5Bclub%5D=your_club_id")
        if response.status_code != 200:
            print("Failed to fetch players:", response.text)
            return

        players_data = response.json().get("data", [])
        db = SessionLocal()

        # ✅ Fetch player statistics asynchronously
        tasks = [
            get_player_statistics(client, player.get("id"))
            for player in players_data if player.get("id")
        ]
        stats_list = await asyncio.gather(*tasks)

        # ✅ Store players & statistics in the database
        for player, stats in zip(players_data, stats_list):
            player_id = player["id"]
            existing_player = db.query(Player).filter(Player.id == player_id).first()

            if existing_player:
                existing_player.first_name = player["attributes"]["firstName"]
                existing_player.last_name = player["attributes"]["lastName"]
                existing_player.best_position = player["attributes"]["bestPosition"]
                existing_player.age = player["attributes"]["age"]
                existing_player.market_price = player["attributes"]["marketPrice"]
            else:
                new_player = Player(
                    id=player_id,
                    first_name=player["attributes"]["firstName"],
                    last_name=player["attributes"]["lastName"],
                    best_position=player["attributes"]["bestPosition"],
                    age=player["attributes"]["age"],
                    market_price=player["attributes"]["marketPrice"],
                )
                db.add(new_player)
                existing_player = new_player

            existing_stats = db.query(PlayerStatistics).filter(PlayerStatistics.player_id == player_id).first()
            if existing_stats:
                existing_stats.friendly_matches = stats["friendlyMatchesPlayed"]
                existing_stats.ladder_matches = stats["ladderMatchesPlayed"]
            else:
                new_stats = PlayerStatistics(
                    player_id=player_id,
                    friendly_matches=stats["friendlyMatchesPlayed"],
                    ladder_matches=stats["ladderMatchesPlayed"],
                )
                db.add(new_stats)

        db.commit()
        db.close()

# ✅ Manually Sync Players from Blackout API
@app.get("/sync_players")
async def sync_players(background_tasks: BackgroundTasks):
    background_tasks.add_task(fetch_and_store_players)
    return {"message": "Player data sync started in the background."}

# ✅ Fetch Players from PostgreSQL
@app.get("/players")
def get_players():
    db = SessionLocal()
    players = db.query(Player).all()
    player_list = []

    for player in players:
        player_dict = {
            "id": player.id,
            "firstName": player.first_name,
            "lastName": player.last_name,
            "bestPosition": player.best_position,
            "age": player.age,
            "marketPrice": player.market_price,
            "statistics": {
                "friendlyMatchesPlayed": player.statistics.friendly_matches if player.statistics else 0,
                "ladderMatchesPlayed": player.statistics.ladder_matches if player.statistics else 0
            }
        }
        player_list.append(player_dict)

    db.close()
    return {"data": player_list}

# ✅ Update Player Position
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

# ✅ Automatic Sync Every 6 Hours
async def scheduled_sync():
    while True:
        await fetch_and_store_players()
        await asyncio.sleep(21600)  # 6 hours

@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(scheduled_sync())