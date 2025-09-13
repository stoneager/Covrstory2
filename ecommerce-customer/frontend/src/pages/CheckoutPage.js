import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../contexts/CartContext';
import { checkoutAPI } from '../services/api';

const CheckoutPage = () => {
  const { cart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const checkoutPayload = {
        items: cart.items.map(item => ({
          productQuantity: item.productQuantity._id,
          qty: item.qty,
          price: item.productQuantity.price
        })),
        subtotal,
        couponCode: appliedCoupon?.code || null,
        discount,
        total
      };

      const response = await checkoutAPI.createOrder(checkoutPayload);
      setCheckoutData(response.data);
      
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Items */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cart.items.map((item) => (
              <div key={item._id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {item.productQuantity.images && item.productQuantity.images.length > 0 ? (
                      <img
                        src={item.productQuantity.images[0]}
                        alt={item.productQuantity.product?.name}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.productQuantity.product?.name || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.productQuantity.colour} • {item.productQuantity.size?.toUpperCase()} • Qty: {item.qty}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{(item.productQuantity.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Coupon */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply Coupon</h2>
            
            {!appliedCoupon ? (
              <div className="flex space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="input"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponLoading}
                  className="btn btn-secondary"
                >
                  <FontAwesomeIcon icon={faTag} className="mr-2" />
                  {couponLoading ? 'Applying...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-800 font-medium">
                      Coupon "{appliedCoupon.code}" applied
                    </p>
                    <p className="text-green-600 text-sm">
                      You saved ₹{appliedCoupon.discount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={loading}
              className="w-full btn btn-primary text-lg py-3"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;