
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_announcement():
    print("Logging in as Admin...")
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@maison.com", "password": "admin"})
    if resp.status_code != 200:
        print(f"Login Failed: {resp.text}")
        return
    token = resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing GET /announcements/")
    resp = requests.get(f"{BASE_URL}/announcements/", headers=headers)
    print(f"GET Status: {resp.status_code}")
    if resp.status_code == 200:
        print("GET Success")
    else:
        print(f"GET Failed: {resp.text}")

    print("Testing POST /announcements/")
    payload = {
        "title": "Test Aviso",
        "description": "Test Desc",
        "type": "Aviso",
        "target_audience": "Todos os moradores"
    }
    resp = requests.post(f"{BASE_URL}/announcements/", json=payload, headers=headers)
    print(f"POST Status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"POST Failed: {resp.text}")

if __name__ == "__main__":
    test_announcement()
