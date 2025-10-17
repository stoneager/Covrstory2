import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faSpinner, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { authAPI } from '../services/api';
import EmailRegisterModal from '../components/EmailRegisterModal';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const LoginPage = () => {
  const [authMethod, setAuthMethod] = useState('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userRole = localStorage.getItem('userRole');
      redirectUser(userRole, token);
    }
  }, []);

  const redirectUser = (role, token) => {
    if (role === 'owner') {
      window.location.href = `http://localhost:3000?token=${token}&role=${role}`;
    } else {
      window.location.href = `http://localhost:3001?token=${token}&role=${role}`;
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await authAPI.login({
        email: user.email,
        name: user.displayName,
        authType: 'google',
        googleId: user.uid
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        redirectUser(response.data.user.role, response.data.token);
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      });
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setOtpSent(true);
      alert('OTP sent successfully!');
    } catch (error) {
      console.error('OTP send error:', error);
      alert('Failed to send OTP. Please try again.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
      const result = await auth.signInWithCredential(credential);
      const user = result.user;

      const response = await authAPI.login({
        email: user.email || `${user.phoneNumber}@phone.auth`,
        name: user.displayName || `User ${user.phoneNumber}`,
        authType: 'phone',
        phoneNumber: user.phoneNumber
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        redirectUser(response.data.user.role, response.data.token);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.loginEmail({ email, password });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        redirectUser(response.data.user.role, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="heading-enhanced mb-4">
            {process.env.REACT_APP_COMPANY_NAME || 'STORE'}
          </h1>
          <p className="subheading-enhanced">Sign in to continue shopping</p>
        </div>

        <div className="form-enhanced space-y-8">
          {/* Auth Method Selection */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                setAuthMethod('email');
                setOtpSent(false);
                setOtp('');
                setPhoneNumber('');
                setError('');
              }}
              className={`py-4 px-4 font-bold transition-all duration-200 rounded-xl ${
                authMethod === 'email'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-900 hover:shadow-md'
              }`}
            >
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              Email
            </button>
            <button
              onClick={() => {
                setAuthMethod('google');
                setOtpSent(false);
                setOtp('');
                setPhoneNumber('');
                setError('');
              }}
              className={`py-4 px-4 font-bold transition-all duration-200 rounded-xl ${
                authMethod === 'google'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-900 hover:shadow-md'
              }`}
            >
              <FontAwesomeIcon icon={faGoogle} className="mr-2" />
              Google
            </button>
            <button
              onClick={() => {
                setAuthMethod('phone');
                setOtpSent(false);
                setOtp('');
                setPhoneNumber('');
                setError('');
              }}
              className={`py-4 px-4 font-bold transition-all duration-200 rounded-xl ${
                authMethod === 'phone'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-900 hover:shadow-md'
              }`}
            >
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              Phone
            </button>
          </div>

          {/* Email Login */}
          {authMethod === 'email' && (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-enhanced w-full pl-12"
                    onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
                  />
                </div>
              </div>
              <button
                onClick={handleEmailLogin}
                disabled={loading || !email || !password}
                className="btn-primary-enhanced w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="loading-enhanced">
                    <div className="spinner-enhanced"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="text-gray-900 hover:text-gray-700 font-bold transition-colors text-lg"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* Google Login */}
          {authMethod === 'google' && (
            <div className="space-y-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="btn-google-enhanced w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="loading-enhanced">
                    <div className="spinner-enhanced"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faGoogle} className="mr-3 text-red-500" />
                    Continue with Google
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 text-center font-medium">
                Sign in with your Google account to access your personalized shopping experience
              </p>
            </div>
          )}

          {/* Phone Login */}
          {authMethod === 'phone' && (
            <div className="space-y-6">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="input-enhanced w-full"
                    />
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                      We'll send you a verification code
                    </p>
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={loading || !phoneNumber}
                    className="btn-primary-enhanced w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="loading-enhanced">
                        <div className="spinner-enhanced"></div>
                        <span>Sending OTP...</span>
                      </div>
                    ) : null}
                    {loading ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                      className="input-enhanced w-full text-center text-xl tracking-widest font-bold"
                    />
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                      Code sent to {phoneNumber}
                    </p>
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || !otp}
                    className="btn-primary-enhanced w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="loading-enhanced">
                        <div className="spinner-enhanced"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : null}
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="w-full text-gray-700 hover:text-gray-900 font-semibold py-3 transition-colors duration-200 rounded-lg hover:bg-gray-50"
                  >
                    Change Phone Number
                  </button>
                </>
              )}
            </div>
          )}

          <div id="recaptcha-container"></div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 space-y-3 pt-6 border-t border-gray-100">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Secure authentication powered by Firebase</span>
            </div>
          </div>
        </div>
      </div>

      <EmailRegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </div>
  );
};

export default LoginPage;