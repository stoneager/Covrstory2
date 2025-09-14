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
      className="group cursor-pointer"
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-gray-100">
        {currentVariant.images && currentVariant.images.length > 0 ? (
          <img
            src={currentVariant.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {currentVariant.hasDiscount && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 text-xs font-semibold">
            {Math.round(((currentVariant.originalPrice - currentVariant.discountedPrice) / currentVariant.originalPrice) * 100)}% OFF
          </div>
        )}

        {/* Quick Actions */}
        <div className={`absolute top-4 right-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors duration-200">
            <FontAwesomeIcon icon={faHeart} className="text-gray-600 text-sm" />
          </button>
        </div>

        {/* Stock Status */}
        {currentSize.qty === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="space-y-3">
        {/* Category */}
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {product.collection?.name} • {product.type} • {product.gender === 'm' ? 'Men' : 'Women'}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-black text-lg leading-tight group-hover:text-gray-700 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Color Selection */}
        {product.variants.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 font-medium">Color:</span>
            <div className="flex space-x-1">
              {product.variants.map((variant, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariant(index);
                    setSelectedSize(0);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    selectedVariant === index
                      ? 'border-black scale-110'
                      : 'border-gray-300 hover:border-gray-400'
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
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 font-medium">Size:</span>
            <div className="flex space-x-1">
              {currentVariant.sizes.map((size, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(index);
                  }}
                  disabled={size.qty === 0}
                  className={`px-2 py-1 text-xs font-medium border transition-all duration-200 ${
                    selectedSize === index
                      ? 'border-black bg-black text-white'
                      : size.qty === 0
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  {size.size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-black">
            ₹{currentVariant.discountedPrice.toLocaleString()}
          </span>
          {currentVariant.hasDiscount && (
            <span className="price-original">
              ₹{currentVariant.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart / Quantity Controls */}
        {user && (
          <div className="pt-2">
            {cartQty > 0 ? (
              <div className="quantity-selector">
                <button
                  onClick={(e) => handleUpdateQty(e, cartQty - 1)}
                  disabled={loading}
                  className="hover:bg-gray-100"
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
                  className="hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={currentSize.qty === 0 || loading}
                className="w-full btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
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