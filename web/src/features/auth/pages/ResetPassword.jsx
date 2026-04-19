import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from "framer-motion";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import bgImage from '../../../assets/background-CivicFix.img.png';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const email = location.state?.email;

  const [code, setCode] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
      return;
    }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Password strength
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

  const getStrengthLabel = (strength) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // OTP input handlers
  const handleInputChange = useCallback((index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [code]);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [code]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newCode = paste.split('').concat(Array(4 - paste.length).fill(''));
    setCode(newCode);
    if (paste.length > 0) {
      inputRefs.current[Math.min(paste.length, 3)]?.focus();
    }
  }, []);

  const handleResend = async () => {
    try {
      await authService.forgotPassword(email);
      setMessage('New code sent!');
      setTimeLeft(600);
      setCanResend(false);
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const codeString = code.join('');

    if (codeString.length !== 4 || !/^\d{4}$/.test(codeString)) {
      setError('Please enter the 4-digit OTP code.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(codeString, password);
      setMessage('Password reset successfully!');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch {
      setError('Invalid or expired code. Please try again.');
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  const codeComplete = code.every((d) => d !== '');
  const canSubmit = codeComplete && password.length >= 6 && password === confirmPassword && !loading;

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
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-white/60 text-sm">
            Enter the code sent to <strong className="text-white/80">{email}</strong> and your new password
          </p>
        </div>

        {/* Alerts */}
        {message && (
          <motion.div
            className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div
            className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* OTP Section */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              Verification Code
            </label>
            <motion.div
              className="flex gap-3 justify-center"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
            >
              {code.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-14 h-14 text-xl font-bold text-center bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                  disabled={loading}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileFocus={{ scale: 1.05 }}
                />
              ))}
            </motion.div>

            {/* Timer & Resend */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-white/40">
                Expires in <span className="text-blue-400">{formatTime(timeLeft)}</span>
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className="text-xs text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition duration-300"
              >
                {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">New Password</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${getStrengthColor(passwordStrength)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-white/40">
                  Strength: <span className={`font-medium ${passwordStrength <= 2 ? 'text-red-400' : passwordStrength <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition"
              >
                {showConfirmPassword ? '🙈' : '👁'}
              </button>
            </div>
            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-3 rounded-lg border border-blue-500/30 font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: canSubmit ? 1.03 : 1 }}
            whileTap={{ scale: canSubmit ? 0.97 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </motion.button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm text-white/60 hover:text-white transition duration-300">
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResetPassword;