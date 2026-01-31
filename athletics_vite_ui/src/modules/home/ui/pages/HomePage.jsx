import React from 'react';
import HomeNavbar from '../components/HomeNavbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import Footer from '../components/Footer';

const HomePage = () => {
    return (
        <div className="bg-white dark:bg-[#121212] min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <HomeNavbar />

            <main>
                <Hero />
                <Features />
                <Stats />
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
