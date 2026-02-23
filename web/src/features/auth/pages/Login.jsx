import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import authService from '../services/authService';
import AuthInput from '../../../components/ui/AuthInput';

import bgImage from '../../../assets/background-CivicFix.img.png';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        if (authService.isAuthenticated()) navigate('/');
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name] : name ==="email" ? value.trim() :value,
        })
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]:"" });
        }
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(loading ) return ;
        
        setFieldErrors({});
        setError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const newErrors = {};

        if(!emailRegex.test(formData.email.trim())){
            newErrors.email = 'Please enter a valid email address';
        }
        if(!formData.password.trim()){
            newErrors.password = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
        await authService.login({
        email: formData.email,
        password: formData.password,
        remember,
        });
            toast.success("Welcome back 👋");
            navigate('/');
        } catch (err) {
            const message =
            err.response?.data?.message ||
            err.message ||
            "Login failed. Please check your credentials.";
            toast.error(message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

return (

<div className="relative h-screen w-full bg-[#0a0f1d] overflow-hidden">

    {/* BACKGROUND */}
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

    <div className="relative z-10 h-full flex flex-col lg:flex-row">

        {/* LEFT SIDE */}
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
                    <li className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                            <span className="text-blue-400 text-sm font-bold">✓</span>
                        </div>
                        <p className="text-slate-200 text-lg">
                            <span className="font-bold text-white">Report local</span> issues quickly
                        </p>
                    </li>

                    <li className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                            <span className="text-blue-400 text-sm font-bold">✓</span>
                        </div>
                        <p className="text-slate-200 text-lg">
                            Track the progress of your reports
                        </p>
                    </li>

                    <li className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                            <span className="text-blue-400 text-sm font-bold">✓</span>
                        </div>
                        <p className="text-slate-200 text-lg">
                            Help improve your neighborhood
                        </p>
                    </li>
                </ul>
            </div>
        </div>


        {/* RIGHT SIDE */}
        <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-8">

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md backdrop-blur-2xl bg-[#0b1220]/80 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl border border-white/10 hover:border-white/20"
            >

                {/* HEADER */}
                <div className="text-center mb-8">
                    <div className="bg-blue-600 p-4 rounded-2xl inline-flex mb-4 shadow-lg shadow-blue-600/40">
                        <span className="text-white text-3xl">🏢</span>
                    </div>

                    <h1 className="text-3xl font-bold text-white">CivicFix</h1>
                    <p className="text-slate-400 text-sm">Your tool for a better community</p>
                    <h2 className="text-xl font-semibold text-white mt-6">Welcome Back</h2>
                </div>


                <form onSubmit={handleSubmit} className="space-y-4">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                {/* EMAIL */}
                <AuthInput
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                placeholder="name@example.com"
                disabled={loading}
                autoComplete="email"
                />

                    {/* PASSWORD */}
                    <AuthInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="text-slate-400"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                }
            />

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400">
                <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) =>
                    setRemember(e.target.checked)
                    }
                    className="accent-blue-600"
                />
                Remember me
                </label>

                <Link
                to="/forgot-password"
                className="text-blue-500 font-semibold hover:text-blue-400"
                >
                Forgot password?
                </Link>
            </div>

              {/* Submit */}
                <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-white transition ${
                loading
                ? "bg-blue-800 opacity-70 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/40"
                }`}
                >
                {loading ? (
                <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Connecting...
                </span> ) : ("Login"
                )}
                </button>

                    {/* DIVIDER */}
                    <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-slate-700"></div>
                        <span className="text-slate-400 text-sm">OR</span>
                        <div className="flex-1 h-px bg-slate-700"></div>
                    </div>


                    {/* GOOGLE LOGIN */}
                    <button
                        type="button"
                        className="w-full bg-white text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="google"
                            className="w-5 h-5"
                        />
                        Continue with Google
                    </button>
                </form>
                <p className="text-center text-slate-500 text-xs mt-8 font-medium">
                    Don’t have an account?{' '}
                    <Link
                        to="/register"
                        className="text-blue-500 font-bold hover:text-blue-400"
                    >
                        Register
                    </Link>
                </p>
            </motion.div>
        </div>
    </div>
</div>

);
};

export default Login;