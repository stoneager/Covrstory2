import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = ({ onUpdate }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    address: {
      line1: '',
      area: '',
      city: '',
      pincode: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        address: {
          line1: user.address?.line1 || '',
          area: user.address?.area || '',
          city: user.address?.city || '',
          pincode: user.address?.pincode || ''
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.address) {
      setForm({ ...form, address: { ...form.address, [name]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onUpdate(form);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8 relative flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-center">Profile Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className="input w-full" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <input name="mobile" value={form.mobile} onChange={handleChange} className="input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address Line 1</label>
              <input name="line1" value={form.address.line1} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Area</label>
              <input name="area" value={form.address.area} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input name="city" value={form.address.city} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input name="pincode" value={form.address.pincode} onChange={handleChange} className="input w-full" />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Close
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
