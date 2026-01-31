import React from 'react';
import { Users, Trophy, Calendar, Activity, CheckCircle, Clock } from 'lucide-react';

const DashboardPage = () => {
    return (
        <div className="space-y-8 p-6">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Bienvenido al panel de control de Atletismo.
                    </p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {/* Card 1 */}
                <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#332122] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="p-6 flex items-center">
                        <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-[rgba(179,12,37,0.15)] flex items-center justify-center text-[#b30c25] group-hover:scale-110 transition-transform duration-300">
                            <Users size={28} />
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Atletas</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">128</p>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#332122] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="p-6 flex items-center">
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <Trophy size={28} />
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Competencias</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">3</p>
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#332122] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="p-6 flex items-center">
                        <div className="h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                            <Calendar size={28} />
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Próximos Eventos</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">5</p>
                        </div>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#332122] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="p-6 flex items-center">
                        <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                            <Activity size={28} />
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rendimiento</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">95%</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#332122] rounded-2xl shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-[#332122] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock size={20} className="text-gray-400" />
                        Actividad Reciente
                    </h3>
                </div>

                <ul className="divide-y divide-gray-100 dark:divide-[#332122]">
                    {[1, 2, 3].map((item) => (
                        <li key={item} className="px-8 py-5 hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-colors">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-red-50 dark:bg-red-900/10 text-[#b30c25]">
                                        <CheckCircle size={18} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Nuevo registro de atleta completado
                                    </p>
                                </div>
                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                                    Completado
                                </span>
                            </div>
                            <div className="mt-2 pl-11 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Juan Pérez</span>
                                <span>Hace 2 horas</span>
                            </div>
                        </li>
                    ))}
                    {/* Empty state filler if needed logic later */}
                </ul>
            </div>

        </div>
    );
};

export default DashboardPage;
