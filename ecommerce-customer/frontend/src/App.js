import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import ProtectedRoute from './components/ProtectedRoute';
import OrdersPage from './pages/OrdersPage';

function App() {
  useEffect(() => {
    // Read token and role from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');
    if (token) {
      localStorage.setItem('token', token);
      if (role) localStorage.setItem('userRole', role);
      // Remove token and role from URL
      params.delete('token');
      params.delete('role');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route 
                  path="/products" 
                  element={
                    <ProtectedRoute>
                      <ProductsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payment" 
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;