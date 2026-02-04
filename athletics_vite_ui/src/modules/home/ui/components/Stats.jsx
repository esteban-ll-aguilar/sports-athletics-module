import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
    { value: 500, suffix: "+", label: "Atletas Activos" },
    { value: 50, suffix: "+", label: "Clubes Registrados" },
    { value: 1200, suffix: "", label: "Competencias", format: (val) => `${(val / 1000).toFixed(1)}k` },
    { value: 98, suffix: "%", label: "Satisfacción" },
];

const CountUp = ({ end, suffix, format, duration = 2 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        let startTime;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(end * easeOutQuart));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isInView]);

    return (
        <span ref={ref}>
            {format ? format(count) : count}{suffix}
        </span>
    );
};

const Stats = () => {
    return (
        <section id="stats" className="py-20 bg-[#b30c25] relative overflow-hidden">
            {/* Pattern Overlay con animación */}
            <motion.div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                animate={{
                    opacity: [0.05, 0.15, 0.05]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L100 0 L100 100 Z" fill="black" />
                </svg>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div 
                    className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {stats.map((stat, index) => (
                        <motion.div 
                            key={stat.label} 
                            className="p-4"
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ 
                                duration: 0.5, 
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 100
                            }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <motion.p 
                                className="text-4xl sm:text-5xl font-black text-white mb-2"
                                initial={{ y: 20 }}
                                whileInView={{ y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                            >
                                <CountUp 
                                    end={stat.value} 
                                    suffix={stat.suffix}
                                    format={stat.format}
                                />
                            </motion.p>
                            <p className="text-white/80 font-medium text-lg">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Stats;
