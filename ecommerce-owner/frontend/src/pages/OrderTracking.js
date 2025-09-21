import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faTimes, 
  faBox, 
  faShoppingCart, 
  faUser, 
  faCalendar,
  faSort,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import { packagesAPI, ordersAPI } from '../services/api';

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

const OrderTracking = () => {
  const [packages, setPackages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [creating, setCreating] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPackages();
    fetchOrders();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await packagesAPI.getAll();
      let sortedPackages = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply sorting
      if (sortBy === 'status') {
        sortedPackages = sortedPackages.sort((a, b) => a.stages.localeCompare(b.stages));
      } else if (sortBy === 'orders') {
        sortedPackages = sortedPackages.sort((a, b) => (b.orders?.length || 0) - (a.orders?.length || 0));
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        sortedPackages = sortedPackages.filter(pkg => pkg.stages === statusFilter);
      }
      
      setPackages(sortedPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      const allOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(allOrders);
      
      // Filter orders that are not already in packages and have payment completed
      const ordersInPackages = new Set();
      packages.forEach(pkg => {
        pkg.orders?.forEach(order => {
          ordersInPackages.add(order._id);
        });
      });
      
      const available = allOrders.filter(order => 
        !ordersInPackages.has(order._id) && 
        order.payment_status === 'completed' &&
        order.stages !== 'cancelled'
      );
      setAvailableOrders(available);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [sortBy, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [packages]);

  const handleStatusChange = async (pkgId, status) => {
    try {
      await packagesAPI.updateStatus(pkgId, status);
      fetchPackages();
    } catch (error) {
      console.error('Error updating package status:', error);
    }
  };

  const handleCreatePackage = async () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order');
      return;
    }
    
    setCreating(true);
    try {
      await packagesAPI.create({ orderIds: selectedOrders });
      setShowCreateModal(false);
      setSelectedOrders([]);
      fetchPackages();
      fetchOrders();
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Failed to create package');
    } finally {
      setCreating(false);
    }
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedOrders(pkg.orders?.map(order => order._id) || []);
    setShowEditModal(true);
  };

  const handleUpdatePackage = async () => {
    if (!selectedPackage) return;
    
    setUpdating(true);
    try {
      await packagesAPI.update(selectedPackage._id, { orderIds: selectedOrders });
      setShowEditModal(false);
      setSelectedPackage(null);
      setSelectedOrders([]);
      fetchPackages();
      fetchOrders();
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Failed to update package');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePackage = async (pkgId) => {
    if (window.confirm('Are you sure you want to delete this package? Orders will be unassigned.')) {
      try {
        await packagesAPI.delete(pkgId);
        fetchPackages();
        fetchOrders();
      } catch (error) {
        console.error('Error deleting package:', error);
        alert('Failed to delete package');
      }
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const getOrderSummary = (orders) => {
    if (!orders || orders.length === 0) return 'No orders';
    const totalItems = orders.reduce((sum, order) => sum + (order.items?.length || 0), 0);
    const totalValue = orders.reduce((sum, order) => sum + (order.total_mrp || 0), 0);
    return `${orders.length} order${orders.length > 1 ? 's' : ''}, ${totalItems} items, ₹${totalValue.toLocaleString()}`;
  };

  return (
  <div className="ordertracking-wrapper">
      {/* Header */}
  <div className="ordertracking-header">
        <div className="ordertracking-title-group">
          <h1 className="ordertracking-title">Order Tracking & Packages</h1>
          <p className="ordertracking-subtitle">Manage order packages and track shipments</p>
        </div>
        
  <div className="ordertracking-filters">
          {/* Filters */}
          <div className="ordertracking-filter-group">
            <FontAwesomeIcon icon={faFilter} className="ordertracking-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ordertracking-select"
            >
              <option value="all">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          {/* Sort */}
          <div className="ordertracking-filter-group">
            <FontAwesomeIcon icon={faSort} className="ordertracking-filter-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ordertracking-select"
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
              <option value="orders">Sort by Order Count</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="ordertracking-create-btn"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Package
          </button>
        </div>
      </div>

      {/* Stats */}
  <div className="ordertracking-stats-grid">
  <div className="ordertracking-stat-card">
          <div className="ordertracking-stat-card-row">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
            </div>
            <div className="ordertracking-stat-icon ordertracking-stat-icon-blue">
              <FontAwesomeIcon icon={faBox} />
            </div>
          </div>
        </div>
        
  <div className="ordertracking-stat-card">
          <div className="ordertracking-stat-card-row">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Orders</p>
              <p className="text-2xl font-bold text-gray-900">{availableOrders.length}</p>
            </div>
            <div className="ordertracking-stat-icon ordertracking-stat-icon-green">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
          </div>
        </div>
        
  <div className="ordertracking-stat-card">
          <div className="ordertracking-stat-card-row">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Packages</p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.filter(pkg => pkg.stages === 'pending').length}
              </p>
            </div>
            <div className="ordertracking-stat-icon ordertracking-stat-icon-yellow">
              <FontAwesomeIcon icon={faCalendar} />
            </div>
          </div>
        </div>
        
  <div className="ordertracking-stat-card">
          <div className="ordertracking-stat-card-row">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.filter(pkg => pkg.stages === 'delivered').length}
              </p>
            </div>
            <div className="ordertracking-stat-icon ordertracking-stat-icon-green">
              <FontAwesomeIcon icon={faBox} />
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="package-grid">
        {packages.map(pkg => (
          <div key={pkg._id} className="package-card">
            <div className="package-info">
              {/* Package Header */}
              <div className="package-header">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Package #{pkg._id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created {new Date(pkg.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="package-actions">
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="btn btn-primary btn-sm"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg._id)}
                    className="btn btn-danger btn-sm"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="package-status-row">
                <label className="package-status-label">Status</label>
                <select
                  value={pkg.stages}
                  onChange={(e) => handleStatusChange(pkg._id, e.target.value)}
                  className="package-status-select"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Package Summary */}
              <div className="package-summary">
                <p className="package-summary-label">Package Summary</p>
                <p className="package-summary-value">{getOrderSummary(pkg.orders)}</p>
              </div>

              {/* Orders List */}
              <div className="package-orders-list">
                <p className="package-orders-label">Orders in Package</p>
                {pkg.orders && pkg.orders.length > 0 ? (
                  <div className="package-orders-scroll">
                    {pkg.orders.map(order => (
                      <div key={order._id} className="package-order-card">
                        <div className="package-order-row">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              #{order._id.slice(-8)}
                            </p>
                            <p className="text-xs text-gray-600">
                              <FontAwesomeIcon icon={faUser} className="mr-1" />
                              {order.user?.username || order.user?.name || order.customerName || order.user?.email || 'Unknown Customer'}
                              {order.user?.email ? ` • ${order.user.email}` : ''}
                            </p>
                          </div>
                          <div className="package-order-right">
                            <p className="text-sm font-medium text-gray-900">
                              ₹{order.total_mrp?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-600">
                              {order.items?.length || 0} items
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="package-orders-empty">No orders in this package</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="ordertracking-empty-state">
          <div className="ordertracking-empty-icon">
            <FontAwesomeIcon icon={faBox} />
          </div>
          <h3 className="ordertracking-empty-title">No packages yet</h3>
          <p className="ordertracking-empty-desc">Create your first package to start tracking orders</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="ordertracking-create-btn"
          >
            Create First Package
          </button>
        </div>
      )}

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Package</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <h3 className="form-section-title">Select Orders ({availableOrders.length} available)</h3>
                <p className="form-label">Only orders with completed payment and not already in packages are shown</p>
                <div className="order-list">
                  {availableOrders.length > 0 ? (
                    <div>
                      {availableOrders.map(order => (
                        <div key={order._id} className="order-row">
                          <input
                            type="checkbox"
                            value={order._id}
                            checked={selectedOrders.includes(order._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders([...selectedOrders, order._id]);
                              } else {
                                setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                              }
                            }}
                            className="order-checkbox"
                          />
                          <div className="order-details">
                            <div className="order-id">#{order._id.slice(-8)}</div>
                            <div className="order-customer">
                              {order.user?.username || order.user?.name || order.customerName || order.user?.email || 'Unknown Customer'}
                              {order.user?.email ? ` • ${order.user.email}` : ''}
                            </div>
                            <div className="order-meta">
                              {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                            </div>
                          </div>
                          <div className="order-right">
                            <div className="order-price">₹{order.total_mrp?.toLocaleString() || 0}</div>
                            <span className={`order-status ${getStatusColor(order.stages)}`}>{order.stages}</span>
                            <button type="button" className="btn btn-secondary" style={{marginLeft:8}} onClick={() => setViewOrder(order)}>
                              View
                            </button>
                          </div>
                        </div>
                      ))}
      {viewOrder && (
        <div className="modal-overlay" style={{zIndex:10000}}>
          <div className="modal-content" style={{maxWidth:'400px', minWidth:'320px', maxHeight:'340px'}}>
            <div className="modal-header">
              <h2 style={{fontSize:'18px'}}>Order Details</h2>
              <button className="modal-close" onClick={() => setViewOrder(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body" style={{padding:'18px'}}>
              <div className="order-details-modal" style={{fontSize:'14px', padding:'0'}}>
                <div><strong>Name:</strong> {viewOrder.user?.name || viewOrder.user?.username || viewOrder.customerName || 'Unknown'}</div>
                <div><strong>Email:</strong> {viewOrder.user?.email || 'Unknown'}</div>
                <div><strong>Address:</strong> {viewOrder.address?.line1 || ''}{viewOrder.address?.area ? ', ' + viewOrder.address.area : ''}{viewOrder.address?.city ? ', ' + viewOrder.address.city : ''}{viewOrder.address?.pincode ? ' - ' + viewOrder.address.pincode : ''}</div>
                <div style={{marginTop:'10px'}}><strong>Products:</strong> {viewOrder.items?.map(item => item.productName).filter(Boolean).join(', ') || 'None'}</div>
              </div>
            </div>
            <div className="modal-footer" style={{padding:'0 18px 18px 18px'}}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
                    </div>
                  ) : (
                    <div className="order-empty">
                      <FontAwesomeIcon icon={faShoppingCart} className="order-empty-icon" />
                      <p>No available orders to package</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleCreatePackage} disabled={creating || selectedOrders.length === 0}>
                {creating ? 'Creating...' : `Create Package (${selectedOrders.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditModal && selectedPackage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Package #{selectedPackage._id.slice(-8)}</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <h3 className="form-section-title">Manage Orders</h3>
                <p className="form-label">Add or remove orders from this package</p>
                <div className="order-list">
                  {/* Current orders in package */}
                  {selectedPackage.orders?.map(order => (
                    <label key={order._id} className="order-row order-row-current">
                      <input
                        type="checkbox"
                        value={order._id}
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order._id]);
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                          }
                        }}
                        className="order-checkbox"
                      />
                      <div className="order-details">
                        <div className="order-id">#{order._id.slice(-8)}</div>
                        <div className="order-customer">
                          {order.user?.username || order.user?.name || order.customerName || order.user?.email || 'Unknown Customer'}
                        </div>
                        <div className="order-meta">
                          <span className="order-meta-status">Currently in package</span>
                        </div>
                      </div>
                      <div className="order-right">
                        <div className="order-price">₹{order.total_mrp?.toLocaleString() || 0}</div>
                      </div>
                    </label>
                  ))}
                  {/* Available orders */}
                  {availableOrders.map(order => (
                    <label key={order._id} className="order-row">
                      <input
                        type="checkbox"
                        value={order._id}
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order._id]);
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                          }
                        }}
                        className="order-checkbox"
                      />
                      <div className="order-details">
                        <div className="order-id">#{order._id.slice(-8)}</div>
                        <div className="order-customer">
                          {order.user?.username || order.user?.name || order.customerName || order.user?.email || 'Unknown Customer'}
                        </div>
                        <div className="order-meta">
                          <span className="order-meta-status">Available to add</span>
                        </div>
                      </div>
                      <div className="order-right">
                        <div className="order-price">₹{order.total_mrp?.toLocaleString() || 0}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleUpdatePackage} disabled={updating}>
                {updating ? 'Updating...' : `Update Package (${selectedOrders.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;