import React, { useState } from 'react';
import { apiCall } from '../../utils/api';

const AddAdModal = ({ closeModal, onSubmit, onlyUrl = false, postedBy = '', error: propError }) => {
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [description, setDescription] = useState('');
    const [region, setRegion] = useState('');
    const [tokenReward, setTokenReward] = useState(0);
    const [maxViews, setMaxViews] = useState(0);
    const [error, setError] = useState(propError || '');

    const isNewApi = (process.env.NEXT_PUBLIC_USE_NEW_API === 'true');

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
        setImageUrl('');
    };

    const handleUrlChange = (e) => {
        setImageUrl(e.target.value);
        setImageFile(null); // Clear file if URL is entered
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
            const base = isNewApi() ? 'new' : 'old';
            if (isNewApi()) {
                // New API logic: file upload or URL
                if (imageFile) {
                    // 1. Upload image
                    await apiCall('uploadImage', {
                        body: { file: imageFile },
                        token,
                        base
                    });
                    // 2. Get presigned URLs
                    const imagesRes = await apiCall('getImages', {
                        token,
                        base
                    });
                    // 3. Find the most recent image with a presigned_url
                    if (imagesRes && Array.isArray(imagesRes.images) && imagesRes.images.length > 0) {
                        const lastImage = imagesRes.images[imagesRes.images.length - 1];
                        image_url = lastImage.presigned_url || lastImage.url || lastImage.image_url;
                    } else {
                        throw new Error('Image upload succeeded but no presigned URL found.');
                    }
                }
                // 4. Create ad (new API)
                const adData = {
                    title,
                    image_url,
                    description,
                    posted_by: postedBy,
                    active: true,
                    max_views: maxViews,
                    region,
                    token_reward: tokenReward
                };
                await apiCall('createAd', {
                    body: adData,
                    token,
                    base
                });
                if (onSubmit) await onSubmit(adData);
                closeModal();
            } else {
                // Old API logic: just post ad data as JSON, ignore file
                const adData = {
                    title,
                    image_url: imageUrl, // Only use URL, not file
                    description,
                    posted_by: postedBy,
                    active: true,
                    max_views: maxViews,
                    region,
                    token_reward: tokenReward
                };
                await apiCall('createAd', {
                    body: adData,
                    token,
                    base
                });
                if (onSubmit) await onSubmit(adData);
                closeModal();
            }
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
                        {isNewApi() ? (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-100">Image File:</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-100">Or Image URL:</label>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={handleUrlChange}
                                        className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                        placeholder="https://..."
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
                                onChange={(e) => setPostedBy(e.target.value)}
                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-100">Max Views:</label>
                            <input
                                type="number"
                                value={maxViews}
                                onChange={(e) => setMaxViews(Number(e.target.value))}
                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                required
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
                        <div className="mb-4">
                            <label className="block text-gray-100">Token Reward:</label>
                            <input
                                type="number"
                                value={tokenReward}
                                onChange={(e) => setTokenReward(Number(e.target.value))}
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
