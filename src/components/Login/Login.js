import { useState } from 'react';
import React from 'react';
import ReactModal from 'react-modal';
import SignUpForm from '../Signup/Signup';
import { apiCall, decodeIdToken } from '../../utils/api';
import { cacheUtils } from '../../utils/apiCache';

const LoginForm = ({ onClose, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Forgot-password state machine: null → 'request' → 'confirm' → 'done'
    const [fpStep, setFpStep] = useState(null);
    const [fpEmail, setFpEmail] = useState('');
    const [fpCode, setFpCode] = useState('');
    const [fpNewPassword, setFpNewPassword] = useState('');
    const [fpShowPassword, setFpShowPassword] = useState(false);
    const [fpError, setFpError] = useState(null);
    const [fpSuccess, setFpSuccess] = useState(null);
    const [fpLoading, setFpLoading] = useState(false);

    // Email-verification prompt
    const [needsVerification, setNeedsVerification] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const userData = {
            email: email,
            password: password
        };
        try {
            // Login via apiCall - always use new AWS backend
            const base = 'new';
            const data = await apiCall('login', { body: userData, base });

            // New backend returns {idToken, accessToken, refreshToken, expiresIn}
            const authToken = data.idToken;
            if (!authToken) throw new Error('No auth token received');

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            // Build profile: decode JWT from new API
            const profileData = decodeIdToken(authToken);
            if (!profileData) throw new Error('Failed to decode user profile from token');
            localStorage.setItem('userProfile', JSON.stringify(profileData));
            
            // Clear cache from any previous user sessions
            cacheUtils.clearPreviousUserCache();
            
            // Dispatch a custom event to notify other components of successful login
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { profile: profileData, token: authToken } 
            }));
            
            setNeedsVerification(false);
            setSuccess(true);
            setError(null);
            
            // Close the modal and reload the page for fresh state
            setTimeout(() => { 
                onClose(); // Close the login modal
                window.location.reload(); // Refresh all states
            }, 1000);
        } catch (error) {
            const msg = error.message || 'Something went wrong. Please try again later.';
            // Detect Cognito "user not confirmed" / email-verification errors
            if (/not confirmed|verify.*email|UserNotConfirmedException/i.test(msg)) {
                setNeedsVerification(true);
                setError(null);
            } else {
                setError(msg);
                setNeedsVerification(false);
            }
            setSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    /* ─── Forgot Password handlers ──────────────────────────────────── */
    const handleForgotPasswordRequest = async (e) => {
        e.preventDefault();
        setFpLoading(true);
        setFpError(null);
        setFpSuccess(null);
        try {
            await apiCall('forgotPassword', { body: { email: fpEmail }, base: 'new' });
            setFpSuccess('A reset code has been sent to your email.');
            setFpStep('confirm');
        } catch (err) {
            setFpError(err.message || 'Failed to send reset code.');
        } finally {
            setFpLoading(false);
        }
    };

    const handleForgotPasswordConfirm = async (e) => {
        e.preventDefault();
        setFpLoading(true);
        setFpError(null);
        setFpSuccess(null);
        try {
            await apiCall('confirmForgotPassword', {
                body: {
                    email: fpEmail,
                    confirmation_code: fpCode,
                    new_password: fpNewPassword
                },
                base: 'new'
            });
            setFpSuccess('Password reset successfully! You can now log in.');
            setFpStep('done');
        } catch (err) {
            setFpError(err.message || 'Failed to reset password.');
        } finally {
            setFpLoading(false);
        }
    };

    /* ─── Forgot-password sub-views ─────────────────────────────────── */
    if (fpStep === 'request') {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-gray-400 text-sm">We'll send you a verification code to reset your password</p>
                    </div>

                    {/* Error Message */}
                    {fpError && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm">{fpError}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                value={fpEmail}
                                onChange={(e) => setFpEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={fpLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={fpLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02]"
                        >
                            {fpLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending Code...
                                </span>
                            ) : 'Send Reset Code'}
                        </button>
                    </form>

                    {/* Back Link */}
                    <div className="text-center mt-6">
                        <button
                            onClick={() => setFpStep(null)}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (fpStep === 'confirm') {
        return (
            <div className="flex justify-center items-center min-h-[500px]">
                <div className="w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Verify Code</h2>
                        <p className="text-gray-400 text-sm">Enter the code sent to <span className="text-blue-400 font-medium">{fpEmail}</span></p>
                    </div>

                    {/* Messages */}
                    {fpError && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm">{fpError}</p>
                        </div>
                    )}
                    {fpSuccess && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                            <p className="text-green-400 text-sm">{fpSuccess}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleForgotPasswordConfirm} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                                value={fpCode}
                                onChange={(e) => setFpCode(e.target.value)}
                                placeholder="000000"
                                required
                                disabled={fpLoading}
                                maxLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                            <div className="relative">
                                <input
                                    type={fpShowPassword ? "text" : "password"}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                                    value={fpNewPassword}
                                    onChange={(e) => setFpNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    disabled={fpLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setFpShowPassword(!fpShowPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {fpShowPassword ? (
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
                        </div>

                        <button
                            type="submit"
                            disabled={fpLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02]"
                        >
                            {fpLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting Password...
                                </span>
                            ) : 'Reset Password'}
                        </button>
                    </form>

                    {/* Resend Link */}
                    <div className="text-center mt-6">
                        <button
                            onClick={() => setFpStep('request')}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                        >
                            Didn't receive code? Resend
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (fpStep === 'done') {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50 text-center">
                    {/* Success Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    {/* Success Message */}
                    <h2 className="text-3xl font-bold text-white mb-3">Password Reset!</h2>
                    <p className="text-green-400 mb-8 text-lg">{fpSuccess}</p>
                    
                    {/* Back to Login Button */}
                    <button
                        onClick={() => { setFpStep(null); setFpEmail(''); setFpCode(''); setFpNewPassword(''); }}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform transition-all duration-200 hover:scale-[1.02]"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    /* ─── Main Login View ───────────────────────────────────────────── */
    return (
        <div className="flex justify-center items-center min-h-[500px]">
            <div className="w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400 text-sm">Sign in to continue to MetaSurfAI</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                        <p className="text-green-400 text-sm flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Login successful! Redirecting...
                        </p>
                    </div>
                )}

                {/* Email Verification Alert */}
                {needsVerification && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                        <div className="flex">
                            <svg className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-yellow-400">Email Not Verified</p>
                                <p className="text-sm text-yellow-300/90 mt-1">
                                    Please check your inbox for the verification link sent to <span className="font-medium">{email}</span> and verify your account.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={email}
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
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
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
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => { setFpStep('request'); setFpEmail(email); }}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02]"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing In...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center mt-6">
                    <span className="text-gray-400 text-sm">Don't have an account? </span>
                    <button
                        onClick={onSwitchToSignup}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;