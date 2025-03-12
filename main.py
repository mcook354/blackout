import asyncio
import httpx
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
def read_root():
    return {"message": "CORS fixed!"}

# ✅ API Setup
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYTM1MzE1Yi0zMDRhLTRhZTctOWNmZi1hNmVmYjlhOTYxZGUiLCJjbHVicyI6WyIzYWM4MGRjNy0zYzQ1LTQ5YzUtOWIyYS1lMmM5Yzg5NzIzNDIiLCIzY2VkYzA4NC02NDA3LTRmYzYtYmU5MC1mYmNhYTZmNWVmNjYiXSwic2Vzc2lvbkRhdGEiOnt9LCJkZXZpY2UiOiJub19kZXZpY2VfaWQiLCJzcG9ydCI6InJ1Z2J5IiwiaXNSZWZyZXNoIjp0cnVlLCJpYXQiOjE3NDExMDY2NjAsImV4cCI6MTc1NjY1ODY2MH0.gpXlsXtOQYSxDT2IytAScE1mgOP_kvfVkJbNWNpXQz4"
BASE_URL = "https://api.blackoutrugby.com/v1/"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}"
}
ALT_HEADERS = {
    "Token": API_KEY,  # ✅ Correct header for Academy & Friendlies API
    "Accept": "application/vnd.api+json"
}


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
async def get_players(club_id: str = Query(..., description="Club GUID to fetch players for")):
    players_url = f"{BASE_URL}players?filter%5Bclub%5D={club_id}"

    async with httpx.AsyncClient(headers=HEADERS) as client:
        response = await client.get(players_url)

        if response.status_code != 200:
            return {"error": "Failed to fetch player data"}
        
        print("🌍 Blackout API Response:", response.status_code, response.text)  # ✅ Debugging

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
        
@app.get("/academy")
async def get_academy_prospect(club_id: str = Query(..., description="Club GUID to fetch academy data for")):
    """
    Fetches the current academy prospect for a given club ID.
    Converts skill XP to levels before returning.
    """
    academy_url = f"{BASE_URL}academy/{club_id}"

    async with httpx.AsyncClient(headers=ALT_HEADERS) as client:
        response = await client.get(academy_url)

    if response.status_code != 200:
        print(f"Academy API Error {response.status_code}: {response.text}")  # ✅ Log error response
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch academy prospect data")

    data = response.json()
    print("🔍 Academy API Response:", data)  # ✅ Log full API response for debugging

    try:
        prospect_data = data["data"]["attributes"].get("newProspect")

        if not prospect_data:
            print("⚠️ No active academy prospect found.")
            raise HTTPException(status_code=404, detail="No active academy prospect found")

        skills_xp = prospect_data["player"]["skills"]

        # ✅ Convert XP to Levels
        converted_skills = {skill: xp_to_level(xp) for skill, xp in skills_xp.items()}

        return {"clubId": club_id, "skills": converted_skills}

    except KeyError as e:
        print("❌ Error Processing Academy Data:", e)  # ✅ Debugging log
        raise HTTPException(status_code=500, detail="Invalid academy prospect data format")


def xp_to_level(xp: int) -> int:
    """ Converts skill XP into a skill level based on predefined XP thresholds. """
    xp_table = [
        (980, 9), (1130, 10), (1290, 11), (1462, 12), (1645, 13), (1839, 14),
        (2043, 15), (2259, 16), (2485, 17), (2722, 18), (2970, 19), (3230, 20),
        (3500, 21), (3780, 22), (4072, 23), (4375, 24), (4689, 25), (5013, 26),
        (5349, 27), (5695, 28), (6052, 29), (6420, 30), (6800, 31), (7190, 32),
        (7590, 33), (8002, 34), (8425, 35), (8859, 36), (9303, 37), (9759, 38),
        (10225, 39), (10702, 40), (11190, 41), (11690, 42), (12200, 43), (12720, 44),
        (13252, 45)
    ]

    level = 9
    for threshold, lvl in xp_table:
        if xp >= threshold:
            level = lvl
        else:
            break
    return level

# ✅ Fetch 5 random clubs for an Instant Friendly
@app.get("/friendlies/random-clubs")
async def get_random_clubs(club_id: str = Query(..., description="Club GUID to fetch random clubs for")):
    """
    Fetches a list of up to 5 random clubs that can be challenged for an instant friendly.
    """
    url = f"{BASE_URL}friendlies"

    headers = {
        "Token": API_KEY,  # ✅ Correct header for authentication
        "Accept": "application/vnd.api+json"
    }

    params = {
        "instant": "true",
        "levelRange": "62,68",
        "club": club_id  # ✅ Pass the club_id as a query param
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)

    print("🌍 Blackout API Response:", response.status_code, response.text)  # ✅ Debugging

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch random clubs: {response.text}")

    return response.json()


# ✅ Initiate an Instant Friendly Match
@app.post("/friendlies/start")
async def start_friendly(initiator_club: str, opponent_club: str):
    url = f"{BASE_URL}friendlies"
    
    payload = {
        "data": {
            "type": "friendlies",
            "attributes": {
                "instant": "true",
                "isTrainingMatch": "true",
                "initiatorClub": initiator_club,
                "opponentClub": opponent_club
            }
        }
    }
    
    async with httpx.AsyncClient(headers=ALT_HEADERS) as client:
        response = await client.post(url, json=payload)

    print("Blackout API Response:", response.status_code, response.text)  # ✅ Debugging

    if response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail="Failed to start friendly match")

    return response.json()  # Send confirmation back to FE