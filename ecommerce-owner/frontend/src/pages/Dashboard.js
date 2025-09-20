import React, { useState, useEffect } from 'react';
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
				backgroundColor: 'rgba(54, 162, 235, 0.6)',
			},
			{
				label: 'Total Revenue (₹)',
				data: stats.map(stat => stat.total),
				backgroundColor: 'rgba(255, 99, 132, 0.6)',
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top',
			},
			title: {
				display: true,
				text: `Orders Statistics - ${filter.charAt(0).toUpperCase() + filter.slice(1)}`,
			},
		},
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
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
							<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
								<path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
							</svg>
						</div>
					</div>
					<div className="stat-value">{totalOrders}</div>
					<div className="stat-label">Total Orders</div>
				</div>
				<div className="stat-card">
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
							<svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
							</svg>
						</div>
					</div>
					<div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
					<div className="stat-label">Total Revenue</div>
				</div>
				<div className="stat-card">
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
							<svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
							</svg>
						</div>
					</div>
					<div className="stat-value">{pendingOrders}</div>
					<div className="stat-label">Pending Orders</div>
				</div>
				<div className="stat-card">
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
							<svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
						</div>
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
										<button className="btn btn-secondary btn-sm">
											View Details
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				
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
