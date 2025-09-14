import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faPlus, faMinus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { cartItems, addToCart, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await productsAPI.getById(id);
      // Transform productQuantities to variants format
      const variantsMap = {};
      (response.data.productQuantities || []).forEach(qty => {
        if (!variantsMap[qty.colour]) {
          variantsMap[qty.colour] = {
            colour: qty.colour,
            price: qty.discountedPrice ?? qty.price,
            discountedPrice: qty.discountedPrice ?? qty.price,
            originalPrice: qty.originalPrice ?? qty.price,
            hasDiscount: qty.hasDiscount ?? false,
            images: qty.images || [],
            sizes: []
          };
        }
        variantsMap[qty.colour].sizes.push({
          size: qty.size,
          qty: qty.qty,
          productQuantityId: qty._id
        });
      });
      const variants = Object.values(variantsMap);
      setProduct({ ...response.data, variants });
    };
    fetchProduct();
  }, [id]);

  if (!product || !product.variants || product.variants.length === 0) {
    return <div className="p-8 text-center">Product not found.</div>;
  }

  const currentVariant = product.variants[selectedVariant];
  const currentSize = currentVariant.sizes[selectedSize];
  const images = currentVariant.images || [];

  // Find cart item for current size
  const cartItem = cartItems && Array.isArray(cartItems)
    ? cartItems.find(ci => ci.productQuantity._id === currentSize.productQuantityId)
    : undefined;
  const cartQty = cartItem ? cartItem.qty : 0;

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = 'http://localhost:3002';
      return;
    }
    await addToCart(currentSize.productQuantityId, 1);
  };

  const handleUpdateQty = async (newQty) => {
    if (newQty <= 0) {
      await removeFromCart(currentSize.productQuantityId);
    } else {
      await updateCartItem(currentSize.productQuantityId, newQty);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Gallery */}
        <div className="flex-1">
          <div className="relative">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-contain rounded shadow"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
            {/* Image navigation */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow"
                  onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow"
                  onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          <div className="flex mt-4 space-x-2 justify-center">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`thumb-${idx}`}
                className={`h-16 w-16 object-cover rounded cursor-pointer border ${selectedImage === idx ? 'border-blue-500' : 'border-gray-200'}`}
                onClick={() => setSelectedImage(idx)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <div className="mb-2 text-xs text-gray-500 uppercase">
            {product.collection?.name} • {product.type} • {product.gender === 'm' ? 'Men' : 'Women'}
          </div>
          <div className="mb-4">
            <span className="text-lg font-bold text-gray-900">
              ₹{currentVariant.discountedPrice.toLocaleString()}
            </span>
            {currentVariant.hasDiscount && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ₹{currentVariant.originalPrice.toLocaleString()}
              </span>
            )}
            {currentVariant.hasDiscount && (
              <span className="ml-2 text-green-600 font-medium">
                {Math.round(((currentVariant.originalPrice - currentVariant.discountedPrice) / currentVariant.originalPrice) * 100)}% off
              </span>
            )}
          </div>
          <div className="mb-4">
            {currentSize.qty > 0 ? (
              <span className="text-sm text-green-600">In Stock ({currentSize.qty} available)</span>
            ) : (
              <span className="text-sm text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Color Selection */}
          {product.variants.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex space-x-2">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedVariant(index);
                      setSelectedSize(0);
                      setSelectedImage(0);
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
          {currentVariant.sizes.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <div className="flex space-x-2">
                {currentVariant.sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(index)}
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

          {/* Add to Cart & Quantity Controls */}
          {user && (
            <div className="space-y-3 mt-4">
              {cartQty > 0 ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <button
                    onClick={() => handleUpdateQty(cartQty - 1)}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                    disabled={cartQty <= 1}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span className="px-3 py-1 border border-gray-300 rounded text-center min-w-[3rem]">
                    {cartQty}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(cartQty + 1)}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                    disabled={currentSize.qty <= cartQty}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={currentSize.qty === 0}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                  Add to Cart
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
