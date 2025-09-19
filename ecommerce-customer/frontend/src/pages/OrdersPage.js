import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../services/api';
import OrderSummaryModal from '../components/OrderSummaryModal';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getMyOrders();
        // Filter out pending orders
        const filtered = response.data.orders.filter(order => order.stages !== 'pending');
        setOrders(filtered);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => window.location.href = '/products'}
        >
          Shop More
        </button>
      </div>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <table className="table-auto w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td className="border px-4 py-2">#{order._id.slice(-8)}</td>
                <td className="border px-4 py-2">₹{order.total_mrp.toLocaleString()}</td>
                <td className="border px-4 py-2">{order.stages}</td>
                <td className="border px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    onClick={() => handleViewOrder(order)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Order Summary Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={closeModal}></div>
          <div className="z-50">
            <OrderSummaryModal order={selectedOrder} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
