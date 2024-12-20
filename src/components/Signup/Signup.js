import { useState } from 'react';
import React from 'react';

const SignUpForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Create user object
        const userData = {
            email: email,
            password: password
        };

        try {
            // Send POST request to your API endpoint
            const response = await fetch('https://metasurfai-public-api.fly.dev/v2/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            // Handle response
            if (response.ok) {
                setSuccess(true);
                setError(null);
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

        // Create user object
        const userData = {
            email: email,
            password: password
        };


    return (
        <div className="flex justify-center items-center">
          <div className="bg-black bg-opacity-10 text-gray-100 p-8 rounded-lg shadow-lg backdrop-blur-md border-2 border-opacity-20 border-pink-600">                
            <h2 className="text-2xl mb-4">Sign Up</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">Sign up successful!</p>}
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
                    <button type="submit" className="bg-blue-500 w-full text-white py-2 px-4 rounded hover:bg-blue-600">Sign Up</button>
                    <span className="text-gray-100 text-sm mt-2 block text-center">Already have an account? <a href="#" className="text-blue-500 hover:underline">Login</a></span>
                </form>
            </div>
        </div>
    );
};

export default SignUpForm;
