import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy, Users, Timer } from 'lucide-react';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
            {/* Shapes de fondo */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-[#b30c25]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Text Content */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#b30c25]/30 bg-[#b30c25]/5 text-[#b30c25] text-sm font-semibold mb-6">
                            <Trophy size={14} className="mr-2" />
                            Gestión Deportiva Profesional
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6">
                            Lleva el <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b30c25] to-orange-600">Atletismo</span> <br />
                            al Siguiente Nivel
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Plataforma integral para gestionar atletas, competencias y rendimientos.
                            Optimiza tus procesos y enfócate en lo que importa: ganar.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full sm:w-auto px-8 py-4 bg-[#b30c25] hover:bg-[#960a1f] text-white font-bold rounded-xl shadow-lg shadow-[#b30c25]/30 flex items-center justify-center transition-all transform hover:-translate-y-1"
                            >
                                Comenzar Ahora
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                            >
                                Ya tengo cuenta
                            </button>
                        </div>

                        {/* Mini Stats */}
                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Users className="text-[#b30c25]" />
                                <span className="font-semibold">+500 Atletas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Timer className="text-orange-500" />
                                <span className="font-semibold">Tiempo Real</span>
                            </div>
                        </div>
                    </div>

                    {/* Image/Visual Content */}
                    <div className="relative mx-auto lg:mr-0 max-w-lg lg:max-w-none">
                        {/* Card flotante 1 */}
                        <div className="absolute top-10 -left-10 z-20 bg-white dark:bg-[#242223] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-[#332122] hidden md:block animate-bounce-slow">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <Timer size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Récord Personal</p>
                                    <p className="font-bold text-gray-900 dark:text-white">10.45s (100m)</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#332122] bg-gray-200">
                            <img
                                src="https://images.unsplash.com/photo-1552674605-5d226a5be380?q=80&w=2564&auto=format&fit=crop"
                                alt="Athletes Running"
                                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                            />
                            {/* Overlay degradado */}
                            <div className="absolute inset-0 bg-linear-to-t from-[#b30c25]/40 to-transparent mix-blend-multiply"></div>
                        </div>

                        {/* Card flotante 2 */}
                        <div className="absolute -bottom-6 -right-6 z-20 bg-white dark:bg-[#242223] p-5 rounded-2xl shadow-xl border border-gray-100 dark:border-[#332122] hidden md:block">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-[#242223]"></div>
                                    ))}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Nuevos Equipos</p>
                                    <p className="text-xs text-[#b30c25]">Unirse ahora</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
