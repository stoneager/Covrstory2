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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking & Packages</h1>
          <p className="text-gray-600 mt-1">Manage order packages and track shipments</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faSort} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
              <option value="orders">Sort by Order Count</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 font-medium"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Package
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faBox} className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Orders</p>
              <p className="text-2xl font-bold text-gray-900">{availableOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faShoppingCart} className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Packages</p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.filter(pkg => pkg.stages === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendar} className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.filter(pkg => pkg.stages === 'delivered').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faBox} className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              {/* Package Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Package #{pkg._id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created {new Date(pkg.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg._id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={pkg.stages}
                  onChange={(e) => handleStatusChange(pkg._id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Package Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Package Summary</p>
                <p className="text-sm text-gray-600">{getOrderSummary(pkg.orders)}</p>
              </div>

              {/* Orders List */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Orders in Package</p>
                {pkg.orders && pkg.orders.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {pkg.orders.map(order => (
                      <div key={order._id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              #{order._id.slice(-8)}
                            </p>
                            <p className="text-xs text-gray-600">
                              <FontAwesomeIcon icon={faUser} className="mr-1" />
                              {order.user?.name || 'Unknown Customer'}
                            </p>
                          </div>
                          <div className="text-right">
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
                  <p className="text-sm text-gray-500 italic">No orders in this package</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faBox} className="text-4xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages yet</h3>
          <p className="text-gray-600 mb-6">Create your first package to start tracking orders</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Create First Package
          </button>
        </div>
      )}

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Package</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select Orders ({availableOrders.length} available)
                </h3>
                <p className="text-sm text-gray-600">
                  Only orders with completed payment and not already in packages are shown
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {availableOrders.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {availableOrders.map(order => (
                      <label key={order._id} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer">
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
                          className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">#{order._id.slice(-8)}</p>
                              <p className="text-sm text-gray-600">
                                {order.user?.name || 'Unknown Customer'} • {order.user?.email}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">₹{order.total_mrp?.toLocaleString() || 0}</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.stages)}`}>
                                {order.stages}
                              </span>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-4xl mb-4" />
                    <p>No available orders to package</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePackage}
                disabled={creating || selectedOrders.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                {creating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                }
                {creating ? 'Creating...' : `Create Package (${selectedOrders.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Package #{selectedPackage._id.slice(-8)}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Orders</h3>
                <p className="text-sm text-gray-600">
                  Add or remove orders from this package
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-200">
                  {/* Current orders in package */}
                  {selectedPackage.orders?.map(order => (
                    <label key={order._id} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer bg-blue-50">
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
                        className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">#{order._id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">
                              {order.user?.name || 'Unknown Customer'}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">Currently in package</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">₹{order.total_mrp?.toLocaleString() || 0}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                  
                  {/* Available orders */}
                  {availableOrders.map(order => (
                    <label key={order._id} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer">
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
                        className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">#{order._id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">
                              {order.user?.name || 'Unknown Customer'}
                            </p>
                            <p className="text-xs text-gray-500">Available to add</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">₹{order.total_mrp?.toLocaleString() || 0}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePackage}
                disabled={updating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                {updating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                }
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