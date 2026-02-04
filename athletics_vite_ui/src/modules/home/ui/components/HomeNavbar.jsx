import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@shared/components/ThemeToggle';
import { Menu, X } from 'lucide-react';

const HomeNavbar = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Inicio', href: '#' },
        { name: 'Características', href: '#features' },
        { name: 'Estadísticas', href: '#stats' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/80 dark:bg-[#212121]/90 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-[#332122]'
            : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    {/* Logo */}
                    <button
                        className="shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#b30c25] rounded-lg text-left"
                        onClick={() => navigate('/')}
                        aria-label="Ir al inicio"
                    >
                        <h1 className="text-2xl font-black italic tracking-tighter">
                            <span className="text-gray-900 dark:text-white">ATHLETICS</span>
                            <span className="text-[#b30c25]">MODULE</span>
                        </h1>
                    </button>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#b30c25] dark:hover:text-[#b30c25] transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}

                        <div className="pl-4 border-l border-gray-300 dark:border-gray-700">
                            <ThemeToggle className="w-10! h-10!" />
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="text-sm font-semibold text-gray-900 dark:text-white hover:text-[#b30c25] transition-colors"
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#b30c25] rounded-full hover:bg-[#8e0a1e] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Registrarse
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <ThemeToggle className="w-10! h-10!" />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-700 dark:text-gray-300 hover:text-[#b30c25]"
                        >
                            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#212121] border-b border-gray-200 dark:border-[#332122] shadow-xl transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="px-4 py-6 space-y-4">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="block text-base font-medium text-gray-900 dark:text-white hover:text-[#b30c25]"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 text-center text-gray-900 dark:text-white font-semibold border border-gray-300 dark:border-gray-600 rounded-xl"
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full py-3 text-center text-white font-semibold bg-[#b30c25] rounded-xl"
                        >
                            Registrarse
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default HomeNavbar;
