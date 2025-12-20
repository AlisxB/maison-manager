import urllib.request
import urllib.parse
import json
import ssl
from datetime import datetime, timedelta

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "http://localhost:8000/api/v1"

def reproduce_block():
    print("1. Logging in as Admin...")
    try:
        data = urllib.parse.urlencode({
            "username": "admin@maison.com",
            "password": "admin"
        }).encode()
        
        req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, method="POST")
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        
        token = ""
        with urllib.request.urlopen(req, context=ctx) as r:
            resp = json.loads(r.read().decode())
            token = resp["access_token"]
            print("Login OK.")
            
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Get a Common Area ID
        print("\n2. Getting Common Area...")
        req = urllib.request.Request(f"{BASE_URL}/common-areas/", headers=headers, method="GET")
        area_id = ""
        with urllib.request.urlopen(req, context=ctx) as r:
            areas = json.loads(r.read().decode())
            if not areas:
                print("FATAL: No common areas found.")
                return
            area_id = areas[0]['id']
            print(f"Using Area: {areas[0]['name']} ({area_id})")

        # Prepare Block Payload
        # Frontend sends: common_area_id, start_time (ISO), end_time (ISO), status='BLOCKED', reason
        today = datetime.now().strftime('%Y-%m-%d')
        start_time = f"{today}T00:00:00.000Z"
        end_time = f"{today}T23:59:59.000Z"
        
        payload = {
            "common_area_id": area_id,
            "start_time": start_time,
            "end_time": end_time,
            "status": "BLOCKED",
            "reason": "Manutencao Teste Script"
        }
        
        print(f"\n3. Sending Block Request for {today}...")
        json_data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}/reservations/", data=json_data, headers=headers, method="POST")
        
        with urllib.request.urlopen(req, context=ctx) as r:
            print(f"Response Status: {r.status}")
            print(f"Response: {r.read().decode()}")
            print("SUCCESS: Block created.")

    except urllib.error.HTTPError as e:
        print(f"FAILED with Error {e.code}")
        print(f"Details: {e.read().decode()}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    reproduce_block()
