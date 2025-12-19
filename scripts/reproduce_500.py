import urllib.request
import urllib.parse
import json
import ssl

# Ignorar verificação SSL (localhost)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoints():
    print("1. Logging in as Admin...")
    try:
        # Login Data
        data = urllib.parse.urlencode({
            "username": "admin@maison.com",
            "password": "admin"
        }).encode()
        
        req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, method="POST")
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=5) as r:
                resp_json = json.loads(r.read().decode())
                token = resp_json["access_token"]
                print("Login OK. Token obtido.")
        except urllib.error.HTTPError as e:
            print(f"Login Falhou: {e.code} - {e.read().decode()}")
            return

        headers = {"Authorization": f"Bearer {token}"}
        
        print("\n2. Calling GET /users?status=ACTIVE ...")
        # Url Encode params
        params = urllib.parse.urlencode({"status": "ACTIVE"})
        req = urllib.request.Request(f"{BASE_URL}/users/?{params}", headers=headers)
        try:
            with urllib.request.urlopen(req, context=ctx) as r:
                print(f"Status: {r.status}")
                print(f"Body: {r.read().decode()[:200]}...") # truncate
        except urllib.error.HTTPError as e:
            print(f"Endpoint Falhou (/users): {e.code}")
            print(f"Body: {e.read().decode()}")

        print("\n3. Calling GET /notifications/ ...")
        req = urllib.request.Request(f"{BASE_URL}/notifications/", headers=headers)
        try:
            with urllib.request.urlopen(req, context=ctx) as r:
                print(f"Status: {r.status}")
                print(f"Body: {r.read().decode()[:200]}...") # truncate
        except urllib.error.HTTPError as e:
            print(f"Endpoint Falhou (/notifications): {e.code}")
            print(f"Body: {e.read().decode()}")

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_endpoints()
