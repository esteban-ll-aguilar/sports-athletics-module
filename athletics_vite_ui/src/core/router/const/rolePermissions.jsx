import { LayoutDashboard, Users, Trophy, Calendar, Activity, Heart, TrendingUp } from 'lucide-react';

const rolePermissions = {
    ADMINISTRADOR: [
        { path: '/dashboard/users', icon: Users, label: 'Gestión de Roles' },
        { path: '/dashboard/athletes', icon: Users, label: 'Atletas' },
        { path: '/dashboard/admin', icon: Users, label: 'Administración' },
        {
            path: '/dashboard/registro-pruebas',
            icon: Users,
            label: 'Gestión de Pruebas',
            children: [
                { path: '/dashboard/registro-pruebas/baremos', label: 'Baremos Especificos' },
                { path: '/dashboard/registro-pruebas/baremos-simple', label: 'Baremos Simples' },
                { path: '/dashboard/registro-pruebas/disciplinas', label: 'Disciplinas' },
                { path: '/dashboard/registro-pruebas/resultados', label: 'Resultados (Tests)' }
            ]
        },
    ],

    ATLETA: [
        { path: '/dashboard/atleta', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/dashboard/schedule', icon: Calendar, label: 'Horario' },
    ],

    ENTRENADOR: [
        {
            path: '/dashboard/registro-pruebas',
            icon: Users,
            label: 'Gestión de Pruebas',
            children: [
                { path: '/dashboard/registro-pruebas', label: 'Agregar Pruebas' },
                { path: '/dashboard/registro-pruebas/baremos', label: 'Baremos Específicos' },
                { path: '/dashboard/registro-pruebas/baremos-simple', label: 'Baremos Simples' },
                { path: '/dashboard/registro-pruebas/disciplinas', label: 'Disciplinas' },
                { path: '/dashboard/registro-pruebas/resultados', label: 'Resultados (Tests)' }
            ]
        },
        {
            path: '/dashboard/entrenamientos',
            icon: Users,
            label: 'Gestión de Entrenamientos',
            children: [
                { path: '/dashboard/entrenamientos', label: 'Entrenamientos' },
                { path: '/dashboard/entrenamientos/resultados', label: 'Resultados' }
            ]
        },
        { path: '/dashboard/historial-medico', icon: Heart, label: 'Historial Médico' },
        { path: '/dashboard/competitions', icon: Trophy, label: 'Gestión de Competencias' },
        { path: '/dashboard/results', icon: Activity, label: 'Resultados (Comp)' },
        { path: '/dashboard/rendimiento', icon: TrendingUp, label: 'Rendimiento Deportivo' },
    ],

    REPRESENTANTE: [
        { path: '/dashboard/representante/mis-atletas', icon: Activity, label: 'Mis Atletas' },
    ]
};

export default rolePermissions;
