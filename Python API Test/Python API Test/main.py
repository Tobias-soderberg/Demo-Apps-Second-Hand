from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import requests
from geopy.geocoders import Nominatim

app = FastAPI()

# Enable Cross-Origin Resource Sharing (CORS) to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a model representing a second-hand store
class Store(BaseModel):
    name: Optional[str] = "Unnamed Store"  # Default name if not provided
    latitude: float  # Latitude coordinate of the store
    longitude: float  # Longitude coordinate of the store
    type: Optional[str] = "second_hand"  # Default type of store

# Define a response model for store search API
class StoreResponse(BaseModel):
    city: str  # City name
    total_stores: int  # Count of found stores
    stores: List[Store]  # List of stores found

# Function to fetch city coordinates using OpenStreetMap API
def get_city_coordinates(city_name):
    url = f"https://nominatim.openstreetmap.org/search?q={city_name}&format=json"
    headers = {"User-Agent": "MySecondHandStoreApp/1.0 (contact@myemail.com)"}  # Custom header to prevent blocking

    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()  # Raise an error for bad responses (4xx, 5xx)
        data = response.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])  # Extract latitude and longitude
    except Exception as e:
        print(f"Error fetching city coordinates: {e}")
    return None, None  # Return None if fetching fails

# Function to fetch second-hand stores near a location using Overpass API
def get_second_hand_stores(lat, lon, radius):
    print(f"Searching stores within a {radius}-meter radius")
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    # Search for all data that has the tag shop with the values "second_hand", "charity" or "thrift" 
    # around a radius from a specific coordinate
    query = f"""
    [out:json];
    (
    node["shop"~"second_hand|charity|thrift"](around:{radius},{lat},{lon});
    );
    out body;
    """

    try:
        response = requests.get(overpass_url, params={'data': query}, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get("elements"):
            return data  # Return fetched store data
        else:
            print(f"No stores found near ({lat}, {lon})")
            return {"error": "No stores found"}
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return {"error": "Overpass API request failed"}
    except requests.exceptions.JSONDecodeError:
        print("Error: Overpass API returned invalid JSON")
        return {"error": "Invalid JSON response"}


# -------------------- API Endpoint: Search second-hand stores by city name ----------------------------------
    
@app.get("/api/stores/{city}")
def search_stores(city: str, radius: int = Query(5000, ge=5000, le=50000)):
    
    # Retrieves second-hand stores within a specified radius around the given city.
    # Default search radius: 5000 meters (minimum), 50000 meters (maximum).
    
    print(f"Received request for city: {city} with radius: {radius} meters")
    
    lat, lon = get_city_coordinates(city)
    if not lat or not lon:
        return JSONResponse(content={"error": "City not found or API failed"}, status_code=404)
    
    stores = get_second_hand_stores(lat, lon, radius)
    
    debug_message = "Store search executed successfully"
    
    response_content = {
        "latitude": lat,
        "longitude": lon,
        "stores": stores,
        "debug_message": debug_message  # Include debug message in response
    }
    
    return JSONResponse(content=response_content, status_code=200)

# Prevent unnecessary 404 errors for /favicon.ico in browser requests
@app.get("/favicon.ico")
async def favicon():
    return {"message": "No favicon available"}

"""
Configuration:

You have to install python on your computer, can do via the microsoft app store.
Another way to get Python is to type "python" in the terminal and you will be redirected to the store.

You need to setup an environment within visual studio. To do this go to: "View -> Other Windows -> Python Environment"
Here you need to create an environment. I recommend picking the first option or look at a tutorial.

To activate the environment:

Go to the folder where your \env is located...
cd '.\Python API Test\'

Activate the environment:
.\env\Scripts\Activate

Then you have to run commands to install some python packages:

For all in one line: (If you get error, do them one by one to see where it doesn't work)

pip install fastapi uvicorn pydantic requests geopy

pip install geopy
pip install fastapi
pip install fastapi[all]
pip install requests
pip install uvicorn
pip install pydantic

To run the server: use the command

python uvicorn main:app --reload

If you close down your program you will need to activate the environment again, go to your specific folder and run:
.\env\Scripts\Activate

"""