// import { useState } from 'react';

// const AddCustomerModal = ({ onAdd, onClose, existingCustomers }) => {
//   const [formData, setFormData] = useState({
//     customerName: '',
//     phoneNumber: '',
//     email: '',
//     address: '',
//     notes: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.customerName.trim()) {
//       newErrors.customerName = 'Customer name is required';
//     }

//     if (!formData.phoneNumber.trim()) {
//       newErrors.phoneNumber = 'Phone number is required';
//     } else if (!/^\d+$/.test(formData.phoneNumber.replace(/[\s\-]/g, ''))) {
//       newErrors.phoneNumber = 'Phone number should contain only digits';
//     } else if (existingCustomers.some(c => c.phoneNumber === formData.phoneNumber)) {
//       newErrors.phoneNumber = 'This phone number already exists';
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     } else if (existingCustomers.some(c => c.email === formData.email)) {
//       newErrors.email = 'This email already exists';
//     }

//     if (!formData.address.trim()) {
//       newErrors.address = 'Address is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     try {
//       await onAdd(formData);
//     } catch (error) {
//       console.error('Error adding customer:', error);
//       setErrors({ submit: error.message || 'Failed to add customer' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     // Clear error for this field when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-blue-600 px-6 py-4 flex items-center justify-between">
//           <h3 className="text-xl font-bold text-white">Add New Customer</h3>
//           <button
//             onClick={onClose}
//             className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           {/* Error Message */}
//           {errors.submit && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//               {errors.submit}
//             </div>
//           )}

//           {/* Customer Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Customer Name *
//             </label>
//             <input
//               type="text"
//               name="customerName"
//               value={formData.customerName}
//               onChange={handleChange}
//               placeholder="Enter customer name"
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.customerName ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {errors.customerName && (
//               <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
//             )}
//           </div>

//           {/* Phone Number */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Phone Number *
//             </label>
//             <input
//               type="text"
//               name="phoneNumber"
//               value={formData.phoneNumber}
//               onChange={handleChange}
//               placeholder="Enter phone number"
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {errors.phoneNumber && (
//               <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
//             )}
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email *
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter email address"
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.email ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {errors.email && (
//               <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//             )}
//           </div>

//           {/* Address */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Address *
//             </label>
//             <textarea
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               placeholder="Enter customer address"
//               rows="2"
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.address ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {errors.address && (
//               <p className="text-red-500 text-sm mt-1">{errors.address}</p>
//             )}
//           </div>

//           {/* Notes */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Notes (Optional)
//             </label>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               placeholder="Add any additional notes about the customer"
//               rows="2"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex space-x-3 pt-4 border-t">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
//             >
//               {loading ? 'Adding...' : 'Add Customer'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerModal;

import { useState } from 'react';

const inp = "w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const lbl = "block text-xs font-medium text-gray-700 mb-0.5";

const AddCustomerModal = ({ onAdd, onClose, existingCustomers }) => {
  const [formData, setFormData] = useState({
    customerName: '', phoneNumber: '', email: '', address: '', notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const e = {};
    if (!formData.customerName.trim()) e.customerName = 'Customer name is required';
    if (!formData.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    else if (!/^\d+$/.test(formData.phoneNumber.replace(/[\s\-]/g, ''))) e.phoneNumber = 'Digits only';
    else if (existingCustomers.some(c => c.phoneNumber === formData.phoneNumber)) e.phoneNumber = 'Phone number already exists';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
    else if (existingCustomers.some(c => c.email === formData.email)) e.email = 'Email already exists';
    if (!formData.address.trim()) e.address = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try { await onAdd(formData); }
    catch (err) { setErrors({ submit: err.message || 'Failed to add customer' }); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* ✅ No scroll: h-auto, all content fits, no overflow-y */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">

        {/* Header */}
        <div className="bg-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0 rounded-t-lg">
          <h3 className="text-base font-bold text-white">Add New Customer</h3>
          <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-2.5">
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs">{errors.submit}</div>
          )}

          {/* Name */}
          <div>
            <label className={lbl}>Customer Name *</label>
            <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Enter customer name" className={`${inp} ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.customerName && <p className="text-red-500 text-xs mt-0.5">{errors.customerName}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className={lbl}>Phone Number *</label>
            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Enter phone number" className={`${inp} ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-0.5">{errors.phoneNumber}</p>}
          </div>

          {/* Email */}
          <div>
            <label className={lbl}>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" className={`${inp} ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
          </div>

          {/* Address */}
          <div>
            <label className={lbl}>Address *</label>
            <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter customer address" rows="2" className={`${inp} ${errors.address ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.address && <p className="text-red-500 text-xs mt-0.5">{errors.address}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className={lbl}>Notes (Optional)</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes" rows="2" className={`${inp} border-gray-300`} />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg">{loading ? 'Adding...' : 'Add Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;