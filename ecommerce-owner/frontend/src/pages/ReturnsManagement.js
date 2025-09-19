import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faEye } from '@fortawesome/free-solid-svg-icons';
import { returnsAPI } from '../services/api';

const ReturnsManagement = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await returnsAPI.getAll(statusFilter);
      setReturns(response.data.returns);
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (returnId, newStatus) => {
    try {
      await returnsAPI.updateStatus(returnId, newStatus);
      fetchReturns(); // Refresh the list
    } catch (error) {
      console.error('Error updating return status:', error);
      alert('Failed to update return status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Requested': 'badge-warning',
      'Approved': 'badge-info',
      'PickedUp': 'badge-primary',
      'Completed': 'badge-success',
      'Rejected': 'badge-danger'
    };
    return colors[status] || 'badge-secondary';
  };

  const handleViewReturn = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setShowModal(true);
  };

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">Returns Management</h1>
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto' }}
          >
            <option value="all">All Returns</option>
            <option value="Requested">Requested</option>
            <option value="Approved">Approved</option>
            <option value="PickedUp">Picked Up</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Requested Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map(returnRequest => (
                  <tr key={returnRequest._id}>
                    <td>#{returnRequest._id.slice(-8)}</td>
                    <td>
                      <div>
                        <div className="font-weight-bold">{returnRequest.userId.name}</div>
                        <div className="text-muted small">{returnRequest.userId.email}</div>
                      </div>
                    </td>
                    <td>#{returnRequest.orderId._id.slice(-8)}</td>
                    <td>{returnRequest.productQuantity.length} item(s)</td>
                    <td>
                      <span className={`badge ${getStatusColor(returnRequest.status)}`}>
                        {returnRequest.status}
                      </span>
                    </td>
                    <td>{new Date(returnRequest.requestedAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleViewReturn(returnRequest)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        
                        {returnRequest.status === 'Requested' && (
                          <>
                            <button
                              className="btn btn-success"
                              onClick={() => handleStatusUpdate(returnRequest._id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleStatusUpdate(returnRequest._id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {returnRequest.status === 'Approved' && (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleStatusUpdate(returnRequest._id, 'PickedUp')}
                          >
                            Mark Picked Up
                          </button>
                        )}
                        
                        {returnRequest.status === 'PickedUp' && (
                          <button
                            className="btn btn-success"
                            onClick={() => handleStatusUpdate(returnRequest._id, 'Completed')}
                          >
                            Complete
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

        {!loading && returns.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No return requests found.
          </div>
        )}
      </div>

      {/* Return Details Modal */}
      {showModal && selectedReturn && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>Return Request Details</h2>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <strong>Return ID:</strong> #{selectedReturn._id.slice(-8)}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className={`badge ${getStatusColor(selectedReturn.status)}`} style={{ marginLeft: '8px' }}>
                    {selectedReturn.status}
                  </span>
                </div>
                <div>
                  <strong>Customer:</strong> {selectedReturn.userId.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedReturn.userId.email}
                </div>
                <div>
                  <strong>Order ID:</strong> #{selectedReturn.orderId._id.slice(-8)}
                </div>
                <div>
                  <strong>Requested:</strong> {new Date(selectedReturn.requestedAt).toLocaleString()}
                </div>
              </div>

              {selectedReturn.reason && (
                <div style={{ marginBottom: '20px' }}>
                  <strong>Reason:</strong>
                  <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginTop: '5px' }}>
                    {selectedReturn.reason}
                  </div>
                </div>
              )}

              <div>
                <strong>Items to Return:</strong>
                <div style={{ marginTop: '10px' }}>
                  {selectedReturn.productQuantity.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px', 
                      padding: '10px', 
                      background: '#f9f9f9', 
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                        {item.productQuantity?.images?.[0] ? (
                          <img
                            src={item.productQuantity.images[0]}
                            alt={item.productQuantity.product?.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>
                            No Image
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>
                          {item.productQuantity?.product?.name || 'Product'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Quantity: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsManagement;