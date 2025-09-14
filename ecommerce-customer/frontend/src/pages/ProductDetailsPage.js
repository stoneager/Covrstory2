import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag, 
  faPlus, 
  faMinus, 
  faChevronLeft, 
  faChevronRight,
  faHeart,
  faShare,
  faTruck,
  faUndo,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product || !product.variants || product.variants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    );
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
    setLoading(true);
    await addToCart(currentSize.productQuantityId, quantity);
    setLoading(false);
  };

  const handleUpdateQty = async (newQty) => {
    if (newQty <= 0) {
      await removeFromCart(currentSize.productQuantityId);
    } else {
      await updateCartItem(currentSize.productQuantityId, newQty);
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-black transition-colors duration-200">
            Home
          </button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-black transition-colors duration-200">
            Shop
          </button>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-gray-600" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="text-gray-600" />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {currentVariant.hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-semibold">
                  {Math.round(((currentVariant.originalPrice - currentVariant.discountedPrice) / currentVariant.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 border-2 transition-all duration-200 ${
                      selectedImage === idx ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
              {product.collection?.name} • {product.type} • {product.gender === 'm' ? 'Men' : 'Women'}
            </div>

            {/* Product Name */}
            <h1 className="heading-lg text-black">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-black">
                ₹{currentVariant.discountedPrice.toLocaleString()}
              </span>
              {currentVariant.hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ₹{currentVariant.originalPrice.toLocaleString()}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 text-sm font-semibold rounded">
                    Save ₹{(currentVariant.originalPrice - currentVariant.discountedPrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <p className="text-body">{product.description}</p>
            </div>

            {/* Color Selection */}
            {product.variants.length > 1 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-black">
                  Color: <span className="font-normal">{currentVariant.colour}</span>
                </h3>
                <div className="flex space-x-3">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedVariant(index);
                        setSelectedSize(0);
                        setSelectedImage(0);
                      }}
                      className={`w-12 h-12 rounded-full border-4 transition-all duration-200 ${
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
              <div className="space-y-3">
                <h3 className="font-semibold text-black">
                  Size: <span className="font-normal">{currentVariant.sizes[selectedSize].size.toUpperCase()}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentVariant.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(index)}
                      disabled={size.qty === 0}
                      className={`px-4 py-2 border font-medium transition-all duration-200 ${
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

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {currentSize.qty > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-medium">
                    In Stock ({currentSize.qty} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-700 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {user && (
              <div className="space-y-4">
                {cartQty > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-black">In Cart:</span>
                      <div className="quantity-selector">
                        <button
                          onClick={() => handleUpdateQty(cartQty - 1)}
                          disabled={cartQty <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <input type="text" value={cartQty} readOnly />
                        <button
                          onClick={() => handleUpdateQty(cartQty + 1)}
                          disabled={currentSize.qty <= cartQty}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/cart')}
                      className="w-full btn btn-primary btn-lg"
                    >
                      View Cart
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-black">Quantity:</span>
                      <div className="quantity-selector">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <input 
                          type="text" 
                          value={quantity} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setQuantity(Math.min(currentSize.qty, Math.max(1, val)));
                          }}
                        />
                        <button
                          onClick={() => setQuantity(Math.min(currentSize.qty, quantity + 1))}
                          disabled={quantity >= currentSize.qty}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={handleAddToCart}
                        disabled={currentSize.qty === 0 || loading}
                        className="flex-1 btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
                        {loading ? 'Adding...' : 'Add to Cart'}
                      </button>
                      <button className="btn btn-outline">
                        <FontAwesomeIcon icon={faHeart} />
                      </button>
                      <button className="btn btn-outline">
                        <FontAwesomeIcon icon={faShare} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Product Features */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <FontAwesomeIcon icon={faTruck} className="text-green-600" />
                <span>Free shipping on orders over ₹2,000</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <FontAwesomeIcon icon={faUndo} className="text-blue-600" />
                <span>30-day return policy</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <FontAwesomeIcon icon={faShieldAlt} className="text-purple-600" />
                <span>1-year warranty included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;