import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/api';
import { REGIONS, getContinents, getRegionsByContinent, getRegionByCode } from '../../utils/regions';

const AddAdModal = ({ 
    closeModal, 
    onSubmit, 
    onAdCreated,
    onlyUrl = false, 
    postedBy: initialPostedBy = '', 
    error: propError,
    editMode = false,
    adData = null,
    updateAd = null
}) => {
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [description, setDescription] = useState('');
    const [region, setRegion] = useState('');
    const [continent, setContinent] = useState('');
    const [availableRegions, setAvailableRegions] = useState([]);
    const [rewardPerView, setRewardPerView] = useState(0);
    const [budget, setBudget] = useState(0);
    const [adType, setAdType] = useState('native'); // Default to native
    const [redirectionLink, setRedirectionLink] = useState('');
    const [error, setError] = useState(propError || '');
    
    // Track original values for comparison in edit mode
    const [originalData, setOriginalData] = useState({});
    
    const userProfile = (() => { try { return JSON.parse(localStorage.getItem('userProfile')); } catch { return null; } })();
    const defaultPostedBy = userProfile?.email || initialPostedBy;
    const [postedBy, setPostedBy] = useState(defaultPostedBy);
    const token = localStorage.getItem('authToken');

    const isNewApi = (process.env.NEXT_PUBLIC_USE_NEW_API === 'true');

    // Pre-populate form when in edit mode
    useEffect(() => {
        if (editMode && adData) {
            const initialTitle = adData.title || '';
            const initialImageUrl = adData.image_url || '';
            const initialDescription = adData.description || '';
            const initialRegion = adData.region || '';
            const initialRewardPerView = adData.reward_per_view || adData.token_reward || 0;
            const initialBudget = adData.budget || 0;
            const initialAdType = adData.type || 'native';
            const initialRedirectionLink = adData.redirection_link || '';
            
            // Set current values
            setTitle(initialTitle);
            setImageUrl(initialImageUrl);
            setDescription(initialDescription);
            setRegion(initialRegion);
            setRewardPerView(initialRewardPerView);
            setBudget(initialBudget);
            setAdType(initialAdType);
            setRedirectionLink(initialRedirectionLink);
            
            // Store original data for comparison
            setOriginalData({
                title: initialTitle,
                image_url: initialImageUrl,
                description: initialDescription,
                region: initialRegion,
                reward_per_view: initialRewardPerView,
                budget: initialBudget,
                type: initialAdType,
                redirection_link: initialRedirectionLink
            });
            
            // Handle region and continent for edit mode
            if (initialRegion) {
                const regionData = getRegionByCode(initialRegion);
                if (regionData) {
                    setContinent(regionData.continent);
                    setAvailableRegions(getRegionsByContinent(regionData.continent));
                }
            }
            
            // Don't change postedBy in edit mode, keep it as is
        }
    }, [editMode, adData]);

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

    const handleContinentChange = (e) => {
        const selectedContinent = e.target.value;
        setContinent(selectedContinent);
        setRegion(''); // Reset region when continent changes
        
        if (selectedContinent) {
            setAvailableRegions(getRegionsByContinent(selectedContinent));
        } else {
            setAvailableRegions([]);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!imageFile && !imageUrl) {
            setError('Please provide an image file or image URL.');
            return;
        }
        if (adType === 'redirect' && !redirectionLink) {
            setError('Please provide a redirection link for redirect ads.');
            return;
        }
        setError('');
        try {
            let image_url = imageUrl;
            const base = isNewApi ? 'new' : 'old';
            
            // Only upload new image if a file is selected
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
            
            // Prepare ad data
            if (editMode && adData && updateAd) {
                // For edit mode, only send changed fields
                const changedFields = {};
                
                // Check each field for changes and only include modified ones
                if (title !== originalData.title) {
                    changedFields.title = title;
                }
                if (image_url !== originalData.image_url) {
                    changedFields.image_url = image_url;
                }
                if (description !== originalData.description) {
                    changedFields.description = description;
                }
                if (region !== originalData.region) {
                    changedFields.region = region;
                }
                if (Number(budget) !== Number(originalData.budget)) {
                    changedFields.budget = Number(budget);
                }
                if (Number(rewardPerView) !== Number(originalData.reward_per_view)) {
                    changedFields.reward_per_view = Number(rewardPerView);
                }
                if (adType !== originalData.type) {
                    changedFields.type = adType;
                }
                if (redirectionLink !== originalData.redirection_link) {
                    changedFields.redirection_link = adType === 'redirect' ? redirectionLink : null;
                }
                
                
                // Update existing ad with only changed fields (updateAd handles the id separately)
                await updateAd(adData.id || adData._id, changedFields);
            } else {
                // Create new ad with all fields
                const adDataPayload = {
                    title,
                    image_url,
                    description,
                    region,
                    budget: Number(budget),
                    reward_per_view: Number(rewardPerView),
                    type: adType,
                    redirection_link: adType === 'redirect' ? redirectionLink : null
                };
                
                await apiCall('createAd', {
                    body: adDataPayload,
                    token,
                    base
                });
                
                if (onSubmit) await onSubmit(adDataPayload);
                if (onAdCreated) await onAdCreated(adDataPayload);
            }
            closeModal();
        } catch (err) {
            setError(err.message || 'Error saving ad.');
        }
    };

    return (
        <div className="flex justify-center items-center">
            <div className="p-0 rounded-lg shadow-lg backdrop-blur-md border-0">
                <div className="p-6 rounded-lg shadow-lg w-full max-w-3xl mx-4 border-2 border-opacity-50 border-pink-600 dark:border-blue-600 bg-gray-900 text-gray-100">
                    <h2 className="text-2xl font-bold mb-4">
                        {editMode ? 'Edit Your Ad' : 'Upload Your Ad'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        {/* Title and Posted By in one row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-100">Title:</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-100">Posted By:</label>
                                <input
                                    type="text"
                                    value={postedBy}
                                    readOnly
                                    className="form-input mt-1 block w-full pl-2 border border-black text-black bg-gray-200 dark:bg-gray-800 dark:text-white cursor-not-allowed opacity-70"
                                    required
                                />
                            </div>
                        </div>
                        {isNewApi ? (
                            <div className="mb-4">
                                {/* Show existing image preview in edit mode */}
                                {editMode && imageUrl && !imageFile ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {/* Current Image - Left Side */}
                                        <div>
                                            <label className="block text-gray-100 mb-2">Current Image:</label>
                                            <div className="border border-gray-600 rounded-lg p-2 bg-gray-800 h-48 flex items-center justify-center">
                                                <img 
                                                    src={imageUrl} 
                                                    alt="Current ad image" 
                                                    className="max-w-full max-h-full object-contain rounded"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Upload Options - Right Side */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-gray-100">Upload New Image:</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
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
                                            
                                            <div>
                                                <label className="block text-gray-100">Or Update Image URL:</label>
                                                <input
                                                    type="text"
                                                    value={imageUrl}
                                                    onChange={handleUrlChange}
                                                    className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                                    placeholder="https://..."
                                                    disabled={!!imageFile}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Create mode or when new image is selected */
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-100">Image File:</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                                    disabled={!!imageUrl && !editMode}
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
                                        <div>
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
                                    </div>
                                )}
                            </div>
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
                        
                        {/* Budget, Reward, Max Views, and Region Selection */}
                        {editMode ? (
                            /* Edit mode: Compact 5-column layout */
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-100">Budget:</label>
                                    <input
                                        type="number"
                                        value={budget}
                                        onChange={(e) => setBudget(Number(e.target.value))}
                                        className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-100">Reward Per View:</label>
                                    <input
                                        type="number"
                                        value={rewardPerView}
                                        onChange={(e) => setRewardPerView(Number(e.target.value))}
                                        className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-100">Max Views:</label>
                                    <input
                                        type="number"
                                        value={rewardPerView > 0 ? Math.floor(Number(budget) / Number(rewardPerView)) : 0}
                                        readOnly
                                        className="form-input mt-1 block w-full pl-2 border border-black text-black bg-gray-200 dark:bg-gray-800 dark:text-white cursor-not-allowed opacity-70"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-100">Continent:</label>
                                    <select
                                        value={continent}
                                        onChange={handleContinentChange}
                                        className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                        required
                                    >
                                        <option value="">Select Continent</option>
                                        {getContinents().map(continentName => (
                                            <option key={continentName} value={continentName}>
                                                {continentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-100">Region/Country:</label>
                                    <select
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                        disabled={!continent}
                                        required
                                    >
                                        <option value="">Select Region/Country</option>
                                        {availableRegions.map(regionData => (
                                            <option key={regionData.code} value={regionData.code}>
                                                {regionData.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            /* Create mode: Original 2-row layout */
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-gray-100">Budget:</label>
                                        <input
                                            type="number"
                                            value={budget}
                                            onChange={(e) => setBudget(Number(e.target.value))}
                                            className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-100">Reward Per View:</label>
                                        <input
                                            type="number"
                                            value={rewardPerView}
                                            onChange={(e) => setRewardPerView(Number(e.target.value))}
                                            className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-100">Max Views:</label>
                                        <input
                                            type="number"
                                            value={rewardPerView > 0 ? Math.floor(Number(budget) / Number(rewardPerView)) : 0}
                                            readOnly
                                            className="form-input mt-1 block w-full pl-2 border border-black text-black bg-gray-200 dark:bg-gray-800 dark:text-white cursor-not-allowed opacity-70"
                                        />
                                    </div>
                                </div>
                                
                                {/* Region Selection with two-level dropdowns */}
                                <div className="mb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-100">Continent:</label>
                                            <select
                                                value={continent}
                                                onChange={handleContinentChange}
                                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                                required
                                            >
                                                <option value="">Select Continent</option>
                                                {getContinents().map(continentName => (
                                                    <option key={continentName} value={continentName}>
                                                        {continentName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-100">Region/Country:</label>
                                            <select
                                                value={region}
                                                onChange={(e) => setRegion(e.target.value)}
                                                className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                                disabled={!continent}
                                                required
                                            >
                                                <option value="">Select Region/Country</option>
                                                {availableRegions.map(regionData => (
                                                    <option key={regionData.code} value={regionData.code}>
                                                        {regionData.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {/* Ad Type - Side by side layout */}
                        <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div>
                                    <label className="block text-gray-100">Ad Type:</label>
                                </div>
                                <div>
                                    {editMode ? (
                                        // In edit mode, show ad type as read-only
                                        <div className="bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded border border-black">
                                            <span className="text-black dark:text-white">
                                                {adType === 'native' ? 'Native Ad' : 'Redirect Ad'}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                (Cannot be changed)
                                            </span>
                                        </div>
                                    ) : (
                                        // In create mode, show radio buttons
                                        <div className="flex items-center space-x-4">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="adType"
                                                    value="native"
                                                    checked={adType === 'native'}
                                                    onChange={() => setAdType('native')}
                                                    className="form-radio"
                                                />
                                                <span className="ml-2 text-gray-100">Native</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="adType"
                                                    value="redirect"
                                                    checked={adType === 'redirect'}
                                                    onChange={() => setAdType('redirect')}
                                                    className="form-radio"
                                                />
                                                <span className="ml-2 text-gray-100">Redirect</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {adType === 'redirect' && (
                            <div className="mb-4">
                                <label className="block text-gray-100">Redirection Link:</label>
                                <input
                                    type="text"
                                    value={redirectionLink}
                                    onChange={(e) => setRedirectionLink(e.target.value)}
                                    className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white dark:bg-gray-800 dark:text-white"
                                    placeholder="https://..."
                                    required={adType === 'redirect'}
                                />
                            </div>
                        )}
                        <div className="flex justify-end mt-6">
                            <button type="button" onClick={closeModal} className="mr-4 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-pink-600 dark:bg-blue-600 text-white rounded">
                                {editMode ? 'Update Ad' : 'Upload Ad'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default AddAdModal;
