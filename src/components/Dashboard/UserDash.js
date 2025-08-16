import React, { useState, useEffect } from 'react';
import { useState as useReactState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../utils/api';
import AddAdModal from '../ads/AddAdModal';
import ReactModal from 'react-modal';
const WEBHOOK_URL = process.env.WEBHOOK;
const isNewApi = () => process.env.NEXT_PUBLIC_USE_NEW_API === 'true';

const UserDash = () => {
    const navigate = useNavigate();
    const storedProfile = localStorage.getItem('userProfile');
    const [profile, setProfile] = useState(storedProfile ? JSON.parse(storedProfile) : null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateAd, setShowCreateAd] = useState(false);
    const [userAds, setUserAds] = useState([]);
    const [adModalError, setAdModalError] = useState('');
    const [selectedAds, setSelectedAds] = useState([]);

    // Ad creation form state
    const [showWithdrawModal, setShowWithdrawModal] = useReactState(false);
    const [showBuyTokenModal, setShowBuyTokenModal] = useReactState(false);
    const [buyEmail, setBuyEmail] = useReactState('');
    const [buySuccess, setBuySuccess] = useReactState(false);
    const [adForm, setAdForm] = useState({
        title: '',
        image_url: '',
        description: '',
        posted_by: '',
        max_views: 0,
        region: '',
        token_reward: ''
    });
    // UTM for buy token form
    const [utmCampaign, setUtmCampaign] = useState('Token Waitlist');
    const utmSource = 'direct';
    const utmMedium = 'MSAPP';

    useEffect(() => {
        let campaign = 'waitlist';
        try {
            const params = new URLSearchParams(window.location.search);
            campaign = params.get('utm_campaign') || localStorage.getItem('utm_campaign') || 'Token Waitlist';
        } catch (e) {}
        setUtmCampaign(campaign);
            // If profile exists in state, fetch ads for this user
            if (profile) {
                const token = localStorage.getItem('authToken');
                fetchUserAds(token, profile);
                setLoading(false);
            } else {
                setLoading(false);
                setError('No user profile found. Please log in.');
            }
    }, [navigate]);

    // Universal ad submit handler
    const handleAdSubmit = async (adData) => {
        setAdModalError('');
        const token = localStorage.getItem('authToken');
        if (!token || !profile) {
            setAdModalError('Authentication required. Please login.');
            return;
        }
        try {
            let imageUrl = adData.image_url;
            // If using new API and file is provided, upload image first
            if (isNewApi && adData.image_file) {
                const uploadRes = await apiCall('uploadImage', {
                    body: { file: adData.image_file },
                    token,
                    base: 'new'
                });
                imageUrl = uploadRes.url || uploadRes.image_url;
                if (!imageUrl) throw new Error('Image upload failed');
            }
            // For old API, only allow image_url
            if (!isNewApi() && !imageUrl) {
                setAdModalError('Image URL is required for the current API.');
                return;
            }
            // Compose ad payload
            const payload = {
                title: adData.title,
                image_url: imageUrl,
                description: adData.description,
                posted_by: profile.email,
                max_views: parseInt(adData.max_views),
                region: adData.region,
                token_reward: parseFloat(adData.token_reward),
                view_count: 0,
                active: true
            };
            await apiCall('createAd', {
                body: payload,
                token,
                base: isNewApi() ? 'new' : 'old'
            });
            alert('Ad created successfully!');
            setShowCreateAd(false);
            setTimeout(() => fetchUserAds(token, profile), 1000);
        } catch (err) {
            setAdModalError(err.message || 'Error creating ad. Please try again.');
        }
    };

    const fetchUserAds = async (token, userProfile = profile) => {
        try {
            const ads = await apiCall('ads', { token, base: 'old' });
            // Filter ads by the current user's email
            const myAds = Array.isArray(ads) ? ads.filter(ad => ad.posted_by === userProfile?.email) : [];
            setUserAds(myAds);
        } catch (err) {
            console.error('Error fetching user ads:', err);
        }
    };

    const handleCreateAd = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        try {
            const adData = {
                title: adForm.title,
                image_url: adForm.image_url,
                description: adForm.description,
                posted_by: adForm.posted_by,
                max_views: parseInt(adForm.max_views),
                region: adForm.region,
                token_reward: parseFloat(adForm.token_reward),
                active: true
            };
            await apiCall('createAdRecord', { body: adData, token, base: 'new' });
            alert('Ad created successfully!');
            setShowCreateAd(false);
            setAdForm({
                title: '',
                image_url: '',
                description: '',
                posted_by: profile?.email || '',
                max_views: 0,
                region: '',
                token_reward: ''
            });
            setTimeout(() => {
                fetchUserAds(token, profile);
            }, 1000);
        } catch (err) {
            console.error('Error creating ad:', err);
            alert('Error creating ad. Please try again.');
        }
    };

    const handleDeleteSelectedAds = async () => {
        if (selectedAds.length === 0) {
            alert('Please select ads to delete');
            return;
        }
        if (!window.confirm(`Are you sure you want to delete ${selectedAds.length} ad(s)?`)) {
            return;
        }
        const token = localStorage.getItem('authToken');
        try {
            const deletePromises = selectedAds.map(adId =>
                apiCall('deleteAd', { body: { id: adId }, token, base: 'new' })
            );
            await Promise.all(deletePromises);
            alert('Ads deleted successfully!');
            setSelectedAds([]);
            fetchUserAds(token, profile);
        } catch (err) {
            alert('Error deleting ads. Please try again.');
        }
    };

    const handleAdSelection = (adId) => {
        setSelectedAds(prev => 
            prev.includes(adId) 
                ? prev.filter(id => id !== adId)
                : [...prev, adId]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        navigate('/');
        window.location.reload();
    };

    // Add the missing handleRefreshAds function
    const handleRefreshAds = () => {
        const token = localStorage.getItem('authToken');
        if (token && profile) {
            fetchUserAds(token, profile);
        } else {
            console.error('Unable to refresh ads');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                User Dashboard
                            </h1>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Information */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Profile Information
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="flex justify-center mb-4">
                                    <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                        {profile?.image ? (
                                            <img
                                                src={profile.image}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover"
                                            />
                                        ) : (
                                            <svg
                                                className="w-12 h-12 text-gray-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                                            {profile?.email || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Balance
                                        </label>
                                        <div className="mt-1 bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-2 rounded-md text-center font-bold">
                                            ${profile?.localBalance?.toFixed(2) || '0.00'}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Earned from watching ads
                                        </p>
                                        <div className="flex flex-col gap-2 mt-3">
                                            <button
                                                className="bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded-md transition-colors"
                                                onClick={() => setShowWithdrawModal(true)}
                                            >
                                                Withdraw Funds
                                            </button>
                                            <button
                                                className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors"
                                                onClick={() => setShowBuyTokenModal(true)}
                                            >
                                                Buy Metasurfai Token
                                            </button>
                                        </div>
                                        {/* Withdraw Modal */}
                                        {showWithdrawModal && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
                                                    <h2 className="text-xl font-bold mb-4 text-center">Withdraw Funds</h2>
                                                    <p className="mb-6 text-center">We are currently in the Pre-ICO stage. Withdrawals are not available at this time.</p>
                                                    <button
                                                        className="block mx-auto bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded-md"
                                                        onClick={() => setShowWithdrawModal(false)}
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {/* Buy Token Modal */}
                                        {showBuyTokenModal && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
                                                    <h2 className="text-xl font-bold mb-2 text-center">Join Metasurfai’s Exclusive Pre-ICO Private Token Sale</h2>
                                                    <p className="mb-4 text-sm text-center">
                                                        Metasurfai is gearing up for its upcoming Initial Coin Offering (ICO), and we’re excited to offer a limited Pre-ICO private token sale for early investors.<br/><br/>
                                                        This is your chance to secure tokens ahead of the public sale and be part of our journey to revolutionize the AI-powered metaverse.<br/><br/>
                                                        Interested in learning more or participating? Reach out to us at:<br/>
                                                        <b>📧 info@metasurfai.com</b><br/>—or—<br/>
                                                        Leave your email below:
                                                    </p>
                                                    {buySuccess ? (
                                                        <div className="text-green-600 text-center font-semibold mb-4">Thank you! We’ll be in touch soon.</div>
                                                    ) : (
                                                        <form
                                                            className="flex flex-col gap-3"
                                                            method="POST"
                                                            action={WEBHOOK_URL}
                                                            target="_blank"
                                                            onSubmit={e => {
                                                                e.preventDefault();
                                                                fetch(WEBHOOK_URL, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        email: buyEmail,
                                                                        utm_source: utmSource,
                                                                        utm_medium: utmMedium,
                                                                        utm_campaign: utmCampaign
                                                                    })
                                                                });
                                                                setBuySuccess(true);
                                                                setBuyEmail('');
                                                                setTimeout(() => setShowBuyTokenModal(false), 2000);
                                                            }}
                                                        >
                                                            <input
                                                                type="email"
                                                                required
                                                                className="border px-3 py-2 rounded-md"
                                                                placeholder="Your email address"
                                                                value={buyEmail}
                                                                onChange={e => setBuyEmail(e.target.value)}
                                                            />
                                                            <input type="hidden" name="utm_source" value={utmSource} />
                                                            <input type="hidden" name="utm_medium" value={utmMedium} />
                                                            <input type="hidden" name="utm_campaign" value={utmCampaign} />
                                                            <button
                                                                type="submit"
                                                                className="bg-pink-600 hover:bg-pink-800 text-white px-4 py-2 rounded-md"
                                                            >
                                                                Submit
                                                            </button>
                                                        </form>
                                                    )}
                                                    <button
                                                        className="block mx-auto mt-4 bg-gray-600 hover:bg-gray-900 text-white px-6 py-2 rounded-md"
                                                        onClick={() => { setShowBuyTokenModal(false); setBuySuccess(false); }}
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
            {/* Withdraw Funds Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4 text-center">Withdraw Funds</h2>
                        <p className="mb-6 text-center">We are currently in the Pre-ICO stage. Withdrawals are not available at this time.</p>
                        <button
                            className="block mx-auto bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded-md"
                            onClick={() => setShowWithdrawModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Buy Metasurfai Token Modal */}
            {showBuyTokenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-2 text-center">Join Metasurfai’s Exclusive Pre-ICO Private Token Sale</h2>
                        <p className="mb-4 text-sm text-center">
                            Metasurfai is gearing up for its upcoming Initial Coin Offering (ICO), and we’re excited to offer a limited Pre-ICO private token sale for early investors.<br/><br/>
                            This is your chance to secure tokens ahead of the public sale and be part of our journey to revolutionize the AI-powered metaverse.<br/><br/>
                            Interested in learning more or participating? Reach out to us at:<br/>
                            <b>📧 info@metasurfai.com</b><br/>—or—<br/>
                            Leave your email below:
                        </p>
                        {buySuccess ? (
                            <div className="text-green-600 text-center font-semibold mb-4">Thank you! We’ll be in touch soon.</div>
                        ) : (
                            <form
                                className="flex flex-col gap-3"
                                method="POST"
                                action={process.env.WEBHOOK}
                                target="_blank"
                                onSubmit={e => {
                                    e.preventDefault();
                                    // Optionally, send via fetch or just submit
                                    fetch(process.env.WEBHOOK, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ email: buyEmail })
                                    });
                                    setBuySuccess(true);
                                    setBuyEmail('');
                                    setTimeout(() => setShowBuyTokenModal(false), 2000);
                                }}
                            >
                                <input
                                    type="email"
                                    required
                                    className="border px-3 py-2 rounded-md"
                                    placeholder="Your email address"
                                    value={buyEmail}
                                    onChange={e => setBuyEmail(e.target.value)}
                                />
                                <input type="hidden" name="webhook" value={process.env.WEBHOOK || ''} />
                                <button
                                    type="submit"
                                    className="bg-pink-600 hover:bg-pink-800 text-white px-4 py-2 rounded-md"
                                >
                                    Submit
                                </button>
                            </form>
                        )}
                        <button
                            className="block mx-auto mt-4 bg-gray-600 hover:bg-gray-900 text-white px-6 py-2 rounded-md"
                            onClick={() => { setShowBuyTokenModal(false); setBuySuccess(false); }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Verification Status
                                        </label>
                                        <div className="mt-1">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                profile?.verified 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                            }`}>
                                                {profile?.verified ? 'Verified' : 'Not Verified'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Member Since
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                                            {formatDate(profile?.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ads Management */}
                    <div className="lg:col-span-2">
                        {/* Ads Header */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Your Ads ({userAds.length})
                                    </h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleRefreshAds}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                                        >
                                            Refresh
                                        </button>
                                        {selectedAds.length > 0 && (
                                            <button
                                                onClick={handleDeleteSelectedAds}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                                            >
                                                Delete Selected ({selectedAds.length})
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setShowCreateAd(true)}
                                            className="bg-pink-600 dark:bg-blue-600 hover:bg-pink-700 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                                        >
                                            Create New Ad
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Create Ad Modal */}
                        <ReactModal
                            isOpen={showCreateAd}
                            onRequestClose={() => setShowCreateAd(false)}
                            contentLabel="Create Ad Modal"
                            style={{
                                overlay: {
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                    zIndex: 1002
                                },
                                content: {
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    right: 'auto',
                                    bottom: 'auto',
                                    marginRight: '-50%',
                                    transform: 'translate(-50%, -50%)',
                                    background: 'none',
                                    border: 'none',
                                    boxShadow: 'none',
                                    overflow: 'visible',
                                    WebkitOverflowScrolling: 'touch',
                                    borderRadius: '0px',
                                    outline: 'none',
                                    padding: 0,
                                    zIndex: 1003
                                }
                            }}
                        >
                            {showCreateAd && (
                                <AddAdModal
                                    closeModal={() => setShowCreateAd(false)}
                                    onSubmit={handleAdSubmit}
                                    onlyUrl={!isNewApi()}
                                    postedBy={profile?.email || ''}
                                    error={adModalError}
                                />
                            )}
                        </ReactModal>

                        {/* Ads List */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                            <div className="px-6 py-4">
                                {userAds.length === 0 ? (
                                    <div className="text-center text-gray-400 mt-8">No ads created yet.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {userAds.map((ad) => (
                                            <div key={ad.id || ad._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                                <div className="flex items-start space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAds.includes(ad.id || ad._id)}
                                                        onChange={() => handleAdSelection(ad.id || ad._id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <img
                                                            src={ad.image_url}
                                                            alt={ad.title}
                                                            className="w-full h-32 object-cover rounded-md mb-3"
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                                            }}
                                                        />
                                                        <h3 className="font-medium text-gray-900 dark:text-white">{ad.title}</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ad.description}</p>
                                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                            <p>Views: {ad.view_count || 0} / {ad.max_views}</p>
                                                            <p>Region: {ad.region}</p>
                                                            <p>Reward: ${ad.token_reward}</p>
                                                            <p>Status: {ad.active ? 'Active' : 'Inactive'}</p>
                                                            <p>ID: {ad.id || ad._id}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDash;