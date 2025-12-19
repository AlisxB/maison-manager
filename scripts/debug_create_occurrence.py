
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def debug_create():
    # 1. Login as Resident (Alice)
    # Using 'alice' as password based on common dev/demo setup (or checking setup_demo.py if needed, but assuming standard)
    # If this fails, I'll default to Admin which also should trigger it if it's a code/DB issue.
    # Alice: alice@maison.com / alice (Trying this)
    # Actually, let's use Admin, simpler. If standard functionality is broken, it breaks for everyone.
    
    print("Logging in...")
    # Trying Admin login
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@maison.com", "password": "admin"})
    if resp.status_code != 200:
        print(f"Login Failed: {resp.text}")
        return
    token = resp.json()["access_token"]
    
    # 2. Try Create with is_anonymous=True
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "Debug Error 500",
        "description": "Testing is_anonymous field causing 500",
        "category": "Maintenance",
        "is_anonymous": True
    }
    
    print(f"Sending POST /occurrences/ with payload: {payload}")
    resp = requests.post(f"{BASE_URL}/occurrences/", json=payload, headers=headers)
    
    print(f"Status Code: {resp.status_code}")
    print("Response Body:")
    try:
        print(json.dumps(resp.json(), indent=2))
    except:
        print(resp.text)

if __name__ == "__main__":
    debug_create()
