import React from 'react';

const stats = [
    { value: "500+", label: "Atletas Activos" },
    { value: "50+", label: "Clubes Registrados" },
    { value: "1.2k", label: "Competencias" },
    { value: "98%", label: "Satisfacción" },
];

const Stats = () => {
    return (
        <section id="stats" className="py-20 bg-[#b30c25] relative overflow-hidden">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L100 0 L100 100 Z" fill="black" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {stats.map((stat) => (
                        <div key={stat.label} className="p-4">
                            <p className="text-4xl sm:text-5xl font-black text-white mb-2">
                                {stat.value}
                            </p>
                            <p className="text-white/80 font-medium text-lg">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
