import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy, Users, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
            {/* Shapes de fondo con animación */}
            <motion.div 
                className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-[#b30c25]/10 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div 
                className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Text Content */}
                    <motion.div 
                        className="text-center lg:text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div 
                            className="inline-flex items-center px-3 py-1 rounded-full border border-[#b30c25]/30 bg-[#b30c25]/5 text-[#b30c25] text-sm font-semibold mb-6"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Trophy size={14} className="mr-2" />
                            Gestión Deportiva Profesional
                        </motion.div>

                        <motion.h1 
                            className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Lleva el <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b30c25] to-orange-600">Atletismo</span> <br />
                            al Siguiente Nivel
                        </motion.h1>

                        <motion.p 
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            Plataforma integral para gestionar atletas, competencias y rendimientos.
                            Optimiza tus procesos y enfócate en lo que importa: ganar.
                        </motion.p>

                        <motion.div 
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <motion.button
                                onClick={() => navigate('/register')}
                                className="w-full sm:w-auto px-8 py-4 bg-[#b30c25] hover:bg-[#960a1f] text-white font-bold rounded-xl shadow-lg shadow-[#b30c25]/30 flex items-center justify-center transition-all"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Comenzar Ahora
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </motion.button>
                            <motion.button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Ya tengo cuenta
                            </motion.button>
                        </motion.div>

                        {/* Mini Stats */}
                        <motion.div 
                            className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-gray-500 dark:text-gray-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                        >
                            <motion.div 
                                className="flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Users className="text-[#b30c25]" />
                                <span className="font-semibold">+500 Atletas</span>
                            </motion.div>
                            <motion.div 
                                className="flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Timer className="text-orange-500" />
                                <span className="font-semibold">Tiempo Real</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Image/Visual Content */}
                    <motion.div 
                        className="relative mx-auto lg:mr-0 max-w-lg lg:max-w-none"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        {/* Card flotante 1 */}
                        <motion.div 
                            className="absolute top-10 -left-10 z-20 bg-white dark:bg-[#242223] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-[#332122] hidden md:block"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                                duration: 0.6, 
                                delay: 0.8,
                                repeat: Infinity,
                                repeatType: "reverse",
                                repeatDelay: 3
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <motion.div 
                                    className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Timer size={20} />
                                </motion.div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Récord Personal</p>
                                    <p className="font-bold text-gray-900 dark:text-white">10.45s (100m)</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#332122] bg-gradient-to-br from-[#b30c25] to-orange-600"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3"
                                alt="Athletes Running"
                                className="w-full h-auto object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-96 text-white"><div class="text-center"><svg class="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg><p class="text-2xl font-bold">ATHLETICS</p></div></div>';
                                }}
                            />
                            {/* Overlay degradado */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#b30c25]/40 to-transparent mix-blend-multiply"></div>
                        </motion.div>

                        {/* Card flotante 2 */}
                        <motion.div 
                            className="absolute -bottom-6 -right-6 z-20 bg-white dark:bg-[#242223] p-5 rounded-2xl shadow-xl border border-gray-100 dark:border-[#332122] hidden md:block"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                                duration: 0.6, 
                                delay: 1,
                                repeat: Infinity,
                                repeatType: "reverse",
                                repeatDelay: 3
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <motion.div 
                                            key={i} 
                                            className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-[#242223]"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 1.2 + (i * 0.1) }}
                                        ></motion.div>
                                    ))}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Nuevos Equipos</p>
                                    <p className="text-xs text-[#b30c25]">Unirse ahora</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
