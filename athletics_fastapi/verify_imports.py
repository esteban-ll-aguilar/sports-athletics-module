import sys
import os
sys.path.append(os.getcwd())

try:
    from app.modules.admin.routers.v1.user_management_router import user_management_router
    from app.modules.admin.services.admin_user_service import AdminUserService
    from app.modules.admin.domain.schemas.user_role_schema import UserRoleUpdate
    from app.modules.admin.dependencies import get_admin_user_service
    print("Imports successful")
except Exception as e:
    print(f"Import error: {e}")
    sys.exit(1)
