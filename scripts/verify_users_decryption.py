import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "http://localhost:8000/api/v1"

def verify_decryption():
    print("1. Logging in...")
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
        
        print("\n2. Fetching Users...")
        req = urllib.request.Request(f"{BASE_URL}/users/", headers=headers, method="GET")
        with urllib.request.urlopen(req, context=ctx) as r:
            users = json.loads(r.read().decode())
            print(f"Status: {r.status}")
            print(f"Total Users: {len(users)}")
            
            for u in users:
                print(f"User: {u['name']} | Email: {u['email']} | Status: {u['status']} | Role: {u['role']}")
                
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    verify_decryption()
