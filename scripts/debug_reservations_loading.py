import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "http://localhost:8000/api/v1"

def debug_loading():
    print("1. Logging in...")
    try:
        data = urllib.parse.urlencode({
            "username": "admin@maison.com",
            "password": "admin"
        }).encode()
        
        req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, method="POST")
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        
        with urllib.request.urlopen(req, context=ctx) as r:
            resp = json.loads(r.read().decode())
            token = resp["access_token"]
            print("Login OK.")
            
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print("\n2. Fetching Common Areas...")
        req = urllib.request.Request(f"{BASE_URL}/common-areas/", headers=headers, method="GET")
        with urllib.request.urlopen(req, context=ctx) as r:
            areas = json.loads(r.read().decode())
            print(f"Status: {r.status}")
            print(f"Count: {len(areas)}")
            if len(areas) > 0:
                print(f"First Area: {areas[0]['name']} (ID: {areas[0]['id']})")
            else:
                print("WARNING: No common areas found.")

        print("\n3. Fetching Users (Residents)...")
        req = urllib.request.Request(f"{BASE_URL}/users/", headers=headers, method="GET")
        with urllib.request.urlopen(req, context=ctx) as r:
            users = json.loads(r.read().decode())
            print(f"Status: {r.status}")
            print(f"Count: {len(users)}")
            if len(users) > 0:
                print(f"First User: {users[0]['name']}")
            else:
                print("WARNING: No users found.")

        print("\n4. Fetching Reservations...")
        req = urllib.request.Request(f"{BASE_URL}/reservations/", headers=headers, method="GET")
        with urllib.request.urlopen(req, context=ctx) as r:
            reservations = json.loads(r.read().decode())
            print(f"Status: {r.status}")
            print(f"Count: {len(reservations)}")
                
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    debug_loading()
