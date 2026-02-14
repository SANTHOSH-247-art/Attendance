import requests
import json

url = 'http://localhost:5000/send-sms'
headers = {'Content-Type': 'application/json'}
data = {
    'to': '+918778311896', # User provided personal number
    'message': 'Test message via local backend wrapper'
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

