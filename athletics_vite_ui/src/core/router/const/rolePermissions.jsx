import { LayoutDashboard, Users, Trophy, Calendar,Activity } from 'lucide-react';

const rolePermissions = {
    ADMINISTRADOR: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/dashboard/users', icon: Users, label: 'Gestión de Roles' },
        { path: '/dashboard/athletes', icon: Users, label: 'Atletas' },
        { path: '/dashboard/admin', icon: Users, label: 'Administración' },
        { path: '/dashboard/registro-pruebas', icon: Users, label: 'Gestión de Pruebas' },
    ],

    ATLETA: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/dashboard/schedule', icon: Calendar, label: 'Horario' },
    ],

    ENTRENADOR: [
        { path: '/dashboard/athletes', icon: Users, label: 'Atletas' },
        { path: '/dashboard/registro-pruebas', icon: Users, label: 'Gestión de Pruebas' }, 
        { path: '/dashboard/entrenamientos', icon: Users, label: 'Gestión de Entrenamientos' },
        { path: '/dashboard/competitions', icon: Trophy, label: 'Gestión de Competencias' },
        { path: '/dashboard/results', icon: Activity, label: 'Resultados' },
    ],

    REPRESENTANTE: [
        { path: '/dashboard/representante/mis-atletas', icon: Activity, label: 'Mis Atletas' },
    ]
};

export default rolePermissions;
