import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div className="container-custom">
          <div className="relative z-10 py-24 md:py-32 lg:py-40">
            <div className="max-w-4xl">
              <h1 className="heading-xl text-black mb-6 fade-in">
                Discover Your
                <br />
                <span className="italic">Perfect Style</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl leading-relaxed fade-in">
                Premium quality clothing designed for the modern lifestyle. 
                Crafted with attention to detail and built to last.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 fade-in">
                {!user ? (
                  <button
                    onClick={() => window.location.href = 'http://localhost:3002'}
                    className="btn btn-primary btn-lg"
                  >
                    Shop Now
                  </button>
                ) : (
                  <Link
                    to="/products"
                    className="btn btn-primary btn-lg"
                  >
                    Shop Now
                  </Link>
                )}
                <Link
                  to="/products"
                  className="btn btn-outline btn-lg"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-transparent"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-black mb-4">Shop by Category</h2>
            <p className="text-body max-w-2xl mx-auto">
              Discover our carefully curated collections designed for every occasion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link 
              to="/products?gender=m" 
              className="group relative overflow-hidden bg-gray-100 aspect-[4/3] hover-lift"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <div className="absolute bottom-8 left-8 z-20">
                <h3 className="text-3xl font-bold text-white mb-2">Men's Collection</h3>
                <p className="text-white/90 text-lg">Discover masculine essentials</p>
              </div>
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-lg">Men's Collection</span>
              </div>
            </Link>
            
            <Link 
              to="/products?gender=f" 
              className="group relative overflow-hidden bg-gray-100 aspect-[4/3] hover-lift"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
              <div className="absolute bottom-8 left-8 z-20">
                <h3 className="text-3xl font-bold text-white mb-2">Women's Collection</h3>
                <p className="text-white/90 text-lg">Elegant and contemporary</p>
              </div>
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-lg">Women's Collection</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-black mb-4">Featured Products</h2>
            <p className="text-body max-w-2xl mx-auto">
              Handpicked favorites from our latest collection
            </p>
          </div>

          {products.length > 0 ? (
            <div className="product-grid-large">
              {products.slice(0, 6).map(product => {
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
                  <div key={product._id} className="fade-in">
                    <ProductCard 
                      product={productForCard} 
                      showAddToCart={false}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products available at the moment.</p>
            </div>
          )}

          {products.length > 6 && (
            <div className="text-center mt-16">
              {user ? (
                <Link
                  to="/products"
                  className="btn btn-primary btn-lg"
                >
                  View All Products
                </Link>
              ) : (
                <button
                  onClick={() => window.location.href = 'http://localhost:3002'}
                  className="btn btn-primary btn-lg"
                >
                  Sign In to View All
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Brand Values Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="heading-sm text-black mb-4">Fast Delivery</h3>
              <p className="text-body">
                Free shipping on orders over $100. Express delivery available nationwide.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="heading-sm text-black mb-4">Premium Quality</h3>
              <p className="text-body">
                Carefully crafted with the finest materials and attention to detail.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="heading-sm text-black mb-4">Satisfaction Guaranteed</h3>
              <p className="text-body">
                30-day return policy. Love it or return it, no questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-black text-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="heading-lg mb-4">Stay in the Loop</h2>
            <p className="text-xl text-gray-300 mb-8">
              Be the first to know about new arrivals, exclusive offers, and style tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="btn bg-white text-black hover:bg-gray-100 border-white">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;