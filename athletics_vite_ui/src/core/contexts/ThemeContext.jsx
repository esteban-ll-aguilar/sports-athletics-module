import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) return storedTheme;

        // Default to light if no preference in localStorage
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old class
        root.classList.remove('light', 'dark');

        // Add new class
        root.classList.add(theme);

        // Save to localStorage
        localStorage.setItem('theme', theme);

        console.log(`Theme toggled to: ${theme}`);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
