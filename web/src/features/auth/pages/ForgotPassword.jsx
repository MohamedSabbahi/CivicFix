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
