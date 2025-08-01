import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDash = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateAd, setShowCreateAd] = useState(false);
    const [userAds, setUserAds] = useState([]);
    const [selectedAds, setSelectedAds] = useState([]);

    // Ad creation form state
    const [adForm, setAdForm] = useState({
        title: '',
        image_url: '',
        description: '',
        posted_by: '',
        max_views: 0,
        region: '',
        token_reward: ''
    });

    // Single useEffect for initialization
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
            return;
        }

        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
            const profileData = JSON.parse(storedProfile);
            
            // Initialize local balance if it doesn't exist
            if (!profileData.localBalance) {
                const updatedProfile = { ...profileData, localBalance: 0 };
                setProfile(updatedProfile);
                localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            } else {
                setProfile(profileData);
            }
            
            setAdForm(prev => ({ ...prev, posted_by: profileData.email }));
            setLoading(false);
            // Delay to ensure profile is set
            setTimeout(() => fetchUserAds(token, profileData), 100);
        } else {
            fetchProfile(token);
        }

        // Listen for localStorage changes to update balance in real-time
        const handleStorageChange = () => {
            const updatedProfile = localStorage.getItem('userProfile');
            if (updatedProfile) {
                setProfile(JSON.parse(updatedProfile));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for manual updates (same tab)
        const intervalId = setInterval(() => {
            const currentProfile = localStorage.getItem('userProfile');
            if (currentProfile) {
                const profile = JSON.parse(currentProfile);
                setProfile(prevProfile => {
                    if (!prevProfile || prevProfile.localBalance !== profile.localBalance) {
                        return profile;
                    }
                    return prevProfile;
                });
            }
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(intervalId);
        };
    }, [navigate]);

    const fetchUserAds = async (token, userProfile = profile) => {
        try {
            const response = await fetch('https://metasurfai-public-api.fly.dev/v2/ads', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const ads = await response.json();
                
                // Filter ads by the current user's email
                const myAds = ads.filter(ad => {
                    return ad.posted_by === userProfile?.email;
                });
                
                setUserAds(myAds);
            } else {
                console.error('Failed to fetch ads:', response.status);
            }
        } catch (err) {
            console.error('Error fetching user ads:', err);
        }
    };

    const fetchProfile = async (token) => {
        try {
            const response = await fetch('https://metasurfai-public-api.fly.dev/v2/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            //New API endpoint for profile data
            // const responseN = await fetch('https://ty0xbob8r8.execute-api.us-east-1.amazonaws.com/user/profile', {
            //     method: 'GET',
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json'
            //     }
            // });

            if (response.ok) {
                const profileData = await response.json();
                setProfile(profileData);
                setAdForm(prev => ({ ...prev, posted_by: profileData.email }));
                localStorage.setItem('userProfile', JSON.stringify(profileData));
                // Call fetchUserAds after profile is properly set
                setTimeout(() => fetchUserAds(token, profileData), 100);
            } else {
                setError('Failed to fetch profile data');
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userProfile');
                    navigate('/');
                }
            }
        } catch (err) {
            setError('Something went wrong while fetching profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAd = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        try {
            const adData = {
                "_id": new Date().getTime().toString(),
                "title": adForm.title,
                "image_url": adForm.image_url,
                "view_count": 0,
                "description": adForm.description,
                "posted_by": adForm.posted_by,
                "active": true,
                "max_views": parseInt(adForm.max_views),
                "region": adForm.region,
                "token_reward": parseFloat(adForm.token_reward)
            };

            const response = await fetch('https://metasurfai-public-api.fly.dev/v2/ads', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adData)
            });

            if (response.ok) {
                const responseData = await response.json();
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
                
                // Wait a moment then refresh the ads list
                setTimeout(() => {
                    fetchUserAds(token, profile);
                }, 1000);
                
            } else {
                const responseText = await response.text();
                console.error('Error response text:', responseText);
                alert(`Error creating ad: ${response.status} - ${responseText}`);
            }
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
                fetch(`https://metasurfai-public-api.fly.dev/v2/ads/${adId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            );

            const results = await Promise.all(deletePromises);
            const successful = results.filter(res => res.ok).length;
            
            if (successful === selectedAds.length) {
                alert('Ads deleted successfully!');
            } else {
                alert(`${successful} out of ${selectedAds.length} ads deleted successfully`);
            }

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
                                            Local Balance
                                        </label>
                                        <div className="mt-1 bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-2 rounded-md text-center font-bold">
                                            ${profile?.localBalance?.toFixed(2) || '0.00'}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Earned from watching ads
                                        </p>
                                    </div>

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
                        {showCreateAd && (
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                                    <div className="mt-3">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                            Upload Your Ad
                                        </h3>
                                        <form onSubmit={handleCreateAd} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Title:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={adForm.title}
                                                    onChange={(e) => setAdForm({...adForm, title: e.target.value})}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Image URL:
                                                </label>
                                                <input
                                                    type="url"
                                                    value={adForm.image_url}
                                                    onChange={(e) => setAdForm({...adForm, image_url: e.target.value})}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Description:
                                                </label>
                                                <textarea
                                                    value={adForm.description}
                                                    onChange={(e) => setAdForm({...adForm, description: e.target.value})}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    rows="3"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Posted By:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={adForm.posted_by}
                                                    readOnly
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Max Views:
                                                </label>
                                                <input
                                                    type="number"
                                                    value={adForm.max_views}
                                                    onChange={(e) => setAdForm({...adForm, max_views: e.target.value})}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    min="1"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Region:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={adForm.region}
                                                    onChange={(e) => setAdForm({...adForm, region: e.target.value})}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Token Reward:
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={adForm.token_reward}
                                                    onChange={(e) => setAdForm({...adForm, token_reward: e.target.value})}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            <div className="flex justify-end space-x-2 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCreateAd(false)}
                                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="bg-pink-600 dark:bg-blue-600 hover:bg-pink-700 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                                                >
                                                    Create Ad
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Ads List */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                            <div className="px-6 py-4">
                                {userAds.length > 0 ? (
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
                                ) : (
                                    <div className="text-center py-8">
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
                                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                            />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No ads</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            You haven't created any ads yet.
                                        </p>
                                        <div className="mt-6">
                                            <button
                                                onClick={() => setShowCreateAd(true)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 dark:bg-blue-600 hover:bg-pink-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-blue-500"
                                            >
                                                Create Your First Ad
                                            </button>
                                        </div>
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