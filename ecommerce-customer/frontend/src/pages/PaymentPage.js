import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faLock, faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
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
          color: '#000000'
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
      <div className="min-h-screen bg-white">
        <div className="container-custom py-16">
          <div className="max-w-md mx-auto text-center">
            <h2 className="heading-md text-black mb-4">Invalid Payment Session</h2>
            <p className="text-body mb-8">Please start from your cart to proceed with payment.</p>
            <button
              onClick={() => navigate('/cart')}
              className="btn btn-primary"
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-lg text-black mb-2">Complete Payment</h1>
            <p className="text-body">Secure payment powered by Razorpay</p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-outline"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Checkout
          </button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Payment Method */}
            <div className="space-y-6">
              <div>
                <h2 className="font-semibold text-black text-xl mb-4">Payment Method</h2>
                
                <div className="bg-gray-50 border-2 border-black p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faCreditCard} className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Razorpay Secure Payment</h3>
                      <p className="text-sm text-gray-600">
                        Multiple payment options available
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white border border-gray-200 px-2 py-1 rounded text-center">
                      Credit Card
                    </div>
                    <div className="bg-white border border-gray-200 px-2 py-1 rounded text-center">
                      Debit Card
                    </div>
                    <div className="bg-white border border-gray-200 px-2 py-1 rounded text-center">
                      Net Banking
                    </div>
                    <div className="bg-white border border-gray-200 px-2 py-1 rounded text-center">
                      UPI
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faLock} className="text-green-600" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600" />
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600" />
                  <span>Trusted by millions</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gray-50 p-6">
                <h2 className="font-semibold text-black text-xl mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{orderSummary.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {orderSummary.coupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({orderSummary.coupon.code})</span>
                      <span>-₹{orderSummary.discount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-2xl font-bold text-black">
                      <span>Total</span>
                      <span>₹{orderSummary.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading || !razorpayLoaded}
                  className="w-full btn btn-primary btn-lg mb-4"
                >
                  <FontAwesomeIcon icon={faLock} className="mr-2" />
                  {loading 
                    ? 'Processing...' 
                    : !razorpayLoaded 
                    ? 'Loading Payment Gateway...' 
                    : `Pay ₹${orderSummary.total.toLocaleString()}`
                  }
                </button>

                <p className="text-xs text-gray-600 text-center">
                  By clicking "Pay", you agree to our Terms of Service and Privacy Policy.
                  Your payment information is secure and encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;