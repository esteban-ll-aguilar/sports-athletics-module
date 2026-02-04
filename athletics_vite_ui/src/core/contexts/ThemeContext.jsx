import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

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

    const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeProvider;
