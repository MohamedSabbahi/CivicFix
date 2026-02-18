import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Redirect to home if already logged in
    useEffect(() => {
        if (authService.isAuthenticated()) navigate('/');
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        // Clear field error when user starts typing
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }

        // Clear general error
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        setError('');

        // Client-side validation
        const newErrors = {};
        if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            // Call auth service
            await authService.login(formData);

            // Redirect to home/dashboard
            navigate('/');
        } catch (err) {
            // Show backend or default error
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="bg-blue-600 p-4 rounded-2xl inline-block mb-4 shadow-lg shadow-blue-500/20">
                        <span className="text-white text-3xl">🏢</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">CivicFix</h1>
                    <p className="text-slate-400 mt-1">Your tool for a better community</p>
                    <h2 className="text-xl font-semibold text-white mt-8">Welcome Back</h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* General API error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="text-slate-400 text-xs uppercase font-bold mb-2 block">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full bg-[#1e293b] border ${
                                fieldErrors.email ? 'border-red-500' : 'border-slate-700'
                            } text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            placeholder="name@example.com"
                        />
                        {fieldErrors.email && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-slate-400 text-xs uppercase font-bold mb-2 block">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full bg-[#1e293b] border ${
                                fieldErrors.password ? 'border-red-500' : 'border-slate-700'
                            } text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            placeholder="Enter your password"
                        />
                        {fieldErrors.password && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                        )}
                        <div className="flex justify-end mt-2">
                            <button
                                type="button"
                                className="text-blue-500 text-xs hover:text-blue-400 transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] ${
                            loading
                                ? 'bg-blue-800 cursor-not-allowed opacity-70'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30'
                        }`}
                    >
                        {loading ? 'Connecting...' : 'Login'}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center pt-4">
                    <p className="text-slate-500 text-sm">
                        Don’t have an account?{' '}
                        <Link
                            to="/register"
                            className="text-blue-500 font-bold hover:text-blue-400"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
