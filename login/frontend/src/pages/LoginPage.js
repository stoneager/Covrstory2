import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
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
  const [authMethod, setAuthMethod] = useState('google'); // 'google' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Redirect based on role stored in localStorage
      const userRole = localStorage.getItem('userRole');
      redirectUser(userRole);
    }
  }, []);

  const redirectUser = (role, token) => {
    if (role === 'owner') {
      window.location.href = `http://localhost:3000?token=${token}&role=${role}`; // Owner app
    } else {
      window.location.href = `http://localhost:3001?token=${token}&role=${role}`; // Customer app
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Send user data to backend
      const response = await authAPI.login({
        email: user.email,
        name: user.displayName,
        authType: 'google',
        googleId: user.uid
      });

      if (response.data.token) {
        // Remove localStorage set here
        // localStorage.setItem('token', response.data.token);
        // localStorage.setItem('userRole', response.data.user.role);
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
        callback: () => {
          // reCAPTCHA solved
        }
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

      // Send user data to backend
      const response = await authAPI.login({
        email: user.email || `${user.phoneNumber}@phone.auth`,
        name: user.displayName || `User ${user.phoneNumber}`,
        authType: 'phone',
        phoneNumber: user.phoneNumber
      });

      if (response.data.token) {
        // Remove localStorage set here
        // localStorage.setItem('token', response.data.token);
        // localStorage.setItem('userRole', response.data.user.role);
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to {process.env.REACT_APP_COMPANY_NAME || 'E-Store'}
          </h2>
          <p className="text-blue-100">Sign in to continue</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Auth Method Selection */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => {
                setAuthMethod('google');
                setOtpSent(false);
                setOtp('');
                setPhoneNumber('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                authMethod === 'google'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                authMethod === 'phone'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className="w-full btn btn-google text-lg py-3"
              >
                <FontAwesomeIcon icon={faGoogle} className="mr-3 text-red-500" />
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>
            </div>
          )}

          {/* Phone Login */}
          {authMethod === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="input"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 10-digit mobile number (without +91)
                    </p>
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={loading || !phoneNumber}
                    className="w-full btn btn-primary text-lg py-3"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                      className="input"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      OTP sent to {phoneNumber}
                    </p>
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || !otp}
                    className="w-full btn btn-primary text-lg py-3"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="w-full text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Change Phone Number
                  </button>
                </>
              )}
            </div>
          )}

          <div id="recaptcha-container"></div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;