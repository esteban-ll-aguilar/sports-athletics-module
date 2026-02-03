import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '@modules/auth/utils/roleUtils';
import rolePermissions from '../const/rolePermissions';

/**
 * Componente que redirige al primer elemento del sidebar según el rol del usuario
 * Reemplaza el Dashboard general que aparecía por defecto
 */
const DashboardRedirect = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        const role = getUserRole();
        
        if (role && rolePermissions[role]) {
            const menuItems = rolePermissions[role];
            
            // Buscar el primer item que NO sea '/dashboard'
            const firstItem = menuItems.find(item => item.path !== '/dashboard');
            
            if (firstItem) {
                // Si el item tiene children, redirigir al primer child
                if (firstItem.children && firstItem.children.length > 0) {
                    navigate(firstItem.children[0].path, { replace: true });
                } else {
                    navigate(firstItem.path, { replace: true });
                }
            } else {
                // Si no hay items disponibles, mostrar mensaje o redirigir a perfil
                navigate('/profile', { replace: true });
            }
        } else {
            // Si no hay rol válido, redirigir al login
            navigate('/login', { replace: true });
        }
    }, [navigate]);
    
    // Mostrar un loader mientras se redirige
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b30c25]"></div>
        </div>
    );
};

export default DashboardRedirect;
