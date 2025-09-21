import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../services/api';
import OrderSummaryModal from '../components/OrderSummaryModal';
import ReturnOrderModal from '../components/ReturnOrderModal';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [alreadyReturnedOrders, setAlreadyReturnedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnOrder, setReturnOrder] = useState(null);

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

  useEffect(() => {
  const checkReturns = async () => {
    try {
      const checks = await Promise.all(
        orders.map(async (order) => {
          const res = await ordersAPI.checkReturnExists(order._id);
          return { orderId: order._id, exists: res.data.exists }; 
        })
      );

      setAlreadyReturnedOrders(checks);
      console.log('Already returned orders:', checks);
    } catch (error) {
      console.error('Error checking return requests:', error);
    }
  };

  if (orders.length > 0) checkReturns();
}, [orders]);


  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleReturnOrder = (order) => {
    setReturnOrder(order);
    setShowReturnModal(true);
  };

  const closeReturnModal = () => {
    setShowReturnModal(false);
    setReturnOrder(null);
  };

  const handleReturnSuccess = () => {
    // Refresh orders list
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getMyOrders();
        const filtered = response.data.orders.filter(order => order.stages !== 'pending');
        setOrders(filtered);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  };

  

  const canReturnOrder = (order) => {
    
    if (order.stages !== 'Delivered') return false;
    
    if (alreadyReturnedOrders.some(o => o.orderId === order._id && o.exists)) return false;

    const deliveryDate = new Date(order.updatedAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return deliveryDate >= sevenDaysAgo;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <button
          className="btn btn-primary"
          onClick={() => window.location.href = '/products'}
        >
          Shop More
        </button>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-black">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ₹{order.total_mrp.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.stages === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.stages === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.stages === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.stages}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        View
                      </button>
                      {canReturnOrder(order) && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleReturnOrder(order)}
                        >
                          Return
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      
      {/* Return Order Modal */}
      {showReturnModal && returnOrder && (
        <ReturnOrderModal
          order={returnOrder}
          onClose={closeReturnModal}
          onSuccess={handleReturnSuccess}
        />
      )}
      </div>
    </div>
  );
};

export default OrdersPage;
