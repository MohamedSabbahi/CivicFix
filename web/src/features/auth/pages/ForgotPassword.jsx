import { useState } from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../../../assets/background-CivicFix.img.png';
import authService from '../services/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
        const res = await authService.forgotPassword(email);
        setMessage(res.data.message || 'Reset link sent to your email.');
    } catch (err) {
        setError(
        err.response?.data?.message || 'Something went wrong. Try again.'
        );
    } finally {
        setLoading(false);
    }
};

    return (
    <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{ backgroundImage: `url(${bgImage})` }}
    >
        <div className="w-full max-w-md bg-[#0b132b]/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-white">
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">CivicFix</h1>
            <p className="text-sm text-gray-300">
            Your tool for a better community
            </p>
        </div>

        <h2 className="text-xl font-semibold text-center mb-2">
            Forgot Password?
        </h2>
        <p className="text-center text-sm text-gray-300 mb-6">
            Enter your email and we’ll send you instructions to reset your
            password.
        </p>

        {message && (
          <p className="text-green-400 text-sm text-center mb-4">{message}</p>
        )}
        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-sm text-gray-300 hover:text-white"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

///UPGRADE CODE
/* 
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/background-CivicFix.img.png';
import authService from '../services/authService';

const RESEND_COOLDOWN_SECONDS = 60;
const REDIRECT_DELAY_MS = 5000;

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [cooldown, setCooldown] = useState(0);

   ----------------------------------------------------
     Cooldown countdown (email resend protection)
  ---------------------------------------------------- 
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

   ----------------------------------------------------
     Auto redirect after success
  ---------------------------------------------------- 
  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      navigate('/login');
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [successMessage, navigate]);

  /* ----------------------------------------------------
     Submit handler
  ---------------------------------------------------- *
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || cooldown > 0) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await authService.forgotPassword(email);

      // SECURITY NOTE:
      // Do NOT reveal whether email exists
      setSuccessMessage(
        'If an account exists for this email, a reset link has been sent. Redirecting to login...'
      );

      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setErrorMessage(
        err.message || 'Something went wrong. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-md bg-[#0b1220]/80 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl border border-white/10 text-white">
        {/* HEADER *}
        <div className="text-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl inline-flex mb-4 shadow-lg shadow-blue-600/40">
            <span className="text-white text-3xl">🔐</span>
          </div>

          <h1 className="text-3xl font-bold">CivicFix</h1>
          <p className="text-slate-400 text-sm">
            Your tool for a better community
          </p>
        </div>

        <h2 className="text-xl font-semibold text-center mb-2">
          Forgot your password?
        </h2>

        <p className="text-center text-sm text-slate-400 mb-6">
          Enter your email and we’ll send you instructions to reset your password.
        </p>

        {/* FEEDBACK *}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-4 rounded-xl text-center mb-4">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl text-center mb-4">
            {errorMessage}
          </div>
        )}

        {/* FORM *}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || cooldown > 0}
            className="w-full px-4 py-4 rounded-xl bg-[#111827] border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className={`w-full py-4 rounded-xl font-bold transition ${
              loading || cooldown > 0
                ? 'bg-blue-800 opacity-70 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/40'
            }`}
          >
            {loading
              ? 'Sending...'
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Send reset link'}
          </button>
        </form>

        {/* FOOTER *}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>  
  );
};

export default ForgotPassword;
*/