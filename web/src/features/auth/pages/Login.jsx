import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import bgImage from '../../../assets/background-CivicFix.img.png';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (authService.isAuthenticated()) navigate('/');
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        setError('');

        const newErrors = {};
        if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await authService.login(formData);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

return (
    /* Change 1: Added h-screen and overflow-hidden to the main wrapper */
    <div className="relative h-screen w-full bg-[#0a0f1d] overflow-hidden">
        
        {/* BACKGROUND LAYER */}
        <div 
            className="absolute inset-0 z-0"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
                opacity: 0.5 
            }}
        />

        {/* CONTENT WRAPPER - Change 2: Changed min-h-screen to h-full */}
        <div className="relative z-10 h-full flex flex-col lg:flex-row">
            
            {/* LEFT SIDE — POSITIONED MID/TOP */}
            <div className="hidden lg:flex lg:w-1/2 items-start justify-center p-12 pt-[12vh]">
                <div className="max-w-md space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold text-white tracking-tight">
                            Join CivicFix today
                        </h2>
                        <p className="text-slate-400 text-lg">
                            Your tool for a better community
                        </p>
                    </div>

                    <ul className="space-y-6">
                        <li className="flex items-center gap-4 group">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                                <span className="text-blue-400 text-sm font-bold">✓</span>
                            </div>
                            <p className="text-slate-200 text-lg">
                                <span className="font-bold text-white">Report local</span> issues quickly and easily
                            </p>
                        </li>
                        <li className="flex items-center gap-4 group">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                                <span className="text-blue-400 text-sm font-bold">✓</span>
                            </div>
                            <p className="text-slate-200 text-lg">
                                Track the progress of your reports
                            </p>
                        </li>
                        <li className="flex items-center gap-4 group">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                                <span className="text-blue-400 text-sm font-bold">✓</span>
                            </div>
                            <p className="text-slate-200 text-lg">
                                Help improve your neighborhood
                            </p>
                        </li>
                    </ul>

                    <div className="pt-8 opacity-40">
                        <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-transparent rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE — LOGIN FORM */}
            <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-8">
                {/* Change 3: Slightly reduced padding (p-8 instead of p-10) to ensure it fits small screens */}
                <div className="w-full max-w-md backdrop-blur-2xl bg-[#0b1220]/80 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl border border-white/10 transition-all hover:border-white/20">
                    
                    <div className="text-center mb-8">
                        <div className="bg-blue-600 p-4 rounded-2xl inline-flex mb-4 shadow-lg shadow-blue-600/40">
                            <span className="text-white text-3xl">🏢</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">CivicFix</h1>
                        <p className="text-slate-400 text-sm">Your tool for a better community</p>
                        <h2 className="text-xl font-semibold text-white mt-6">Welcome Back</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-slate-400 text-xs uppercase font-bold tracking-widest ml-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full bg-[#020617]/60 border ${
                                    fieldErrors.email ? 'border-red-500' : 'border-slate-700'
                                } text-white rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600`}
                                placeholder="name@example.com"
                            />
                            {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{fieldErrors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-slate-400 text-xs uppercase font-bold tracking-widest ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full bg-[#020617]/60 border ${
                                    fieldErrors.password ? 'border-red-500' : 'border-slate-700'
                                } text-white rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600`}
                                placeholder="••••••••••••"
                            />
                            <div className="flex justify-end">
                                <button type="button" className="text-blue-500 text-[11px] font-semibold hover:text-blue-400 transition">
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold text-white transition-all transform active:scale-95 mt-2 ${
                                loading
                                    ? 'bg-blue-800 opacity-70 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/40'
                            }`}
                        >
                            {loading ? 'Connecting...' : 'Login'}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-xs mt-8 font-medium">
                        Don’t have an account?{' '}
                        <Link to="/register" className="text-blue-500 font-bold hover:text-blue-400 transition">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    </div>
);
};

export default Login;