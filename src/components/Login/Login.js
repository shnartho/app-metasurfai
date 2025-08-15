import { useState } from 'react';
import React from 'react';
import ReactModal from 'react-modal';
import SignUpForm from '../Signup/Signup';
import { apiCall } from '../../utils/api';

const LoginForm = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userData = {
            email: email,
            password: password
        };
        try {
            // Login via apiCall
            const data = await apiCall('login', { body: userData, base: 'new' });
            localStorage.setItem('authToken', data.token);
            // Fetch profile data via apiCall
            const profileData = await apiCall('profile', { token: data.token, base: 'new' });
            localStorage.setItem('userProfile', JSON.stringify(profileData));
            setSuccess(true);
            setError(null);
            setTimeout(() => { window.location.reload(); }, 1500);
            } catch (error) {
                setError(error.message || 'Something went wrong. Please try again later.');
                setSuccess(false);
            }
        };
    
        const openSignUpForm = () => setIsSignUpOpen(true);
        const closeSignUpForm = () => setIsSignUpOpen(false);
    
        return (
            <div className="login-form-container">
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 dark:text-gray-200">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 dark:text-gray-200">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-xs text-blue-500 mt-1"
                        >
                            {showPassword ? "Hide" : "Show"} Password
                        </button>
                    </div>
                    {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                    {success && <div className="text-green-500 text-sm mb-2">Login successful!</div>}
                    <div className="flex justify-center mt-4">
                        <button type="submit" className="bg-pink-600 dark:bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 dark:hover:bg-pink-600">Login</button>
                    </div>
                    <span className="text-gray-100 text-sm mt-2 ml-1 block text-center">
                        Don't have an account?
                        <a onClick={openSignUpForm} className="text-blue-500 hover:underline cursor-pointer ml-1">Register</a>
                    </span>
                </form>
                
                {isSignUpOpen && (
                    <ReactModal
                        isOpen={isSignUpOpen}
                        onRequestClose={closeSignUpForm}
                        contentLabel="Sign Up Modal"
                        style={{
                        overlay: {
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            zIndex: 1002
                        },
                        content: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'transparent',
                            overflow: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            borderRadius: '4px',
                            outline: 'none',
                            padding: '20px',
                            zIndex: 1003
                        }
                    }}
                >
                    <SignUpForm onSwitchToLogin={() => {
                        closeSignUpForm();
                    }} />
                </ReactModal>
            )}
        </div>
    );
};

export default LoginForm;