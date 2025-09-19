import React, { useEffect, useState } from 'react';
import { returnsAPI } from '../services/api';

const ReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const response = await returnsAPI.getMyReturns();
        setReturns(response.data.returns);
      } catch (error) {
        console.error('Error fetching returns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Requested': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'PickedUp': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusSteps = (currentStatus) => {
    const steps = ['Requested', 'Approved', 'PickedUp', 'Completed'];
    const currentIndex = steps.indexOf(currentStatus);
    
    if (currentStatus === 'Rejected') {
      return [{ name: 'Requested', completed: true }, { name: 'Rejected', completed: true }];
    }
    
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-black">My Returns</h1>
          <button
            onClick={() => window.location.href = '/orders'}
            className="btn btn-outline"
          >
            Back to Orders
          </button>
        </div>

        {returns.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl text-gray-300 mb-6">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Returns Found</h3>
            <p className="text-gray-600 mb-8">You haven't requested any returns yet.</p>
            <button
              onClick={() => window.location.href = '/orders'}
              className="btn btn-primary"
            >
              View Orders
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {returns.map((returnRequest) => (
              <div key={returnRequest._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      Return Request #{returnRequest._id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Order #{returnRequest.orderId._id.slice(-8)} • 
                      Requested on {new Date(returnRequest.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(returnRequest.status)}`}>
                    {returnRequest.status}
                  </span>
                </div>

                {/* Status Timeline */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    {getStatusSteps(returnRequest.status).map((step, index) => (
                      <div key={step.name} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.completed ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="ml-2 text-sm font-medium text-gray-900">
                          {step.name}
                        </div>
                        {index < getStatusSteps(returnRequest.status).length - 1 && (
                          <div className={`w-16 h-1 mx-4 ${
                            step.completed ? 'bg-black' : 'bg-gray-200'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Return Items */}
                <div className="mb-4">
                  <h4 className="font-semibold text-black mb-3">Items to Return:</h4>
                  <div className="space-y-3">
                    {returnRequest.productQuantity.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {item.productQuantity?.images?.[0] ? (
                            <img
                              src={item.productQuantity.images[0]}
                              alt={item.productQuantity.product?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-black">
                            {item.productQuantity?.product?.name || 'Product'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                {returnRequest.reason && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-black mb-2">Reason:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">
                      {returnRequest.reason}
                    </p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-sm text-gray-500 border-t pt-4">
                  <p>Requested: {new Date(returnRequest.requestedAt).toLocaleString()}</p>
                  <p>Last Updated: {new Date(returnRequest.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnsPage;