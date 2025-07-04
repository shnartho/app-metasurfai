import { useState } from 'react';
import React from 'react';
import ReactModal from 'react-modal';
import SignUpForm from '../Signup/Signup';

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
            const response = await fetch('https://metasurfai-public-api.fly.dev/v2/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
          
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                
                // Fetch profile data
                const profileResponse = await fetch('https://metasurfai-public-api.fly.dev/v2/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${data.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    localStorage.setItem('userProfile', JSON.stringify(profileData));
                }
                
                setSuccess(true);
                setError(null);
                
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                const data = await response.json(); 
                setError(data.message);
                setSuccess(false);
            }
        } catch (error) {
            setError('Something went wrong. Please try again later.');
            setSuccess(false);
        }
    };

    const handleMouseDown = () => {
        setShowPassword(true);
    };

    const handleMouseUp = () => {
        setShowPassword(false);
    };

    const openSignUpForm = () => {
        setIsSignUpOpen(true);
    };

    const closeSignUpForm = () => {
        setIsSignUpOpen(false);
    };

    return (
        <div className="flex justify-center items-center">
            <div className="bg-black bg-opacity-10 text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600 dark:border-blue-600">                
                <h2 className="text-2xl mb-4">Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">Login successful!</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-100">Email:</label>
                        <input
                            type="email"
                            className="form-input mt-1 block w-full pl-2 border border-black text-black bg-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-4 relative">
                        <label className="block text-gray-100">Password:</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-input mt-1 block w-full pl-2 pr-10 border border-black text-black bg-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        <button type="submit" className="bg-pink-600 dark:bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 dark:hover:bg-pink-600">Login</button>
                    </div>
                    <span className="text-gray-100 text-sm mt-2 ml-1 block text-center">
                        Don't have an account? 
                        <a onClick={openSignUpForm} className="text-blue-500 hover:underline cursor-pointer ml-1">Register</a>
                    </span>
                </form>
            </div>
            
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
