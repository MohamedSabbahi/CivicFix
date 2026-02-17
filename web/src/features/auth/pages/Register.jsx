import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Client-side Validation
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        setIsLoading(true);
        try {
            // 2. Call the register function from our authService
            await authService.register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            });
            navigate('/'); // Redirect to Map/Home
        } catch (err) {
    console.error('Register Error:', err);
    const message = err?.response?.data?.message || err.message || 'Registration failed';
    setError(message);
}
finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center p-6 pt-12">
            <div className="w-full max-w-sm">
                {/* Back Button & Header (Matches Screenshot) */}
                <div className="flex items-center mb-8">
                    <Link to="/login" className="text-white bg-slate-800 p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h2 className="text-white font-bold flex-1 text-center pr-8">Join CivicFix</h2>
                </div>
                <div className="text-left mb-8">
                    <div className="bg-blue-600/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-blue-500 text-2xl">🏠</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                    <p className="text-slate-400 mt-2">Join thousands of citizens making their neighborhoods better.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="text-slate-400 text-xs font-bold mb-2 block">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="John Doe"
                            className="w-full bg-[#1e293b] border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="text-slate-400 text-xs font-bold mb-2 block">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="name@example.com"
                            className="w-full bg-[#1e293b] border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="text-slate-400 text-xs font-bold mb-2 block">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-[#1e293b] border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="text-slate-400 text-xs font-bold mb-2 block">Confirm Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-[#1e293b] border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={handleChange}
                        />
                        <p className="text-slate-500 text-[10px] mt-2">Must be at least 8 characters with one special character.</p>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-4"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <p className="text-slate-500 text-sm">
                        By creating an account, you agree to our <span className="text-blue-500">Terms of Service</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;