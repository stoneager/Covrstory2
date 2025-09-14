import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes, faSliders } from '@fortawesome/free-solid-svg-icons';
import { productsAPI, collectionsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    fetchProducts();
    fetchCollections();
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
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="heading-lg text-black mb-2">Shop All</h1>
            <p className="text-body">Discover our complete collection</p>
          </div>
          
          {/* Mobile Filter Toggle */}
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn btn-outline"
            >
              <FontAwesomeIcon icon={faSliders} className="mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-auto min-w-[140px]"
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
            <div className="bg-gray-50 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-black">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-black transition-colors duration-200"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="space-y-2">
                    {['', 'top', 'bottom'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={selectedType === type}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {type === '' ? 'All Categories' : type === 'top' ? 'Tops' : 'Bottoms'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <div className="space-y-2">
                    {['', 'm', 'f'].map((gender) => (
                      <label key={gender} className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={selectedGender === gender}
                          onChange={(e) => setSelectedGender(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {gender === '' ? 'All' : gender === 'm' ? 'Men' : 'Women'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="input"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="spinner-lg"></div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-600">
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
              <div className="text-center py-16">
                <FontAwesomeIcon icon={faFilter} className="text-6xl text-gray-300 mb-6" />
                <h3 className="heading-sm text-gray-900 mb-2">No products found</h3>
                <p className="text-body mb-6">Try adjusting your search or filter criteria</p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
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