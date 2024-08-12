import React, { useState, useEffect } from 'react';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetch('https://metasurfai-public-api.fly.dev/v1/profile?username=nayem')
            .then(response => response.json())
            .then(data => setProfileData(data))
            .catch(error => console.error('Error fetching profile data:', error));
    }, []);

    if (!profileData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container p-4 bg-base-100 rounded-box shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
            <div className="profile-item mb-2">
                <strong>Username:</strong> {profileData.username}
            </div>
            <div className="profile-item mb-2">
                <strong>Email:</strong> {profileData.email}
            </div>
            <div className="profile-item mb-2">
                <strong>Balance:</strong> {profileData.balance} MST
            </div>
            <div className="profile-item mb-2">
                <strong>Region:</strong> {profileData.region}
            </div>
            <div className="profile-item mb-2">
                <strong>Country:</strong> {profileData.country}
            </div>
        </div>
    );
};

export default Profile;