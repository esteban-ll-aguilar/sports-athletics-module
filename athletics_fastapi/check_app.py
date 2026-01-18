try:
    from app.main import _APP
    print("✅ Successfully imported _APP")
except Exception as e:
    import traceback
    traceback.print_exc()
