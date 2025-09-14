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
import './App.css';

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
		<Router>
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
						</Routes>
					</main>
				</div>
			</div>
		</Router>
	);
}

export default App;
