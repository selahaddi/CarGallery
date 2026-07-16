import requests
import json

payload = {
    "customer": {
        "name": "Test User",
        "email": "test@test.com",
        "phone": "123456"
    },
    "car": {
        "title": "This is a very very very very very very very very very very very long model name that should definitely wrap and increase the box height to test the dynamic logic.",
        "price": 35000,
        "down_payment": 5000,
        "monthly_rate": 350,
        "term_months": 48,
        "interest_rate": 3.8
    }
}

try:
    response = requests.post('http://localhost:8000/webhook/generate-pdf', json=payload)
    if response.status_code == 200:
        with open('test_output.pdf', 'wb') as f:
            f.write(response.content)
        print("Success! PDF saved to test_output.pdf")
    else:
        print("Error:", response.status_code, response.text)
except Exception as e:
    print("Exception:", e)
