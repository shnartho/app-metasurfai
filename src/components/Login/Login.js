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
            <div className="flex justify-center items-center">
                <div className="text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600 dark:border-blue-600 w-full max-w-md">
                    <h2 className="text-2xl mb-4">Forgot Password</h2>
                    <p className="text-sm text-gray-300 mb-4">Enter your email and we'll send a reset code.</p>
                    {fpError && <p className="text-red-500 mb-4">{fpError}</p>}
                    <form onSubmit={handleForgotPasswordRequest}>
                        <div className="mb-4">
                            <label className="block text-gray-100">Email:</label>
                            <input
                                type="email"
                                className="form-input mt-1 block w-full pl-2 border-0 text-black bg-white rounded"
                                value={fpEmail}
                                onChange={(e) => setFpEmail(e.target.value)}
                                required
                                disabled={fpLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={fpLoading}
                            className="bg-pink-600 dark:bg-blue-500 w-full text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {fpLoading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                    <span className="text-gray-100 text-sm mt-3 block text-center">
                        <a onClick={() => setFpStep(null)} className="text-blue-500 hover:underline cursor-pointer">Back to Login</a>
                    </span>
                </div>
            </div>
        );
    }

    if (fpStep === 'confirm') {
        return (
            <div className="flex justify-center items-center">
                <div className="text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600 dark:border-blue-600 w-full max-w-md">
                    <h2 className="text-2xl mb-4">Reset Password</h2>
                    <p className="text-sm text-gray-300 mb-4">Enter the code sent to <strong>{fpEmail}</strong> and your new password.</p>
                    {fpError && <p className="text-red-500 mb-4">{fpError}</p>}
                    {fpSuccess && <p className="text-green-400 mb-4">{fpSuccess}</p>}
                    <form onSubmit={handleForgotPasswordConfirm}>
                        <div className="mb-4">
                            <label className="block text-gray-100">Verification Code:</label>
                            <input
                                type="text"
                                className="form-input mt-1 block w-full pl-2 border-0 text-black bg-white rounded"
                                value={fpCode}
                                onChange={(e) => setFpCode(e.target.value)}
                                required
                                disabled={fpLoading}
                                placeholder="Enter 6-digit code"
                            />
                        </div>
                        <div className="mb-4 relative">
                            <label className="block text-gray-100">New Password:</label>
                            <input
                                type={fpShowPassword ? "text" : "password"}
                                className="form-input mt-1 block w-full pl-2 pr-10 border-0 text-black bg-white rounded"
                                value={fpNewPassword}
                                onChange={(e) => setFpNewPassword(e.target.value)}
                                required
                                disabled={fpLoading}
                            />
                            <span
                                className="absolute inset-y-0 right-0 pr-3 pt-6 flex items-center cursor-pointer"
                                onClick={() => setFpShowPassword(!fpShowPassword)}
                            >
                                <img src="/show-password.png" alt={fpShowPassword ? "Hide" : "Show"} className="h-5 w-5" />
                            </span>
                        </div>
                        <button
                            type="submit"
                            disabled={fpLoading}
                            className="bg-pink-600 dark:bg-blue-500 w-full text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {fpLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                    <span className="text-gray-100 text-sm mt-3 block text-center">
                        <a onClick={() => setFpStep('request')} className="text-blue-500 hover:underline cursor-pointer">Resend code</a>
                    </span>
                </div>
            </div>
        );
    }

    if (fpStep === 'done') {
        return (
            <div className="flex justify-center items-center">
                <div className="text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600 dark:border-blue-600 w-full max-w-md text-center">
                    <h2 className="text-2xl mb-4">Password Reset!</h2>
                    <p className="text-green-400 mb-6">{fpSuccess}</p>
                    <button
                        onClick={() => { setFpStep(null); setFpEmail(''); setFpCode(''); setFpNewPassword(''); }}
                        className="bg-pink-600 dark:bg-blue-500 w-full text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    /* ─── Main Login View ───────────────────────────────────────────── */
    return (
        <div className="flex justify-center items-center">
            <div className="text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600 dark:border-blue-600">
                <h2 className="text-2xl mb-4">Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">Login successful!</p>}
                {needsVerification && (
                    <div className="bg-yellow-900 bg-opacity-50 border border-yellow-500 text-yellow-200 px-4 py-3 rounded mb-4">
                        <p className="font-semibold">Email not verified</p>
                        <p className="text-sm mt-1">
                            Please check your inbox for the verification link sent to <strong>{email}</strong> and click it to verify your account, then try logging in again.
                        </p>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-100">Email:</label>
                        <input
                            type="email"
                            className="form-input mt-1 block w-full pl-2 border-0 text-black bg-white rounded"
                            value={email}
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
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <img src="/show-password.png" alt={showPassword ? "Hide Password" : "Show Password"} className="h-5 w-5" />
                        </span>
                    </div>
                    <div className="flex justify-center mt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-pink-600 dark:bg-blue-500 w-full text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                    <div className="flex justify-between mt-3 text-sm">
                        <a
                            onClick={() => { setFpStep('request'); setFpEmail(email); }}
                            className="text-blue-500 hover:underline cursor-pointer"
                        >
                            Forgot Password?
                        </a>
                        <a
                            onClick={onSwitchToSignup}
                            className="text-blue-500 hover:underline cursor-pointer"
                        >
                            Register
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;