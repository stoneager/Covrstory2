import React, { useState } from 'react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import ProductCard from '../components/ui/ProductCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faShield, faRotateLeft, faHeadset } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  const [cartCount] = useState(3);
  const [user] = useState({ name: 'John', email: 'john@example.com' });

  const featuredProducts = [
    { id: 1, name: 'Premium Wireless Headphones', price: 12999, salePrice: 8999, discount: 30, image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', category: 'Electronics', rating: 4.5, reviews: 324, stock: 45 },
    { id: 2, name: 'Ultra HD Smart Watch', price: 8999, salePrice: 5999, discount: 33, image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', category: 'Electronics', rating: 4.2, reviews: 156, stock: 32 },
    { id: 3, name: 'Portable Power Bank', price: 3999, salePrice: 2499, discount: 37, image: 'https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg', category: 'Accessories', rating: 4.8, reviews: 512, stock: 78 },
    { id: 4, name: 'Premium Gaming Mouse', price: 5999, salePrice: 3999, discount: 33, image: 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg', category: 'Gaming', rating: 4.6, reviews: 289, stock: 54 },
  ];

  const categories = [
    { name: 'Electronics', icon: '📱', image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg' },
    { name: 'Fashion', icon: '👕', image: 'https://images.pexels.com/photos/2769274/pexels-photo-2769274.jpeg' },
    { name: 'Home & Garden', icon: '🏠', image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg' },
    { name: 'Sports', icon: '⚽', image: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar logo="ShopHub" cartCount={cartCount} user={user} />

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-32 pb-24 md:pb-40 overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-20 w-72 h-72 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div className="space-y-4">
                <span className="inline-block text-sm font-bold text-primary-600 bg-primary-100 px-4 py-2 rounded-full">
                  ✨ Welcome to ShopHub
                </span>
                <h1 className="text-display-lg text-secondary-900">
                  Discover Premium Products at Unbeatable Prices
                </h1>
                <p className="text-xl text-secondary-600 leading-relaxed">
                  Shop thousands of products from your favorite brands. Fast shipping, easy returns, and 24/7 customer support.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-premium-primary">
                  Shop Now
                </button>
                <button className="btn-premium-outline">
                  View Collections
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="bg-white rounded-xl p-4 shadow-soft">
                  <p className="text-2xl font-bold text-primary-600">50K+</p>
                  <p className="text-sm text-secondary-600">Products</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-soft">
                  <p className="text-2xl font-bold text-accent-600">100K+</p>
                  <p className="text-sm text-secondary-600">Happy Customers</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-soft">
                  <p className="text-2xl font-bold text-warm-600">24/7</p>
                  <p className="text-sm text-secondary-600">Support</p>
                </div>
              </div>
            </div>

            <div className="relative h-[500px] lg:h-[600px] animate-slideUp">
              <img
                src="https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg"
                alt="Hero Product"
                className="w-full h-full object-cover rounded-3xl shadow-large"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-large max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="font-bold text-secondary-900">4.8/5 Rating</p>
                    <p className="text-sm text-secondary-600">From 1000+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: faTruck, title: 'Free Shipping', desc: 'On orders over ₹999' },
              { icon: faShield, title: 'Secure Payment', desc: '100% secure transactions' },
              { icon: faRotateLeft, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: faHeadset, title: '24/7 Support', desc: 'Dedicated customer service' },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={feature.icon} className="text-primary-600 text-xl" />
                </div>
                <h3 className="font-bold text-secondary-900">{feature.title}</h3>
                <p className="text-sm text-secondary-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-h1 mb-12 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl cursor-pointer h-72 card-premium-hover"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300 flex items-end p-6">
                  <div>
                    <p className="text-3xl mb-2">{category.icon}</p>
                    <h3 className="text-white text-xl font-bold">{category.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-h1">Featured Products</h2>
              <p className="text-secondary-600 mt-2">Limited time offers on selected items</p>
            </div>
            <a href="#" className="link-primary text-lg">View all →</a>
          </div>

          <div className="grid-responsive">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(prod) => console.log('Added to cart:', prod)}
                onQuickView={(prod) => console.log('Quick view:', prod)}
                onWishlist={(prod) => console.log('Added to wishlist:', prod)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Find Your Perfect Product?
          </h2>
          <p className="text-xl text-primary-100">
            Join over 100,000 happy customers shopping with us today
          </p>
          <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-secondary-50 transition-colors duration-200 shadow-large">
            Start Shopping
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
