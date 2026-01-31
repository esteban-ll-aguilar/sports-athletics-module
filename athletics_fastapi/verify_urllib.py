import urllib.request
import json

def check():
    url = "http://localhost:8080/api/v1/atleta/"
    try:
        print(f"GET {url}")
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"Status: {response.status}")
            if isinstance(data, list) and len(data) > 0:
                first = data[0]
                print(f"First Item Keys: {list(first.keys())}")
                print(f"First Item external_id: {first.get('external_id')}")
            else:
                 print("Data is empty or not list")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
