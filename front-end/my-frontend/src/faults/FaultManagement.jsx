import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import AddFaultModal from './AddFaultModal';
import EditFaultModal from './EditFaultModal';

const FaultManagement = () => {
  const { apiCall } = useApi();
  const { isAdmin } = useAuth();
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFault, setSelectedFault] = useState(null);

  const fetchFaults = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/faults');
      setFaults(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch faults');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFaults();
  }, []);

  const handleAddFault = async (newFault) => {
    try {
      const response = await apiCall('/api/faults', {
        method: 'POST',
        body: JSON.stringify(newFault)
      });
      setFaults([...faults, response]);
      setShowAddModal(false);
      showSuccessMessage('Fault added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add fault');
    }
  };

  const handleUpdateFault = async (updatedFault) => {
    try {
      const response = await apiCall(`/api/faults/${selectedFault.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFault)
      });
      setFaults(faults.map(fault => fault.id === selectedFault.id ? response : fault));
      setShowEditModal(false);
      setSelectedFault(null);
      showSuccessMessage('Fault updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update fault');
    }
  };

  const handleDeleteFault = async (id) => {
    if (window.confirm('Are you sure you want to delete this fault?')) {
      try {
        await apiCall(`/api/faults/${id}`, {
          method: 'DELETE'
        });
        setFaults(faults.filter(fault => fault.id !== id));
        showSuccessMessage('Fault deleted successfully!');
      } catch (err) {
        setError(err.message || 'Failed to delete fault');
      }
    }
  };

  const showSuccessMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  // Filter faults by name or id
  const filteredFaults = faults.filter(fault => {
    const searchLower = searchTerm.toLowerCase();
    return (
      fault.faultName.toLowerCase().includes(searchLower) ||
      fault.id.toString().includes(searchLower)
    );
  });

  if (!isAdmin()) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm mt-1">You do not have permission to access Fault Management. Only administrators can manage faults.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Fault Management</h2>
          <p className="text-gray-600 mt-1">Manage system faults for job cards</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Fault</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by fault name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Faults Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFaults.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No Faults Found</h3>
              <p className="text-gray-600 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first fault to get started'}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fault Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFaults.map(fault => (
                  <tr key={fault.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{fault.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{fault.faultName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {fault.description || 'No description provided'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        fault.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {fault.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(fault.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedFault(fault);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFault(fault.id)}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Faults</p>
              <p className="text-3xl font-bold text-gray-900">{faults.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Faults</p>
              <p className="text-3xl font-bold text-green-600">{faults.filter(f => f.isActive).length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Faults</p>
              <p className="text-3xl font-bold text-red-600">{faults.filter(f => !f.isActive).length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddFaultModal
          onAdd={handleAddFault}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && selectedFault && (
        <EditFaultModal
          fault={selectedFault}
          onUpdate={handleUpdateFault}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFault(null);
          }}
        />
      )}
    </div>
  );
};

export default FaultManagement;