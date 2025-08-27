// src/components/Callback.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            try {
                // Amplify will automatically handle the URL parsing and token exchange
                // when Auth.currentAuthenticatedUser() is called on the redirect page.
                const user = await Auth.currentAuthenticatedUser();
                console.log("Authenticated User:", user);

                // Mark user as authenticated (this flag is only for UI state, Amplify handles actual session)
                localStorage.setItem('isAuthenticated', 'true');

                // Redirect to the new user profile page after successful authentication
                navigate('/my-profile');
            } catch (error) {
                console.error("Authentication error during callback:", error);
                // Clear flag if authentication failed
                localStorage.removeItem('isAuthenticated');
                // Redirect to home on error
                navigate('/');
            }
        };

        handleAuth();
    }, [navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-600">Authenticating...</span>
        </div>
    );
};

export default Callback;