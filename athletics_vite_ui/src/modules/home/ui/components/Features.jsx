import React from 'react';
import { Users, ClipboardList, Activity, Medal, BarChart3, Calendar } from 'lucide-react';

const features = [
    {
        icon: <Users className="w-6 h-6" />,
        title: "Gestión de Atletas",
        description: "Administra perfiles completos, historial médico y seguimiento detallado de cada deportista."
    },
    {
        icon: <ClipboardList className="w-6 h-6" />,
        title: "Planificación de Entrenamientos",
        description: "Crea y asigna rutinas personalizadas, controlando la asistencia y el progreso diario."
    },
    {
        icon: <Medal className="w-6 h-6" />,
        title: "Competencias y Pruebas",
        description: "Gestiona inscripciones, series y resultados de competencias locales y nacionales."
    },
    {
        icon: <BarChart3 className="w-6 h-6" />,
        title: "Análisis de Resultados",
        description: "Visualiza el rendimiento con gráficas avanzadas y estadísticas comparativas."
    },
    {
        icon: <Activity className="w-6 h-6" />,
        title: "Seguimiento de Salud",
        description: "Monitoreo constante de datos biométricos, lesiones y evolución física."
    },
    {
        icon: <Calendar className="w-6 h-6" />,
        title: "Calendario de Eventos",
        description: "Mantén a todo el equipo sincronizado con un calendario centralizado de actividades."
    }
];

const Features = () => {
    return (
        <section id="features" className="py-24 bg-gray-50 dark:bg-[#1a1a1a] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-[#b30c25] font-semibold tracking-wider uppercase text-sm">Características Principales</span>
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Todo lo que necesitas para gestionar tu equipo
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                        Herramientas diseñadas específicamente para entrenadores, administradores y atletas del alto rendimiento.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-white dark:bg-[#242223] p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-[#332122] transition-all duration-300 transform hover:-translate-y-2"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#b30c25]/10 flex items-center justify-center text-[#b30c25] mb-6 group-hover:bg-[#b30c25] group-hover:text-white transition-colors duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Features;
