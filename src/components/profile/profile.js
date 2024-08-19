import React, { useEffect, useState } from 'react';

function Profile() {
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetch('api/v1/profile?username=nayem')
            .then(response => response.json())
            .then(data => setProfileData(data))
            .catch(error => console.error('Error fetching profile data:', error));
    }, []);

    if (!profileData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div>
                <div className="flex items-center mb-4">
                    <img src="/logo.png" alt="Profile" className="w-16 h-16 rounded-full mr-4" />
                    <h2 className="text-2xl font-bold">Profile Information</h2>
                </div>
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
        </div>
    );
}

export default Profile;