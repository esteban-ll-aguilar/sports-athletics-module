import asyncio
import httpx

async def check_api():
    url = "http://localhost:8080/api/v1/atleta/"
    try:
        async with httpx.AsyncClient() as client:
            print(f"GET {url}")
            resp = await client.get(url)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                print(f"Is List? {isinstance(data, list)}")
                if isinstance(data, list) and len(data) > 0:
                    first = data[0]
                    print("First item keys:", first.keys())
                    print("First item external_id:", first.get("external_id"))
                else:
                    print("Empty list or invalid format", data)
            else:
                print("Error response:", resp.text)
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_api())
