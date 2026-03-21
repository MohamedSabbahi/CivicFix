import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import bgImage from '../../../assets/background-CivicFix.img.png';

const VerifyCode = () => {
  // Local mocks
  const verifyCode = async (email, code) => {
    console.log(`✅ Verified: ${email}, code: ${code}`);
    return { success: true };
  };
  
  const forgotPassword = async (email) => {
    console.log(`🔄 Resend to: ${email}`);
    return { message: 'Code resent!' };
  };

  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);

  const email = location.state?.email;

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
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

  const handleVerify = useCallback(async () => {
    if (loading) return;

    const codeString = code.join('');
    if (codeString.length !== 4) return;

    setLoading(true);
    setError('');

    try {
      await verifyCode(email, codeString);
      setMessage('Code verified! Redirecting...');
      setTimeout(() => {
        navigate('/reset-password', {
          state: { email, code: codeString }
        });
      }, 1200);
    } catch {
      setError('Invalid code. Please try again.');
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [code, email, navigate, loading]);

  const handleInputChange = useCallback((index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '')) {
      setTimeout(handleVerify, 100);
    }
  }, [code, handleVerify]);

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
    if (newCode.every((digit) => digit !== '')) {
      inputRefs.current[3]?.focus();
      setTimeout(handleVerify, 100);
    }
  }, [handleVerify]);

  const handleResend = async () => {
    try {
      await forgotPassword(email);
      setMessage('New code sent!');
      setTimeLeft(600);
      setCanResend(false);
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Verify Code</h1>
          <p className="text-white/60 text-sm">Code sent to <strong>{email}</strong></p>
        </div>

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

        <motion.div
          className="flex gap-3 justify-center mb-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
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
              className="w-14 h-14 text-xl font-bold text-center bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
              disabled={loading}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              whileFocus={{ scale: 1.02 }}
            />
          ))}
        </motion.div>

        <motion.div
          className="text-center text-sm text-white/40 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Expires in <span className="text-blue-400">{formatTime(timeLeft)}</span>
        </motion.div>

        <motion.button
          onClick={handleVerify}
          disabled={loading || code.some((d) => !d)}
          className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-3 rounded-lg border border-blue-500/30 font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </motion.button>

        <motion.button
          onClick={handleResend}
          disabled={!canResend}
          className="w-full text-sm text-white/60 hover:text-white transition duration-300"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
        </motion.button>

        <div className="text-center">
          <Link to="/login" className="text-sm text-white/60 hover:text-white transition duration-300">
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VerifyCode;
