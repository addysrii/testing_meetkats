import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Ticket, 
  Edit2, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  BarChart2, 
  Check, 
  X, 
  Calendar,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';
import ticketService from '../services/ticketService';
import { useToast } from '../components/common/Toast';

const CouponManagementPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  // State variables
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [currentStats, setCurrentStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountPercentage: 10,
    maxUses: '',
    validFrom: formatDateForInput(new Date()),
    validUntil: ''
  });

  // Format date for form input (YYYY-MM-DD)
  function formatDateForInput(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return 'No expiration';
    
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid date";
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, [eventId]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const result = await ticketService.getEventCoupons(eventId);
      setCoupons(result || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
      setError('Failed to load coupons. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (value === '' ? '' : parseFloat(value)) : 
              value
    }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      discountPercentage: 10,
      maxUses: '',
      validFrom: formatDateForInput(new Date()),
      validUntil: ''
    });
    setCurrentCoupon(null);
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // Format data for API
      const couponData = {
        ...formData,
        // Convert empty strings to null for optional fields
        maxUses: formData.maxUses === '' ? null : parseInt(formData.maxUses, 10),
        validUntil: formData.validUntil === '' ? null : formData.validUntil
      };
      
      await ticketService.createCoupon(eventId, couponData);
      setShowAddModal(false);
      resetForm();
      toast.success({ description: 'Coupon created successfully' });
      await fetchCoupons();
    } catch (err) {
      console.error('Failed to create coupon:', err);
      toast.error({ description: err.message || 'Failed to create coupon. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (coupon) => {
    setCurrentCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      name: coupon.name || '',
      discountPercentage: coupon.discountPercentage || 10,
      maxUses: coupon.maxUses === null ? '' : coupon.maxUses,
      validFrom: formatDateForInput(coupon.validFrom) || formatDateForInput(new Date()),
      validUntil: formatDateForInput(coupon.validUntil) || '',
      isActive: coupon.isActive !== false
    });
    setShowEditModal(true);
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    if (!currentCoupon) return;

    try {
      setLoading(true);
      
      // Format data for API
      const couponData = {
        ...formData,
        // Convert empty strings to null for optional fields
        maxUses: formData.maxUses === '' ? null : parseInt(formData.maxUses, 10),
        validUntil: formData.validUntil === '' ? null : formData.validUntil
      };
      
      await ticketService.updateCoupon(currentCoupon.id, couponData);
      setShowEditModal(false);
      resetForm();
      toast.success({ description: 'Coupon updated successfully' });
      await fetchCoupons();
    } catch (err) {
      console.error('Failed to update coupon:', err);
      toast.error({ description: err.message || 'Failed to update coupon. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (couponId, isCurrentlyActive) => {
    try {
      setLoading(true);
      await ticketService.updateCoupon(couponId, {
        isActive: !isCurrentlyActive
      });
      toast.success({ 
        description: isCurrentlyActive ? 
          'Coupon deactivated successfully' : 
          'Coupon activated successfully' 
      });
      await fetchCoupons();
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
      toast.error({ description: 'Failed to update coupon status. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewStats = async (coupon) => {
    try {
      setCurrentCoupon(coupon);
      setLoadingStats(true);
      setShowStatsModal(true);
      
      const stats = await ticketService.getCouponStats(coupon.id);
      setCurrentStats(stats);
    } catch (err) {
      console.error('Failed to fetch coupon stats:', err);
      toast.error({ description: 'Failed to load coupon statistics. Please try again.' });
      setShowStatsModal(false);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/events/${eventId}/manage`)}
            className="text-orange-600 hover:text-orange-900 flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to Event</span>
          </button>
          <h1 className="text-2xl font-bold">Coupon Management</h1>
        </div>
        <div className="space-x-2">
          <button 
            onClick={() => navigate(`/events/${eventId}/tickets`)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Tickets
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Promotion Codes</h2>
          <button 
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Coupon
          </button>
        </div>
        
        {loading && !coupons.length ? (
          <div className="text-center p-4">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">No coupons created yet</p>
            <p className="text-gray-500 mt-1 mb-4">Create your first coupon to offer discounts for your event.</p>
            <button 
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code & Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => {
                  const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
                  const usageLimit = coupon.maxUses !== null && coupon.maxUses !== undefined;
                  const usedUp = usageLimit && coupon.currentUses >= coupon.maxUses;
                  
                  return (
                    <tr key={coupon.id || coupon._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                        <div className="text-sm text-gray-500">{coupon.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.discountPercentage}% off
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.currentUses || 0} used
                        {usageLimit && ` / ${coupon.maxUses} max`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          <span>
                            {formatDate(coupon.validFrom)} 
                            {coupon.validUntil ? ` - ${formatDate(coupon.validUntil)}` : ' - No expiration'}
                          </span>
                        </div>
                        {isExpired && (
                          <div className="text-xs text-red-500 flex items-center mt-1">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Expired
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          coupon.isActive && !isExpired && !usedUp
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.isActive && !isExpired && !usedUp ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleViewStats(coupon)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View Stats"
                          >
                            <BarChart2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditClick(coupon)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleActive(coupon.id || coupon._id, coupon.isActive)}
                            className={`${
                              coupon.isActive 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            } flex items-center`}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Coupon</h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddCoupon}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                  Coupon Code
                </label>
                <input
                  type="text"
                  id="code"
  name="code"
  value={formData.code}
  onChange={handleInputChange}
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  placeholder="SUMMER2025"
  required
/>
<p className="mt-1 text-xs text-gray-500">Customers will enter this code at checkout</p>
</div>
<div className="mb-4">
<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
  Coupon Name
</label>
<input
  type="text"
  id="name"
  name="name"
  value={formData.name}
  onChange={handleInputChange}
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  placeholder="Summer Discount"
  required
/>
</div>
<div className="mb-4">
<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discountPercentage">
  Discount Percentage
</label>
<input
  type="number"
  id="discountPercentage"
  name="discountPercentage"
  value={formData.discountPercentage}
  onChange={handleInputChange}
  min="1"
  max="100"
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  required
/>
</div>
<div className="mb-4">
<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxUses">
  Maximum Uses (optional)
</label>
<input
  type="number"
  id="maxUses"
  name="maxUses"
  value={formData.maxUses}
  onChange={handleInputChange}
  min="1"
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  placeholder="Leave empty for unlimited uses"
/>
</div>
<div className="grid grid-cols-2 gap-4 mb-4">
<div>
  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="validFrom">
    Valid From
  </label>
  <input
    type="date"
    id="validFrom"
    name="validFrom"
    value={formData.validFrom}
    onChange={handleInputChange}
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  />
</div>
<div>
  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="validUntil">
    Valid Until (optional)
  </label>
  <input
    type="date"
    id="validUntil"
    name="validUntil"
    value={formData.validUntil}
    onChange={handleInputChange}
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  />
</div>
</div>
<div className="flex justify-end mt-6">
<button
  type="button"
  onClick={() => {
    setShowAddModal(false);
    resetForm();
  }}
  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
>
  Cancel
</button>
<button
  type="submit"
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  disabled={loading}
>
  {loading ? 'Creating...' : 'Create Coupon'}
</button>
</div>
</form>
</div>
</div>
)}

{/* Edit Coupon Modal */}
{showEditModal && currentCoupon && (
<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
<div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
<div className="flex justify-between items-center mb-4">
<h2 className="text-xl font-bold">Edit Coupon</h2>
<button 
  onClick={() => {
    setShowEditModal(false);
    resetForm();
  }}
  className="text-gray-500 hover:text-gray-700"
>
  &times;
</button>
</div>
<form onSubmit={handleUpdateCoupon}>
<div className="mb-4">
<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-code">
  Coupon Code
</label>
<input
  type="text"
  id="edit-code"
  name="code"
  value={formData.code}
  onChange={handleInputChange}
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  placeholder="SUMMER2025"
  disabled={currentCoupon.currentUses > 0} // Can't change code if already used
  required
/>
{currentCoupon.currentUses > 0 && (
  <p className="mt-1 text-xs text-yellow-500">
    Code cannot be changed as it has been used by customers
  </p>
)}
</div>
<div className="mb-4">
<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">
  Coupon Name
</label>
<input
  type="text"
  id="edit-name"
  name="name"
  value={formData.name}
  onChange={handleInputChange}
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  placeholder="Summer Discount"
  required
/>
</div>
<div className="mb-4">
<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-discountPercentage">
  Discount Percentage
</label>
<input
  type="number"
  id="edit-discountPercentage"
  name="discountPercentage"
  value={formData.discountPercentage}
  onChange={handleInputChange}
  min="1"
  max="100"
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  required
/>
</div>
<div className="mb-4">
<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-maxUses">
  Maximum Uses (optional)
</label>
<input
  type="number"
  id="edit-maxUses"
  name="maxUses"
  value={formData.maxUses}
  onChange={handleInputChange}
  min={currentCoupon.currentUses || 1}
  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  placeholder="Leave empty for unlimited uses"
/>
{currentCoupon.currentUses > 0 && (
  <p className="mt-1 text-xs text-yellow-500">
    Cannot be less than current uses ({currentCoupon.currentUses})
  </p>
)}
</div>
<div className="grid grid-cols-2 gap-4 mb-4">
<div>
  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-validFrom">
    Valid From
  </label>
  <input
    type="date"
    id="edit-validFrom"
    name="validFrom"
    value={formData.validFrom}
    onChange={handleInputChange}
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  />
</div>
<div>
  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-validUntil">
    Valid Until (optional)
  </label>
  <input
    type="date"
    id="edit-validUntil"
    name="validUntil"
    value={formData.validUntil}
    onChange={handleInputChange}
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  />
</div>
</div>
<div className="mb-4 flex items-center">
<input
  type="checkbox"
  id="edit-isActive"
  name="isActive"
  checked={formData.isActive}
  onChange={handleInputChange}
  className="mr-2"
/>
<label className="text-gray-700 text-sm font-bold" htmlFor="edit-isActive">
  Active (available for use)
</label>
</div>
<div className="flex justify-end mt-6">
<button
  type="button"
  onClick={() => {
    setShowEditModal(false);
    resetForm();
  }}
  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
>
  Cancel
</button>
<button
  type="submit"
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  disabled={loading}
>
  {loading ? 'Updating...' : 'Update Coupon'}
</button>
</div>
</form>
</div>
</div>
)}

{/* Coupon Stats Modal */}
{showStatsModal && currentCoupon && (
<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
<div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl">
<div className="flex justify-between items-center mb-4">
<h2 className="text-xl font-bold">Coupon Statistics: {currentCoupon.code}</h2>
<button 
  onClick={() => {
    setShowStatsModal(false);
    setCurrentStats(null);
  }}
  className="text-gray-500 hover:text-gray-700"
>
  &times;
</button>
</div>

{loadingStats ? (
<div className="text-center py-10">
  <div className="w-12 h-12 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto"></div>
  <p className="mt-4 text-gray-600">Loading coupon statistics...</p>
</div>
) : currentStats ? (
<div>
  {/* Coupon Summary */}
  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Coupon Details</h3>
      <div className="grid grid-cols-2 gap-y-2">
        <div className="text-gray-600">Name:</div>
        <div className="font-medium">{currentStats.coupon.name}</div>
        
        <div className="text-gray-600">Discount:</div>
        <div className="font-medium">{currentStats.coupon.discountPercentage}%</div>
        
        <div className="text-gray-600">Status:</div>
        <div className="font-medium">
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            currentStats.coupon.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {currentStats.coupon.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="text-gray-600">Valid Period:</div>
        <div className="font-medium">
          {formatDate(currentStats.coupon.validFrom)} - 
          {currentStats.coupon.validUntil ? formatDate(currentStats.coupon.validUntil) : 'No expiration'}
        </div>
      </div>
    </div>
    
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Usage Statistics</h3>
      <div className="grid grid-cols-2 gap-y-2">
        <div className="text-gray-600">Total Uses:</div>
        <div className="font-medium">{currentStats.stats.totalUses}</div>
        
        <div className="text-gray-600">Usage Limit:</div>
        <div className="font-medium">
          {currentStats.coupon.maxUses ? (
            <span>
              {currentStats.coupon.currentUses} / {currentStats.coupon.maxUses}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div 
                  className="bg-orange-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (currentStats.coupon.currentUses / currentStats.coupon.maxUses) * 100)}%` }}
                ></div>
              </div>
            </span>
          ) : (
            'Unlimited'
          )}
        </div>
        
        <div className="text-gray-600">Total Discount:</div>
        <div className="font-medium">
          ${currentStats.stats.totalDiscount.toFixed(2)}
        </div>
        
        <div className="text-gray-600">Avg. Discount:</div>
        <div className="font-medium">
          ${currentStats.stats.averageDiscount.toFixed(2)} per booking
        </div>
      </div>
    </div>
  </div>
  
  {/* Recent Bookings Table */}
  {currentStats.recentBookings && currentStats.recentBookings.length > 0 ? (
    <div>
      <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking #
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentStats.recentBookings.map((booking) => (
              <tr key={booking._id || booking.id}>
                <td className="px-4 py-2 whitespace-nowrap">
                  {booking.bookingNumber}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  ${booking.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  ${booking.discountAmount?.toFixed(2) || '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <div className="text-center py-4 bg-gray-50 rounded-lg">
      <p className="text-gray-600">No bookings have used this coupon yet.</p>
    </div>
  )}
</div>
) : (
<div className="text-center py-4">
  <p className="text-red-500">Failed to load coupon statistics. Please try again.</p>
</div>
)}

<div className="flex justify-end mt-6">
<button
  onClick={() => {
    setShowStatsModal(false);
    setCurrentStats(null);
  }}
  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
>
  Close
</button>
</div>
</div>
</div>
)}

{/* Help card */}
<div className="bg-white rounded shadow p-4 mb-6">
<div className="flex items-start">
<Info className="w-6 h-6 text-orange-500 mr-3 flex-shrink-0 mt-1" />
<div>
<h3 className="font-bold text-gray-900 mb-1">Using Promotion Codes</h3>
<p className="text-gray-600 text-sm mb-2">
  Promotion codes offer discounts to customers during checkout. Here's how they work:
</p>
<ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
  <li>Customers enter the code during checkout to receive a discount</li>
  <li>You can limit the number of times a code can be used</li>
  <li>Set validity periods to create time-limited promotions</li>
  <li>Deactivate codes at any time to prevent further use</li>
  <li>View usage statistics to track the performance of your promotions</li>
</ul>
</div>
</div>
</div>
</div>
);
};

export default CouponManagementPage;