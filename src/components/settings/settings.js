import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../utils/api';
import { cacheUtils } from '../../utils/apiCache';

const Settings = () => {
    const navigate = useNavigate();
    // Get current theme from localStorage or default to system
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('DarkMode');
        if (savedTheme !== null) {
            return savedTheme === 'true' ? 'dark' : 'light';
        }
        return 'system';
    });
    
    // Other settings state
    const [network, setNetwork] = useState('mainnet');
    const [walletConnected, setWalletConnected] = useState(false);
    const [language, setLanguage] = useState('en');
    const [fontSize, setFontSize] = useState('medium');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [transactionAlerts, setTransactionAlerts] = useState(true);
    const [profileVisibility, setProfileVisibility] = useState('public');
    const [analyticsConsent, setAnalyticsConsent] = useState(true);
    const [dataSharingConsent, setDataSharingConsent] = useState(false);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [autoLogout, setAutoLogout] = useState('30');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Apply theme changes
    useEffect(() => {
        const applyTheme = () => {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('DarkMode', 'true');
            } else if (theme === 'light') {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('DarkMode', 'false');
            } else { // system
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (systemPrefersDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                localStorage.removeItem('DarkMode');
            }
        };

        applyTheme();

        // Listen for system theme changes when theme is set to 'system'
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = applyTheme;
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    const handleNetworkChange = (event) => {
        setNetwork(event.target.value);
    };

    const handleSaveSettings = () => {
        // Save settings logic here
        alert('Settings saved successfully!');
    };

    const handleExportData = () => {
        alert('Data export initiated. You will receive an email when ready.');
    };

    const handleDeleteAccount = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }
        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const accessToken = localStorage.getItem('accessToken');
            const isNewApi = (process.env.NEXT_PUBLIC_USE_NEW_API === 'true');
            if (isNewApi && token && accessToken) {
                await apiCall('deleteAccount', {
                    body: { accessToken, reason: deleteReason || 'No reason provided' },
                    token,
                    base: 'new'
                });
            }
            // Clear all local data
            localStorage.removeItem('authToken');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userProfile');
            cacheUtils.clearAllOnLogout();
            alert('Your account has been permanently deleted.');
            window.location.href = '/';
        } catch (error) {
            alert('Failed to delete account: ' + (error.message || 'Unknown error'));
        } finally {
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
        }
    };

     const handleViewProfile = () => {
        navigate('/profile');
    };

    // Custom Toggle Component
    const Toggle = ({ checked, onChange, label }) => (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <button
                type="button"
                className={`${
                    checked 
                        ? 'bg-pink-600 dark:bg-blue-600' 
                        : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-600 dark:focus:ring-blue-600 focus:ring-offset-2`}
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
            >
                <span
                    aria-hidden="true"
                    className={`${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
                    </div>
                    <div className="px-6 py-4 space-y-6">
                        {/* Theme Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Theme
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: 'light', label: 'Light' },
                                    { value: 'dark', label: 'Dark' },
                                    { value: 'system', label: 'System' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleThemeChange(option.value)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md border ${
                                            theme === option.value
                                                ? 'bg-pink-600 dark:bg-blue-600 text-white border-pink-600 dark:border-blue-600'
                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-pink-600 dark:focus:ring-blue-600 focus:border-pink-600 dark:focus:border-blue-600"
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                                <option value="pt">Português</option>
                                <option value="zh">中文</option>
                            </select>
                        </div>

                        {/* Font Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Font Size
                            </label>
                            <select
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-pink-600 dark:focus:ring-blue-600 focus:border-pink-600 dark:focus:border-blue-600"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Blockchain Settings */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Blockchain & Wallet</h2>
                    </div>
                    <div className="px-6 py-4 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Network
                            </label>
                            <select
                                value={network}
                                onChange={handleNetworkChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-pink-600 dark:focus:ring-blue-600 focus:border-pink-600 dark:focus:border-blue-600"
                            >
                                <option value="mainnet">Mainnet</option>
                                <option value="testnet">Testnet</option>
                                <option value="sepolia">Sepolia</option>
                            </select>
                        </div>
                        <Toggle
                            checked={walletConnected}
                            onChange={setWalletConnected}
                            label="Wallet Connected"
                        />
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                    </div>
                    <div className="px-6 py-4 space-y-6">
                        <Toggle
                            checked={emailNotifications}
                            onChange={setEmailNotifications}
                            label="Email Notifications"
                        />
                        <Toggle
                            checked={pushNotifications}
                            onChange={setPushNotifications}
                            label="Push Notifications"
                        />
                        <Toggle
                            checked={transactionAlerts}
                            onChange={setTransactionAlerts}
                            label="Transaction Alerts"
                        />
                        <Toggle
                            checked={marketingEmails}
                            onChange={setMarketingEmails}
                            label="Marketing Emails"
                        />
                    </div>
                </div>

                {/* Privacy & Security */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy & Security</h2>
                    </div>
                    <div className="px-6 py-4 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Profile Visibility
                            </label>
                            <select
                                value={profileVisibility}
                                onChange={(e) => setProfileVisibility(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-pink-600 dark:focus:ring-blue-600 focus:border-pink-600 dark:focus:border-blue-600"
                            >
                                <option value="public">Public</option>
                                <option value="friends">Friends Only</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                        <Toggle
                            checked={twoFactorAuth}
                            onChange={setTwoFactorAuth}
                            label="Two-Factor Authentication"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Auto Logout (minutes)
                            </label>
                            <select
                                value={autoLogout}
                                onChange={(e) => setAutoLogout(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-pink-600 dark:focus:ring-blue-600 focus:border-pink-600 dark:focus:border-blue-600"
                            >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="never">Never</option>
                            </select>
                        </div>
                        <Toggle
                            checked={analyticsConsent}
                            onChange={setAnalyticsConsent}
                            label="Analytics Consent"
                        />
                        <Toggle
                            checked={dataSharingConsent}
                            onChange={setDataSharingConsent}
                            label="Data Sharing Consent"
                        />
                    </div>
                </div>

                {/* Account Management */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Management</h2>
                    </div>
                    <div className="px-6 py-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Profile</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">View and edit your profile information</p>
                            </div>
                            <button
                                onClick={handleViewProfile}
                                className="px-4 py-2 bg-pink-600 dark:bg-blue-600 text-white rounded-md hover:bg-pink-700 dark:hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                View Profile
                            </button>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Export Data</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Download all your account data</p>
                            </div>
                            <button
                                onClick={handleExportData}
                                className="px-4 py-2 bg-pink-600 dark:bg-blue-600 text-white rounded-md hover:bg-pink-700 dark:hover:bg-blue-700 transition-colors"
                            >
                                Export
                            </button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-medium text-red-600">Delete Account</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all data</p>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>

                        {/* Delete Account Confirmation Modal */}
                        {showDeleteConfirm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                                    <h2 className="text-xl font-bold mb-2 text-red-600">Delete Account</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                        This action is <strong>permanent</strong> and cannot be undone. All your data will be deleted.
                                    </p>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Reason for leaving (optional)
                                        </label>
                                        <textarea
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                                            value={deleteReason}
                                            onChange={(e) => setDeleteReason(e.target.value)}
                                            rows={3}
                                            placeholder="Tell us why you're leaving..."
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={deleteLoading}
                                            className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                                        </button>
                                        <button
                                            onClick={() => { setShowDeleteConfirm(false); setDeleteReason(''); }}
                                            disabled={deleteLoading}
                                            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        className="px-6 py-2 bg-pink-600 dark:bg-blue-600 text-white rounded-md hover:bg-pink-700 dark:hover:bg-blue-700 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
