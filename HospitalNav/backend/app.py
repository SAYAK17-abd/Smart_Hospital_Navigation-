from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import random
import hashlib

# ✅ CREATE APP FIRST
app = Flask(__name__)
CORS(app)

# ✅ TEST ROUTE
@app.route("/")
def home():
    return "Backend Running ✅"

# ✅ RETRY FUNCTION FOR API CALLS
def detect_hospital_type(name, tags):
    """Detect if hospital is government or private based on name and tags"""
    govt_keywords = ['govt', 'government', 'medical college', 'state', 'municipal', 'public', 'civil', 'district', 'general hospital']
    private_keywords = ['apollo', 'fortis', 'max', 'manipal', 'columbia', 'reliance', 'lilavati', 'global', 'indian', 'cure', 'nursing', 'private', 'care']
    
    name_lower = name.lower()
    
    for keyword in govt_keywords:
        if keyword in name_lower:
            return 'govt'
    
    for keyword in private_keywords:
        if keyword in name_lower:
            return 'private'
    
    # Use hash to consistently assign type for same hospital
    hash_val = int(hashlib.md5(name.encode()).hexdigest(), 16)
    return 'private' if hash_val % 3 == 0 else 'govt'

def get_hospital_speciality(name):
    """Determine hospital speciality based on name"""
    specialities = {
        'eye': ['eye', 'ophthalmology', 'vision', 'retina'],
        'heart': ['cardiology', 'cardiac', 'heart', 'chest'],
        'cancer': ['oncology', 'cancer', 'tumor'],
        'all': []
    }
    
    name_lower = name.lower()
    for spec, keywords in specialities.items():
        if spec != 'all':
            for keyword in keywords:
                if keyword in name_lower:
                    return spec
    
    return 'all'

def get_hospital_rating(name):
    """Generate consistent rating based on name"""
    hash_val = int(hashlib.md5(name.encode()).hexdigest(), 16)
    return round(3.5 + (hash_val % 15) / 10, 1)

# ✅ RETRY FUNCTION FOR API CALLS
def fetch_hospitals_with_retry(lat, lon, max_retries=2):
    """Fetch hospitals from Overpass API with retry logic"""
    
    query = f"""
    [out:json][timeout:10];
    (
      node["amenity"="hospital"](around:15000,{lat},{lon});
      way["amenity"="hospital"](around:15000,{lat},{lon});
      node["amenity"="clinic"](around:15000,{lat},{lon});
      node["healthcare"](around:15000,{lat},{lon});
    );
    out center;
    """
    
    # Try multiple Overpass API endpoints
    urls = [
        "https://lz4.overpass-api.de/api/interpreter",
        "https://overpass-api.de/api/interpreter"
    ]
    
    headers = {"User-Agent": "SmartNav-App"}
    
    for attempt in range(max_retries):
        for url in urls:
            try:
                print(f"🔄 Attempt {attempt+1}/{max_retries} - Trying {url}")
                
                # Use POST with shorter timeout for better UX
                res = requests.post(url, data={"data": query}, headers=headers, timeout=15)
                res.raise_for_status()
                
                data = res.json()
                hospitals = []
                
                for el in data.get("elements", []):
                    if "lat" in el:
                        lat_ = el["lat"]
                        lon_ = el["lon"]
                    else:
                        lat_ = el["center"]["lat"]
                        lon_ = el["center"]["lon"]
                    
                    name = el.get("tags", {}).get("name", "Hospital")
                    tags = el.get("tags", {})
                    
                    # ✅ Add type, speciality, and rating
                    hospital_type = detect_hospital_type(name, tags)
                    speciality = get_hospital_speciality(name)
                    rating = get_hospital_rating(name)
                    
                    hospitals.append({
                        "id": hashlib.md5(name.encode()).hexdigest()[:12],
                        "name": name,
                        "lat": lat_,
                        "lon": lon_,
                        "type": hospital_type,
                        "speciality": speciality,
                        "rating": rating
                    })
                
                print(f"✅ Hospitals found: {len(hospitals)}")
                return hospitals
                
            except requests.exceptions.Timeout:
                print(f"⏱️ Timeout from {url}")
                continue
            except Exception as e:
                print(f"❌ Error from {url}: {e}")
                continue
        
        if attempt < max_retries - 1:
            wait_time = 1  # Reduced wait time
            print(f"⏳ Waiting {wait_time}s before retry...")
            time.sleep(wait_time)
    
    return []

# ✅ HOSPITAL API
@app.route("/hospitals", methods=["POST"])
def hospitals():
    try:
        data = request.json
        lat = data["lat"]
        lon = data["lng"]
        
        hospitals = fetch_hospitals_with_retry(lat, lon)
        return jsonify(hospitals)

    except Exception as e:
        print(f"❌ ERROR: {e}")
        return jsonify([])

# ✅ RUN SERVER
if __name__ == "__main__":
    app.run(debug=True)