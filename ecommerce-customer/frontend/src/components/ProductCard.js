import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faPlus, faMinus, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { cartItems, addToCart, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();

  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  const currentVariant = product.variants[selectedVariant];
  const currentSize = currentVariant.sizes[selectedSize];

  // Find cart item for current size
  const cartItem = cartItems && Array.isArray(cartItems)
    ? cartItems.find(ci => ci.productQuantity._id === currentSize.productQuantityId)
    : undefined;
  const cartQty = cartItem ? cartItem.qty : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = 'http://localhost:3002';
      return;
    }
    setLoading(true);
    await addToCart(currentSize.productQuantityId, 1);
    setLoading(false);
  };

  const handleUpdateQty = async (e, newQty) => {
    e.preventDefault();
    e.stopPropagation();
    if (newQty <= 0) {
      await removeFromCart(currentSize.productQuantityId);
    } else {
      await updateCartItem(currentSize.productQuantityId, newQty);
    }
  };

  const handleProductClick = () => {
    if (!user) {
      window.location.href = 'http://localhost:3002';
    }
  };

  return (
    <div 
      className="product-card-enhanced cursor-pointer"
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="product-image-container">
        {currentVariant.images && currentVariant.images.length > 0 ? (
          <img
            src={currentVariant.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm font-medium">No Image</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {currentVariant.hasDiscount && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-full">
            {Math.round(((currentVariant.originalPrice - currentVariant.discountedPrice) / currentVariant.originalPrice) * 100)}% OFF
          </div>
        )}

        {/* Product Overlay with Quick Actions */}
        <div className="product-overlay">
          <div className="product-quick-actions">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-110">
              <FontAwesomeIcon icon={faHeart} className="text-gray-600 text-sm" />
            </button>
          </div>
        </div>

        {/* Wishlist Button */}
        <div className={`absolute top-4 right-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110">
            <FontAwesomeIcon icon={faHeart} className="text-gray-600 text-sm" />
          </button>
        </div>

        {/* Stock Status */}
        {currentSize.qty === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-t-2xl">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="product-info-enhanced">
        {/* Category */}
        <div className="product-category">
          {product.collection?.name} • {product.type} • {product.gender === 'm' ? 'Men' : 'Women'}
        </div>

        {/* Product Name */}
        <h3 className="product-title">
          {product.name}
        </h3>

        {/* Color Selection */}
        {product.variants.length > 1 && (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Color:</span>
            <div className="flex space-x-2">
              {product.variants.map((variant, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariant(index);
                    setSelectedSize(0);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-200 shadow-sm ${
                    selectedVariant === index
                      ? 'border-gray-900 scale-110 shadow-md'
                      : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: variant.colour.toLowerCase() }}
                  title={variant.colour}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {currentVariant.sizes.length > 1 && (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Size:</span>
            <div className="flex space-x-2">
              {currentVariant.sizes.map((size, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(index);
                  }}
                  disabled={size.qty === 0}
                  className={`px-3 py-1.5 text-xs font-semibold border transition-all duration-200 rounded-lg ${
                    selectedSize === index
                      ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                      : size.qty === 0
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      : 'border-gray-200 text-gray-700 hover:border-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {size.size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="product-price-container">
          <span className="product-price-current">
            ₹{currentVariant.discountedPrice.toLocaleString()}
          </span>
          {currentVariant.hasDiscount && (
            <span className="product-price-original">
              ₹{currentVariant.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart / Quantity Controls */}
        {user && (
          <div className="pt-4">
            {cartQty > 0 ? (
              <div className="quantity-selector shadow-sm">
                <button
                  onClick={(e) => handleUpdateQty(e, cartQty - 1)}
                  disabled={loading}
                  className="hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <input
                  type="text"
                  value={cartQty}
                  readOnly
                  className="text-center"
                />
                <button
                  onClick={(e) => handleUpdateQty(e, cartQty + 1)}
                  disabled={loading || currentSize.qty <= cartQty}
                  className="hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={currentSize.qty === 0 || loading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
                {loading ? 'Adding...' : 'Add to Cart'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;