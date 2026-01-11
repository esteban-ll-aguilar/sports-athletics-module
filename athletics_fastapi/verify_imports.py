import sys
import os
sys.path.append(os.getcwd())

try:
    from app.modules.auth.routers.v1.user_management_router import user_management_router
    from app.modules.auth.services.admin_user_service import AdminUserService
    from app.modules.auth.domain.schemas import UserRoleUpdate
    from app.modules.auth.dependencies import get_admin_user_service
    print("Imports successful")
except Exception as e:
    print(f"Import error: {e}")
    sys.exit(1)
