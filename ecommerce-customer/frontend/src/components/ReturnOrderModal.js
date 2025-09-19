import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { returnsAPI } from '../services/api';

const ReturnOrderModal = ({ order, onClose, onSuccess }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleItemToggle = (item, quantity) => {
    const existingIndex = selectedItems.findIndex(
      selected => selected.productQuantity === item.productQuantity._id
    );

    if (existingIndex > -1) {
      if (quantity === 0) {
        // Remove item
        setSelectedItems(prev => prev.filter((_, index) => index !== existingIndex));
      } else {
        // Update quantity
        setSelectedItems(prev => prev.map((selected, index) => 
          index === existingIndex ? { ...selected, quantity } : selected
        ));
      }
    } else if (quantity > 0) {
      // Add new item
      setSelectedItems(prev => [...prev, {
        productQuantity: item.productQuantity._id,
        quantity
      }]);
    }
  };

  const getSelectedQuantity = (itemId) => {
    const selected = selectedItems.find(item => item.productQuantity === itemId);
    return selected ? selected.quantity : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      alert('Please select at least one item to return');
      return;
    }

    setLoading(true);
    try {
      await returnsAPI.create({
        orderId: order._id,
        productQuantity: selectedItems,
        reason
      });
      
      alert('Return request submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">Return Order Items</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Order #{order._id.slice(-8)} - Select items you want to return
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.productQuantity?.images?.[0] ? (
                      <img
                        src={item.productQuantity.images[0]}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-black">
                      {item.productName || item.productQuantity?.product?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Color: {item.colour} | Size: {item.size?.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ordered: {item.qty} | Price: ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Return Qty:</label>
                    <select
                      value={getSelectedQuantity(item.productQuantity._id)}
                      onChange={(e) => handleItemToggle(item, parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    >
                      {Array.from({ length: item.qty + 1 }, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Return (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe why you want to return these items..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedItems.length === 0}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnOrderModal;