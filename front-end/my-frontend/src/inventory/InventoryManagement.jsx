// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import { useAuth } from '../auth/AuthProvider';
// import AddInventoryModal from './AddInventoryModal';
// import EditInventoryModal from './EditInventoryModal';
// import ViewInventoryModal from './ViewInventoryModal';
// import DeductStockModal from './DeductStockModal';

// const InventoryManagement = () => {
//   const { apiCall } = useApi();
//   const { isAdmin } = useAuth();
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('ALL');
  
//   // Modal states
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showDeductModal, setShowDeductModal] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);

//   const fetchItems = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/inventory');
//       setItems(data);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch inventory items');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchItems();
//   }, []);

//   const handleAddItem = async (newItem) => {
//     try {
//       const response = await apiCall('/api/inventory', {
//         method: 'POST',
//         body: JSON.stringify(newItem)
//       });
//       setItems([...items, response]);
//       setShowAddModal(false);
//       showSuccessMessage('Item added successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to add item');
//     }
//   };

//   const handleUpdateItem = async (updatedItem) => {
//     try {
//       const response = await apiCall(`/api/inventory/${selectedItem.id}`, {
//         method: 'PUT',
//         body: JSON.stringify(updatedItem)
//       });
//       setItems(items.map(item => item.id === selectedItem.id ? response : item));
//       setShowEditModal(false);
//       setSelectedItem(null);
//       showSuccessMessage('Item updated successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to update item');
//     }
//   };

//   const handleDeleteItem = async (id) => {
//     if (window.confirm('Are you sure you want to delete this item?')) {
//       try {
//         await apiCall(`/api/inventory/${id}`, {
//           method: 'DELETE'
//         });
//         setItems(items.filter(item => item.id !== id));
//         showSuccessMessage('Item deleted successfully!');
//       } catch (err) {
//         setError(err.message || 'Failed to delete item');
//       }
//     }
//   };

//   const handleDeductStock = async (deductData) => {
//     try {
//       await apiCall(`/api/inventory/${selectedItem.id}/deduct-stock`, {
//         method: 'POST',
//         body: JSON.stringify(deductData)
//       });
//       // Refresh items
//       await fetchItems();
//       setShowDeductModal(false);
//       setSelectedItem(null);
//       showSuccessMessage('Stock deducted successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to deduct stock');
//     }
//   };

//   const handleAddSerial = async (serialNumber) => {
//     try {
//       await apiCall(`/api/inventory/${selectedItem.id}/serials`, {
//         method: 'POST',
//         body: JSON.stringify({ serialNumber })
//       });
//       await fetchItems();
//       showSuccessMessage('Serial added successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to add serial');
//     }
//   };

//   const showSuccessMessage = (message) => {
//     const msg = document.createElement('div');
//     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
//     msg.textContent = message;
//     document.body.appendChild(msg);
//     setTimeout(() => msg.remove(), 3000);
//   };

//   const getStockStatus = (item) => {
//     if (item.quantity === 0) return { status: 'OUT_OF_STOCK', color: 'bg-red-100 text-red-800', label: 'Out of Stock' };
//     if (item.quantity <= item.minThreshold) return { status: 'LOW_STOCK', color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' };
//     return { status: 'IN_STOCK', color: 'bg-green-100 text-green-800', label: 'In Stock' };
//   };

//   const filteredItems = items.filter(item => {
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                           item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
//     if (filterStatus === 'ALL') return matchesSearch;
//     return matchesSearch && getStockStatus(item).status === filterStatus;
//   });

