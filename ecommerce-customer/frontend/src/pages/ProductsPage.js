import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes, faSliders } from '@fortawesome/free-solid-svg-icons';
import { productsAPI, collectionsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { Link, useLocation } from 'react-router-dom';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const { cartItems, addToCart, updateCartItem, removeFromCart } = useCart();

  const location = useLocation();

  useEffect(() => {
    // If a collection query param exists, apply it on first load
    const params = new URLSearchParams(location.search);
    const collectionFromUrl = params.get('collection');
    if (collectionFromUrl) {
      setSelectedCollection(collectionFromUrl);
    }
    fetchProducts();
    fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedCollection, selectedType, selectedGender, priceRange, sortBy]);

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
      let sortedProducts = [...response.data];
      
      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          sortedProducts.sort((a, b) => {
            const aPrice = Math.min(...(a.productQuantities || []).map(pq => pq.discountedPrice || pq.price));
            const bPrice = Math.min(...(b.productQuantities || []).map(pq => pq.discountedPrice || pq.price));
            return aPrice - bPrice;
          });
          break;
        case 'price-high':
          sortedProducts.sort((a, b) => {
            const aPrice = Math.max(...(a.productQuantities || []).map(pq => pq.discountedPrice || pq.price));
            const bPrice = Math.max(...(b.productQuantities || []).map(pq => pq.discountedPrice || pq.price));
            return bPrice - aPrice;
          });
          break;
        case 'name':
          sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default: // newest
          sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

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
    setSortBy('newest');
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCollection,
    selectedType,
    selectedGender,
    priceRange.min,
    priceRange.max
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <div className="mb-4">
              <span className="inline-block bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                Products
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Shop All</h1>
            <p className="text-body text-lg">Discover our complete collection of premium products</p>
          </div>
          
          {/* Mobile Filter Toggle */}
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200 shadow-sm"
            >
              <FontAwesomeIcon icon={faSliders} className="mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm min-w-[160px]"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl p-8 sticky top-24 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                    <FontAwesomeIcon 
                      icon={faSearch} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    />
                  </div>
                </div>

                {/* Collection Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Collection
                  </label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
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
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Category
                  </label>
                  <div className="space-y-3">
                    {['', 'top', 'bottom'].map((type) => (
                      <label key={type} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={selectedType === type}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="mr-3 w-4 h-4 text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm text-gray-700 font-medium">
                          {type === '' ? 'All Categories' : type === 'top' ? 'Tops' : 'Bottoms'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Gender
                  </label>
                  <div className="space-y-3">
                    {['', 'm', 'f'].map((gender) => (
                      <label key={gender} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={selectedGender === gender}
                          onChange={(e) => setSelectedGender(e.target.value)}
                          className="mr-3 w-4 h-4 text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm text-gray-700 font-medium">
                          {gender === '' ? 'All' : gender === 'm' ? 'Men' : 'Women'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="spinner-lg"></div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <p className="text-sm text-gray-600 font-medium">
                    Showing {products.length} product{products.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="product-grid">
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

                    const productForCard = {
                      ...product,
                      variants
                    };

                    return (
                      <Link key={product._id} to={`/product/${product._id}`}>
                        <ProductCard product={productForCard} />
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FontAwesomeIcon icon={faFilter} className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
                <p className="text-body mb-8 text-lg">Try adjusting your search or filter criteria</p>
                <button
                  onClick={clearFilters}
                  className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;