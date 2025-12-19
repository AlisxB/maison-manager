
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_flow():
    # 1. Login as Admin
    print("Logging in as Admin...")
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@maison.com", "password": "admin"})
    if resp.status_code != 200:
        print(f"Admin Login Failed: {resp.text}")
        return
    token_admin = resp.json()["access_token"]
    print("Admin Token acquired.")

    # 2. Get Occurrences as Admin
    headers_admin = {"Authorization": f"Bearer {token_admin}"}
    resp = requests.get(f"{BASE_URL}/occurrences/", headers=headers_admin)
    print(f"Admin GET /occurrences/ Status: {resp.status_code}")
    print(f"Admin Occurrences: {resp.json()}")

    # 3. Login as Resident (Alice)
    # Note: Alice's password in setup_demo users insert was likely 'alice' or we need to check setup script.
    # checking setup_demo.py content would help, assuming 'alice' for now or 'password123' if default.
    # The setup_demo.py wasn't fully read in my history, only modified.
    # But usually demo passwords are 'alice' for alice@example.com (Wait, alice@example.com was in MOCK, real db uses what?)
    # Let's check the DB users again or assume a standard password. 
    # Actually, I'll stick to Admin first. If Admin sees empty list, that's enough key info.
    
    # Let's try to Create one as Admin (though intended for Resident) just to test Write capability
    print("Creating Occurrence as Admin...")
    new_occ = {
        "title": "Teste API Script",
        "description": "Criado via script Python",
        "category": "Maintenance",
        "photo_url": ""
    }
    resp = requests.post(f"{BASE_URL}/occurrences/", json=new_occ, headers=headers_admin)
    print(f"Create Status: {resp.status_code}")
    if resp.status_code == 200:
        print("Create Success.")
    else:
        print(f"Create Failed: {resp.text}")

    # Read again
    resp = requests.get(f"{BASE_URL}/occurrences/", headers=headers_admin)
    print(f"Admin Occurrences After Create: {len(resp.json())} items")

if __name__ == "__main__":
    test_flow()
