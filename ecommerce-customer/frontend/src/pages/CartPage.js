import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <FontAwesomeIcon icon={faShoppingBag} className="text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cart.items.map((item) => (
              <div key={item._id} className="p-6 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.productQuantity.images && item.productQuantity.images.length > 0 ? (
                      <img
                        src={item.productQuantity.images[0]}
                        alt={item.productQuantity.product?.name}
                        className="h-20 w-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.productQuantity.product?.name || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Color: {item.productQuantity.colour} | Size: {item.productQuantity.size?.toUpperCase()}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      ₹{item.productQuantity.price?.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(item.productQuantity._id, item.qty - 1)}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                      disabled={item.qty <= 1}
                    >
                      <FontAwesomeIcon icon={faMinus} className="text-xs" />
                    </button>
                    <span className="px-3 py-1 border border-gray-300 rounded text-center min-w-[3rem]">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.productQuantity._id, item.qty + 1)}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{(item.productQuantity.price * item.qty).toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.productQuantity._id)}
                      className="text-red-600 hover:text-red-800 mt-2"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{total.toLocaleString()}</span>
              </div>
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
              onClick={handleCheckout}
              className="w-full btn btn-primary text-lg py-3 mb-4"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;