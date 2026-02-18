import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Redirect if user is already logged in
    useEffect(() => {
        if (authService.isAuthenticated()) navigate('/');
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear field error on typing
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
        if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
        if (!formData.email.includes('@')) newErrors.email = "Valid email is required";
        if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            // Call backend register
            await authService.register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            // Redirect after successful registration
            navigate('/');
        } catch (err) {
            // Backend-specific field errors
            if (err.message?.toLowerCase().includes('email')) {
                setFieldErrors({ email: err.message });
            } else {
                setError(err.message || 'Registration failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center p-6 pt-12">
            <div className="w-full max-w-sm">
                {/* Back Button & Header */}
                <div className="flex items-center mb-6">
                    <Link to="/login" className="text-white bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h2 className="text-white font-bold flex-1 text-center pr-8">Join CivicFix</h2>
                </div>

                {/* Branding */}
                <div className="text-left mb-6">
                    <div className="bg-blue-600/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-blue-500 text-2xl">🏠</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                    <p className="text-slate-400 mt-2">Join thousands of citizens improving their neighborhoods.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* General API Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="text-slate-400 text-xs font-bold mb-2 block">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={`w-full bg-[#1e293b] border ${fieldErrors.name ? 'border-red-500' : 'border-slate-700'} text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                        />
                        {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-slate-400 text-xs font-bold mb-2 block">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            className={`w-full bg-[#1e293b] border ${fieldErrors.email ? 'border-red-500' : 'border-slate-700'} text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                        />
                        {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-slate-400 text-xs font-bold mb-2 block">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={`w-full bg-[#1e293b] border ${fieldErrors.password ? 'border-red-500' : 'border-slate-700'} text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                        />
                        {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-slate-400 text-xs font-bold mb-2 block">Confirm Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={`w-full bg-[#1e293b] border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-700'} text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                        />
                        {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
                        <p className="text-slate-500 text-[10px] mt-1">
                            Must be at least 6 characters with at least 1 number.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] ${
                            isLoading
                                ? 'bg-blue-800 cursor-not-allowed opacity-70'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30'
                        }`}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-slate-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-500 font-bold hover:text-blue-400">
                            Login
                        </Link>
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                        By creating an account, you agree to our <span className="text-blue-500">Terms of Service</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
