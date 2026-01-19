import { useState } from 'react';
import React from 'react';
import { apiCall } from '../../utils/api';
import { cacheUtils } from '../../utils/apiCache';
import { validateSignupForm } from '../../utils/validation';
import storage from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants';
import { handleApiError } from '../../utils/errorHandler';

const SignUpForm = ({ onSwitchToLogin, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isNewApi = (process.env.NEXT_PUBLIC_USE_NEW_API === 'true');
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const userData = {
            email: email,
            password: password
        };
        
        // Validate form data
        const validation = validateSignupForm(userData);
        if (!validation.isValid) {
            // Show the first error
            const firstError = Object.values(validation.errors)[0];
            setError(firstError);
            return;
        }
        
        setIsLoading(true);
        try {
            // Step 1: Sign up the user (old or new API)
            const base = isNewApi ? 'new' : 'old';
            await apiCall('signup', { body: userData, base });
            
            // Step 2: Automatically log in the user after successful signup
            const loginRes = await apiCall('login', { body: userData, base });
            
            // Handle both old API (token) and new API (idToken/accessToken)
            const token = loginRes.token || loginRes.accessToken || loginRes.idToken;
            if (!token) {
                throw new Error('No token received from server');
            }
            storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
            
            // Store all Cognito tokens separately (new API format)
            if (loginRes.idToken) {
                storage.set('idToken', loginRes.idToken);
            }
            if (loginRes.accessToken) {
                storage.set('accessToken', loginRes.accessToken);
            }
            
            // Store refresh token if provided (new API)
            if (loginRes.refreshToken) {
                storage.set('refreshToken', loginRes.refreshToken);
            }
            
            // Step 3: Fetch profile data
            const profileRes = await apiCall('profile', { token, base });
            storage.setJSON(STORAGE_KEYS.USER_PROFILE, profileRes);
            
            // Clear cache from any previous user sessions (but keep current user's data)
            cacheUtils.clearPreviousUserCache();
            
            // Dispatch a custom event to notify other components of successful signup/login
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { profile: profileRes, token } 
            }));
            
            setSuccess(true);
            setError(null);
            
            // Step 4: Close modal and reload for fresh state
            setTimeout(() => {
                if (onClose) onClose(); // Close the signup modal if provided
                window.location.reload(); // Refresh all states
            }, 1000);
        } catch (error) {
            setError(handleApiError(error, 'Signup'));
            setSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMouseDown = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex justify-center items-center">
            <div className=" text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600 dark:border-blue-600">                
                <h2 className="text-2xl mb-4">Sign Up</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && (
                    <div className="text-green-500 mb-4 p-3 bg-green-500 bg-opacity-20 rounded">
                        <p className="font-semibold">✓ Account Created!</p>
                        <p className="text-sm mt-1">Please check your email to verify your account before logging in.</p>
                    </div>
                )}
                
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
                            onClick={handleMouseDown}
                        >
                            <img src="/show-password.png" alt={showPassword ? "Hide Password" : "Show Password"} className="h-5 w-5" />
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
