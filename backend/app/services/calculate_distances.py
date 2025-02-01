from math import radians, sin, cos, sqrt, atan2

def compute_distance(lat1, lon1, lat2, lon2):
    # Earth radius (km)
    R = 6371.0

    # Convert latitude and longitude: degrees --> radians
    rad_lat1 = radians(lat1)
    rad_lon1 = radians(lon1)
    rad_lat2 = radians(lat2)
    rad_lon2 = radians(lon2)

    # differences
    dlat = rad_lat2 - rad_lat1
    dlon = rad_lon2 - rad_lon1

    # Haversine
    a = sin(dlat / 2)**2 + cos(rad_lat1) * cos(rad_lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    # Distance in km
    distance_km = R * c

    return distance_km