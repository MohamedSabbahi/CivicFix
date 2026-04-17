import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import bgImage from '../../../assets/background-CivicFix.img.png';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { email, code } = location.state || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, code, navigate]);

  useEffect(() => {
    setPasswordStrength(calculateStrength(password));
  }, [password]);

  const calculateStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(code, password);
      setMessage('Password reset successfully!');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch {
      setError('Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !code) return null;

  return (
    <motion.div
      className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-[#020617]/70 bg-gradient-to-br from-black/30 via-transparent to-black/50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-500/20 blur-[150px]" />

      <motion.div 
        className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-white/60 text-sm">Enter your new password</p>
        </div>

        {message && (
          <motion.div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm text-center">
            {message}
          </motion.div>
        )}

        {error && (
          <motion.div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              New Password
            </label>

            <div className="relative">
              <motion.input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                👁
              </button>
            </div>

            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStrengthColor(passwordStrength)}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <motion.input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                👁
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || password.length < 6 || password !== confirmPassword}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-3 rounded-lg border border-blue-500/30 font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </motion.button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-white/60 hover:text-white"
          >
            ← Back to Forgot Password
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResetPassword;