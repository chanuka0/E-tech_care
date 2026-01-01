import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import AddModelModal from './AddModelModal';
import EditModelModal from './EditModelModal';

const ModelManagement = () => {
  const { apiCall } = useApi();
  const { isAdmin } = useAuth();
  
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter state
  const [selectedBrandId, setSelectedBrandId] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // Track which models can be deleted (not linked to model numbers)
  const [modelDeletionStatus, setModelDeletionStatus] = useState({});

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [brandsData, modelsData] = await Promise.all([
        apiCall('/api/brands'),
        apiCall('/api/models')
      ]);
      setBrands(brandsData);
      setModels(modelsData);
      
      // Fetch deletion status for each model
      await fetchDeletionStatusForModels(modelsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error(err);
    }
    setLoading(false);
  };

  // Fetch deletion status for all models
  const fetchDeletionStatusForModels = async (modelsList) => {
    const statusPromises = modelsList.map(async (model) => {
      try {
        const response = await apiCall(`/api/models/${model.id}/can-delete`);
        return { id: model.id, ...response };
      } catch (err) {
        console.error(`Failed to fetch deletion status for model ${model.id}:`, err);
        return { id: model.id, canDelete: false, isLinked: true };
      }
    });

    const statuses = await Promise.all(statusPromises);
    const statusMap = {};
    statuses.forEach(status => {
      statusMap[status.id] = {
        canDelete: status.canDelete,
        isLinked: status.isLinked
      };
    });
    setModelDeletionStatus(statusMap);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter models
  const filteredModels = models.filter(model => {
    // Filter by brand
    if (selectedBrandId && model.brand?.id !== parseInt(selectedBrandId)) {
      return false;
    }
    
    // Filter by search term
    const searchLower = searchTerm.toLowerCase();
    return (
      model.modelName.toLowerCase().includes(searchLower) ||
      model.id.toString().includes(searchLower) ||
      model.brand?.brandName.toLowerCase().includes(searchLower)
    );
  });

  // CRUD Operations
  const handleAddModel = async (newModel) => {
    try {
      const response = await apiCall('/api/models', {
        method: 'POST',
        body: JSON.stringify(newModel)
      });
      
      // Check if response contains an error
      if (response.error) {
        setError(response.error);
        showErrorMessage(response.error);
        throw new Error(response.error);
      }
      
      setModels([...models, response]);
      
      // Fetch deletion status for the new model
      try {
        const status = await apiCall(`/api/models/${response.id}/can-delete`);
        setModelDeletionStatus(prev => ({
          ...prev,
          [response.id]: { canDelete: status.canDelete, isLinked: status.isLinked }
        }));
      } catch (err) {
        console.error('Failed to fetch deletion status for new model:', err);
      }
      
      setShowAddModal(false);
      showSuccessMessage('Model added successfully!');
    } catch (err) {
      console.error('handleAddModel error:', err);
      console.error('Error message:', err.message);
      const errorMsg = err.message || 'Failed to add model';
      setError(errorMsg);
      showErrorMessage(errorMsg);
      // Re-throw the error so the modal can catch it and display it
      throw err;
    }
  };

  const handleUpdateModel = async (updatedModel) => {
    try {
      const response = await apiCall(`/api/models/${selectedModel.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedModel)
      });
      
      // Check if response contains an error
      if (response.error) {
        setError(response.error);
        showErrorMessage(response.error);
        throw new Error(response.error);
      }
      
      setModels(models.map(model => model.id === selectedModel.id ? response : model));
      setShowEditModal(false);
      setSelectedModel(null);
      showSuccessMessage('Model updated successfully!');
    } catch (err) {
      console.error('handleUpdateModel error:', err);
      console.error('Error message:', err.message);
      const errorMsg = err.message || 'Failed to update model';
      setError(errorMsg);
      showErrorMessage(errorMsg);
      // Re-throw the error so the modal can catch it and display it
      throw err;
    }
  };

  const handleDeleteModel = async (id) => {
    const model = models.find(m => m.id === id);
    
    const confirmMessage = `Are you sure you want to permanently delete the model "${model?.modelName}"?\n\nThis action cannot be undone and the record will be removed from the database.`;

    if (window.confirm(confirmMessage)) {
      try {
        const response = await apiCall(`/api/models/${id}`, {
          method: 'DELETE'
        });
        
        // Refresh data to get updated status
        await fetchData();
        
        showSuccessMessage('Model permanently deleted from database!');
      } catch (err) {
        const errorMsg = err.message || 'Failed to delete model';
        setError(errorMsg);
        showErrorMessage(errorMsg);
      }
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
          <p className="text-sm mt-1">You do not have permission to access Model Management. Only administrators can manage models.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Model Management</h2>
          <p className="text-gray-600 mt-1">Manage device models organized by brand</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Model</span>
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
                placeholder="Search by model name, brand, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Brand</label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.brandName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {(selectedBrandId || searchTerm) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-800">
                Showing {filteredModels.length} of {models.length} models
                {selectedBrandId && ` for brand: ${brands.find(b => b.id === parseInt(selectedBrandId))?.brandName || 'Selected Brand'}`}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedBrandId('');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Models Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No Models Found</h3>
              <p className="text-gray-600 mt-1">
                {searchTerm || selectedBrandId 
                  ? 'Try adjusting your filters' 
                  : 'Create your first model to get started'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModels.map(model => {
                  const deletionStatus = modelDeletionStatus[model.id];
                  const canDelete = deletionStatus?.canDelete ?? true;
                  const isLinked = deletionStatus?.isLinked ?? false;

                  return (
                    <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">#{model.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{model.brand?.brandName || 'N/A'}</span>
                            <p className="text-xs text-gray-500">Brand ID: {model.brand?.id || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="text-lg font-bold text-gray-900">{model.modelName}</span>
                          <p className="text-xs text-gray-500 font-mono mt-1">Model ID: {model.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {model.description || 'No description provided'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium block w-fit ${
                            model.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {model.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {isLinked && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium block w-fit">
                              🔗 Linked
                            </span>
                          )}
                          {model.brand && !model.brand.isActive && (
                            <span className="text-xs text-orange-600 block">(Brand inactive)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(model.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => {
                            setSelectedModel(model);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium transition-colors px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        {!isLinked && (
                          <button
                            onClick={() => handleDeleteModel(model.id)}
                            className="text-red-600 hover:text-red-900 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
                            title="Permanently delete model from database"
                          >
                            Delete
                          </button>
                        )}
                        {isLinked && (
                          <span className="text-gray-400 text-xs italic px-2 py-1">
                            Cannot delete (linked)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Models</p>
              <p className="text-3xl font-bold text-gray-900">{models.length}</p>
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
              <p className="text-sm text-gray-600">Active Models</p>
              <p className="text-3xl font-bold text-green-600">
                {models.filter(m => m.isActive).length}
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
              <p className="text-sm text-gray-600">Linked Models</p>
              <p className="text-3xl font-bold text-blue-600">
                {Object.values(modelDeletionStatus).filter(status => status.isLinked).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Brands with Models</p>
              <p className="text-3xl font-bold text-purple-600">
                {[...new Set(models.map(m => m.brand?.id).filter(Boolean))].length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddModelModal
          onAdd={handleAddModel}
          onClose={() => setShowAddModal(false)}
          brands={brands}
          existingModels={models}
        />
      )}

      {showEditModal && selectedModel && (
        <EditModelModal
          model={selectedModel}
          onUpdate={handleUpdateModel}
          onClose={() => {
            setShowEditModal(false);
            setSelectedModel(null);
          }}
          brands={brands}
          existingModels={models}
        />
      )}
    </div>
  );
};

export default ModelManagement;