import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import AddModelNumberModal from './AddModelNumberModal';
import EditModelNumberModal from './EditModelNumberModal';

const ModelNumberManagement = () => {
  const { apiCall } = useApi();
  const { isAdmin } = useAuth();
  
  const [modelNumbers, setModelNumbers] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter state
  const [selectedModelId, setSelectedModelId] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModelNumber, setSelectedModelNumber] = useState(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [modelsData, modelNumbersData] = await Promise.all([
        apiCall('/api/models'),
        apiCall('/api/model-numbers')
      ]);
      setModels(modelsData);
      setModelNumbers(modelNumbersData);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter model numbers
  const filteredModelNumbers = modelNumbers.filter(modelNumber => {
    // Filter by model
    if (selectedModelId && modelNumber.model?.id !== parseInt(selectedModelId)) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        modelNumber.modelNumber.toLowerCase().includes(searchLower) ||
        modelNumber.description?.toLowerCase().includes(searchLower) ||
        modelNumber.model?.modelName.toLowerCase().includes(searchLower) ||
        modelNumber.id.toString().includes(searchLower)
      );
    }
    
    return true;
  });

  // CRUD Operations
  const handleAddModelNumber = async (newModelNumber) => {
    try {
      const response = await apiCall('/api/model-numbers', {
        method: 'POST',
        body: JSON.stringify(newModelNumber)
      });
      setModelNumbers([...modelNumbers, response]);
      setShowAddModal(false);
      showSuccessMessage('Model number added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add model number');
    }
  };

  const handleUpdateModelNumber = async (updatedModelNumber) => {
    try {
      const response = await apiCall(`/api/model-numbers/${selectedModelNumber.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedModelNumber)
      });
      setModelNumbers(modelNumbers.map(mn => mn.id === selectedModelNumber.id ? response : mn));
      setShowEditModal(false);
      setSelectedModelNumber(null);
      showSuccessMessage('Model number updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update model number');
    }
  };

  const handleDeleteModelNumber = async (id) => {
    if (window.confirm('Are you sure you want to delete this model number?')) {
      try {
        await apiCall(`/api/model-numbers/${id}`, {
          method: 'DELETE'
        });
        setModelNumbers(modelNumbers.filter(mn => mn.id !== id));
        showSuccessMessage('Model number deleted successfully!');
      } catch (err) {
        setError(err.message || 'Failed to delete model number');
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

  if (!isAdmin()) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm mt-1">You do not have permission to access Model Number Management. Only administrators can manage model numbers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Model Number Management</h2>
          <p className="text-gray-600 mt-1">Manage specific model numbers for devices</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Model Number</span>
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by model number, description, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Model Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Model</label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Models</option>
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.modelName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {(selectedModelId || searchTerm) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-800">
                Showing {filteredModelNumbers.length} of {modelNumbers.length} model numbers
                {selectedModelId && ` for model: ${models.find(m => m.id === parseInt(selectedModelId))?.modelName || 'Selected Model'}`}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedModelId('');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Model Numbers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredModelNumbers.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No Model Numbers Found</h3>
              <p className="text-gray-600 mt-1">
                {searchTerm || selectedModelId 
                  ? 'Try adjusting your filters' 
                  : 'Create your first model number to get started'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModelNumbers.map(modelNumber => (
                  <tr key={modelNumber.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{modelNumber.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{modelNumber.modelNumber}</span>
                        <p className="text-xs text-gray-500 font-mono mt-1">Specific variant</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="font-medium text-gray-900">{modelNumber.model?.modelName || 'N/A'}</span>
                        <p className="text-xs text-gray-500">
                          Model ID: {modelNumber.model?.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {modelNumber.description || 'No description provided'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        modelNumber.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {modelNumber.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {modelNumber.model && !modelNumber.model.isActive && (
                        <span className="ml-2 text-xs text-orange-600">(Parent model inactive)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(modelNumber.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedModelNumber(modelNumber);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteModelNumber(modelNumber.id)}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
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
              <p className="text-sm text-gray-600">Total Model Numbers</p>
              <p className="text-3xl font-bold text-gray-900">{modelNumbers.length}</p>
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
              <p className="text-sm text-gray-600">Active Model Numbers</p>
              <p className="text-3xl font-bold text-green-600">
                {modelNumbers.filter(mn => mn.isActive).length}
              </p>
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
              <p className="text-sm text-gray-600">Inactive Model Numbers</p>
              <p className="text-3xl font-bold text-red-600">
                {modelNumbers.filter(mn => !mn.isActive).length}
              </p>
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
        <AddModelNumberModal
          onAdd={handleAddModelNumber}
          onClose={() => setShowAddModal(false)}
          models={models}
        />
      )}

      {showEditModal && selectedModelNumber && (
        <EditModelNumberModal
          modelNumber={selectedModelNumber}
          onUpdate={handleUpdateModelNumber}
          onClose={() => {
            setShowEditModal(false);
            setSelectedModelNumber(null);
          }}
          models={models}
        />
      )}
    </div>
  );
};

export default ModelNumberManagement;