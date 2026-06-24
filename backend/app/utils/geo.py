"""
Rakshak AI - Geospatial Utilities

Coordinate processing and distance calculations.
"""

from typing import Tuple


def make_geojson_point(lat: float, lng: float) -> dict:
    """Create a GeoJSON Point object."""
    return {
        "type": "Point",
        "coordinates": [lng, lat],  # GeoJSON uses [lng, lat] order
    }


def haversine_distance(
    coord1: Tuple[float, float],
    coord2: Tuple[float, float],
) -> float:
    """Calculate haversine distance between two lat/lng points in kilometers."""
    import math

    lat1, lon1 = coord1
    lat2, lon2 = coord2

    R = 6371  # Earth's radius in km

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


# Major Indian city coordinates for seeding
INDIAN_CITIES = {
    "Delhi": {"lat": 28.6139, "lng": 77.2090, "state": "Delhi"},
    "Mumbai": {"lat": 19.0760, "lng": 72.8777, "state": "Maharashtra"},
    "Bangalore": {"lat": 12.9716, "lng": 77.5946, "state": "Karnataka"},
    "Hyderabad": {"lat": 17.3850, "lng": 78.4867, "state": "Telangana"},
    "Chennai": {"lat": 13.0827, "lng": 80.2707, "state": "Tamil Nadu"},
    "Kolkata": {"lat": 22.5726, "lng": 88.3639, "state": "West Bengal"},
    "Pune": {"lat": 18.5204, "lng": 73.8567, "state": "Maharashtra"},
    "Jaipur": {"lat": 26.9124, "lng": 75.7873, "state": "Rajasthan"},
    "Lucknow": {"lat": 26.8467, "lng": 80.9462, "state": "Uttar Pradesh"},
    "Ahmedabad": {"lat": 23.0225, "lng": 72.5714, "state": "Gujarat"},
    "Kanpur": {"lat": 26.4499, "lng": 80.3319, "state": "Uttar Pradesh"},
    "Nagpur": {"lat": 21.1458, "lng": 79.0882, "state": "Maharashtra"},
    "Indore": {"lat": 22.7196, "lng": 75.8577, "state": "Madhya Pradesh"},
    "Bhopal": {"lat": 23.2599, "lng": 77.4126, "state": "Madhya Pradesh"},
    "Patna": {"lat": 25.6093, "lng": 85.1376, "state": "Bihar"},
    "Chandigarh": {"lat": 30.7333, "lng": 76.7794, "state": "Chandigarh"},
    "Coimbatore": {"lat": 11.0168, "lng": 76.9558, "state": "Tamil Nadu"},
    "Thiruvananthapuram": {"lat": 8.5241, "lng": 76.9366, "state": "Kerala"},
    "Guwahati": {"lat": 26.1445, "lng": 91.7362, "state": "Assam"},
    "Visakhapatnam": {"lat": 17.6868, "lng": 83.2185, "state": "Andhra Pradesh"},
}
