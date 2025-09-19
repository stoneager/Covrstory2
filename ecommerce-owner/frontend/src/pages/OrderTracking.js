import React, { useEffect, useState } from 'react';
import { packagesAPI, ordersAPI } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faBox, faCalendarAlt, faSort } from '@fortawesome/free-solid-svg-icons';

const statusOptions = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled'
];

const OrderTracking = () => {
  const [packages, setPackages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [creating, setCreating] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchPackages();
    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter orders that are not already in packages
    const ordersInPackages = new Set();
    packages.forEach(pkg => {
      if (pkg.orders) {
        pkg.orders.forEach(order => {
          ordersInPackages.add(typeof order === 'string' ? order : order._id);
        });
      }
    });
    
    const available = orders.filter(order => !ordersInPackages.has(order._id));
    setAvailableOrders(available);
  }, [packages, orders]);

  const fetchPackages = async () => {
    const res = await packagesAPI.getAll();
    let sortedPackages = [...res.data];
    
    // Apply sorting
    sortedPackages.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case 'status':
          comparison = a.stages.localeCompare(b.stages);
          break;
        case 'size':
          comparison = (b.orders?.length || 0) - (a.orders?.length || 0);
          break;
        default:
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
      }
      
      return sortOrder === 'desc' ? comparison : -comparison;
    });
    
    setPackages(sortedPackages);
  };

  const fetchOrders = async () => {
    const res = await ordersAPI.getAll();
    // Filter confirmed orders only
    const confirmedOrders = res.data.filter(order => 
      ['confirmed', 'shipped', 'delivered'].includes(order.stages)
    );
    setOrders(confirmedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const handleStatusChange = async (pkgId, status) => {
    await packagesAPI.updateStatus(pkgId, status);
    fetchPackages();
  };

  const handleCreatePackage = async () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order');
      return;
    }
    setCreating(true);
    await packagesAPI.create({ orderIds: selectedOrders });
    setShowCreateModal(false);
    setSelectedOrders([]);
    setCreating(false);
    fetchPackages();
    fetchOrders();
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setSelectedOrders(pkg.orders?.map(order => typeof order === 'string' ? order : order._id) || []);
    setShowEditModal(true);
  };

  const handleUpdatePackage = async () => {
    // This would require a new API endpoint to update package orders
    // For now, we'll just close the modal
    setShowEditModal(false);
    setEditingPackage(null);
    setSelectedOrders([]);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">Package Tracking</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faSort} />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="form-control"
              style={{ width: 'auto' }}
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
              <option value="size">Sort by Package Size</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px' }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Create Package
          </button>
        </div>
      </div>

      <div className="product-grid">
        {packages.map(pkg => (
          <div key={pkg._id} className="card" style={{ margin: '0', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                  <FontAwesomeIcon icon={faBox} style={{ marginRight: '8px', color: '#007bff' }} />
                  Package #{pkg._id.slice(-8)}
                </h3>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                  <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} />
                  {new Date(pkg.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleEditPackage(pkg)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                Status:
              </label>
              <select
                value={pkg.stages}
                onChange={e => handleStatusChange(pkg._id, e.target.value)}
                className="form-control"
                style={{ fontSize: '14px' }}
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ fontSize: '14px' }}>Orders ({pkg.orders?.length || 0}):</strong>
                <span className={`badge ${getStatusColor(pkg.stages).replace('bg-', 'badge-').replace('text-', '')}`}>
                  {pkg.stages.charAt(0).toUpperCase() + pkg.stages.slice(1)}
                </span>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', padding: '10px' }}>
                {pkg.orders && pkg.orders.length > 0 ? (
                  pkg.orders.map(order => (
                    <div key={order._id} style={{ 
                      padding: '8px', 
                      marginBottom: '8px', 
                      background: '#f9f9f9', 
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>#{order._id.slice(-8)}</div>
                      <div style={{ color: '#666' }}>
                        {new Date(order.createdAt).toLocaleDateString()} • ₹{order.total_mrp?.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#999', fontSize: '13px' }}>
                    No orders in this package
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="card">
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <FontAwesomeIcon icon={faBox} style={{ fontSize: '48px', marginBottom: '20px', color: '#ddd' }} />
            <h3>No packages created yet</h3>
            <p>Create your first package to start tracking orders</p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <FontAwesomeIcon icon={faPlus} />
              Create Package
            </button>
          </div>
        </div>
      )}

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Package</h2>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Select Orders ({availableOrders.length} available):
                </label>
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                  {availableOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      No available orders to package
                    </div>
                  ) : (
                    availableOrders.map(order => (
                      <label key={order._id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '8px', 
                        marginBottom: '4px',
                        background: selectedOrders.includes(order._id) ? '#f0f8ff' : 'transparent',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedOrders([...selectedOrders, order._id]);
                            } else {
                              setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                            }
                          }}
                          style={{ marginRight: '10px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            #{order._id.slice(-8)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(order.createdAt).toLocaleDateString()} • 
                            ₹{order.total_mrp?.toLocaleString()} • 
                            {order.stages}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
              
              {selectedOrders.length > 0 && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  <strong>Selected: {selectedOrders.length} order(s)</strong>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreatePackage} 
                disabled={creating || selectedOrders.length === 0}
              >
                {creating ? 'Creating...' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditModal && editingPackage && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Package #{editingPackage._id.slice(-8)}</h2>
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Current Orders in Package:</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px', marginBottom: '15px' }}>
                  {editingPackage.orders?.map(order => (
                    <div key={order._id} style={{ 
                      padding: '8px', 
                      marginBottom: '4px', 
                      background: '#f9f9f9', 
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>#{order._id.slice(-8)}</div>
                      <div style={{ color: '#666' }}>
                        {new Date(order.createdAt).toLocaleDateString()} • ₹{order.total_mrp?.toLocaleString()}
                      </div>
                    </div>
                  )) || <div style={{ color: '#999' }}>No orders in package</div>}
                </div>
                
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  Note: Package editing functionality would require additional backend API endpoints.
                  Currently showing package details only.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
                    <input
                      type="checkbox"
                      id={`order-checkbox-${order._id}`}
                      value={order._id}
                      checked={selectedOrders.includes(order._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedOrders([...selectedOrders, order._id]);
                        } else {
                          setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                        }
                      }}
                    />
                    <label htmlFor={`order-checkbox-${order._id}`} style={{ marginLeft: '6px' }}>
                      {order._id} - {new Date(order.createdAt).toLocaleString()} - ₹{order.total_mrp} - {order.stages}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-success" onClick={handleCreatePackage} disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
