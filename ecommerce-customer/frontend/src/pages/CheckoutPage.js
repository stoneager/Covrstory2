import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faLock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../contexts/CartContext';
import { checkoutAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = () => {
  const { cart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState({ line1: '', area: '', city: '', pincode: '' });

  // Autofill mobile and address from user.js
  useEffect(() => {
    if (user) {
      setMobile(user.mobile || '');
      setAddress({
        line1: user.address?.line1 || '',
        area: user.address?.area || '',
        city: user.address?.city || '',
        pincode: user.address?.pincode || ''
      });
    }
  }, [user]);

  const subtotal = getCartTotal();
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = subtotal - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const response = await checkoutAPI.applyCoupon(couponCode, subtotal);
      if (response.data.valid) {
        setAppliedCoupon({
          code: couponCode,
          discount: response.data.discount
        });
        alert('Coupon applied successfully!');
      } else {
        alert(response.data.message || 'Invalid coupon code');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error applying coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleProceedToPayment = async () => {
    // Validate mobile and address
    if (!mobile.trim() || !address.line1.trim() || !address.area.trim() || !address.city.trim() || !address.pincode.trim()) {
      alert('Please fill in all required fields for mobile and address.');
      return;
    }
    setLoading(true);
    try {
      // Only update order.js, not user.js
      const checkoutPayload = {
        items: cart.items.map(item => ({
          productQuantity: item.productQuantity._id,
          qty: item.qty,
          price: item.productQuantity.price
        })),
        subtotal,
        couponCode: appliedCoupon?.code || null,
        discount,
        total,
        mobile,
        address
      };
      const response = await checkoutAPI.createOrder(checkoutPayload);
      // Navigate to payment page with checkout data
      navigate('/payment', { 
        state: { 
          checkoutData: response.data,
          orderSummary: {
            subtotal,
            discount,
            total,
            coupon: appliedCoupon
          }
        }
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error processing checkout');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-lg text-black mb-2">Checkout</h1>
            <p className="text-body">Review your order and complete your purchase</p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="btn btn-outline"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Items */}
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-black text-xl mb-4">Order Summary</h2>
              <div className="bg-gray-50 p-6 space-y-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {item.productQuantity.images && item.productQuantity.images.length > 0 ? (
                        <img
                          src={item.productQuantity.images[0]}
                          alt={item.productQuantity.product?.name}
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-black">
                        {item.productQuantity.product?.name || 'Product'}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {item.productQuantity.colour} • {item.productQuantity.size?.toUpperCase()} • Qty: {item.qty}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-black">
                        ₹{(item.productQuantity.price * item.qty).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div>
              <h2 className="font-semibold text-black text-xl mb-4">Promo Code</h2>
              <div className="bg-gray-50 p-6">
                {!appliedCoupon ? (
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="input pl-10"
                        />
                        <FontAwesomeIcon 
                          icon={faTag} 
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || couponLoading}
                        className="btn btn-primary"
                      >
                        {couponLoading ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Have a promo code? Enter it above to save on your order.
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <FontAwesomeIcon icon={faTag} className="text-green-600" />
                          <span className="font-semibold text-green-800">
                            Coupon "{appliedCoupon.code}" applied
                          </span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          You saved ₹{appliedCoupon.discount.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="font-semibold text-black text-xl mb-6">Payment Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-2xl font-bold text-black">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* User Info Middleware */}
              <div className="mb-6 p-4 bg-white border rounded">
                <h3 className="font-semibold text-lg mb-4">Contact & Address</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Mobile Number</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="Enter mobile number"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Address Line 1</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={address.line1}
                    onChange={e => setAddress({ ...address, line1: e.target.value })}
                    placeholder="Flat/House/Building"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Area</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={address.area}
                    onChange={e => setAddress({ ...address, area: e.target.value })}
                    placeholder="Area/Locality"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={address.city}
                    onChange={e => setAddress({ ...address, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Pincode</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={address.pincode}
                    onChange={e => setAddress({ ...address, pincode: e.target.value })}
                    placeholder="Pincode"
                  />
                </div>
              </div>
              <button
                onClick={handleProceedToPayment}
                disabled={loading}
                className="w-full btn btn-primary btn-lg mb-6"
              >
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                {loading ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
              </button>

              {/* Security Features */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faLock} className="text-green-600" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Free shipping on all orders</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">We accept:</p>
                <div className="flex space-x-2">
                  <div className="bg-white border border-gray-200 px-3 py-2 rounded text-xs font-medium">
                    Credit Card
                  </div>
                  <div className="bg-white border border-gray-200 px-3 py-2 rounded text-xs font-medium">
                    Debit Card
                  </div>
                  <div className="bg-white border border-gray-200 px-3 py-2 rounded text-xs font-medium">
                    UPI
                  </div>
                  <div className="bg-white border border-gray-200 px-3 py-2 rounded text-xs font-medium">
                    Net Banking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;