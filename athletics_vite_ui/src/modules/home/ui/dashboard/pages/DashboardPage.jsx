import React from 'react';

const DashboardPage = () => {
    return (
        <div className="space-y-8">

            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-400">
                    Bienvenido al panel de control de Atletismo.
                </p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {/* Card 1 */}
                <div className="bg-[#242223] border border-[#332122] rounded-xl shadow-lg">
                    <div className="p-5 flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-[rgba(179,12,37,0.15)] flex items-center justify-center text-[#b30c25]">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm text-gray-400">Total Atletas</p>
                            <p className="text-xl font-semibold text-white">128</p>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-[#242223] border border-[#332122] rounded-xl shadow-lg">
                    <div className="p-5 flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-[rgba(179,12,37,0.15)] flex items-center justify-center text-[#b30c25]">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm text-gray-400">Competencias Activas</p>
                            <p className="text-xl font-semibold text-white">3</p>
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-[#242223] border border-[#332122] rounded-xl shadow-lg">
                    <div className="p-5 flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-[rgba(179,12,37,0.15)] flex items-center justify-center text-[#b30c25]">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm text-gray-400">Próximos Eventos</p>
                            <p className="text-xl font-semibold text-white">5</p>
                        </div>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-[#242223] border border-[#332122] rounded-xl shadow-lg">
                    <div className="p-5 flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-[rgba(179,12,37,0.15)] flex items-center justify-center text-[#b30c25]">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm text-gray-400">Rendimiento</p>
                            <p className="text-xl font-semibold text-white">95%</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Recent Activity */}
            <div className="bg-[#242223] border border-[#332122] rounded-xl shadow-lg">
                <div className="px-6 py-4 border-b border-[#332122]">
                    <h3 className="text-lg font-semibold text-white">
                        Actividad Reciente
                    </h3>
                </div>

                <ul className="divide-y divide-[#332122]">
                    {[1, 2, 3].map((item) => (
                        <li key={item} className="px-6 py-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-[#b30c25]">
                                    Nuevo registro de atleta
                                </p>
                                <span className="px-2 py-1 text-xs rounded-full bg-[rgba(179,12,37,0.15)] text-[#b30c25]">
                                    Completado
                                </span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm text-gray-400">
                                <span>Juan Pérez</span>
                                <span>Hace 2 horas</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
};

export default DashboardPage;
