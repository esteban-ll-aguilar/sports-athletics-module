
import { LayoutDashboard, Users, Trophy, Calendar, Activity } from 'lucide-react';

const rolePermissions = {
    ADMINISTRADOR: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/dashboard/users', icon: Users, label: 'Gestión de Roles' },
        { path: '/dashboard/athletes', icon: Users, label: 'Atletas' },
        { path: '/dashboard/competitions', icon: Trophy, label: 'Competencias' },
        { path: '/dashboard/events', icon: Calendar, label: 'Eventos' },
        { path: '/dashboard/results', icon: Activity, label: 'Resultados' },
        { path: '/dashboard/admin', icon: Users, label: 'Administracion' },
        
    ],
    ATLETA: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Atleta' },
    ],
    ENTRENADOR: [
        { path: '/dashboard/results', icon: Activity, label: 'Entrenador' },
    ],
    REPRESENTANTE: [
        { path: '/dashboard/results', icon: Activity, label: 'Representante' },
    ]
}

export default rolePermissions;
