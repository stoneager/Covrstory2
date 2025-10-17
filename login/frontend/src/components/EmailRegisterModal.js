import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEnvelope, faLock, faUser, faArrowRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { authAPI } from '../services/api';

const EmailRegisterModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const startCountdown = () => {
    setCanResend(false);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    setError('');
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authAPI.sendCode(email);
      setStep(2);
      startCountdown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyCode(email, code);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!name || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await authAPI.registerEmail({
        email,
        password,
        confirmPassword,
        name,
        role: 'customer'
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setCode('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const handleResendCode = async () => {
    setError('');
    setCode('');
    await handleSendCode();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Step {step} of 3</p>
          <div className="mt-4 flex space-x-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-enhanced w-full pl-12"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                />
              </div>
            </div>
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="btn-primary-enhanced w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="loading-enhanced">
                  <div className="spinner-enhanced"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  Send Verification Code
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </>
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                className="input-enhanced w-full text-center text-2xl tracking-widest font-bold"
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
              />
              <p className="text-sm text-gray-500 mt-3 font-medium">
                Code sent to {email}
              </p>
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
              className="btn-primary-enhanced w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="loading-enhanced">
                  <div className="spinner-enhanced"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <>
                  Verify Code
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </>
              )}
            </button>
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  className="text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                >
                  Resend Code
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend code in {countdown}s
                </p>
              )}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full text-gray-600 hover:text-gray-900 font-semibold py-3 transition-colors"
            >
              Change Email
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-enhanced w-full pl-12"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-enhanced w-full pl-12"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-enhanced w-full pl-12"
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="btn-primary-enhanced w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="loading-enhanced">
                  <div className="spinner-enhanced"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-4xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600">Your account has been created. Please login to continue.</p>
            </div>
            <button
              onClick={handleClose}
              className="btn-primary-enhanced w-full"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailRegisterModal;
