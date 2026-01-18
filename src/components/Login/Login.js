import { useState } from 'react';
import React from 'react';
import ReactModal from 'react-modal';
import SignUpForm from '../Signup/Signup';
import { apiCall } from '../../utils/api';
import { cacheUtils } from '../../utils/apiCache';
import { validateEmail, validatePassword } from '../../utils/validation';
import storage from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants';
import { handleApiError } from '../../utils/errorHandler';

const LoginForm = ({ onClose, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate email
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        
        // Validate password
        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters');
            return;
        }
        
        const userData = {
            email: email,
            password: password
        };
        try {
            // Login via apiCall
            const isNewApi = (process.env.NEXT_PUBLIC_USE_NEW_API === 'true');
            const base = isNewApi ? 'new' : 'old';
            const data = await apiCall('login', { body: userData, base });
            storage.set(STORAGE_KEYS.AUTH_TOKEN, data.token);
            
            // Fetch profile data via apiCall
            const profileData = await apiCall('profile', { token: data.token, base });
            storage.setJSON(STORAGE_KEYS.USER_PROFILE, profileData);
            
            // Clear cache from any previous user sessions
            cacheUtils.clearPreviousUserCache();
            
            // Dispatch a custom event to notify other components of successful login
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { profile: profileData, token: data.token } 
            }));
            
            setSuccess(true);
            setError(null);
            
            // Close the modal and reload the page for fresh state
            setTimeout(() => { 
                onClose(); // Close the login modal
                window.location.reload(); // Refresh all states
            }, 1000);
        } catch (error) {
            setError(handleApiError(error, 'Login'));
            setSuccess(false);
        }
    };


    return (
        <div className="flex justify-center items-center">
            <div className="text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600 dark:border-blue-600">
                <h2 className="text-2xl mb-4">Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">Login successful!</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-100">Email:</label>
                        <input
                            type="email"
                            className="form-input mt-1 block w-full pl-2 border-0 text-black bg-white rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
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
                        />
                        <span
                            className="absolute inset-y-0 right-0 pr-3 pt-6 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <img src="/show-password.png" alt={showPassword ? "Hide Password" : "Show Password"} className="h-5 w-5" />
                        </span>
                    </div>
                    <div className="flex justify-center mt-4">
                        <button
                            type="submit"
                            className="bg-pink-600 dark:bg-blue-500 w-full text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Login
                        </button>
                    </div>
                    <span className="text-gray-100 text-sm mt-2 block text-center">
                        Don't have an account?
                        <a
                            onClick={onSwitchToSignup}
                            className="text-blue-500 hover:underline cursor-pointer ml-1"
                        >
                            Register
                        </a>
                    </span>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;