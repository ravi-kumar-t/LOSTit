// src/components/HomePage.js
import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <div className="min-h-screen bg-blue-50 flex flex-col">
            {/* Hero Section */}
            <section className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 md:px-16 py-10 gap-8">
                <div className="max-w-xl order-2 lg:order-1">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 leading-tight mb-6">
                        WHEN RECOVERING <br /> YOUR ITEMS BECOMES <br /> CHILD'S PLAY!
                    </h1>
                    <p className="text-green-600 text-lg sm:text-xl mb-8">
                        Lost or found something? <br /> Let us help you
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                        <Link
                            to="/upload"
                            className="w-full sm:w-auto"
                        >
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300">
                                I HAVE LOST
                            </button>
                        </Link>
                        <Link
                            to="/upload"
                            className="w-full sm:w-auto"
                        >
                            <button className="w-full bg-white border-2 border-gray-400 hover:bg-gray-100 text-gray-700 px-6 sm:px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300">
                                I HAVE FOUND
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="order-1 lg:order-2">
                    <img
                        src="/Hero.png"
                        alt="Hero"
                        className="h-64 sm:h-80 md:h-96 w-auto"
                        onError={(e) => {
                            if (!e.target.src.includes('placehold.co')) {
                                e.target.src = "https://placehold.co/600x400/cccccc/000000?text=LostFoundApp";
                                e.target.onerror = null;
                            }
                        }}
                    />
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-white py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                        How Our App Helps You
                    </h2>
                    <p className="text-center text-gray-500 mb-8 md:mb-12">How it works</p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center max-w-sm p-4">
                            <div className="bg-green-100 p-6 rounded-full shadow-md mb-4">
                                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Report a lost or found item
                            </h3>
                            <p className="text-gray-600">
                                Fill the declaration and give as much detail as possible (location, type,
                                description) to help others identify it quickly.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center max-w-sm p-4">
                            <div className="bg-green-100 p-6 rounded-full shadow-md mb-4">
                                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Prove ownership of the item
                            </h3>
                            <p className="text-gray-600">
                                After matching, prove the item is yours (e.g., describe a detail) so the
                                finder can confirm it's yours.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center max-w-sm p-4">
                            <div className="bg-green-100 p-6 rounded-full shadow-md mb-4">
                                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Get it back!</h3>
                            <p className="text-gray-600">
                                Once authenticated, you'll receive details for handover and a receipt will
                                be generated for proof.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Founders Team Section */}
            <section className="py-12 md:py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 md:mb-12">
                        Meet Our Founders
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Founder 1 */}
                        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:scale-105">
                            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                <svg
                                    className="w-20 h-20 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 12a5 5 0 110-10 5 5 0 010 10zm0-2a3 3 0 100-6 3 3 0 000 6zm7 11a1 1 0 01-2 0v-2a3 3 0 00-3-3H7a3 3 0 00-3 3v2a1 1 0 01-2 0v-2a5 5 0 015-5h7a5 5 0 015 5v2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">John Doe</h3>
                            <p className="text-gray-600 mb-2">CEO & Co-Founder</p>
                            <p className="text-gray-500">
                                Visionary leader with 10+ years in tech innovation.
                            </p>
                        </div>

                        {/* Founder 2 */}
                        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:scale-105">
                            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                <svg
                                    className="w-20 h-20 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 12a5 5 0 110-10 5 5 0 010 10zm0-2a3 3 0 100-6 3 3 0 000 6zm7 11a1 1 0 01-2 0v-2a3 3 0 00-3-3H7a3 3 0 00-3 3v2a1 1 0 01-2 0v-2a5 5 0 015-5h7a5 5 0 015 5v2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Jane Smith</h3>
                            <p className="text-gray-600 mb-2">CTO & Co-Founder</p>
                            <p className="text-gray-500">
                                Technical expert specializing in AI and blockchain.
                            </p>
                        </div>

                        {/* Founder 3 */}
                        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:scale-105">
                            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                <svg
                                    className="w-20 h-20 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 12a5 5 0 110-10 5 5 0 010 10zm0-2a3 3 0 100-6 3 3 0 000 6zm7 11a1 1 0 01-2 0v-2a3 3 0 00-3-3H7a3 3 0 00-3 3v2a1 1 0 01-2 0v-2a5 5 0 015-5h7a5 5 0 015 5v2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Alex Johnson</h3>
                            <p className="text-gray-600 mb-2">COO & Co-Founder</p>
                            <p className="text-gray-500">
                                Operations specialist with logistics expertise.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white pt-12 pb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Column 1 */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">FOUNDIT</h3>
                            <p className="text-gray-400">
                                Making lost and found items reunite with their owners since 2023.
                            </p>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/upload" className="text-gray-400 hover:text-white transition-colors">
                                        Report Item
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                                        Gallery
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                            <ul className="text-gray-400 space-y-2">
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    help@foundit.com
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    +1 (555) 123-4567
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    123 Tech Street, Silicon Valley
                                </li>
                            </ul>
                        </div>

                        {/* Column 4 */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                            <div className="flex space-x-4">
                                <a href="https://facebook.com" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                    </svg>
                                </a>
                                <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="https://instagram.com" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                </a>
                                <a href="https://youtube.com" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-gray-700 pt-6 text-center text-gray-400">
                        <p>© {new Date().getFullYear()} FOUNDIT. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;