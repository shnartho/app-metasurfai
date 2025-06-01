import React, { useState } from 'react';

const AddAdModal = ({ closeModal }) => {
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [postedBy, setPostedBy] = useState('');
    const [maxViews, setMaxViews] = useState(0);
    const [region, setRegion] = useState('');
    const [tokenReward, setTokenReward] = useState(0);

    const handleSubmit = (event) => {
        event.preventDefault();
        const adData = {
            title,
            image_url: imageUrl,
            view_count: 0, // Default value
            description,
            posted_by: postedBy,
            active: true, // Default value
            max_views: maxViews,
            region,
            token_reward: tokenReward
        };
        console.log('Ad data:', adData);
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
                        <label className="block text-gray-100">Image URL:</label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                            required
                        />
                    </div>
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
