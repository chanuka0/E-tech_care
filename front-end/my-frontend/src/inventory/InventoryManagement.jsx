
// src/components/inventory/InventoryManagement.js
import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import AddInventoryModal from './AddInventoryModal';
import EditInventoryModal from './EditInventoryModal';
import ViewInventoryModal from './ViewInventoryModal';
import DeductStockModal from './DeductStockModal';
import BulkSerialImportModal from './BulkSerialImportModal';
import AddStockModal from './AddStockModal';
import StockAdjustmentModal from './StockAdjustmentModal';

const InventoryManagement = () => {
  const { apiCall } = useApi();
  const { isAdmin, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [displayCount, setDisplayCount] = useState(10);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showBulkSerialModal, setShowBulkSerialModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchItems = async () => {
    if (!isAuthenticated) {
      setError('Please login to access inventory');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Fetching inventory items...');
      const data = await apiCall('/api/inventory');
      const sortedData = data.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
      setItems(sortedData);
      console.log('Inventory items fetched successfully:', data.length);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'Failed to fetch inventory items');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [isAuthenticated]);

  // ✅ Check if item can be deleted (quantity = 0 and created within 24 hours)
  const canDeleteItem = (item) => {
    if (item.quantity !== 0) return false;
    
    const createdTime = new Date(item.createdAt).getTime();
    const currentTime = new Date().getTime();
    const hoursSinceCreation = (currentTime - createdTime) / (1000 * 60 * 60);
    
    return hoursSinceCreation < 24;
  };

  // ✅ Enhanced validation before adding item
  const handleAddItem = async (newItem) => {
    try {
      // ✅ Check for duplicate item name (case-insensitive)
      const duplicateName = items.find(
        item => item.name.toLowerCase().trim() === newItem.name.toLowerCase().trim()
      );
      
      if (duplicateName) {
        setError(`Item "${newItem.name}" already exists! Please use a different name.`);
        return;
      }

      console.log('Adding new item:', newItem);
      const response = await apiCall('/api/inventory', {
        method: 'POST',
        body: JSON.stringify(newItem)
      });
      setItems([response, ...items]);
      setShowAddModal(false);
      showSuccessMessage('Item added successfully!');
      await fetchItems(); // Refresh the list
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err.message || 'Failed to add item');
    }
  };

  const handleUpdateItem = async (updatedItem) => {
    try {
      console.log('Updating item:', selectedItem.id, updatedItem);
      const response = await apiCall(`/api/inventory/${selectedItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedItem)
      });
      setItems(items.map(item => item.id === selectedItem.id ? response : item));
      setShowEditModal(false);
      setSelectedItem(null);
      showSuccessMessage('Item updated successfully!');
      await fetchItems(); // Refresh to get updated quantities
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.message || 'Failed to update item');
    }
  };

  // ✅ Enhanced delete with time and quantity validation
  const handleDeleteItem = async (item) => {
    // ✅ Validate deletion criteria
    if (!canDeleteItem(item)) {
      const createdTime = new Date(item.createdAt).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceCreation = Math.floor((currentTime - createdTime) / (1000 * 60 * 60));
      
      if (item.quantity > 0) {
        alert(`Cannot delete "${item.name}"!\n\n` +
              `Reason: Item has stock (${item.quantity} units).\n\n` +
              `You can only delete items with 0 stock within 24 hours of creation.`);
      } else {
        alert(`Cannot delete "${item.name}"!\n\n` +
              `Reason: Item was created ${hoursSinceCreation} hours ago.\n\n` +
              `You can only delete items within 24 hours of creation when stock is 0.`);
      }
      return;
    }

    if (window.confirm(`⚠️ PERMANENTLY DELETE "${item.name}"?\n\n` +
                       `This action cannot be undone.\n` +
                       `All associated data will be removed.`)) {
      try {
        console.log('Deleting item:', item.id);
        await apiCall(`/api/inventory/${item.id}`, {
          method: 'DELETE'
        });
        setItems(items.filter(i => i.id !== item.id));
        showSuccessMessage('Item deleted successfully!');
      } catch (err) {
        console.error('Error deleting item:', err);
        setError(err.message || 'Failed to delete item');
      }
    }
  };

  const handleAddStock = async (stockData) => {
    try {
      console.log('Adding stock:', selectedItem.id, stockData);
      await apiCall(`/api/inventory/${selectedItem.id}/add-stock`, {
        method: 'POST',
        body: JSON.stringify(stockData)
      });
      await fetchItems();
      setShowAddStockModal(false);
      setSelectedItem(null);
      showSuccessMessage('Stock added successfully!');
    } catch (err) {
      console.error('Error adding stock:', err);
      setError(err.message || 'Failed to add stock');
    }
  };

  const handleAdjustStock = async (adjustData) => {
    try {
      console.log('Adjusting stock:', selectedItem.id, adjustData);
      await apiCall(`/api/inventory/${selectedItem.id}/adjust-stock`, {
        method: 'POST',
        body: JSON.stringify(adjustData)
      });
      await fetchItems();
      setShowAdjustStockModal(false);
      setSelectedItem(null);
      showSuccessMessage('Stock adjusted successfully!');
    } catch (err) {
      console.error('Error adjusting stock:', err);
      setError(err.message || 'Failed to adjust stock');
    }
  };

  const handleDeductStock = async (deductData) => {
    try {
      console.log('Deducting stock:', selectedItem.id, deductData);
      await apiCall(`/api/inventory/${selectedItem.id}/deduct-stock`, {
        method: 'POST',
        body: JSON.stringify(deductData)
      });
      await fetchItems();
      setShowDeductModal(false);
      setSelectedItem(null);
      showSuccessMessage('Stock deducted successfully!');
    } catch (err) {
      console.error('Error deducting stock:', err);
      setError(err.message || 'Failed to deduct stock');
    }
  };

  const handleAddSerial = async (serialNumber) => {
    try {
      console.log('Adding serial:', selectedItem.id, serialNumber);
      await apiCall(`/api/inventory/${selectedItem.id}/serials`, {
        method: 'POST',
        body: JSON.stringify({ serialNumber })
      });
      await fetchItems();
      showSuccessMessage('Serial added successfully!');
    } catch (err) {
      console.error('Error adding serial:', err);
      setError(err.message || 'Failed to add serial');
    }
  };

  // ✅ Enhanced bulk serial import with duplicate validation
  const handleBulkSerialImport = async (serialNumbers) => {
    try {
      // ✅ Get all existing serials across ALL items
      const allExistingSerials = items.flatMap(item => 
        (item.serials || []).map(s => s.serialNumber.toLowerCase().trim())
      );

      // ✅ Check for duplicates in existing database
      const duplicatesInDB = [];
      const duplicatesInInput = [];
      const seen = new Set();

      serialNumbers.forEach((serial) => {
        const trimmedSerial = serial.toLowerCase().trim();
        
        // Check against existing database
        if (allExistingSerials.includes(trimmedSerial)) {
          duplicatesInDB.push(serial);
        }
        
        // Check for duplicates within input
        if (seen.has(trimmedSerial)) {
          duplicatesInInput.push(serial);
        } else {
          seen.add(trimmedSerial);
        }
      });

      // ✅ Show error if duplicates found
      if (duplicatesInDB.length > 0 || duplicatesInInput.length > 0) {
        let errorMessage = '❌ Duplicate Serial Numbers Detected!\n\n';
        
        if (duplicatesInDB.length > 0) {
          errorMessage += `Already in database (${duplicatesInDB.length}):\n`;
          errorMessage += duplicatesInDB.slice(0, 5).join(', ');
          if (duplicatesInDB.length > 5) {
            errorMessage += ` ... and ${duplicatesInDB.length - 5} more`;
          }
          errorMessage += '\n\n';
        }
        
        if (duplicatesInInput.length > 0) {
          errorMessage += `Duplicates in your input (${duplicatesInInput.length}):\n`;
          errorMessage += duplicatesInInput.slice(0, 5).join(', ');
          if (duplicatesInInput.length > 5) {
            errorMessage += ` ... and ${duplicatesInInput.length - 5} more`;
          }
        }
        
        alert(errorMessage);
        return;
      }

      console.log('Bulk importing serials:', selectedItem.id, serialNumbers.length);
      await apiCall(`/api/inventory/${selectedItem.id}/serials/bulk`, {
        method: 'POST',
        body: JSON.stringify({ serialNumbers })
      });
      await fetchItems();
      setShowBulkSerialModal(false);
      setSelectedItem(null);
      showSuccessMessage(`${serialNumbers.length} serials imported successfully!`);
    } catch (err) {
      console.error('Error bulk importing serials:', err);
      setError(err.message || 'Failed to import serials');
    }
  };

  const showSuccessMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { status: 'OUT_OF_STOCK', color: 'bg-red-100 text-red-800', label: 'Out of Stock' };
    if (item.quantity <= item.minThreshold) return { status: 'LOW_STOCK', color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' };
    return { status: 'IN_STOCK', color: 'bg-green-100 text-green-800', label: 'In Stock' };
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && getStockStatus(item).status === filterStatus;
  });

  const displayedItems = filteredItems.slice(0, displayCount);

  const handleSeeMore = () => {
    setDisplayCount(prevCount => prevCount + 10);
  };

  const canShowMore = displayCount < filteredItems.length;

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please login to access inventory management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Manage inventory items, stock levels, and serials</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Item</span>
          </button>
        )}
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Items</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* ✅ Delete Policy Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">🗑️ Item Deletion Policy</h4>
            <p className="text-sm text-blue-700">
              Items can only be permanently deleted if:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 mt-1 ml-4">
              <li>Stock quantity is <strong>0</strong> (no inventory remaining)</li>
              <li>Created within the <strong>last 24 hours</strong></li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              💡 This prevents accidental deletion of established inventory items with transaction history.
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No items found</h3>
              <p className="text-gray-600">Try adjusting your filters or add a new item</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serials</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedItems.map(item => {
                    const stockStatus = getStockStatus(item);
                    const availableSerials = item.serials?.filter(s => s.status === 'AVAILABLE') || [];
                    const soldSerials = item.serials?.filter(s => s.status === 'SOLD') || [];
                    const isDeletable = canDeleteItem(item);
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.description?.substring(0, 50)}</p>
                            {item.hasSerialization && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                                Serialized
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className={`text-sm font-medium ${item.quantity <= item.minThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                              {item.quantity}
                            </p>
                            <p className="text-xs text-gray-500">Min: {item.minThreshold}</p>
                          </div>
                        </td>
                        {/* ✅ Serial Numbers Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.hasSerialization ? (
                            <div className="text-xs">
                              <div className="flex items-center space-x-1">
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-medium">
                                  {availableSerials.length} Available
                                </span>
                              </div>
                              {soldSerials.length > 0 && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {soldSerials.length} Used
                                  </span>
                                </div>
                              )}
                              {item.serials && item.serials.length > 0 && (
                                <p className="text-gray-500 mt-1">
                                  Total: {item.serials.length}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <p>Rs.{item.sellingPrice?.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Cost: Rs.{item.purchasePrice?.toFixed(2)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col space-y-1">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowViewModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                View
                              </button>
                              {isAdmin() && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setShowEditModal(true);
                                    }}
                                    className="text-green-600 hover:text-green-900 font-medium"
                                  >
                                    Edit
                                  </button>
                                  {/* ✅ Show delete button only when item can be deleted */}
                                  {isDeletable && (
                                    <button
                                      onClick={() => handleDeleteItem(item)}
                                      className="text-red-600 hover:text-red-900 font-medium"
                                      title="Can delete - created within 24 hours and stock is 0"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                            {/* ✅ Hide stock buttons when in "add stock" mode */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowAddStockModal(true);
                                }}
                                className="text-emerald-600 hover:text-emerald-900 font-medium text-xs"
                              >
                                + Stock
                              </button>
            
                              {item.hasSerialization && (
                                <button
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setShowBulkSerialModal(true);
                                  }}
                                  className="text-purple-600 hover:text-purple-900 font-medium text-xs"
                                >
                                  + Serials
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {canShowMore && (
              <div className="flex justify-center py-4 border-t border-gray-200">
                <button
                  onClick={handleSeeMore}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <span>See More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {displayedItems.length} of {filteredItems.length} items
                {filteredItems.length > displayedItems.length && ` (${filteredItems.length - displayedItems.length} more available)`}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddInventoryModal
          onAdd={handleAddItem}
          onClose={() => setShowAddModal(false)}
          existingItems={items}
        />
      )}

      {showEditModal && selectedItem && (
        <EditInventoryModal
          item={selectedItem}
          onUpdate={handleUpdateItem}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {showViewModal && selectedItem && (
        <ViewInventoryModal
          item={selectedItem}
          onAddSerial={handleAddSerial}
          onClose={() => {
            setShowViewModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {showDeductModal && selectedItem && (
        <DeductStockModal
          item={selectedItem}
          onDeduct={handleDeductStock}
          onClose={() => {
            setShowDeductModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {showBulkSerialModal && selectedItem && (
        <BulkSerialImportModal
          item={selectedItem}
          onImport={handleBulkSerialImport}
          onClose={() => {
            setShowBulkSerialModal(false);
            setSelectedItem(null);
          }}
          existingSerials={items.flatMap(item => item.serials || [])}
        />
      )}

      {showAddStockModal && selectedItem && (
        <AddStockModal
          item={selectedItem}
          onAdd={handleAddStock}
          onClose={() => {
            setShowAddStockModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {showAdjustStockModal && selectedItem && (
        <StockAdjustmentModal
          item={selectedItem}
          onAdjust={handleAdjustStock}
          onClose={() => {
            setShowAdjustStockModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};

export default InventoryManagement;