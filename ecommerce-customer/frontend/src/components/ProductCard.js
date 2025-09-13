import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product, showAddToCart = false }) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = 'http://localhost:3002';
      return;
    }

    const variant = product.variants[selectedVariant];
    const size = variant.sizes[selectedSize];
    
    if (!size.productQuantityId) {
      alert('Product variant not available');
      return;
    }

    setLoading(true);
    const result = await addToCart(size.productQuantityId, quantity);
    
    if (result.success) {
      alert('Product added to cart!');
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const handleProductClick = () => {
    if (!user && !showAddToCart) {
      window.location.href = 'http://localhost:3002';
    }
  };

  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  const currentVariant = product.variants[selectedVariant];
  const currentSize = currentVariant.sizes[selectedSize];
  const discountedPrice = currentVariant.discountedPrice || currentVariant.price;
  const hasDiscount = discountedPrice < currentVariant.price;

  return (
    <div 
      className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleProductClick}
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
        {currentVariant.images && currentVariant.images.length > 0 ? (
          <img
            src={currentVariant.images[0]}
            alt={product.name}
            className="h-48 w-full object-cover object-center group-hover:opacity-75"
          />
        ) : (
          <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.collection?.name} • {product.type} • {product.gender === 'm' ? 'Men' : 'Women'}
          </span>
        </div>

        {/* Color Selection */}
        {product.variants.length > 1 && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex space-x-2">
              {product.variants.map((variant, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariant(index);
                    setSelectedSize(0);
                  }}
                  className={`px-3 py-1 text-xs border rounded ${
                    selectedVariant === index
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {variant.colour}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {showAddToCart && currentVariant.sizes.length > 1 && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
            <div className="flex space-x-2">
              {currentVariant.sizes.map((size, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(index);
                  }}
                  disabled={size.qty === 0}
                  className={`px-3 py-1 text-xs border rounded ${
                    selectedSize === index
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : size.qty === 0
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size.size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{discountedPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₹{currentVariant.price.toLocaleString()}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="text-sm text-green-600 font-medium">
              {Math.round(((currentVariant.price - discountedPrice) / currentVariant.price) * 100)}% off
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {currentSize.qty > 0 ? (
            <span className="text-sm text-green-600">In Stock ({currentSize.qty} available)</span>
          ) : (
            <span className="text-sm text-red-600">Out of Stock</span>
          )}
        </div>

        {/* Add to Cart Section */}
        {showAddToCart && user && (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <span className="px-3 py-1 border border-gray-300 rounded text-center min-w-[3rem]">
                  {quantity}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(Math.min(currentSize.qty, quantity + 1));
                  }}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={currentSize.qty === 0 || loading}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
              {loading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;