import asyncio
import httpx
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timezone

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
def root():
    return {"message": "Friendly Match Automation API is running."}

# ✅ API Setup
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYTM1MzE1Yi0zMDRhLTRhZTctOWNmZi1hNmVmYjlhOTYxZGUiLCJjbHVicyI6WyIzYWM4MGRjNy0zYzQ1LTQ5YzUtOWIyYS1lMmM5Yzg5NzIzNDIiLCIzY2VkYzA4NC02NDA3LTRmYzYtYmU5MC1mYmNhYTZmNWVmNjYiXSwic2Vzc2lvbkRhdGEiOnt9LCJkZXZpY2UiOiJub19kZXZpY2VfaWQiLCJzcG9ydCI6InJ1Z2J5IiwiaXNSZWZyZXNoIjp0cnVlLCJpYXQiOjE3NDIzMTM3NjIsImV4cCI6MTc1Nzg2NTc2Mn0.WRaDBa9JJQRKhnKe3fAq0y00VIEX2vw1QgRKTeaCCTU"
BASE_URL = "https://api.blackoutrugby.com/v1/"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}"
}
ALT_HEADERS = {
    "Token": API_KEY,  # ✅ Correct header for Academy & Friendlies API
    "Accept": "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
}


import random

def predict_physical_attribute_growth(player):
    age = player["age"]
    attributes = player["physicalAttributes"]
    position = player["bestPosition"]

    # Training slots per position (from age 21 onwards)
    position_training = {
        "Prop": {"strength": 2, "agility": 2, "power": 2, "endurance": 1},
        "Hooker": {"strength": 2, "coordination": 2, "power": 2, "agility": 1},
        "Lock": {"strength": 2, "agility": 2, "power": 2, "endurance": 1},
        "Flanker": {"strength": 2, "agility": 2, "power": 2, "endurance": 1},
        "No8": {"strength": 2, "agility": 2, "power": 2, "endurance": 1},
        "Scrumhalf": {"acceleration": 2, "agility": 1, "speed": 2, "coordination": 2},
        "Flyhalf": {"acceleration": 2, "agility": 1, "speed": 2, "coordination": 2},
        "Winger": {"speed": 2, "acceleration": 2, "agility": 2, "power": 1},
        "Center": {"speed": 2, "power": 2, "acceleration": 2, "agility": 1},
        "Fullback": {"acceleration": 2, "agility": 1, "speed": 2, "coordination": 2}
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

# Run Prediction of physical attribute growth
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
async def get_academy_prospect(club_id: str = Query(..., description="Club GUID to fetch random clubs for")):

    url = f"{BASE_URL}academy/{club_id}"

    headers = {
        "Token": API_KEY,  # ✅ Correct header for authentication
        "Accept": "application/vnd.api+json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    print("🌍 Blackout API Response:", response.status_code, response.text)  # ✅ Debugging

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch random clubs: {response.text}")

    return response.json()

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

@app.post("/friendlies/start-match")
async def start_friendly_match(request: Request):
    data = await request.json()
    initiator_club = data.get("initiator_club")
    opponent_club = data.get("opponent_club")

    if not initiator_club or not opponent_club:
        raise HTTPException(status_code=400, detail="Missing club IDs")

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

    async with httpx.AsyncClient(headers=ALT_HEADERS, timeout=20.0) as client:
        response = await client.post(url, json=payload)

    print("🔥 Blackout API Response:", response.status_code, response.text)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to start friendly match: {response.text}")

    return response.json()

# ✅ The club ID to run the job for
CLUB_ID = "3ac80dc7-3c45-49c5-9b2a-e2c9c8972342"

# ✅ Track daily friendly matches
friendly_match_counter = 0
ladder_match_counter = 0
last_friendly_reset_date = datetime.now(timezone.utc).date()
last_ladder_reset_date = datetime.now(timezone.utc).date()

# ✅ Automation status (initially off, controlled via FE later)
friendlyAutomationEnabled = False

async def auto_start_friendly():
    global friendly_match_counter, last_friendly_reset_date, friendlyAutomationEnabled

    if not friendlyAutomationEnabled:
        print("🛑 Automation disabled; skipping execution.")
        return

    # ✅ Reset the match counter each day at midnight UTC
    today = datetime.now(timezone.utc).date()
    if today != last_friendly_reset_date:
        friendly_match_counter = 0
        last_friendly_reset_date = today
        print("🔄 Daily match counter reset.")

    # ✅ Limit the number of friendly matches per day
    MAX_MATCHES_PER_DAY = 10
    if friendly_match_counter >= MAX_MATCHES_PER_DAY:
        print("🚫 Maximum daily friendly matches reached.")
        return

    search_url = f"{BASE_URL}friendlies?instant=true&levelRange=63,69&club={CLUB_ID}"

    try:
        async with httpx.AsyncClient(headers=ALT_HEADERS, timeout=20.0) as client:
            # ✅ Corrected variable name
            search_response = await client.get(search_url)

        clubs = search_response.json().get("data", {}).get("relationships", {}).get("clubs", {}).get("data", [])

        if not clubs:
            print("⚠️ No available clubs found.")
            return

        opponent_club = clubs[0]["id"]
        print(f"🤝 Selected opponent: {opponent_club}")

        match_url = f"{BASE_URL}friendlies"
        payload = {
            "data": {
                "type": "friendlies",
                "attributes": {
                    "instant": True,
                    "isTrainingMatch": True,
                    "initiatorClub": CLUB_ID,
                    "opponentClub": opponent_club,
                }
            }
        }

        async with httpx.AsyncClient(headers=ALT_HEADERS, timeout=20.0) as client:
            match_response = await client.post(match_url, json=payload)

        if match_response.status_code == 201:
            friendly_match_counter += 1
            print(f"✅ Friendly match started successfully ({friendly_match_counter}/{MAX_MATCHES_PER_DAY}).")
        else:
            print(f"❌ Failed to start friendly match: {match_response.text}")

    except httpx.ReadTimeout:
        print("⏳ Request to Blackout API timed out.")

# ✅ Fetch ladder clubs near to the current club
@app.get("/ladder/clubs")
async def get_ladder_clubs(club_id: str = Query(..., description="Club GUID to fetch ladder clubs for")):
    """
    Fetches a list of clubs near to the currently selected club in the ladder.
    """
    url = f"{BASE_URL}ladder-clubs?ladder=global&club={club_id}"

    headers = {
        "Accept": "application/vnd.api+json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    print("🌍 Blackout API Response:", response.status_code, response.text)  # ✅ Debugging

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch ladder clubs: {response.text}")

    return response.json()

@app.post("/ladder/start-match")
async def start_ladder_match(request: Request):
    data = await request.json()
    challenger_club = data.get("challenger_club")
    challengee_club = data.get("challengee_club")

    if not challenger_club or not challengee_club:
        raise HTTPException(status_code=400, detail="Missing club IDs")

    url = f"{BASE_URL}ladder-clubs"
    payload = {
        "data": {
            "type": "ladder-clubs",
            "attributes": {
                "challengerId": challenger_club,
                "challengeeId": challengee_club,
                "medpackCard": "LadderMedpack:0"
            }
        }
    }

    async with httpx.AsyncClient(headers=ALT_HEADERS, timeout=20.0) as client:
        response = await client.post(url, json=payload)

    print("🔥 Blackout API Response:", response.status_code, response.text)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Failed to start ladder match: {response.text}")

    return response.json()

async def auto_start_ladder():
    global ladderAutomationEnabled, ladder_match_counter, last_ladder_reset_date

    # clearly control via FE (add FE toggle later if desired)
    ladderAutomationEnabled = True  # Explicitly toggle or manage via frontend later

    if not ladderAutomationEnabled:
        print("🛑 Ladder Automation disabled; skipping execution.")
        return

    today = datetime.now(timezone.utc).date()
    if today != last_ladder_reset_date:
        ladder_match_counter = 0
        last_ladder_reset_date = today
        print("🔄 Daily ladder match counter reset.")

    MAX_LADDER_MATCHES_PER_DAY = 10
    if ladder_match_counter >= MAX_LADDER_MATCHES_PER_DAY:
        print("🚫 Max daily ladder matches reached.")
        return

    search_url = f"{BASE_URL}ladder?club_id={CLUB_ID}"

    try:
        async with httpx.AsyncClient(headers=ALT_HEADERS, timeout=20.0) as client:
            search_response = await client.get(search_url)

        clubs = search_response.json().get("data", [])
        available_clubs = [club for club in clubs if club["attributes"]["isChallengeable"]]

        if not available_clubs:
            print("⚠️ No available ladder clubs found.")
            return

        opponent_club = available_clubs[0]["id"]
        print(f"🤝 Ladder opponent selected: {opponent_club}")

        payload = {
            "data": {
                "type": "ladderMatch",
                "attributes": {
                    "challengerClub": CLUB_ID,
                    "challengeeClub": opponent_club,
                }
            }
        }

        async with httpx.AsyncClient(headers=ALT_HEADERS) as client:
            match_response = await client.post(f"{BASE_URL}ladder-matches", json=payload)

        if match_response.status_code == 201:
            ladder_match_counter += 1
            print(f"✅ Ladder match started ({ladder_match_counter}/{MAX_LADDER_MATCHES_PER_DAY}).")
        else:
            print(f"❌ Ladder match failed: {match_response.text}")

    except Exception as e:
        print(f"❌ Ladder automation exception: {e}")

scheduler = BackgroundScheduler()

async def friendly_task():
    await auto_start_friendly()
    print("Friendly match job executed.")

async def ladder_task():
    await auto_start_ladder()
    print("Ladder match job executed.")

# Helper to run async tasks
def run_async_task(coro):
    asyncio.run(coro())

# Schedule the friendly task every 25 minutes and 30 seconds (full cycle duration)
scheduler.add_job(run_async_task, 'interval', 
                  args=[friendly_task], 
                  minutes=25, seconds=30, 
                  next_run_time=None)  # next_run_time=None starts immediately

# Schedule the ladder task every 25 minutes and 30 seconds, but start it 30 seconds after friendly
from datetime import datetime, timedelta
scheduler.add_job(run_async_task, 'interval', 
                  args=[ladder_task], 
                  minutes=25, seconds=30, 
                  next_run_time=datetime.now() + timedelta(seconds=30))

scheduler.start()

# ✅ API endpoint to manually trigger automation from FE
@app.post("/automation/toggle")
def toggle_automation(state: bool):
    global friendlyAutomationEnabled
    friendlyAutomationEnabled = state
    status = "enabled" if friendlyAutomationEnabled else "disabled"
    print(f"⚙️ Automation {status} via frontend.")
    return {"friendlyAutomationEnabled": friendlyAutomationEnabled}

@app.get("/automation/status")
def get_automation_status():
    return {"friendlyAutomationEnabled": friendlyAutomationEnabled}

@app.post("/friendlies/manual-auto-match")
async def manual_auto_match():
    await auto_start_friendly()
    return {"message": "✅ Friendly match manually triggered"}

@app.post("/ladder/manual-auto-match")
async def manual_auto_match():
    await auto_start_ladder()
    return {"message": "✅ Ladder match manually triggered"}