import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../core/contexts/ThemeContext';
import PropTypes from 'prop-types';

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={`
                group relative inline-flex items-center justify-center 
                w-14 h-14 rounded-full
                transition-all duration-500 ease-out
                focus:outline-none focus:ring-2 focus:ring-[#b30c25] focus:ring-offset-2
                hover:scale-105 active:scale-95
                ${isDark
                    ? 'bg-linear-to-br from-[#2a1a1f] to-[#1a0f14] text-amber-300 hover:from-[#3d2329] hover:to-[#2a1a1f] border border-[#b30c25]/20 shadow-lg shadow-[#b30c25]/10'
                    : 'bg-linear-to-br from-white to-gray-50 text-orange-500 hover:from-orange-50 hover:to-white border border-gray-200 shadow-lg shadow-gray-200/50'}
                ${className}
            `}
            aria-label="Toggle theme"
            title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
        >
            <span className="sr-only">Cambiar tema</span>

            {/* Fondo animado decorativo */}
            <div
                className={`
                    absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                    transition-opacity duration-500 blur-sm
                    ${isDark
                        ? 'bg-linear-to-br from-[#b30c25]/20 to-transparent'
                        : 'bg-linear-to-br from-orange-200/30 to-transparent'}
                `}
            />

            {/* Container de iconos con mejor perspectiva */}
            <div className="relative w-7 h-7 perspective-1000">
                {/* Sol */}
                <Sun
                    className={`
                        absolute inset-0 w-7 h-7 
                        transition-all duration-700 ease-out
                        ${isDark
                            ? 'rotate-180 scale-0 opacity-0 blur-sm'
                            : 'rotate-0 scale-100 opacity-100 blur-0'}
                    `}
                    strokeWidth={2}
                />

                {/* Luna */}
                <Moon
                    className={`
                        absolute inset-0 w-7 h-7 
                        transition-all duration-700 ease-out
                        ${isDark
                            ? 'rotate-0 scale-100 opacity-100 blur-0'
                            : '-rotate-180 scale-0 opacity-0 blur-sm'}
                    `}
                    strokeWidth={2}
                />
            </div>

            {/* Partículas decorativas (opcional) */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div
                    className={`
                        absolute top-2 right-2 w-1 h-1 rounded-full
                        transition-all duration-1000
                        ${isDark
                            ? 'bg-amber-400 opacity-60 animate-pulse'
                            : 'bg-orange-400 opacity-0'}
                    `}
                />
                <div
                    className={`
                        absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full
                        transition-all duration-1000 delay-100
                        ${isDark
                            ? 'bg-amber-300 opacity-40 animate-pulse'
                            : 'bg-orange-300 opacity-0'}
                    `}
                />
            </div>
        </button>
    );
};

ThemeToggle.propTypes = {
    className: PropTypes.string
};

export default ThemeToggle;