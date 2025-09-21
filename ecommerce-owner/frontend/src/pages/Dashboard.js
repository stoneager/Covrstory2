import React, { useState, useEffect } from 'react';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { 
	Chart as ChartJS, 
	CategoryScale, 
	LinearScale, 
	BarElement, 
	Title, 
	Tooltip, 
	Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ordersAPI } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
	const [stats, setStats] = useState([]);
	const [orders, setOrders] = useState([]);
	const [filter, setFilter] = useState('day');
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState(null);

	useEffect(() => {
		fetchData();
	}, [filter]);

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await ordersAPI.getStats(filter);
			setStats(response.data.stats);
			setOrders(response.data.orders);
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	const chartData = {
		labels: stats.map(stat => stat._id || 'Unknown'),
		datasets: [
			{
				label: 'Order Count',
				data: stats.map(stat => stat.count),
				backgroundColor: 'rgba(30, 30, 30, 0.8)',
				borderRadius: 4,
			},
			{
				label: 'Total Revenue (₹)',
				data: stats.map(stat => stat.total),
				backgroundColor: 'rgba(80, 80, 80, 0.6)',
				borderRadius: 4,
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top',
				labels: {
					font: {
						size: 13,
						family: "'Inter', sans-serif",
						weight: '500'
					},
					padding: 20,
					color: '#1e1e1e'
				}
			},
			title: {
				display: true,
				text: `Orders Statistics - ${filter.charAt(0).toUpperCase() + filter.slice(1)}`,
				font: {
					size: 16,
					family: "'Inter', sans-serif",
					weight: '600'
				},
				color: '#1e1e1e',
				padding: 20
			},
		},
		scales: {
			y: {
				grid: {
					color: '#f0f0f0',
				},
				ticks: {
					font: {
						size: 12,
						family: "'Inter', sans-serif"
					},
					color: '#666666'
				}
			},
			x: {
				grid: {
					display: false
				},
				ticks: {
					font: {
						size: 12,
						family: "'Inter', sans-serif"
					},
					color: '#666666'
				}
			}
		}
	};

	const getTotalStats = () => {
		const totalOrders = stats.reduce((sum, stat) => sum + stat.count, 0);
		const totalRevenue = stats.reduce((sum, stat) => sum + stat.total, 0);
		const pendingOrders = stats.find(stat => stat._id === 'pending')?.count || 0;
		const deliveredOrders = stats.find(stat => stat._id === 'delivered')?.count || 0;

		return { totalOrders, totalRevenue, pendingOrders, deliveredOrders };
	};

	const { totalOrders, totalRevenue, pendingOrders, deliveredOrders } = getTotalStats();

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<div className="card-header">
				<div>
					<h1 className="card-title">Dashboard Overview</h1>
					<p className="text-gray-600 text-lg mt-2">Monitor your business performance and key metrics</p>
				</div>
				<div className="flex items-center gap-4">
					<label className="filter-item">
						<span className="text-sm font-semibold text-gray-700">Time Period:</span>
						<select 
							className="form-control min-w-[140px]"
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
						>
							<option value="day">Today</option>
							<option value="week">This Week</option>
							<option value="month">This Month</option>
						</select>
					</label>
				</div>
			</div>

			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-icon">
						<svg fill="currentColor" viewBox="0 0 20 20">
							<path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
						</svg>
					</div>
					<div className="stat-value">{totalOrders}</div>
					<div className="stat-label">Total Orders</div>
				</div>
				<div className="stat-card">
					<div className="stat-icon">
						<svg fill="currentColor" viewBox="0 0 20 20">
							<path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.5 12.5v1h3v-1h-3zm5.5-1a1 1 0 01-1 1h-1v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1H6a1 1 0 01-1-1V8a1 1 0 011-1h1V6a1 1 0 011-1h3a1 1 0 011 1v1h1a1 1 0 011 1v3.5z" />
						</svg>
					</div>
					<div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
					<div className="stat-label">Total Revenue</div>
				</div>
				<div className="stat-card">
					<div className="stat-icon">
						<svg fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
						</svg>
					</div>
					<div className="stat-value">{pendingOrders}</div>
					<div className="stat-label">Pending Orders</div>
				</div>
				<div className="stat-card">
					<div className="stat-icon">
						<svg fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
						</svg>
					</div>
					<div className="stat-value">{deliveredOrders}</div>
					<div className="stat-label">Delivered Orders</div>
				</div>
			</div>

			<div className="card">
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Analytics</h2>
					<p className="text-gray-600">Visual representation of your business metrics</p>
				</div>
				<div className="chart-container">
					<Bar data={chartData} options={chartOptions} />
				</div>
			</div>

			<div className="card">
				<div className="card-header">
					<div>
						<h3 className="text-2xl font-bold text-gray-900">Recent Orders</h3>
						<p className="text-gray-600 mt-1">Latest customer orders and their status</p>
					</div>
					<button className="btn btn-primary">
						View All Orders
					</button>
				</div>
				<div className="table-responsive">
					<table className="table">
						<thead>
							<tr>
								<th>Order ID</th>
								<th>Customer</th>
								<th>Total</th>
								<th>Status</th>
								<th>Date</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{orders.map(order => (
								<tr key={order._id}>
									<td className="font-mono font-semibold">#{order._id.slice(-8)}</td>
									<td>
										<div>
											<div className="font-semibold text-gray-900">{order.user?.name || 'N/A'}</div>
											<div className="text-sm text-gray-500">{order.user?.email || ''}</div>
										</div>
									</td>
									<td className="font-semibold">₹{order.total_mrp.toLocaleString()}</td>
									<td>
										<span className={`badge badge-${getStatusColor(order.stages)}`}>
											{order.stages}
										</span>
									</td>
									<td className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
									<td>
														<button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(order)}>
															View Details
														</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
						</div>
						{selectedOrder && (
							<OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
						)}
				
				{orders.length === 0 && (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
								<path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
						<p className="text-gray-600">Orders will appear here once customers start purchasing</p>
					</div>
				)}
			</div>
		</div>
	);
};

const getStatusColor = (status) => {
	const colors = {
		pending: 'warning',
		confirmed: 'info',
		shipped: 'primary',
		delivered: 'success',
		cancelled: 'danger'
	};
	return colors[status] || 'secondary';
};

export default Dashboard;
