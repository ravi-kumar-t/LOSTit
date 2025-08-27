// src/components/UploadLostItemForm.js
import React, { useState } from 'react';
import { saveItemToDynamoDB } from "../dynamoService"; // Ensure this path is correct
import { FiUpload, FiCheckCircle, FiXCircle, FiCalendar, FiMapPin, FiTag, FiSearch, FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function UploadLostItemForm() {
    const navigate = useNavigate(); // Initialize navigate hook

    const [formData, setFormData] = useState({
        itemType: 'lost', // 'lost' or 'found'
        itemName: '',
        description: '',
        location: '',
        dateLost: '' // This maps to 'createdAt' in the backend
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [verificationCode, setVerificationCode] = useState(''); // State for verification code

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setFile(null);
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        setVerificationCode(''); // Clear previous code

        if (!file) { // Image is mandatory for this flow
            setSubmitStatus({ success: false, message: "Please select an image first!" });
            setIsSubmitting(false);
            return;
        }

        try {
            const { itemId, verificationCode: newVerificationCode } = await saveItemToDynamoDB(formData, file);

            setSubmitStatus({
                success: true,
                message: `Item ${formData.itemType === 'lost' ? 'lost' : 'found'} report submitted successfully!`
            });
            setVerificationCode(newVerificationCode); // Set the verification code

            // Clear the form and image preview
            setFormData({
                itemType: 'lost',
                itemName: '',
                description: '',
                location: '',
                dateLost: ''
            });
            setFile(null);
            setPreview(null);


        } catch (error) {
            console.error('Upload error:', error);
            setSubmitStatus({
                success: false,
                message: error.message || 'Upload failed. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Report Lost or Found Item</h2>
                    <p className="mt-2 text-lg text-gray-600">
                        Help reunite items with their owners by providing detailed information.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                        {/* Item Type Selector */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                I am reporting a...
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, itemType: 'lost'})}
                                    className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all ${formData.itemType === 'lost' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <FiSearch className={`h-6 w-6 mr-2 ${formData.itemType === 'lost' ? 'text-red-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${formData.itemType === 'lost' ? 'text-red-600' : 'text-gray-600'}`}>Lost Item</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, itemType: 'found'})}
                                    className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all ${formData.itemType === 'found' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <FiPackage className={`h-6 w-6 mr-2 ${formData.itemType === 'found' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${formData.itemType === 'found' ? 'text-indigo-600' : 'text-gray-600'}`}>Found Item</span>
                                </button>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Image
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-gray-400 transition-colors">
                                <div className="space-y-1 text-center">
                                    {preview ? (
                                        <div className="relative group">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="mx-auto h-48 w-full object-cover rounded-lg"
                                            />
                                            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <div className="text-white text-center">
                                                    <FiUpload className="mx-auto h-8 w-8" />
                                                    <span className="block mt-2">Change Image</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-center">
                                                <FiUpload className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                    <span>Upload a file</span>
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        className="sr-only"
                                                        accept="image/*"
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG up to 5MB
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Item Name */}
                            <div className="sm:col-span-2">
                                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">
                                    {formData.itemType === 'lost' ? 'What did you lose?' : 'What did you find?'}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiTag className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="itemName"
                                        id="itemName"
                                        value={formData.itemName}
                                        onChange={handleInputChange}
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                                        placeholder={formData.itemType === 'lost' ? "e.g. Black Wallet, iPhone 12" : "e.g. Blue Backpack, Gold Ring"}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        name="description"
                                        id="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4"
                                        placeholder={`Provide detailed description including any distinguishing features${formData.itemType === 'found' ? ' and where you found it' : ''}`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                    {formData.itemType === 'lost' ? 'Where did you lose it?' : 'Where did you find it?'}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="location"
                                        id="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                                        placeholder="e.g. Central Park, Building A"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label htmlFor="dateLost" className="block text-sm font-medium text-gray-700">
                                    {formData.itemType === 'lost' ? 'When did you lose it?' : 'When did you find it?'}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiCalendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        name="dateLost"
                                        id="dateLost"
                                        value={formData.dateLost}
                                        onChange={handleInputChange}
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status Message */}
                        {submitStatus && (
                            <div className={`mt-6 p-4 rounded-md ${submitStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        {submitStatus.success ? (
                                            <FiCheckCircle className="h-5 w-5 text-green-400" />
                                        ) : (
                                            <FiXCircle className="h-5 w-5 text-red-400" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${submitStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                                            {submitStatus.message}
                                            {submitStatus.success && verificationCode && (
                                                <> <br/>Your verification code is: <strong>{verificationCode}</strong></>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white
                                    ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'}
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    `Submit ${formData.itemType === 'lost' ? 'Lost' : 'Found'} Item Report`
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>By submitting this form, you agree to our <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a>.</p>
                </div>
            </div>
        </div>
    );
}

export default UploadLostItemForm;
