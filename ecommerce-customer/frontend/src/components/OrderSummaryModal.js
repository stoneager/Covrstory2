import React from 'react';

const OrderSummaryModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
        onClick={onClose}
      >
        &times;
      </button>
      <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
      <div className="mb-4">
        <div className="flex justify-between text-gray-700 mb-2">
          <span><strong>Order ID:</strong> #{order._id.slice(-8)}</span>
          <span><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-gray-700 mb-2">
          <span><strong>Status:</strong> {order.stages}</span>
          <span><strong>Total:</strong> ₹{order.total_mrp.toLocaleString()}</span>
        </div>
      </div>
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 border-b pb-4">
              <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
                {item.productQuantity && item.productQuantity.images && item.productQuantity.images.length > 0 ? (
                  <img
                    src={item.productQuantity.images[0]}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-black">{item.productName || (item.productQuantity && item.productQuantity.product && item.productQuantity.product.name) || 'Product'}</div>
                <div className="text-sm text-gray-600">Color: {item.colour} | Size: {item.size && item.size.toUpperCase()}</div>
                <div className="text-sm text-gray-600">Quantity: {item.qty}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-black">₹{(item.price * item.qty).toLocaleString()}</div>
                <div className="text-xs text-gray-500">₹{item.price.toLocaleString()} each</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between text-lg font-bold text-black">
          <span>Total</span>
          <span>₹{order.total_mrp.toLocaleString()}</span>
        </div>
        {order.coupon_code && (
          <div className="flex justify-between text-green-600 mt-2">
            <span>Coupon ({order.coupon_code})</span>
            <span>-₹{order.discount_amount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600 mt-2">
          <span>Shipping</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryModal;
