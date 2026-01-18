import asyncio
from app.core.db.database import _db
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.services.admin_user_service import AdminUserService

async def test_get_users():
    async with _db.get_session_factory()() as session:
        repo = AuthUsersRepository(session)
        service = AdminUserService(repo)
        try:
            print("🔍 Fetching users from service...")
            result = await service.get_all_users()
            print(f"✅ Successfully fetched {len(result['items'])} users")
            
            # Test serialization manually
            from app.modules.auth.domain.schemas.pagination_schema import PaginatedUsers
            print("🧪 Testing Pydantic serialization...")
            paginated = PaginatedUsers.model_validate(result)
            print("✅ Serialization successful")
            
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_get_users())
