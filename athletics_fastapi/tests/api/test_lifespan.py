import asyncio
from app.main import _APP

async def test_lifespan():
    try:
        print("🚀 Starting lifespan test...")
        # Simular el arranque
        async with _APP.router.lifespan_context(_APP) as context:
            print("✅ Lifespan context entered successfully")
        print("✅ Lifespan context exited successfully")
    except Exception:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_lifespan())
