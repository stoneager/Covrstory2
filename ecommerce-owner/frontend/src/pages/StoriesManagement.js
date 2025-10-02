import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StoriesManagement = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/stories/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStories(response.data);
    } catch (err) {
      setError('Failed to fetch stories');
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalToggle = async (storyId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/stories/${storyId}/approve`,
        { approved: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStories();
    } catch (err) {
      console.error('Error updating story approval:', err);
      alert('Failed to update story approval');
    }
  };

  const handleDelete = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStories();
    } catch (err) {
      console.error('Error deleting story:', err);
      alert('Failed to delete story');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stories Management</h1>
        <p className="text-gray-600">Manage customer stories and testimonials</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {stories.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No stories submitted yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
            >
              <div className="relative">
                <img
                  src={story.imageLink}
                  alt={story.quote}
                  className="w-full h-48 object-cover"
                />
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                    story.approved
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}
                >
                  {story.approved ? 'Approved' : 'Pending'}
                </div>
              </div>

              <div className="p-5">
                <p className="text-lg font-bold text-gray-900 mb-2 italic">
                  "{story.quote}"
                </p>
                <p className="text-gray-600 mb-4 text-sm">{story.description}</p>

                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-500">
                    <strong>Posted by:</strong> {story.userId?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Email:</strong> {story.userId?.email || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Date:</strong>{' '}
                    {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprovalToggle(story._id, story.approved)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                      story.approved
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {story.approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleDelete(story._id)}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoriesManagement;
