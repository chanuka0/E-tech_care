// import { useState, useEffect } from 'react';

// const EditInventoryModal = ({ item, onUpdate, onClose }) => {
//   const [formData, setFormData] = useState(item);
//   const categories = ['Electronics', 'Hardware', 'Software', 'Accessories', 'Services', 'Other'];

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onUpdate(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
//         <div className="bg-green-600 text-white p-6 flex justify-between items-center sticky top-0">
//           <h3 className="text-xl font-bold">Edit Item</h3>
//           <button onClick={onClose} className="text-white hover:bg-green-700 p-1 rounded">
//             ✕
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//             <textarea
//               name="description"
//               value={formData.description || ''}
//               onChange={handleChange}
//               rows="2"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//             <select
//               name="category"
//               value={formData.category || ''}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//             >
//               <option value="">Select Category</option>
//               {categories.map(cat => (
//                 <option key={cat} value={cat}>{cat}</option>
//               ))}
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
//               <input
//                 type="number"
//                 name="quantity"
//                 value={formData.quantity}
//                 onWheel={(e) => e.target.blur()}
//                 onChange={handleChange}
//                 min="0"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Min Threshold</label>
//               <input
//                 type="number"
//                 name="minThreshold"
//                 value={formData.minThreshold || 0}
//                 onWheel={(e) => e.target.blur()}
//                 onChange={handleChange}
//                 min="0"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
//               <input
//                 type="number"
//                 name="purchasePrice"
//                 value={formData.purchasePrice || 0}
//                 onWheel={(e) => e.target.blur()}
//                 onChange={handleChange}
//                 min="0"
//                 step="0.01"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
//               <input
//                 type="number"
//                 name="sellingPrice"
//                 value={formData.sellingPrice || 0}
//                 onWheel={(e) => e.target.blur()}
//                 onChange={handleChange}
//                 min="0"
//                 step="0.01"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Special Price</label>
//             <input
//               type="number"
//               name="specialPrice"
//               value={formData.specialPrice || 0}
//               onWheel={(e) => e.target.blur()}
//               onChange={handleChange}
//               min="0"
//               step="0.01"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//             />
//           </div>

//           <div className="flex space-x-3 pt-4 border-t">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
//             >
//               Update Item
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditInventoryModal;


import { useState } from 'react';

const EditInventoryModal = ({ item, onUpdate, onClose }) => {
  const [formData, setFormData] = useState(item);
  const categories = ['Electronics', 'Hardware', 'Software', 'Accessories', 'Services', 'Other'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const inp = "w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 text-sm";
  const lbl = "block text-xs font-medium text-gray-700 mb-0.5";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">

        {/* Header */}
        <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center rounded-t-lg flex-shrink-0">
          <h3 className="text-base font-bold">Edit Item</h3>
          <button onClick={onClose} className="text-white hover:bg-green-700 p-1 rounded">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">

          {/* Name */}
          <div>
            <label className={lbl}>Item Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${inp} border-gray-300 focus:ring-green-500`}
              required
            />
          </div>

          {/* Description + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows="2"
                className={`${inp} border-gray-300 focus:ring-green-500`}
              />
            </div>
            <div>
              <label className={lbl}>Category</label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className={`${inp} border-gray-300 focus:ring-green-500`}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity (READ-ONLY) + Min Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>
                Quantity
                <span className="ml-1 text-xs text-gray-500 font-normal">
                  {item.hasSerialization ? '(via Serials)' : '(via Add/Adjust Stock)'}
                </span>
              </label>
              {/* ✅ Always disabled in Edit - quantity is managed through Add Stock / Serials only */}
              <div className="relative">
                <input
                  type="number"
                  value={formData.quantity}
                  disabled
                  className={`${inp} border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  🔒
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {item.hasSerialization
                  ? 'Use "+ Serials" to add stock.'
                  : 'Use "+ Stock" or "Adjust" to change quantity.'}
              </p>
            </div>
            <div>
              <label className={lbl}>Min Threshold</label>
              <input
                type="number"
                name="minThreshold"
                value={formData.minThreshold || 0}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                min="0"
                className={`${inp} border-gray-300 focus:ring-green-500`}
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lbl}>Purchase Price</label>
              <input type="number" name="purchasePrice" value={formData.purchasePrice || 0} onChange={handleChange} onWheel={(e) => e.target.blur()} min="0" step="0.01" className={`${inp} border-gray-300 focus:ring-green-500`} />
            </div>
            <div>
              <label className={lbl}>Selling Price</label>
              <input type="number" name="sellingPrice" value={formData.sellingPrice || 0} onChange={handleChange} onWheel={(e) => e.target.blur()} min="0" step="0.01" className={`${inp} border-gray-300 focus:ring-green-500`} />
            </div>
            <div>
              <label className={lbl}>Special Price</label>
              <input type="number" name="specialPrice" value={formData.specialPrice || 0} onChange={handleChange} onWheel={(e) => e.target.blur()} min="0" step="0.01" className={`${inp} border-gray-300 focus:ring-green-500`} />
            </div>
          </div>

          {/* Serialization info (read-only in edit) */}
          <div className={`flex items-start p-2 rounded-lg border ${item.hasSerialization ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`text-xs font-medium ${item.hasSerialization ? 'text-purple-800' : 'text-gray-600'}`}>
              {item.hasSerialization
                ? '📋 Serialized Item — stock managed via serial numbers'
                : '📦 Non-Serialized Item — stock managed via Add/Adjust Stock'}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md font-medium">Update Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInventoryModal;