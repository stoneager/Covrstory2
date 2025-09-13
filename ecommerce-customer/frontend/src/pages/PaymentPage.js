import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faLock } from '@fortawesome/free-solid-svg-icons';
import { paymentAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const { checkoutData, orderSummary } = location.state || {};

  useEffect(() => {
    if (!checkoutData) {
      navigate('/cart');
      return;
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      alert('Failed to load payment gateway. Please try again.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [checkoutData, navigate]);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert('Payment gateway is loading. Please wait...');
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay order
      const response = await paymentAPI.createOrder({
        amount: orderSummary.total,
        orderId: checkoutData.orderId
      });

      const { razorpayOrderId, amount } = response.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: process.env.REACT_APP_COMPANY_NAME || 'E-Store',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: checkoutData.orderId
            });

            if (verifyResponse.data.success) {
              // Clear cart and redirect to success page
              await clearCart();
              alert('Payment successful! Your order has been placed.');
              navigate('/products');
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: checkoutData.user?.name || '',
          email: checkoutData.user?.email || '',
          contact: checkoutData.user?.mobile || ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutData || !orderSummary) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Payment Session</h2>
          <p className="text-gray-600 mb-8">Please start from your cart to proceed with payment.</p>
          <button
            onClick={() => navigate('/cart')}
            className="btn btn-primary"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Method */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
            
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 text-xl" />
                <div>
                  <h3 className="font-medium text-gray-900">Razorpay Secure Payment</h3>
                  <p className="text-sm text-gray-600">
                    Pay securely using Credit Card, Debit Card, Net Banking, UPI, or Wallet
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-2 text-sm text-gray-600">
              <FontAwesomeIcon icon={faLock} className="text-green-600" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{orderSummary.subtotal.toLocaleString()}</span>
              </div>
              
              {orderSummary.coupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount ({orderSummary.coupon.code})</span>
                  <span>-₹{orderSummary.discount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">₹{orderSummary.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !razorpayLoaded}
              className="w-full btn btn-primary text-lg py-3 mb-4"
            >
              {loading ? 'Processing...' : !razorpayLoaded ? 'Loading Payment Gateway...' : `Pay ₹${orderSummary.total.toLocaleString()}`}
            </button>

            <div className="text-center">
              <button
                onClick={() => navigate('/checkout')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Back to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;