//   return (
//     <div className="space-y-6 p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
//           <p className="text-gray-600 mt-1">Manage inventory items, stock levels, and serials</p>
//         </div>
//         {isAdmin() && (
//           <button
//             onClick={() => setShowAddModal(true)}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//             <span>Add Item</span>
//           </button>
//         )}
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
//           <span>{error}</span>
//           <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
//             ✕
//           </button>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
//             <input
//               type="text"
//               placeholder="Search by name or SKU..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="ALL">All Items</option>
//               <option value="IN_STOCK">In Stock</option>
//               <option value="LOW_STOCK">Low Stock</option>
//               <option value="OUT_OF_STOCK">Out of Stock</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Items Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         ) : filteredItems.length === 0 ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-center">
//               <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//               </svg>
//               <h3 className="text-lg font-medium text-gray-900">No items found</h3>
//               <p className="text-gray-600">Try adjusting your filters or add a new item</p>
//             </div>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredItems.map(item => {
//                   const stockStatus = getStockStatus(item);
//                   return (
//                     <tr key={item.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div>
//                           <p className="text-sm font-medium text-gray-900">{item.name}</p>
//                           <p className="text-xs text-gray-500">{item.description?.substring(0, 50)}</p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.sku}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.category}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div>
//                           <p className={`text-sm font-medium ${item.quantity <= item.minThreshold ? 'text-red-600' : 'text-gray-900'}`}>
//                             {item.quantity}
//                           </p>
//                           <p className="text-xs text-gray-500">Min: {item.minThreshold}</p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         <div>
//                           <p>Rs.{item.sellingPrice?.toFixed(2)}</p>
//                           <p className="text-xs text-gray-500">Bought: Rs.{item.purchasePrice?.toFixed(2)}</p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
//                           {stockStatus.label}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
//                         <button
//                           onClick={() => {
//                             setSelectedItem(item);
//                             setShowViewModal(true);
//                           }}
//                           className="text-blue-600 hover:text-blue-900 font-medium"
//                         >
//                           View
//                         </button>
//                         {isAdmin() && (
//                           <>
//                             <button
//                               onClick={() => {
//                                 setSelectedItem(item);
//                                 setShowEditModal(true);
//                               }}
//                               className="text-green-600 hover:text-green-900 font-medium"
//                             >
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => handleDeleteItem(item.id)}
//                               className="text-red-600 hover:text-red-900 font-medium"
//                             >
//                               Delete
//                             </button>
//                           </>
//                         )}
//                         <button
//                           onClick={() => {
//                             setSelectedItem(item);
//                             setShowDeductModal(true);
//                           }}
//                           className="text-orange-600 hover:text-orange-900 font-medium"
//                         >
//                           Use
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       {showAddModal && (
//         <AddInventoryModal
//           onAdd={handleAddItem}
//           onClose={() => setShowAddModal(false)}
//         />
//       )}

//       {showEditModal && selectedItem && (
//         <EditInventoryModal
//           item={selectedItem}
//           onUpdate={handleUpdateItem}
//           onClose={() => {
//             setShowEditModal(false);
//             setSelectedItem(null);
//           }}
//         />
//       )}

//       {showViewModal && selectedItem && (
//         <ViewInventoryModal
//           item={selectedItem}
//           onAddSerial={handleAddSerial}
//           onClose={() => {
//             setShowViewModal(false);
//             setSelectedItem(null);
//           }}
//         />
//       )}

//       {showDeductModal && selectedItem && (
//         <DeductStockModal
//           item={selectedItem}
//           onDeduct={handleDeductStock}
//           onClose={() => {
//             setShowDeductModal(false);
//             setSelectedItem(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default InventoryManagement;

import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider';
import AddInventoryModal from './AddInventoryModal';
import EditInventoryModal from './EditInventoryModal';
import ViewInventoryModal from './ViewInventoryModal';
import DeductStockModal from './DeductStockModal';

const InventoryManagement = () => {
  const { apiCall } = useApi();
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [displayCount, setDisplayCount] = useState(20);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/inventory');
      // Sort by creation date (newest first) assuming items have a createdAt field
      const sortedData = data.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
      setItems(sortedData);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory items');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (newItem) => {
    try {
      const response = await apiCall('/api/inventory', {
        method: 'POST',
        body: JSON.stringify(newItem)
      });
      // Add new item at the beginning of the array
      setItems([response, ...items]);
      setShowAddModal(false);
      showSuccessMessage('Item added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add item');
    }
  };

  const handleUpdateItem = async (updatedItem) => {
    try {
      const response = await apiCall(`/api/inventory/${selectedItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedItem)
      });
      setItems(items.map(item => item.id === selectedItem.id ? response : item));
      setShowEditModal(false);
      setSelectedItem(null);
      showSuccessMessage('Item updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await apiCall(`/api/inventory/${id}`, {
          method: 'DELETE'
        });
        setItems(items.filter(item => item.id !== id));
        showSuccessMessage('Item deleted successfully!');
      } catch (err) {
        setError(err.message || 'Failed to delete item');
      }
    }
  };

  const handleDeductStock = async (deductData) => {
    try {
      await apiCall(`/api/inventory/${selectedItem.id}/deduct-stock`, {
        method: 'POST',
        body: JSON.stringify(deductData)
      });
      // Refresh items
      await fetchItems();
      setShowDeductModal(false);
      setSelectedItem(null);
      showSuccessMessage('Stock deducted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to deduct stock');
    }
  };

  const handleAddSerial = async (serialNumber) => {
    try {
      await apiCall(`/api/inventory/${selectedItem.id}/serials`, {
        method: 'POST',
        body: JSON.stringify({ serialNumber })
      });
      await fetchItems();
      showSuccessMessage('Serial added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add serial');
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

  // Get items to display based on current display count
  const displayedItems = filteredItems.slice(0, displayCount);

  const handleSeeMore = () => {
    setDisplayCount(prevCount => prevCount + 20);
  };

  const canShowMore = displayCount < filteredItems.length;

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedItems.map(item => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.description?.substring(0, 50)}</p>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <p>Rs.{item.sellingPrice?.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Bought: Rs.{item.purchasePrice?.toFixed(2)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
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
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeductModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-900 font-medium"
                          >
                            Use
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* See More Button */}
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

            {/* Results Count */}
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
    </div>
  );
};

export default InventoryManagement;