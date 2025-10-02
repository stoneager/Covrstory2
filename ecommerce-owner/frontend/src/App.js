import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import CollectionManagement from './pages/CollectionManagement';
import DiscountManagement from './pages/DiscountManagement';
import CouponManagement from './pages/CouponManagement';
import OrderTracking from './pages/OrderTracking';
import ReturnsManagement from './pages/ReturnsManagement';
import StoriesManagement from './pages/StoriesManagement';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');
    if (token) {
      localStorage.setItem('token', token);
      if (role) localStorage.setItem('userRole', role);
      params.delete('token');
      params.delete('role');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          <div className="app-body">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/collections" element={<CollectionManagement />} />
                <Route path="/discounts" element={<DiscountManagement />} />
                <Route path="/coupons" element={<CouponManagement />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/returns" element={<ReturnsManagement />} />
                <Route path="/stories" element={<StoriesManagement />} />
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}
//This is exporttttt
export default App;
