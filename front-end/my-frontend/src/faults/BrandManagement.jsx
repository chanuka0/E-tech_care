import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { useAuth } from '../auth/AuthProvider';
import AddBrandModal from './AddBrandModal';
import EditBrandModal from './EditBrandModal';

const BrandManagement = () => {
  const { token, isAdmin } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // API call helper - similar to how Expenses does it
  const apiCall = async (endpoint, options = {}) => {
    console.log('📡 Making API call to:', `${API_BASE_URL}${endpoint}`);
    
    const defaultHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      console.log('📥 Response status:', response.status);

      // Handle unauthorized
      if (response.status === 401 || response.status === 403) {
        console.error('❌ Unauthorized - Token invalid or expired');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            console.error('Could not parse error response');
          }
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses (like DELETE)
      if (response.status === 204) {
        return null;
      }

      // Handle JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('❌ API call error:', error);
      throw error;
    }
  };

  const fetchBrands = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/brands');
      setBrands(data);
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch brands';
      setError(errorMsg);
      console.error('Fetch brands error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, [token]);

  const handleAddBrand = async (newBrand) => {
    setError('');
    try {
      const response = await apiCall('/api/brands', {
        method: 'POST',
        body: JSON.stringify(newBrand),
      });
      const brandWithCount = { ...response, modelCount: 0 };
      setBrands([...brands, brandWithCount]);
      setShowAddModal(false);
      setSuccess('Brand added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.message || 'Failed to add brand';
      throw new Error(errorMsg);
    }
  };

  const handleUpdateBrand = async (updatedBrand) => {
    setError('');
    try {
      const response = await apiCall(`/api/brands/${selectedBrand.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedBrand),
      });
      const brandWithCount = { ...response, modelCount: selectedBrand.modelCount || 0 };
      setBrands(brands.map(brand => brand.id === selectedBrand.id ? brandWithCount : brand));
      setShowEditModal(false);
      setSelectedBrand(null);
      setSuccess('Brand updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.message || 'Failed to update brand';
      throw new Error(errorMsg);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const brand = brands.find(b => b.id === id);
    const newStatus = !currentStatus;
    const confirmMessage = newStatus 
      ? `Are you sure you want to activate brand "${brand.brandName}"?`
      : `Are you sure you want to deactivate brand "${brand.brandName}"?\n\nNote: Deactivating will prevent it from being used in new job cards.`;
    
    if (window.confirm(confirmMessage)) {
      setError('');
      try {
        const response = await apiCall(`/api/brands/${id}/toggle-active`, {
          method: 'PATCH'
        });
        
        const brandWithCount = { ...response, modelCount: brand.modelCount || 0 };
        setBrands(brands.map(b => b.id === id ? brandWithCount : b));
        setSuccess(`Brand ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        const errorMsg = err.message || `Failed to ${newStatus ? 'activate' : 'deactivate'} brand`;
        setError(errorMsg);
        console.error('Toggle brand error:', err);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleDeleteBrand = async (id) => {
    const brand = brands.find(b => b.id === id);
    if (window.confirm(`Are you sure you want to permanently delete brand "${brand.brandName}"?`)) {
      setError('');
      try {
        await apiCall(`/api/brands/${id}`, {
          method: 'DELETE'
        });
        setBrands(brands.filter(brand => brand.id !== id));
        setSuccess('Brand deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        const errorMsg = err.message || 'Failed to delete brand';
        setError(errorMsg);
        console.error('Delete brand error:', err);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const filteredBrands = brands.filter(brand => {
    const searchLower = searchTerm.toLowerCase();
    return (
      brand.brandName.toLowerCase().includes(searchLower) ||
      (brand.description && brand.description.toLowerCase().includes(searchLower)) ||
      brand.id.toString().includes(searchLower)
    );
  });

  if (!isAdmin()) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm mt-1">You do not have permission to access Brand Management. Only administrators can manage brands.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Brand Management</h2>
          <p className="text-gray-600 mt-1">Manage device brands for job cards</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Brand</span>
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
            ✕
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
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
            placeholder="Search by brand name, description, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Showing {filteredBrands.length} of {brands.length} brands
        </p>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading brands...</p>
            </div>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching brands found' : 'No brands yet'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first brand to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add First Brand
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Models</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrands.map(brand => (
                  <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{brand.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-900">{brand.brandName}</span>
                        {!brand.isActive && (
                          <span className="ml-2 text-xs text-gray-500">(Inactive)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 italic">
                        {brand.description || <span className="text-gray-400">No description</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${brand.modelCount > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                          {brand.modelCount}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          {brand.modelCount === 1 ? 'model' : 'models'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        brand.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        <div>{new Date(brand.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(brand.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedBrand(brand);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium transition-colors px-3 py-1 hover:bg-blue-50 rounded flex items-center space-x-1"
                          title="Edit brand"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        
                        {brand.modelCount === 0 && (
                          <button
                            onClick={() => handleToggleActive(brand.id, brand.isActive)}
                            className={`font-medium transition-colors px-3 py-1 rounded flex items-center space-x-1 ${
                              brand.isActive
                                ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title={brand.isActive ? 'Deactivate brand' : 'Activate brand'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {brand.isActive ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              )}
                            </svg>
                            <span>{brand.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                        )}
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
              <p className="text-sm text-gray-600">Total Brands</p>
              <p className="text-3xl font-bold text-gray-900">{brands.length}</p>
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
              <p className="text-sm text-gray-600">Active Brands</p>
              <p className="text-3xl font-bold text-green-600">{brands.filter(b => b.isActive).length}</p>
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
              <p className="text-sm text-gray-600">Inactive Brands</p>
              <p className="text-3xl font-bold text-orange-600">{brands.filter(b => !b.isActive).length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddBrandModal
          onAdd={handleAddBrand}
          onClose={() => setShowAddModal(false)}
          existingBrands={brands}
        />
      )}

      {showEditModal && selectedBrand && (
        <EditBrandModal
          brand={selectedBrand}
          onUpdate={handleUpdateBrand}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBrand(null);
          }}
          existingBrands={brands}
        />
      )}
    </div>
  );
};

export default BrandManagement;