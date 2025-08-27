// src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { getUploadedItemsFromDynamoDB, getClaimedItemsFromDynamoDB, confirmHandover } from '../dynamoService';
import {
    FiPackage, FiMapPin, FiCalendar, FiEdit, FiCheckCircle, FiAlertCircle, FiTag
} from 'react-icons/fi';

function UserProfile() { 
    const [user, setUser] = useState(null);
    const [uploadedItems, setUploadedItems] = useState([]);
    const [claimedItems, setClaimedItems] = useState([]);
    const [isLoadingUploaded, setIsLoadingUploaded] = useState(true);
    const [isLoadingClaimed, setIsLoadingClaimed] = useState(true);
    const [errorUploaded, setErrorUploaded] = useState(null);
    const [errorClaimed, setErrorClaimed] = useState(null);
    const [activeTab, setActiveTab] = useState('uploaded'); 

    useEffect(() => {
        const checkUserAndFetchItems = async () => {
            try {
                const authUser = await Auth.currentAuthenticatedUser();
                setUser(authUser);

                // Fetch uploaded items
                try {
                    // Call the service function, it will get the token internally
                    const uploaded = await getUploadedItemsFromDynamoDB();
                    setUploadedItems(uploaded);
                } catch (err) {
                    console.error("Error fetching uploaded items:", err);
                    setErrorUploaded(err.message || "Failed to load your uploaded items.");
                } finally {
                    setIsLoadingUploaded(false);
                }

                // Fetch claimed items
                try {
                    // Call the service function, it will get the token internally
                    const claimed = await getClaimedItemsFromDynamoDB();
                    setClaimedItems(claimed);
                } catch (err) {
                    console.error("Error fetching claimed items:", err);
                    setErrorClaimed(err.message || "Failed to load your claimed items.");
                } finally {
                    setIsLoadingClaimed(false);
                }

            } catch (err) {
                console.error("Authentication error for profile:", err);
                setErrorUploaded("You need to be logged in to view your profile.");
                setErrorClaimed("You need to be logged in to view your profile.");
                setIsLoadingUploaded(false);
                setIsLoadingClaimed(false);
                setUser(null);
            }
        };

        checkUserAndFetchItems();
    }, []); // Empty dependency array means this runs once on mount

    const handleConfirmHandover = async (itemId) => {
        // Use a custom modal or a more sophisticated confirmation than window.confirm in production
        if (window.confirm("Are you sure you want to confirm this item has been handed over? This action cannot be undone.")) {
            try {
                await confirmHandover(itemId); // Call the service function
                alert("Handover confirmed successfully!");
                // Update the status of the specific item in the uploadedItems state
                setUploadedItems(prev => prev.map(item =>
                    item.itemId === itemId ? { ...item, status: 'handed_over' } : item
                ));
            } catch (error) {
                console.error("Error confirming handover:", error);
                alert(`Failed to confirm handover: ${error.message}`);
            }
        }
    };

    const handleEditItem = (item) => {
        // Placeholder for future edit functionality
        alert(`Feature coming soon: Edit item "${item.itemName}"`);
    };

    if (isLoadingUploaded || isLoadingClaimed) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
                <span className="ml-4 text-xl text-gray-700 font-semibold">Loading your profile...</span>
            </div>
        );
    }

    if (errorUploaded || errorClaimed) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-red-50 p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md text-center max-w-md">
                    <FiAlertCircle className="inline-block text-red-600 text-3xl mb-3" />
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p>{errorUploaded || errorClaimed}</p>
                    {!user && ( // If user is not logged in, suggest login
                        <button
                            onClick={() => window.location.href = '/'} // Redirect to home/login
                            className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Go to Home / Login
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="container mx-auto px-4 py-10">
                <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-10 leading-tight">
                    {user ? `Welcome, ${user.username || user.attributes?.email || 'User'}!` : 'Your Profile'}
                </h2>

                <div className="flex justify-center mb-8 space-x-4">
                    <button
                        onClick={() => setActiveTab('uploaded')}
                        className={`px-6 py-3 rounded-full text-lg font-semibold transition-colors duration-200
                            ${activeTab === 'uploaded' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                        My Uploaded Items ({uploadedItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('claimed')}
                        className={`px-6 py-3 rounded-full text-lg font-semibold transition-colors duration-200
                            ${activeTab === 'claimed' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                        My Claimed Items ({claimedItems.length})
                    </button>
                </div>

                {activeTab === 'uploaded' && (
                    <>
                        <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">Items You Reported</h3>
                        {uploadedItems.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                                <FiPackage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                <h3 className="mt-2 text-2xl font-bold text-gray-900">No items reported by you yet!</h3>
                                <p className="mt-2 text-lg text-gray-600">
                                    Start by reporting a lost or found item.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/upload'}
                                    className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out"
                                >
                                    Report New Item
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {uploadedItems.map(item => (
                                    <div
                                        key={item.itemId}
                                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative"
                                    >
                                        {/* Item Status Tag */}
                                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md
                                            ${item.status === 'active' ? 'bg-blue-500 text-white' :
                                                item.status === 'pending_handover' ? 'bg-yellow-500 text-white' :
                                                    item.status === 'handed_over' ? 'bg-green-500 text-white' :
                                                        'bg-gray-500 text-white'}`}>
                                            {item.status ? item.status.replace(/_/g, ' ') : 'Unknown'}
                                        </div>

                                        <div className="relative h-56">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.itemName || 'Item image'}
                                                className="absolute h-full w-full object-cover rounded-t-2xl"
                                                onError={(e) => {
                                                    e.target.src = "https://placehold.co/400x300/e0e0e0/555555?text=No+Image";
                                                }}
                                            />
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                                                {item.itemName || 'Unnamed Item'}
                                            </h3>
                                            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                                {item.description || 'No description provided.'}
                                            </p>
                                            <div className="flex items-center text-gray-600 text-sm mb-2">
                                                <FiMapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                {item.location || 'Unknown Location'}
                                            </div>
                                            <div className="flex items-center text-gray-600 text-sm mb-4">
                                                <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Invalid Date'}
                                            </div>
                                            <div className="flex justify-between items-center gap-2 mt-4"> {/* Buttons for management */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEditItem(item); }}
                                                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                                                >
                                                    <FiEdit className="mr-2" /> Edit
                                                </button>
                                                {(item.status === 'pending_handover' && item.claimedByUserId) && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleConfirmHandover(item.itemId); }}
                                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
                                                    >
                                                        <FiCheckCircle className="mr-2" /> Confirm Handover
                                                    </button>
                                                )}
                                                {item.status === 'handed_over' && (
                                                    <span className="flex-1 text-center text-sm font-medium text-green-700 bg-green-100 py-2 px-4 rounded-lg">
                                                        Handed Over
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'claimed' && (
                    <>
                        <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">Items You Claimed</h3>
                        {claimedItems.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                                <FiTag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                <h3 className="mt-2 text-2xl font-bold text-gray-900">No items claimed by you yet!</h3>
                                <p className="mt-2 text-lg text-gray-600">
                                    Browse the gallery and verify items to claim them.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out"
                                >
                                    View Gallery
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {claimedItems.map(item => (
                                    <div
                                        key={item.itemId}
                                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative"
                                    >
                                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md
                                            ${item.status === 'active' ? 'bg-blue-500 text-white' :
                                                item.status === 'pending_handover' ? 'bg-yellow-500 text-white' :
                                                    item.status === 'handed_over' ? 'bg-green-500 text-white' :
                                                        'bg-gray-500 text-white'}`}>
                                            {item.status ? item.status.replace(/_/g, ' ') : 'Unknown'}
                                        </div>
                                        <div className="relative h-56">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.itemName || 'Item image'}
                                                className="absolute h-full w-full object-cover rounded-t-2xl"
                                                onError={(e) => {
                                                    e.target.src = "https://placehold.co/400x300/e0e0e0/555555?text=No+Image";
                                                }}
                                            />
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                                                {item.itemName || 'Unnamed Item'}
                                            </h3>
                                            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                                {item.description || 'No description provided.'}
                                            </p>
                                            <div className="flex items-center text-gray-600 text-sm mb-2">
                                                <FiMapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                {item.location || 'Unknown Location'}
                                            </div>
                                            <div className="flex items-center text-gray-600 text-sm mb-4">
                                                <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Invalid Date'}
                                            </div>
                                            {item.status === 'pending_handover' && (
                                                 <span className="flex-1 text-center text-sm font-medium text-yellow-700 bg-yellow-100 py-2 px-4 rounded-lg">
                                                    Pending Handover
                                                 </span>
                                            )}
                                            {item.status === 'handed_over' && (
                                                 <span className="flex-1 text-center text-sm font-medium text-green-700 bg-green-100 py-2 px-4 rounded-lg">
                                                    Handed Over
                                                 </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default UserProfile; // Export as UserProfile