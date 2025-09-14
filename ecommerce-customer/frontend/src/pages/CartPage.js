import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus, faShoppingBag, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productQuantityId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productQuantityId, newQuantity);
  };

  const handleRemoveItem = async (productQuantityId) => {
    if (window.confirm('Remove this item from cart?')) {
      await removeFromCart(productQuantityId);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom py-16">
          <div className="max-w-md mx-auto text-center">
            <FontAwesomeIcon icon={faShoppingBag} className="text-6xl text-gray-300 mb-6" />
            <h2 className="heading-md text-black mb-4">Your cart is empty</h2>
            <p className="text-body mb-8">Start shopping to add items to your cart</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-lg text-black mb-2">Shopping Cart</h1>
            <p className="text-body">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart</p>
          </div>
          <Link to="/products" className="btn btn-outline">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div key={item._id} className="bg-white border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.productQuantity.images && item.productQuantity.images.length > 0 ? (
                      <img
                        src={item.productQuantity.images[0]}
                        alt={item.productQuantity.product?.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-semibold text-black text-lg">
                        {item.productQuantity.product?.name || 'Product'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Color: {item.productQuantity.colour}</span>
                        <span>Size: {item.productQuantity.size?.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-700 mr-3">Qty:</span>
                        <div className="quantity-selector">
                          <button
                            onClick={() => handleQuantityChange(item.productQuantity._id, item.qty - 1)}
                            disabled={item.qty <= 1}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <input type="text" value={item.qty} readOnly />
                          <button
                            onClick={() => handleQuantityChange(item.productQuantity._id, item.qty + 1)}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-black">
                            ₹{(item.productQuantity.price * item.qty).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            ₹{item.productQuantity.price.toLocaleString()} each
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.productQuantity._id)}
                          className="text-red-600 hover:text-red-800 p-2 transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="font-semibold text-black text-xl mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-black">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn btn-primary btn-lg mb-4"
              >
                Proceed to Checkout
              </button>

              <div className="text-center">
                <Link
                  to="/products"
                  className="text-sm text-gray-600 hover:text-black transition-colors duration-200"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Free shipping over ₹2,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;