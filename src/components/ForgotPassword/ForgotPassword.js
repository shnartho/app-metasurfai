import { useState } from 'react';
import React from 'react';
import { apiCall } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';

const ForgotPassword = ({ onBack, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'confirm'
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const isNewApi = (process.env.NEXT_PUBLIC_USE_NEW_API === 'true');
    const base = isNewApi ? 'new' : 'old';

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!email || !email.includes('@')) {
                setError('Please enter a valid email address');
                setIsLoading(false);
                return;
            }

            await apiCall('forgotPassword', {
                body: { email },
                base
            });

            setSuccess(true);
            setError(null);
            setStep('confirm');
        } catch (error) {
            setError(handleApiError(error, 'Forgot Password'));
            setSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!confirmationCode || !newPassword) {
                setError('Please enter confirmation code and new password');
                setIsLoading(false);
                return;
            }

            await apiCall('confirmForgotPassword', {
                body: {
                    email,
                    confirmationCode,
                    newPassword
                },
                base
            });

            setSuccess(true);
            setError(null);
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (error) {
            setError(handleApiError(error, 'Reset Password'));
            setSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center">
            <div className="text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600 dark:border-blue-600 w-full max-w-md">
                <h2 className="text-2xl mb-4">Reset Password</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && step === 'confirm' && (
                    <p className="text-green-500 mb-4">✓ Password reset successfully! Redirecting to login...</p>
                )}
                {success && step === 'email' && (
                    <p className="text-green-500 mb-4">✓ Check your email for confirmation code</p>
                )}

                {step === 'email' ? (
                    <form onSubmit={handleEmailSubmit}>
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
                        <div className="flex justify-center mt-4">
                            <button
                                type="submit"
                                className="bg-pink-600 dark:bg-blue-500 w-full text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleConfirmSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-100">Confirmation Code:</label>
                            <input
                                type="text"
                                className="form-input mt-1 block w-full pl-2 border-0 text-black bg-white rounded"
                                value={confirmationCode}
                                onChange={(e) => setConfirmationCode(e.target.value)}
                                placeholder="Enter code from email"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="mb-4 relative">
                            <label className="block text-gray-100">New Password:</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input mt-1 block w-full pl-2 pr-10 border-0 text-black bg-white rounded"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
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
                                className="bg-pink-600 dark:bg-blue-500 w-full text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}

                <span className="text-gray-100 text-sm mt-4 block text-center">
                    <a
                        onClick={onSwitchToLogin}
                        className="text-blue-500 hover:underline cursor-pointer"
                    >
                        Back to Login
                    </a>
                </span>
            </div>
        </div>
    );
};

export default ForgotPassword;
