// src/components/VerifyItem.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLostItemByVerificationCode, claimItem } from '../dynamoService';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

function VerifyItem() {
    const { verificationCode } = useParams();
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState('loading'); // 'loading', 'success', 'error', 'claimed'
    const [itemDetails, setItemDetails] = useState(null);
    const [error, setError] = useState(null);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimMessage, setClaimMessage] = useState('');
    const [claimMessageType, setClaimMessageType] = useState(''); // 'success' or 'error'

    // useRef to prevent duplicate API calls on re-renders, especially with React 18 strict mode
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        console.log("LOG 1: VerifyItem useEffect triggered for code:", verificationCode);

        // Prevent fetching twice in strict mode
        if (hasFetchedRef.current) {
            console.log("LOG Skip: API call already initiated in this mount cycle. Skipping.");
            return;
        }

        const verifyAndFetchItem = async () => {
            // Using sessionStorage to cache verification result for the current session
            const SESSION_STORAGE_KEY = `verified_${verificationCode}`;
            const STORED_ITEM_DETAILS_KEY = `itemDetails_${verificationCode}`;

            console.log("LOG 2: Checking sessionStorage for key:", SESSION_STORAGE_KEY);
            const isVerifiedInSession = sessionStorage.getItem(SESSION_STORAGE_KEY);

            if (isVerifiedInSession === 'true') {
                console.log("LOG 3: Found in sessionStorage, attempting to display cached details.");
                try {
                    const storedDetails = JSON.parse(sessionStorage.getItem(STORED_ITEM_DETAILS_KEY));
                    if (storedDetails) {
                        setItemDetails(storedDetails);
                        setVerificationStatus('success');
                        setError(null);
                        console.log("LOG 4: Displayed cached details. Returning from verifyAndFetchItem.");
                        return; // Exit if already successfully verified and cached
                    }
                } catch (e) {
                    console.error("LOG 5: Error parsing stored item details from session storage:", e);
                    // If parsing fails, proceed to fetch from API
                }
            }

            hasFetchedRef.current = true; // Mark as fetched for this mount cycle
            console.log("LOG 6: Not found in sessionStorage or parsing failed. Proceeding with API call.");
            setVerificationStatus('loading');
            setError(null);

            try {
                // Call the service function to get item details by verification code
                const data = await getLostItemByVerificationCode(verificationCode);
                console.log("LOG 8: API call successful, received data:", data);

                setItemDetails(data.itemDetails);
                setVerificationStatus('success');

                console.log("LOG 9: Setting sessionStorage for key:", SESSION_STORAGE_KEY);
                sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
                sessionStorage.setItem(STORED_ITEM_DETAILS_KEY, JSON.stringify(data.itemDetails));

            } catch (err) {
                console.error("LOG 10: API Error during verification:", err);
                setError(err.message || "Network error or unexpected issue during verification.");
                setVerificationStatus('error');
            }
        };

        if (verificationCode) {
            verifyAndFetchItem();
        } else {
            setVerificationStatus('error');
            setError("No verification code provided in the URL.");
        }
    }, [verificationCode]);

    const handleClaimItem = async () => {
        setIsClaiming(true);
        setClaimMessage('');
        setClaimMessageType('');
        try {
            // Call the service function to claim the item
            const result = await claimItem(verificationCode);
            setClaimMessage(result.message || "Item successfully claimed!");
            setClaimMessageType('success');
            setVerificationStatus('claimed');
            navigate('/my-profile');
        } catch (err) {
            console.error("Error during item claim:", err);
            setClaimMessage(err.message || "Failed to claim item. Please ensure you are logged in and eligible.");
            setClaimMessageType('error');
        } finally {
            setIsClaiming(false);
        }
    };


    if (verificationStatus === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                        <p className="text-lg text-gray-700">Verifying item...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (verificationStatus === 'error') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center">
                    <FiXCircle className="mx-auto text-red-500 text-6xl mb-4 h-16 w-16" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                    <p className="text-gray-600 mb-6">{error || "An unexpected error occurred during verification."}</p>
                    <button
                        onClick={() => navigate('/')} // Navigate back to home or a suitable page
                        className="mt-6 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    // Display for success or claimed status
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Item Verification</h2>

                {itemDetails ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <div className="md:col-span-1 flex flex-col items-center justify-center">
                            <img
                                src={itemDetails.imageUrl}
                                alt={itemDetails.itemName || 'Item image'}
                                className="w-full max-h-64 object-cover rounded-lg shadow-md mb-4"
                                onError={(e) => { e.target.src = "https://placehold.co/400x300/e0e0e0/555555?text=No+Image"; }}
                            />
                             <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide mt-2
                                ${itemDetails.itemType === 'lost' ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'}`}>
                                {itemDetails.itemType === 'lost' ? 'Lost Item' : 'Found Item'}
                            </div>
                        </div>
                        <div className="md:col-span-1 space-y-4">
                            <h3 className="text-2xl font-bold text-gray-800">{itemDetails.itemName || 'Unnamed Item'}</h3>
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Description:</p>
                                <p className="text-gray-700">{itemDetails.description || 'No description provided.'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Location:</p>
                                <p className="text-gray-700">{itemDetails.location || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Date:</p>
                                <p className="text-gray-700">{itemDetails.createdAt ? new Date(itemDetails.createdAt).toLocaleDateString() : 'Invalid Date'}</p>
                            </div>
                            {itemDetails.contactInfo && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">Contact Info (Uploader):</p>
                                    <p className="text-gray-700">{itemDetails.contactInfo}</p>
                                </div>
                            )}
                            {itemDetails.status === 'pending_handover' && itemDetails.claimedByUserId && (
                                <div className="p-3 bg-yellow-50 rounded-lg text-yellow-800 border border-yellow-200">
                                    <p className="font-semibold text-sm flex items-center">
                                        <FiAlertCircle className="h-4 w-4 mr-2" />
                                        Currently pending handover.
                                    </p>
                                    <p className="text-xs mt-1">
                                        A claim has been initiated for this item.
                                    </p>
                                </div>
                            )}
                             {itemDetails.status === 'handed_over' && (
                                <div className="p-3 bg-green-50 rounded-lg text-green-800 border border-green-200">
                                    <p className="font-semibold text-sm flex items-center">
                                        <FiCheckCircle className="h-4 w-4 mr-2" />
                                        This item has been successfully handed over!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-600">No item details available.</p>
                )}

                {claimMessage && (
                    <div className={`mt-6 p-3 rounded-md ${claimMessageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {claimMessage}
                    </div>
                )}

                {/* Show "Claim This Item" button only if:
                    1. Item exists and is not already 'handed_over'.
                    2. Item is not already in 'pending_handover' status with a claimant (prevents multiple claims).
                    The backend will also enforce these checks.
                */}
                {itemDetails && itemDetails.status !== 'handed_over' && (
                    <div className="mt-8">
                        {verificationStatus === 'success' && (
                            <button
                                onClick={handleClaimItem}
                                disabled={isClaiming || (itemDetails.status === 'pending_handover' && itemDetails.claimedByUserId)}
                                className={`px-6 py-3 rounded-full font-semibold text-white shadow-md transition duration-200
                                    ${isClaiming || (itemDetails.status === 'pending_handover' && itemDetails.claimedByUserId)
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    }`}
                            >
                                {isClaiming ? 'Claiming...' : (itemDetails.status === 'pending_handover' && itemDetails.claimedByUserId) ? 'Claim Initiated' : 'Claim This Item'}
                            </button>
                        )}
                    </div>
                )}

                <button
                    onClick={() => navigate('/')}
                    className="mt-6 text-gray-600 hover:text-gray-800 font-medium px-4 py-2 transition-colors duration-200"
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
}

export default VerifyItem;