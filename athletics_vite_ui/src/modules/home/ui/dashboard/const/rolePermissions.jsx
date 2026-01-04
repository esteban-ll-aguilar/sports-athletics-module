
import { LayoutDashboard, Users, Trophy, Calendar, Activity } from 'lucide-react';

const rolePermissions = {
    ADMINISTRADOR: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/dashboard/users', icon: Users, label: 'Gestión de Roles' },
        { path: '/dashboard/athletes', icon: Users, label: 'Atletas' },
        { path: '/dashboard/events', icon: Calendar, label: 'Eventos' },
        { path: '/dashboard/admin', icon: Users, label: 'Administracion' },
        
    ],
    ATLETA: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Atleta' },
       
    ],
    ENTRENADOR: [
        { path: '/dashboard/pruebas', icon: Users, label: 'Gestion de Pruebas' },
        { path: '/dashboard/competitions', icon: Trophy, label: 'Gestión de Competencias' },
        { path: '/dashboard/results', icon: Activity, label: 'Resultados' },
        { path: '/dashboard/athletes', icon: Users, label: 'Atletas' },
        
    ],
    REPRESENTANTE: [
        { path: '/dashboard/results', icon: Activity, label: 'Representante' },
    ]
}

export default rolePermissions;
