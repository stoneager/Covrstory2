import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import { productsAPI, collectionsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const { cartItems, addToCart, updateCartItem, removeFromCart } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedCollection, selectedType, selectedGender, priceRange]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        collection: selectedCollection,
        type: selectedType,
        gender: selectedGender,
        minPrice: priceRange.min,
        maxPrice: priceRange.max
      };
      
      const response = await productsAPI.getAll(params);
      console.log('Products : ', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Log products whenever they change
    console.log('Fetched products:', products);
  }, [products]);

  const fetchCollections = async () => {
    try {
      const response = await collectionsAPI.getAll();
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCollection('');
    setSelectedType('');
    setSelectedGender('');
    setPriceRange({ min: '', max: '' });
  };

  // Helper to get cart item for a productQuantity._id
  const getCartItem = (productQuantityId) => {
    if (!Array.isArray(cartItems)) return undefined;
    return cartItems.find(ci => ci.productQuantity._id === productQuantityId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">All Products</h1>
        
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Collection Filter */}
            <div>
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="input"
              >
                <option value="">All Collections</option>
                {collections.map(collection => (
                  <option key={collection._id} value={collection._id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="input"
              >
                <option value="">All Genders</option>
                <option value="m">Men</option>
                <option value="f">Women</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <button
                onClick={clearFilters}
                className="w-full btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
              <input
                type="number"
                placeholder="No limit"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => {
            // Transform productQuantities to variants format for ProductCard
            const variantsMap = {};
            (product.productQuantities || []).forEach(qty => {
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

            // Compose the product object for ProductCard
            const productForCard = {
              ...product,
              variants
            };

            return (
              <div key={product._id}>
                <ProductCard product={productForCard} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faFilter} className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;