
import React, { useState } from 'react';

const AddAdModal = ({ closeModal, onSubmit, onlyUrl = false, postedBy = '', error }) => {
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [description, setDescription] = useState('');
    const [region, setRegion] = useState('');
    const [tokenReward, setTokenReward] = useState(0);
    const [maxViews, setMaxViews] = useState(0);

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
        const adData = {
            title,
            image_url: imageUrl,
            image_file: imageFile,
            view_count: 0,
            description,
            posted_by: postedBy,
            active: true,
            max_views: maxViews,
            region,
            token_reward: tokenReward
        };
        if (onSubmit) {
            await onSubmit(adData);
        }
        closeModal();
    };

    return (
        <div className="flex justify-center items-center">
        <div className="z-50 bg-black bg-opacity-10 text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600 dark:border-blue-600">                

            <div className=" p-6 rounded-lg shadow-lg w-full max-w-3xl mx-4">
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
