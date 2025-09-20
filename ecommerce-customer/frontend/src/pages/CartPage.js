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
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <FontAwesomeIcon icon={faShoppingBag} className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-body mb-10 text-lg">Start shopping to add items to your cart</p>
            <Link to="/products" className="bg-gray-900 text-white px-10 py-4 text-lg font-bold hover:bg-gray-800 transition-all duration-300 inline-flex items-center justify-center rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="mb-4">
              <span className="inline-block bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                Cart
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Shopping Cart</h1>
            <p className="text-body text-lg">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart</p>
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
              <div key={item._id} className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.productQuantity.images && item.productQuantity.images.length > 0 ? (
                      <img
                        src={item.productQuantity.images[0]}
                        alt={item.productQuantity.product?.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 flex items-center justify-center rounded-xl">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl">
                        {item.productQuantity.product?.name || 'Product'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2 font-medium">
                        <span>Color: {item.productQuantity.colour}</span>
                        <span>Size: {item.productQuantity.size?.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-semibold text-gray-900 mr-4 uppercase tracking-wide">Qty:</span>
                        <div className="quantity-selector shadow-sm">
                          <button
                            onClick={() => handleQuantityChange(item.productQuantity._id, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="hover:bg-gray-50"
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <input type="text" value={item.qty} readOnly />
                          <button
                            onClick={() => handleQuantityChange(item.productQuantity._id, item.qty + 1)}
                            className="hover:bg-gray-50"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            ₹{(item.productQuantity.price * item.qty).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 font-medium">
                            ₹{item.productQuantity.price.toLocaleString()} each
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.productQuantity._id)}
                          className="text-red-500 hover:text-red-700 p-3 rounded-lg hover:bg-red-50 transition-all duration-200"
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
            <div className="bg-white p-8 sticky top-24 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 text-2xl mb-8">Order Summary</h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Subtotal ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 mb-6"
              >
                Proceed to Checkout
              </button>

              <div className="text-center">
                <Link
                  to="/products"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Security Features */}
              <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Secure checkout</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">30-day return policy</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Free shipping over ₹2,000</span>
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