import React, { useState } from 'react';

const ProfileModal = ({ user, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    address: {
      line1: user?.address?.line1 || '',
      area: user?.address?.area || '',
      city: user?.address?.city || '',
      pincode: user?.address?.pincode || ''
    }
  });
  const [loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative
                      transform transition-all duration-300 scale-95 opacity-0 animate-scaleFadeIn">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Profile Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input w-full border rounded px-2 py-1"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="input w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address Line 1</label>
              <input
                name="line1"
                value={form.address.line1}
                onChange={handleChange}
                className="input w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Area</label>
              <input
                name="area"
                value={form.address.area}
                onChange={handleChange}
                className="input w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                name="city"
                value={form.address.city}
                onChange={handleChange}
                className="input w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input
                name="pincode"
                value={form.address.pincode}
                onChange={handleChange}
                className="input w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-4 bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </form>
      </div>

      {/* Tailwind animation class */}
      <style>
        {`
          @keyframes scaleFadeIn {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-scaleFadeIn {
            animation: scaleFadeIn 0.25s forwards;
          }
        `}
      </style>
    </div>
  );
};

export default ProfileModal;
