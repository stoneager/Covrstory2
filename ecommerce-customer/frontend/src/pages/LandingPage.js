import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, collectionsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await collectionsAPI.getAll();
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

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
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="Athletic wear model"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="container-custom">
          <div className="relative z-10 py-32 md:py-40 lg:py-48">
            <div className="max-w-4xl">
              <h1 className="heading-xl text-white mb-6 fade-in">
                Discover Your
                <br />
                <span className="italic">Perfect Style</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl leading-relaxed fade-in">
                Premium quality clothing designed for the modern lifestyle. 
                Crafted with attention to detail and built to last.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 fade-in">
                {!user ? (
                  <button
                    onClick={() => window.location.href = 'http://localhost:3002'}
                    className="bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
                  >
                    Shop Now
                  </button>
                ) : (
                  <Link
                    to="/products"
                    className="bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-100 transition-colors duration-300 inline-flex items-center justify-center"
                  >
                    Shop Now
                  </Link>
                )}
                <Link
                  to="/products"
                  className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-black transition-colors duration-300 inline-flex items-center justify-center"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Carousel */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-black mb-4">Shop by Category</h2>
            <p className="text-body max-w-2xl mx-auto">
              Discover our carefully curated collections designed for every occasion
            </p>
          </div>
          <div className="relative w-full max-w-4xl mx-auto">
            <div
              ref={carouselRef}
              className="overflow-hidden rounded-xl shadow-lg"
              style={{ height: '400px', position: 'relative' }}
            >
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${activeIndex * (100 / collections.length)}%)`, width: `${collections.length * 100}%`, height: '400px' }}
              >
                {collections.map((collection, idx) => (
                  <div key={collection._id} style={{width: `${100 / collections.length}%`, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Link
                      to={`/products?collection=${collection._id}`}
                      className="relative block w-full h-full"
                    >
                      <div className="flex flex-col items-center justify-center w-full h-full" style={{ height: '400px' }}>
                        {collection.image ? (
                          <div className="flex items-center justify-center w-full h-80 bg-white rounded-t-lg shadow overflow-hidden">
                            <img
                              src={collection.image}
                              alt={collection.name}
                              className="object-contain mx-auto block"
                              style={{ maxHeight: '90%', maxWidth: '90%' }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-t-lg shadow">
                            <span className="text-gray-400 text-lg">No Image</span>
                          </div>
                        )}
                        <div className="w-full bg-white rounded-b-lg shadow px-6 py-4 flex items-center justify-center border-t border-gray-100" style={{ minHeight: '60px' }}>
                          <h3 className="text-2xl font-bold text-black text-center m-0">{collection.name}</h3>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              {/* Left Arrow */}
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow z-30"
                onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
                disabled={activeIndex === 0}
                style={{ outline: 'none' }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              {/* Right Arrow */}
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow z-30"
                onClick={() => setActiveIndex((prev) => Math.min(prev + 1, collections.length - 1))}
                disabled={activeIndex === collections.length - 1}
                style={{ outline: 'none' }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </button>
              {/* Navigation Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {collections.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full ${activeIndex === idx ? 'bg-black' : 'bg-gray-300'} border border-white`}
                    onClick={() => setActiveIndex(idx)}
                    style={{ outline: 'none' }}
                  />
                ))}
              </div>
            </div>
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
}

export default LandingPage;
