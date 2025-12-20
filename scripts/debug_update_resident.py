
import requests
import json
import logging

# Config
BASE_URL = "http://localhost:8000/api/v1"
LOGIN_DATA = {"username": "admin@maison.com", "password": "admin"} # Password from verify script
# Or use the new password if reset? admin/admin based on walkthrough.

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def login():
    try:
        logging.info("Logging in...")
        resp = requests.post(f"{BASE_URL}/auth/login", data=LOGIN_DATA)
        if resp.status_code != 200:
            logging.error(f"Login Failed: {resp.status_code} {resp.text}")
            return None
        return resp.json()["access_token"]
    except Exception as e:
        logging.error(f"Login failed bad: {e}")
        return None

def get_first_resident(token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/users/", headers=headers, params={"limit": 50})
    if resp.status_code != 200:
        logging.error(f"Failed to list users: {resp.status_code} {resp.text}")
        return None
    
    users = resp.json()
    for u in users:
        # Check role. Assuming 'role' is in response
        if u.get("role") == "RESIDENT":
            return u
    return None

def update_resident(token, user):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # Simulate Frontend Payload
    # payload = {
    #     name: residentForm.name,
    #     email: residentForm.email,
    #     phone: residentForm.phone,
    #     role: 'RESIDENT',
    #     profile_type: 'TENANT',
    #     unit_id: targetUnit?.id,
    #     password: ... (omitted if edit)
    # }
    
    payload = {
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone") or "11999999999", # Ensure Phone
        "role": "RESIDENT",
        "profile_type": user.get("profile_type") or "TENANT",
        "unit_id": user.get("unit_id") or user.get("unit", {}).get("id"),
        # "password": "" # Omitted intentionally for edit test
    }
    
    # We strip None unit_id if not present to simulate "undefined" not sent?
    # No, python requests requires dict.
    # If unit_id is None, we send json null.
    
    logging.info(f"Attempting Update on User {user['id']}")
    logging.info(f"Payload: {json.dumps(payload, indent=2)}")
    
    resp = requests.put(f"{BASE_URL}/users/{user['id']}", headers=headers, json=payload)
    
    logging.info(f"Response Status: {resp.status_code}")
    logging.info(f"Response Body: {resp.text}")

def main():
    token = login()
    if not token:
        return
    
    resident = get_first_resident(token)
    if not resident:
        logging.error("No resident found to update")
        return
        
    update_resident(token, resident)

if __name__ == "__main__":
    main()
