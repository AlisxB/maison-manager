import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "http://localhost:8000/api/v1"

def test_create_announcement():
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
        
        print("\n2. Creating Announcement...")
        payload = {
            "title": "Teste de Aviso",
            "description": "Este é um aviso de teste automático.",
            "type": "General", # Assuming this field exists based on typical use
            "is_active": True
        }
        
        req = urllib.request.Request(f"{BASE_URL}/announcements/", data=json.dumps(payload).encode(), headers=headers, method="POST")
        
        with urllib.request.urlopen(req, context=ctx) as r:
            print(f"Status: {r.status}")
            print(f"Response: {r.read().decode()}")
            
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_create_announcement()
