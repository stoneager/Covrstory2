import React from 'react';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const { line1, area, city, pincode } = address;
    return `${line1 || ''}${area ? ', ' + area : ''}${city ? ', ' + city : ''}${pincode ? ' - ' + pincode : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4">Order Details</h2>

        <div className="mb-2">
          <span className="font-semibold">User Name:</span> {order.user?.name || 'N/A'}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Email:</span> {order.user?.email || 'N/A'}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Mobile:</span> {order.mobile || 'N/A'}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Address:</span> {formatAddress(order.address)}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Order ID:</span> {order._id}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Total MRP:</span> ₹{order.total_mrp?.toLocaleString() || 0}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Discount:</span> ₹{order.discount_amount?.toLocaleString() || 0}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Final Amount:</span> ₹{order.final_amount?.toLocaleString() || 0}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Status:</span> {order.stages || 'N/A'}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Payment Status:</span> {order.payment_status || 'N/A'}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Created At:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Items:</span>
          <ul className="list-disc ml-6">
            {order.items?.length > 0 ? (
              order.items.map((item, idx) => (
                <li key={idx}>
                  {item.productName} ({item.size || 'N/A'}, {item.colour || 'N/A'}) x {item.qty} - ₹{item.price?.toLocaleString() || 0}
                </li>
              ))
            ) : (
              <li>No items found</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
