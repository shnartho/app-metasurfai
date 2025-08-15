import { useState } from 'react';
import React from 'react';
import { apiCall } from '../../utils/api';

const SignUpForm = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isNewApi = () => process.env.USE_NEW_API === 'true';
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const userData = {
            email: email,
            password: password
        };
        try {
            // Step 1: Sign up the user (old or new API)
            const base = isNewApi() ? 'new' : 'old';
            await apiCall('signup', { body: userData, base });
            setSuccess(true);
            setError(null);
            // Step 2: Automatically log in the user after successful signup
            const loginRes = await apiCall('login', { body: userData, base });
            localStorage.setItem('authToken', loginRes.token);
            // Step 3: Fetch profile data
            const profileRes = await apiCall('profile', { token: loginRes.token, base });
            localStorage.setItem('userProfile', JSON.stringify(profileRes));
            // Step 4: Reload the page to update the navbar and redirect to main page
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            setError(error.message || 'Something went wrong. Please try again later.');
            setSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMouseDown = () => {
        setShowPassword(true);
    };

    const handleMouseUp = () => {
        setShowPassword(false);
    };

    return (
        <div className="flex justify-center items-center">
            <div className=" text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600 dark:border-blue-600">                
                <h2 className="text-2xl mb-4">Sign Up</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">Registration successful! Logging you in...</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-100">Email:</label>
                        <input
                            type="email"
                            className="form-input mt-1 block w-full pl-2 border-0 text-black bg-white rounded"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4 relative">
                        <label className="block text-gray-100">Password:</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-input mt-1 block w-full pl-2 pr-10 border-0 text-black bg-white rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <span
                            className="absolute inset-y-0 right-0 pr-3 pt-6 flex items-center cursor-pointer"
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img src="/show-password.png" alt="Show Password" className="h-5 w-5" />
                        </span>
                    </div>
                    <div className="flex justify-center mt-4">
                        <button 
                            type="submit" 
                            className="bg-pink-600 dark:bg-blue-500 w-full text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                    <span className="text-gray-100 text-sm mt-2 block text-center">
                        Already have an account? 
                        <a 
                            onClick={!isLoading ? onSwitchToLogin : null} 
                            className={`text-blue-500 hover:underline cursor-pointer ml-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Login
                        </a>
                    </span>
                </form>
            </div>
        </div>
    );
};

export default SignUpForm;
