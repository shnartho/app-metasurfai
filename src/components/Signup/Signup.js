import { useState } from 'react';
import React from 'react';
import { apiCall, decodeIdToken } from '../../utils/api';
import { cacheUtils } from '../../utils/apiCache';

const SignUpForm = ({ onSwitchToLogin, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const userData = {
            email: email,
            password: password
        };
        try {
            // Step 1: Sign up the user - always use new AWS backend
            const base = 'new';
            const signupRes = await apiCall('signup', { body: userData, base });

            // New backend (Cognito) may require email verification before login
            if (signupRes.userConfirmed === false) {
                setNeedsVerification(true);
                setSuccess(true);
                setError(null);
                return; // Stop here — user must verify email first
            }

            // Step 2: Automatically log in the user after successful signup
            const loginRes = await apiCall('login', { body: userData, base });

            // New backend returns {idToken, accessToken, refreshToken}
            const authToken = loginRes.idToken;
            if (!authToken) throw new Error('No auth token received');

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('accessToken', loginRes.accessToken);
            localStorage.setItem('refreshToken', loginRes.refreshToken);

            // Step 3: Build profile from token
            const profileRes = decodeIdToken(authToken);
            if (!profileRes) throw new Error('Failed to decode user profile from token');
            localStorage.setItem('userProfile', JSON.stringify(profileRes));
            
            // Clear cache from any previous user sessions (but keep current user's data)
            cacheUtils.clearPreviousUserCache();
            
            // Dispatch a custom event to notify other components of successful signup/login
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { profile: profileRes, token: authToken } 
            }));
            
            setSuccess(true);
            setError(null);
            
            // Step 4: Close modal and reload for fresh state
            setTimeout(() => {
                if (onClose) onClose(); // Close the signup modal if provided
                window.location.reload(); // Refresh all states
            }, 1000);
        } catch (error) {
            setError(error.message || 'Something went wrong. Please try again later.');
            setSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMouseDown = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex justify-center items-center min-h-[500px]">
            <div className="w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-gray-400 text-sm">Join MetaSurfAI today</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Email Verification Alert */}
                {needsVerification && (
                    <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                        <div className="flex">
                            <svg className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-blue-400">Check Your Email!</p>
                                <p className="text-sm text-blue-300/90 mt-1">
                                    A verification link has been sent to <span className="font-medium">{email}</span>. Please verify your email, then <button onClick={onSwitchToLogin} className="text-blue-400 underline hover:text-blue-300 transition-colors">log in</button>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {success && !needsVerification && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                        <p className="text-green-400 text-sm flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Account created! Logging you in...
                        </p>
                    </div>
                )}
                
                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a strong password"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={handleMouseDown}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Must be at least 8 characters with uppercase, lowercase, and number</p>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : 'Create Account'}
                    </button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6">
                    <span className="text-gray-400 text-sm">Already have an account? </span>
                    <button
                        onClick={!isLoading ? onSwitchToLogin : null}
                        className={`text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUpForm;
