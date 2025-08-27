// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Auth, Hub } from 'aws-amplify';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    const checkAuthStatus = async () => {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            setIsAuthenticated(true);
            setUser({
                username: currentUser.username || currentUser.attributes?.email || currentUser.attributes?.sub?.substring(0, 8),
                attributes: currentUser.attributes
            });
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
            console.log('User not authenticated:', error);
        }
    };

    useEffect(() => {
        checkAuthStatus();

        const listener = (data) => {
            switch (data.payload.event) {
                case 'signIn':
                    console.log('User signed in');
                    checkAuthStatus(); 
                    break;
                case 'signOut':
                    console.log('User signed out');
                    setIsAuthenticated(false);
                    setUser(null);
                    localStorage.removeItem('isAuthenticated'); 
                    window.location.href = '/'; 
                    break;
                case 'signIn_failure':
                    console.log('User sign in failed');
                    setIsAuthenticated(false);
                    setUser(null);
                    break;
                case 'configured':
                    checkAuthStatus();
                    break;
                default:
                    break;
            }
        };

        Hub.listen('auth', listener);

        return () => Hub.remove('auth', listener);
    }, []);

    const handleSignOut = async () => {
        try {
            await Auth.signOut();
            // Hub listener will handle state updates and redirect
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleSignIn = () => {
        Auth.federatedSignIn();
    };

    return (
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white shadow">
            <div className="flex items-center space-x-2">
                <img
                    src="/logo192.png"
                    alt="Logo"
                    className="h-10 w-10"
                    onError={(e) => {
                        if (!e.target.src.includes('placehold.co')) {
                            e.target.src = "https://placehold.co/192x192/cccccc/000000?text=Logo";
                            e.target.onerror = null; // Prevent infinite loop
                        }
                    }}
                />
                <span className="font-bold text-xl sm:text-2xl text-gray-800">FOUNDIT</span>
            </div>

            <nav className="flex items-center space-x-4 sm:space-x-8 text-gray-700 font-semibold">
                <Link to="/" className="hover:text-blue-500">Home</Link>
                <Link to="/upload" className="hover:text-blue-500">Upload</Link>
                <Link to="/dashboard" className="hover:text-blue-500">Gallery</Link>
                {/* Updated link for user profile */}
                {isAuthenticated && (
                    <Link to="/my-profile" className="hover:text-blue-500">My Profile</Link>
                )}

                {isAuthenticated ? (
                    <>
                        {user && <span className="text-gray-800 hidden sm:inline">Hi, {user.username}!</span>}
                        <button
                            onClick={handleSignOut}
                            className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-red-600 transition"
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleSignIn}
                        className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-green-600 transition"
                    >
                        Sign In / Sign Up
                    </button>
                )}
            </nav>
        </header>
    );
};

export default Navbar;