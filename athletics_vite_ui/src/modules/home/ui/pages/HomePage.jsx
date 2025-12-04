import React from 'react';

const HomePage = () => {
    return (
        <div className="text-center py-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Welcome to the Athletics Module
            </h2>
            <p className="mt-4 text-lg text-gray-500">
                Manage athletes, events, and competitions efficiently.
            </p>
            <div className="mt-8">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default HomePage;
