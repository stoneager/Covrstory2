import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { authAPI } from '../services/api';

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
  const [authMethod, setAuthMethod] = useState('google');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userRole = localStorage.getItem('userRole');
      redirectUser(userRole, token);
    }
  }, []);

  const redirectUser = (role, token) => {
    if (role === 'owner') {
      window.location.href = `http://localhost:3001?token=${token}&role=${role}`;
    } else {
      window.location.href = `http://localhost:3000?token=${token}&role=${role}`;
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">
            {process.env.REACT_APP_COMPANY_NAME || 'STORE'}
          </h1>
          <p className="text-gray-600 text-lg">Sign in to continue</p>
        </div>

        <div className="bg-gray-50 p-8 space-y-8">
          {/* Auth Method Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setAuthMethod('google');
                setOtpSent(false);
                setOtp('');
                setPhoneNumber('');
              }}
              className={`py-3 px-4 font-medium transition-all duration-200 ${
                authMethod === 'google'
                  ? 'bg-black text-white'
                  : 'bg-white text-black border border-gray-300 hover:border-black'
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
              }}
              className={`py-3 px-4 font-medium transition-all duration-200 ${
                authMethod === 'phone'
                  ? 'bg-black text-white'
                  : 'bg-white text-black border border-gray-300 hover:border-black'
              }`}
            >
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              Phone
            </button>
          </div>

          {/* Google Login */}
          {authMethod === 'google' && (
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white text-black border border-gray-300 py-4 px-6 font-medium hover:border-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} className="mr-3 animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faGoogle} className="mr-3 text-red-500" />
                )}
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>
              <p className="text-xs text-gray-600 text-center">
                Sign in with your Google account to access your personalized shopping experience
              </p>
            </div>
          )}

          {/* Phone Login */}
          {authMethod === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      We'll send you a verification code
                    </p>
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={loading || !phoneNumber}
                    className="w-full bg-black text-white py-4 px-6 font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                    ) : null}
                    {loading ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200 text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Code sent to {phoneNumber}
                    </p>
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || !otp}
                    className="w-full bg-black text-white py-4 px-6 font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                    ) : null}
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="w-full text-black hover:text-gray-600 font-medium py-2 transition-colors duration-200"
                  >
                    Change Phone Number
                  </button>
                </>
              )}
            </div>
          )}

          <div id="recaptcha-container"></div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 space-y-2">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
            <p>Secure authentication powered by Firebase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;