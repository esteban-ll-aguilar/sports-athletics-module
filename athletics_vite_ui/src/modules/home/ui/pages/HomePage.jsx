import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#212121] text-white">

            {/* Hero Section */}
            <div className="relative overflow-hidden">

                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path
                                    d="M 10 0 L 0 0 0 10"
                                    fill="none"
                                    stroke="#b30c25"
                                    strokeWidth="0.3"
                                />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Content */}
                <div className="relative py-12">
                    <main className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid lg:grid-cols-12 gap-8 items-center">

                            {/* Text */}
                            <div className="lg:col-span-6">
                                <span className="inline-block text-sm font-semibold uppercase tracking-wide text-[#b30c25]">
                                    Gestión Deportiva
                                </span>

                                <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
                                    <span className="block">Módulo de</span>
                                    <span className="block text-[#b30c25]">Atletismo</span>
                                </h1>

                                <p className="mt-5 text-lg text-gray-400 max-w-xl">
                                    Gestiona atletas, entrenamientos, competencias y resultados de manera eficiente
                                    en una plataforma moderna y centralizada.
                                </p>

                                {/* Buttons */}
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="
                                            w-full py-3 px-6 rounded-xl font-semibold text-white
                                            bg-gradient-to-r from-[#332122] via-[#362022] to-[#b30c25]
                                            hover:opacity-95 transition-all duration-300 shadow-lg
                                        "
                                    >
                                        Iniciar Sesión
                                    </button>

                                    <button
                                        onClick={() => navigate('/register')}
                                        className="
                                            w-full py-3 px-6 rounded-xl font-semibold
                                            text-[#b30c25] border border-[#332122]
                                            bg-[#242223] hover:bg-[#2a2425]
                                            transition-all duration-300
                                        "
                                    >
                                        Registrarse
                                    </button>
                                </div>
                            </div>

                            {/* Image */}
                            <div className="lg:col-span-6">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#332122] max-h-[360px]">
                                    <img
                                        className="w-full h-full object-cover"
                                        src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1350&q=80"
                                        alt="Athletics"
                                    />
                                    <div className="absolute inset-0 bg-[#b30c25] opacity-25"></div>
                                </div>
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
