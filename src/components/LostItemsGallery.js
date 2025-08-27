// src/components/LostItemsGallery.js

import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify'; // Import Auth for user session
import { getLostItemsFromDynamoDB } from '../dynamoService'; // Import the service function
import { QRCodeSVG } from 'qrcode.react'; // Import QRCodeSVG for generating QR codes

// Import icons for UI
import {
    FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp,
    FiCalendar, FiMapPin, FiTag
} from 'react-icons/fi';

function LostItemsGallery() {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [generatedVerificationCode, setGeneratedVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        itemType: 'all',
        sortBy: 'newest',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState(null);

    // API Gateway URL for generating verification codes (POST /verify)
    const API_VERIFY_GENERATE_URL = "https://9t8oykqn5j.execute-api.us-east-1.amazonaws.com/prod/verify";

    // Effect to fetch items on component mount
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await getLostItemsFromDynamoDB();
                console.log("Fetched items data (Gallery):", data);
                setItems(data);
                setFilteredItems(data);
                setError(null); // Clear any previous errors on successful fetch
            } catch (error) {
                console.error("Error fetching items (Gallery):", error);
                setError("Failed to load items. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchItems();
    }, []); // Empty dependency array means this runs once on mount

    // Effect to apply filters and search terms
    useEffect(() => {
        let result = [...items];

        // Filter by item type
        if (filters.itemType !== 'all') {
            result = result.filter(item => item.itemType === filters.itemType);
        }

        // Filter by search term (case-insensitive)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.itemName && item.itemName.toLowerCase().includes(term)) ||
                (item.description && item.description.toLowerCase().includes(term)) ||
                (item.location && item.location.toLowerCase().includes(term))
            );
        }

        // Sort items based on selected criteria
        switch (filters.sortBy) {
            case 'newest':
                // Sort by creation date, newest first
                result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            case 'oldest':
                // Sort by creation date, oldest first
                result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
                break;
            case 'name-asc':
                // Sort by item name ascending
                result.sort((a, b) => (a.itemName || '').localeCompare(b.itemName || ''));
                break;
            case 'name-desc':
                // Sort by item name descending
                result.sort((a, b) => (b.itemName || '').localeCompare(a.itemName || ''));
                break;
            default:
                break;
        }

        setFilteredItems(result);
    }, [items, searchTerm, filters]); // Re-run when items, search term, or filters change

    // Handles generating the QR code link for an item
    const handleGenerateQR = async (item) => {
        setSelectedItem(item);
        setGeneratedVerificationCode(''); // Clear any previous code
        setError(null); // Clear any previous errors
        setIsGeneratingQR(true); // Set loading state
        setShowQRModal(true); // Show the modal immediately

        try {
            // Get the user's ID token from Amplify for authentication
            // This token will be sent in the Authorization header to API Gateway
            const session = await Auth.currentSession();
            const userToken = session.getIdToken().getJwtToken();

            // Make the POST request to your Lambda to generate the verification code
            const response = await fetch(API_VERIFY_GENERATE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}` // Send the authentication token
                },
                body: JSON.stringify({ itemId: item.itemId }), // Send the item ID to generate code for
            });

            // Check if the API call was successful
            if (!response.ok) {
                const errorData = await response.json();
                // Throw an error with the message from the API if available
                throw new Error(errorData.message || 'Failed to generate verification code.');
            }

            // Parse the response to get the generated verification code
            const data = await response.json();
            // Construct the full URL that the QR code will represent
            const fullVerificationUrl = `${window.location.origin}/verify/${data.verificationCode}`;
            setGeneratedVerificationCode(fullVerificationUrl); // Store the full URL for the QR code
        } catch (err) {
            console.error("Error generating QR code:", err);
            if ((err.message && err.message.includes("No current user")) || err.message.includes("User not authenticated")) {
                setError("You must be logged in to generate a verification link. Please log in.");
            } else if (err.message && err.message.includes("Unauthorized: You can only generate a verification link for items you have uploaded.")) {
                 setError("You are not authorized to generate a link for this item. Only the uploader can do so.");
            }
            else {
                setError(err.message || "Failed to generate QR code for verification.");
            }
        } finally {
            setIsGeneratingQR(false); // End loading state
        }
    };

    // Closes the QR code modal and resets its state
    const handleCloseQRModal = () => {
        setShowQRModal(false);
        setSelectedItem(null);
        setGeneratedVerificationCode('');
        setError(null);
        setIsGeneratingQR(false);
    };

    // Resets all search and filter criteria
    const resetFilters = () => {
        setSearchTerm("");
        setFilters({
            itemType: 'all',
            sortBy: 'newest'
        });
    };

    // Display loading spinner while fetching items
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="ml-3 text-gray-600">Loading items...</span>
            </div>
        );
    }

    // Display a global error message if fetching items failed (and modal is not open)
    if (error && !showQRModal) {
        return <div className="text-center py-12 text-lg text-red-600">Error: {error}</div>;
    }

    // Main component render
    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                Lost & Found Gallery
            </h2>

            {/* Search and Filter Section */}
            <div className="mb-8 bg-white p-4 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, description or location..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <FiFilter className="mr-2" />
                        Filters
                        {showFilters ? (
                            <FiChevronUp className="ml-2" />
                        ) : (
                            <FiChevronDown className="ml-2" />
                        )}
                    </button>
                </div>

                {/* Collapsible Filter Options */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Item Type
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setFilters({...filters, itemType: 'all'})}
                                        className={`py-2 px-3 rounded-md text-sm font-medium ${filters.itemType === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilters({...filters, itemType: 'lost'})}
                                        className={`py-2 px-3 rounded-md text-sm font-medium ${filters.itemType === 'lost' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Lost
                                    </button>
                                    <button
                                        onClick={() => setFilters({...filters, itemType: 'found'})}
                                        className={`py-2 px-3 rounded-md text-sm font-medium ${filters.itemType === 'found' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Found
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort By
                                </label>
                                <select
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={resetFilters}
                                className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                            >
                                <FiX className="mr-1" />
                                Reset all filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Item Count and Clear Filters */}
            <div className="mb-4 text-sm text-gray-600">
                Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                {(searchTerm || filters.itemType !== 'all') && (
                    <button
                        onClick={resetFilters}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                        (Clear filters)
                    </button>
                )}
            </div>

            {/* No Items Found Message */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No items found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
                    <button
                        onClick={resetFilters}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Reset filters
                    </button>
                </div>
            ) : (
                // Item Gallery Grid
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <div
                            key={item.itemId}
                            onClick={() => handleGenerateQR(item)} // Click to open modal and generate QR
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer transform hover:-translate-y-1"
                        >
                            <div className="relative h-48">
                                <img
                                    src={item.imageUrl}
                                    alt={item.itemName || 'Item image'}
                                    className="absolute h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.src = "https://placehold.co/300x200/cccccc/000000?text=No+Image";
                                    }}
                                />
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${item.itemType === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    {item.itemType === 'lost' ? 'Lost' : 'Found'}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                                    {item.itemName || 'Unnamed Item'}
                                </h3>
                                <div className="flex items-center text-gray-600 text-sm mb-2">
                                    <FiMapPin className="w-4 h-4 mr-1 text-gray-500" />
                                    {item.location || 'Unknown Location'}
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <FiCalendar className="w-4 h-4 mr-1 text-gray-500" />
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Invalid Date'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Code Modal (Item Details and Verification) */}
            {showQRModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn transition-opacity duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleIn transition-transform duration-300">
                        {/* Close button for the modal */}
                        <button
                            onClick={handleCloseQRModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                            aria-label="Close modal"
                        >
                            <FiX />
                        </button>
                        <div className="grid md:grid-cols-2 gap-8 p-8">
                            {/* Item Image Section within modal */}
                            <div>
                                <img
                                    src={selectedItem.imageUrl}
                                    alt={selectedItem.itemName || 'Item image'}
                                    className="w-full h-auto rounded-xl object-cover max-h-96 shadow-md"
                                    onError={(e) => {
                                        e.target.src = "https://placehold.co/600x400/e0e0e0/555555?text=No+Image";
                                    }}
                                />
                            </div>

                            {/* Item Details and QR Section within modal */}
                            <div>
                                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide mb-4 ${selectedItem.itemType === 'lost' ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'}`}>
                                    {selectedItem.itemType === 'lost' ? 'Lost Item' : 'Found Item'}
                                </div>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                                    {selectedItem.itemName || 'Unnamed Item'}
                                </h2>
                                <div className="space-y-4 text-gray-700">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
                                        <p className="leading-relaxed">{selectedItem.description || 'No description provided.'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 mb-1">Location</h3>
                                            <p>{selectedItem.location || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 mb-1">
                                                {selectedItem.itemType === 'lost' ? 'Date Lost' : 'Date Found'}
                                            </h3>
                                            <p>
                                                {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString() : 'Invalid Date'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedItem.contactInfo && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 mb-1">Contact Info</h3>
                                            <p>{selectedItem.contactInfo}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 text-center">
                                    {isGeneratingQR ? (
                                        // Loading spinner while QR code is being generated
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-indigo-500 mb-4"></div>
                                            <p className="text-lg text-gray-700 font-semibold">Generating verification link...</p>
                                        </div>
                                    ) : generatedVerificationCode && generatedVerificationCode !== 'ERROR' ? (
                                        // Display QR code and verification link
                                        <div className="space-y-5">
                                            <p className="text-lg text-gray-700 font-medium">
                                                {selectedItem.itemType === 'lost'
                                                    ? "Share this QR code with the finder for verification:"
                                                    : "Share this QR code with the owner for verification:"}
                                            </p>
                                            <div className="flex justify-center p-5 bg-white rounded-xl border-2 border-gray-100 shadow-lg">
                                                <QRCodeSVG
                                                    value={generatedVerificationCode} // Data to encode in the QR code
                                                    size={256} // Size of the QR code in pixels
                                                    level={"H"} // Error correction level (H is highest)
                                                    includeMargin={false} // No extra margin around the QR code
                                                />
                                            </div>
                                            {/* Button to open the verification page directly */}
                                            <a
                                                href={generatedVerificationCode}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out mt-4"
                                            >
                                                Open Verification Page
                                                <FiTag className="ml-2" />
                                            </a>
                                        </div>
                                    ) : (
                                        // "Generate Link" button (initial state)
                                        <>
                                            <button
                                                onClick={() => handleGenerateQR(selectedItem)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-300 shadow-lg focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                {selectedItem.itemType === 'lost' ? 'Generate Link for Claim' : 'Generate Link for Handover'}
                                            </button>
                                            {error && (
                                                <p className="mt-5 text-base text-red-600">Error: {error}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Modal Footer */}
                        <div className="px-8 py-5 bg-gray-50 rounded-b-3xl flex justify-end border-t border-gray-100">
                            <button
                                onClick={handleCloseQRModal}
                                className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LostItemsGallery;
