import React from 'react';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const { line1, area, city, pincode } = address;
    return `${line1 || ''}${area ? ', ' + area : ''}${city ? ', ' + city : ''}${pincode ? ' - ' + pincode : ''}`;
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Order Details</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="order-detail-row">
            <span className="order-detail-label">Order ID</span>
            <span className="order-detail-value font-mono">{order._id}</span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">User Name</span>
            <span className="order-detail-value">{order.user?.name || 'N/A'}</span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Email</span>
            <span className="order-detail-value">{order.user?.email || 'N/A'}</span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Mobile</span>
            <span className="order-detail-value">{order.mobile || 'N/A'}</span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Address</span>
            <span className="order-detail-value">{formatAddress(order.address)}</span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Total MRP</span>
            <span className="order-detail-value">₹{order.total_mrp?.toLocaleString() || 0}</span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Discount</span>
            <span className="order-detail-value">₹{order.discount_amount?.toLocaleString() || 0}</span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Final Amount</span>
            <span className="order-detail-value font-semibold">₹{order.final_amount?.toLocaleString() || 0}</span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Order Status</span>
            <span className="order-detail-value">
              <span className={`status-badge ${getStatusClass(order.stages)}`}>
                {order.stages || 'N/A'}
              </span>
            </span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Payment Status</span>
            <span className="order-detail-value">
              <span className={`status-badge ${order.payment_status?.toLowerCase() === 'paid' ? 'status-delivered' : 'status-pending'}`}>
                {order.payment_status || 'N/A'}
              </span>
            </span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Created At</span>
            <span className="order-detail-value">{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</span>
          </div>

          <div className="order-items-list">
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            {order.items?.length > 0 ? (
              order.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <div className="order-item-details">
                    <div className="font-medium text-base mb-1 text-black">
                      {item.productName || (item.productQuantity?.product?.name) || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="inline-block mr-3">Size: {item.size || 'N/A'}</span>
                      <span className="inline-block mr-3">Color: {item.colour || 'N/A'}</span>
                      <span className="inline-block">Quantity: {item.qty}</span>
                    </div>
                  </div>
                  <div className="order-item-price font-semibold">₹{item.price?.toLocaleString() || 0}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No items found</div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
