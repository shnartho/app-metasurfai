import React, { useState } from 'react';
import { apiCall } from '../../utils/api';

const AddAdModal = ({ closeModal, onSubmit, onlyUrl = false, postedBy: initialPostedBy = '', error: propError }) => {
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [description, setDescription] = useState('');
    const [region, setRegion] = useState('');
    const [rewardPerView, setRewardPerView] = useState(0);
    const [budget, setBudget] = useState(0);
    const [error, setError] = useState(propError || '');
    const userProfile = (() => { try { return JSON.parse(localStorage.getItem('userProfile')); } catch { return null; } })();
    const defaultPostedBy = userProfile?.email || initialPostedBy;
    const [postedBy, setPostedBy] = useState(defaultPostedBy);

    const isNewApi = (process.env.NEXT_PUBLIC_USE_NEW_API === 'true');

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
        setImageUrl(''); // Disable URL if file is chosen
    };

    const handleRemoveFile = () => {
        setImageFile(null);
        // Also clear the file input value
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Ref for file input to clear it programmatically
    const fileInputRef = React.useRef();

    const handleUrlChange = (e) => {
        setImageUrl(e.target.value);
        setImageFile(null); // Disable file if URL is entered
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!imageFile && !imageUrl) {
            setError('Please provide an image file or image URL.');
            return;
        }
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            let image_url = imageUrl;
            const base = isNewApi ? 'new' : 'old';
            if (isNewApi && imageFile) {
                // Upload image and use image_url from response
                const uploadRes = await apiCall('uploadImage', {
                    body: { file: imageFile },
                    token,
                    base
                });
                if (uploadRes && uploadRes.image_url) {
                    image_url = uploadRes.image_url;
                } else {
                    throw new Error('Image upload succeeded but no image_url returned.');
                }
            }
            // Always send correct fields for new API
            const adData = {
                title,
                image_url,
                description,
                region,
                budget: Number(budget),
                reward_per_view: Number(rewardPerView)
            };
            await apiCall('createAd', {
                body: adData,
                token,
                base
            });
            if (onSubmit) await onSubmit(adData);
            closeModal();
        } catch (err) {
            setError(err.message || 'Error creating ad.');
        }
    };

    return (
        <div className="flex justify-center items-center">
            <div className="p-0 rounded-lg shadow-lg backdrop-blur-md border-0">
                <div className="p-6 rounded-lg shadow-lg w-full max-w-3xl mx-4 border-2 border-opacity-50 border-pink-600 dark:border-blue-600 bg-gray-900 text-gray-100">
                    <h2 className="text-2xl font-bold mb-4">Upload Your Ad</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-100">Title:</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        {isNewApi ? (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-100">Image File:</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                            disabled={!!imageUrl}
                                            ref={fileInputRef}
                                        />
                                        {imageFile && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="ml-2 text-red-500 text-lg font-bold focus:outline-none"
                                                title="Remove file"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    {imageFile && (
                                        <div className="text-xs text-gray-300 mt-1 flex items-center">
                                            <span>{imageFile.name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-100">Or Image URL:</label>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={handleUrlChange}
                                        className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                        placeholder="https://..."
                                        disabled={!!imageFile}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-gray-100">Image URL:</label>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={handleUrlChange}
                                    className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                    placeholder="https://..."
                                    required
                                />
                            </div>
                        )}
                        {error && <div className="text-red-500 mb-2">{error}</div>}
                        <div className="mb-4">
                            <label className="block text-gray-100">Description:</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-100">Posted By:</label>
                            <input
                                type="text"
                                value={postedBy}
                                readOnly
                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-gray-200 dark:bg-gray-800 dark:text-white cursor-not-allowed opacity-70"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-100">Budget:</label>
                            <input
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(Number(e.target.value))}
                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-100">Reward Per View:</label>
                            <input
                                type="number"
                                value={rewardPerView}
                                onChange={(e) => setRewardPerView(Number(e.target.value))}
                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-100">Max Views:</label>
                            <input
                                type="number"
                                value={rewardPerView > 0 ? Math.floor(Number(budget) / Number(rewardPerView)) : 0}
                                readOnly
                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-gray-200 dark:bg-gray-800 dark:text-white cursor-not-allowed opacity-70"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-100">Region:</label>
                            <input
                                type="text"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={closeModal} className="mr-4 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-pink-600 dark:bg-blue-600 text-white rounded">Upload</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default AddAdModal;
