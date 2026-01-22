
import { useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';
import { useAuth } from '../auth/AuthProvider';
import AddModelNumberModal from './AddModelNumberModal';
import EditModelNumberModal from './EditModelNumberModal';

const ModelNumberManagement = () => {
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
      
      if (response.error) {
        setError(response.error);
        showErrorMessage(response.error);
        throw new Error(response.error);
      }
      
      setModelNumbers([...modelNumbers, response]);
      setShowAddModal(false);
      showSuccessMessage('Model number added successfully!');
    } catch (err) {
      const errorMsg = err.message || 'Failed to add model number';
      setError(errorMsg);
      showErrorMessage(errorMsg);
      throw err;
    }
  };

  const handleUpdateModelNumber = async (updatedModelNumber) => {
    try {
      const response = await apiCall(`/api/model-numbers/${selectedModelNumber.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedModelNumber)
      });
      
      if (response.error) {
        setError(response.error);
        showErrorMessage(response.error);
        throw new Error(response.error);
      }
      
      setModelNumbers(modelNumbers.map(mn => mn.id === selectedModelNumber.id ? response : mn));
      setShowEditModal(false);
      setSelectedModelNumber(null);
      showSuccessMessage('Model number updated successfully!');
    } catch (err) {
      const errorMsg = err.message || 'Failed to update model number';
      setError(errorMsg);
      showErrorMessage(errorMsg);
      throw err;
    }
  };

  // Updated: Toggle status with window.confirm (like FaultManagement)
  const handleToggleStatus = async (modelNumber) => {
    // Show confirmation for both activate and deactivate
    if (modelNumber.isActive) {
      const confirmDeactivate = window.confirm(
        `Are you sure you want to deactivate the model number "${modelNumber.modelNumber}"?\n\nThis model number will not be available for new job cards.`
      );
      
      if (!confirmDeactivate) {
        return;
      }
    } else {
      const confirmActivate = window.confirm(
        `Are you sure you want to activate the model number "${modelNumber.modelNumber}"?\n\nThis model number will be available for new job cards.`
      );
      
      if (!confirmActivate) {
        return;
      }
    }

    try {
      const endpoint = modelNumber.isActive 
        ? `/api/model-numbers/${modelNumber.id}/deactivate`
        : `/api/model-numbers/${modelNumber.id}/activate`;
      
      const response = await apiCall(endpoint, {
        method: 'PATCH'
      });
      
      setModelNumbers(modelNumbers.map(mn => 
        mn.id === modelNumber.id ? response.modelNumber : mn
      ));
      
      const action = response.modelNumber.isActive ? 'activated' : 'deactivated';
      showSuccessMessage(`Model number ${action} successfully!`);
    } catch (err) {
      const errorMsg = err.message || 'Failed to toggle model number status';
      setError(errorMsg);
      showErrorMessage(errorMsg);
    }
  };

  const showSuccessMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
    msg.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  const showErrorMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-start space-x-2 max-w-md';
    msg.innerHTML = `
      <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 5000);
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
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
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
                        <span className="text-sm font-bold text-gray-900">{modelNumber.modelNumber}</span>
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
                      <p className="text-sm text-gray-600 italic">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedModelNumber(modelNumber);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium transition-colors px-3 py-1 hover:bg-blue-50 rounded flex items-center space-x-1"
                          title="Edit model number"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        
                        {/* Updated: Like FaultManagement - Eye icon with cross line */}
                        <button
                          onClick={() => handleToggleStatus(modelNumber)}
                          className={`font-medium transition-colors px-3 py-1 rounded flex items-center space-x-1 ${
                            modelNumber.isActive
                              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={modelNumber.isActive ? 'Deactivate model number' : 'Activate model number'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {modelNumber.isActive ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            )}
                          </svg>
                          <span>{modelNumber.isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </div>
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
          existingModelNumbers={modelNumbers}
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
          existingModelNumbers={modelNumbers}
        />
      )}
    </div>
  );
};

export default ModelNumberManagement;