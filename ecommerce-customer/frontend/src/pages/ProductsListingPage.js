import React, { useState } from 'react';
import Navbar from '../components/ui/Navbar';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import ProductCard from '../components/ui/ProductCard';
import Footer from '../components/ui/Footer';

const ProductsListingPage = () => {
  const [cartCount] = useState(3);
  const [user] = useState({ name: 'John', email: 'john@example.com' });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const allProducts = [
    { id: 1, name: 'Premium Wireless Headphones', price: 12999, salePrice: 8999, discount: 30, image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', category: 'Electronics', rating: 4.5, reviews: 324, stock: 45 },
    { id: 2, name: 'Ultra HD Smart Watch', price: 8999, salePrice: 5999, discount: 33, image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', category: 'Electronics', rating: 4.2, reviews: 156, stock: 32 },
    { id: 3, name: 'Portable Power Bank', price: 3999, salePrice: 2499, discount: 37, image: 'https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg', category: 'Accessories', rating: 4.8, reviews: 512, stock: 78 },
    { id: 4, name: 'Premium Gaming Mouse', price: 5999, salePrice: 3999, discount: 33, image: 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg', category: 'Gaming', rating: 4.6, reviews: 289, stock: 54 },
    { id: 5, name: 'USB-C Fast Charger', price: 2999, salePrice: 1999, discount: 33, image: 'https://images.pexels.com/photos/4239521/pexels-photo-4239521.jpeg', category: 'Accessories', rating: 4.7, reviews: 421, stock: 92 },
    { id: 6, name: 'Wireless Keyboard', price: 4999, salePrice: 2999, discount: 40, image: 'https://images.pexels.com/photos/4050444/pexels-photo-4050444.jpeg', category: 'Accessories', rating: 4.4, reviews: 178, stock: 41 },
  ];

  const categories = ['Electronics', 'Accessories', 'Gaming', 'Fashion'];

  const handleSearch = (query) => {
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (cats) => {
    if (cats.length === 0) {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(p => cats.includes(p.category));
      setFilteredProducts(filtered);
    }
  };

  const handleSort = (sortBy) => {
    let sorted = [...(filteredProducts.length > 0 ? filteredProducts : allProducts)];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    setFilteredProducts(sorted);
  };

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : allProducts;

  return (
    <div className="min-h-screen bg-white">
      <Navbar logo="ShopHub" cartCount={cartCount} user={user} />

      <div className="pt-20">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-h1 mb-2">All Products</h1>
          <p className="text-secondary-600">Browse our complete collection of premium products</p>
        </div>

        {/* Search and Filters */}
        <SearchFilterBar
          categories={categories}
          onCategoryChange={handleCategoryChange}
          onSearch={handleSearch}
          onSortChange={handleSort}
        />

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {displayProducts.length > 0 ? (
            <>
              <div className="mb-6 flex justify-between items-center">
                <p className="text-secondary-600">
                  Showing {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>

              <div className={viewMode === 'grid' ? 'grid-responsive' : 'space-y-4'}>
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(prod) => console.log('Added to cart:', prod)}
                    onQuickView={(prod) => console.log('Quick view:', prod)}
                    onWishlist={(prod) => console.log('Added to wishlist:', prod)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-secondary-600">No products found. Try adjusting your filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {displayProducts.length > 12 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-center gap-2">
              <button className="px-4 py-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors">
                Previous
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    page === 1
                      ? 'bg-primary-600 text-white'
                      : 'border border-secondary-200 hover:bg-secondary-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-4 py-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductsListingPage;
