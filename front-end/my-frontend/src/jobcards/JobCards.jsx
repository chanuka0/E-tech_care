// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import JobCardEdit from './JobCardEdit';
// import JobCardView from './JobCardView';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';

// const JobCards = ({ onCreateNew }) => {
//   const { apiCall } = useApi();
//   const [jobCards, setJobCards] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [filterStatus, setFilterStatus] = useState('ALL');
//   const [editingJobCard, setEditingJobCard] = useState(null);
//   const [viewingJobCard, setViewingJobCard] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [visibleCount, setVisibleCount] = useState(10);
  
//   // State for advanced filters
//   const [filterBrand, setFilterBrand] = useState('');
//   const [filterModel, setFilterModel] = useState('');
//   const [filterProcessor, setFilterProcessor] = useState('');
//   const [filterDeviceCondition, setFilterDeviceCondition] = useState('');
//   const [brands, setBrands] = useState([]);
//   const [models, setModels] = useState([]);
//   const [processors, setProcessors] = useState([]);
//   const [deviceConditions, setDeviceConditions] = useState([]);
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

//   // Fetch job cards and filter data
//   const fetchJobCards = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/jobcards');
//       // Sort by creation date - newest first
//       const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       setJobCards(sortedData);
//     } catch (err) {
//       setError('Failed to load job cards');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   // Fetch filter options
//   const fetchFilterData = async () => {
//     try {
//       const [brandsData, modelsData, processorsData, conditionsData] = await Promise.all([
//         apiCall('/api/brands'),
//         apiCall('/api/models'),
//         apiCall('/api/processors'),
//         apiCall('/api/device-conditions')
//       ]);
//       setBrands(brandsData || []);
//       setModels(modelsData || []);
//       setProcessors(processorsData || []);
//       setDeviceConditions(conditionsData || []);
//     } catch (err) {
//       console.error('Error fetching filter data:', err);
//     }
//   };

//   useEffect(() => {
//     fetchJobCards();
//     fetchFilterData();
//   }, []);

//   // Function to add new job card to the top
//   const addNewJobCard = (newJobCard) => {
//     setJobCards(prev => [newJobCard, ...prev]);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
//       WAITING_FOR_PARTS: 'bg-orange-100 text-orange-800 border-orange-300',
//       WAITING_FOR_APPROVAL: 'bg-purple-100 text-purple-800 border-purple-300',
//       COMPLETED: 'bg-green-100 text-green-800 border-green-300',
//       DELIVERED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
//       CANCELLED: 'bg-red-100 text-red-800 border-red-300',
//       ONE_DAY_SERVICE: 'bg-red-100 text-red-800 border-red-300',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       PENDING: '⏳',
//       IN_PROGRESS: '🔧',
//       WAITING_FOR_PARTS: '📦',
//       WAITING_FOR_APPROVAL: '👥',
//       COMPLETED: '✅',
//       DELIVERED: '🚚',
//       CANCELLED: '❌',
//       ONE_DAY_SERVICE: '🚨',
//     };
//     return icons[status] || '📄';
//   };

//   // Filter job cards by status, search term, AND new filters
//   const filteredJobCards = jobCards.filter(job => {
//     // Handle ONE_DAY_SERVICE filter separately since it's a boolean flag
//     if (filterStatus === 'ONE_DAY_SERVICE') {
//       if (!job.oneDayService) return false;
//     } else {
//       const statusMatch = filterStatus === 'ALL' || job.status === filterStatus;
//       if (!statusMatch) return false;
//     }
    
//     const searchMatch = searchTerm === '' || 
//       job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.deviceType?.toLowerCase().includes(searchTerm.toLowerCase());
    
//     // Advanced filter conditions
//     const brandMatch = filterBrand === '' || job.brand?.id === parseInt(filterBrand);
//     const modelMatch = filterModel === '' || job.model?.id === parseInt(filterModel);
//     const processorMatch = filterProcessor === '' || job.processor?.id === parseInt(filterProcessor);
//     const conditionMatch = filterDeviceCondition === '' || job.deviceCondition?.id === parseInt(filterDeviceCondition);

//     return searchMatch && brandMatch && modelMatch && processorMatch && conditionMatch;
//   });

//   // Get only the visible job cards (first N items)
//   const visibleJobCards = filteredJobCards.slice(0, visibleCount);

//   // Function to load more job cards
//   const loadMore = () => {
//     setVisibleCount(prev => prev + 10);
//   };

//   // Function to clear all advanced filters
//   const clearAdvancedFilters = () => {
//     setFilterBrand('');
//     setFilterModel('');
//     setFilterProcessor('');
//     setFilterDeviceCondition('');
//   };

//   // Status filter button style
//   const getStatusButtonStyle = (status) => {
//     const isActive = filterStatus === status;
//     const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
    
//     if (isActive) {
//       const activeStyles = {
//         ALL: 'bg-gray-600 text-white shadow-md',
//         PENDING: 'bg-yellow-500 text-white shadow-md',
//         IN_PROGRESS: 'bg-blue-500 text-white shadow-md',
//         WAITING_FOR_PARTS: 'bg-orange-500 text-white shadow-md',
//         WAITING_FOR_APPROVAL: 'bg-purple-500 text-white shadow-md',
//         COMPLETED: 'bg-green-500 text-white shadow-md',
//         DELIVERED: 'bg-indigo-500 text-white shadow-md',
//         CANCELLED: 'bg-red-500 text-white shadow-md',
//         ONE_DAY_SERVICE: 'bg-red-600 text-white shadow-md',
//       };
//       return `${baseStyle} ${activeStyles[status]}`;
//     }
    
//     return `${baseStyle} bg-gray-100 text-gray-700 hover:bg-gray-200`;
//   };

//   // NEW: Get urgent one day service job cards (only PENDING and IN_PROGRESS - EXCLUDES DELIVERED)
//   const getUrgentOneDayServiceJobCards = () => {
//     return jobCards.filter(job => 
//       job.oneDayService && 
//       (job.status === 'PENDING' || job.status === 'IN_PROGRESS') &&
//       job.status !== 'DELIVERED' // EXCLUDE DELIVERED JOBS
//     );
//   };

//   const urgentOneDayServiceJobs = getUrgentOneDayServiceJobCards();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (viewingJobCard) {
//     return (
//       <JobCardView
//         jobCardId={viewingJobCard}
//         onClose={() => setViewingJobCard(null)}
//         onEdit={(id) => {
//           setViewingJobCard(null);
//           setEditingJobCard(id);
//         }}
//         onStatusChange={fetchJobCards} // Refresh list when status changes
//       />
//     );
//   }

//   if (editingJobCard) {
//     return (
//       <JobCardEdit
//         jobCardId={editingJobCard}
//         onSuccess={(updatedJobCard) => {
//           setEditingJobCard(null);
//           // Update the specific job card in the list
//           setJobCards(prev => prev.map(job => 
//             job.id === editingJobCard ? updatedJobCard : job
//           ));
//         }}
//         onCancel={() => setEditingJobCard(null)}
//       />
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Job Cards</h2>
//           <p className="text-gray-600 mt-1">Total: {jobCards.length} job cards</p>
//         </div>
//         <button
//           onClick={onCreateNew}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span>New Job Card</span>
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}

//       {/* URGENT ONE DAY SERVICE ALERT - Only for PENDING and IN_PROGRESS (EXCLUDES DELIVERED) */}
//       {urgentOneDayServiceJobs.length > 0 && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//               </svg>
//               <div>
//                 <h3 className="text-lg font-bold text-red-800">
//                   🚨 Urgent One Day Service Alert
//                 </h3>
//                 <p className="text-red-700">
//                   {urgentOneDayServiceJobs.length} job card{urgentOneDayServiceJobs.length !== 1 ? 's' : ''} requiring immediate attention (24-hour deadline)
//                 </p>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {urgentOneDayServiceJobs.map(job => (
//                     <span key={job.id} className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
//                       {job.jobNumber} - {job.customerName}
//                       <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
//                         job.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
//                       }`}>
//                         {job.status === 'PENDING' ? '⏳ Pending' : '🔧 In Progress'}
//                       </span>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={() => setFilterStatus('ONE_DAY_SERVICE')}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//             >
//               View All Urgent Jobs
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Search Bar */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//           <input
//             type="text"
//             placeholder="Search by job card number, customer name, phone, or device type..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm('')}
//               className="absolute inset-y-0 right-0 pr-3 flex items-center"
//             >
//               <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Status Filter Buttons - INCLUDING ONE DAY SERVICE */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex flex-wrap gap-2">
//           {['ALL', 'PENDING', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'DELIVERED', 'CANCELLED', 'ONE_DAY_SERVICE'].map(status => (
//             <button
//               key={status}
//               onClick={() => setFilterStatus(status)}
//               className={getStatusButtonStyle(status)}
//             >
//               <span className="capitalize">{status.toLowerCase().replace(/_/g, ' ')}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Advanced Filters Toggle */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <button
//           onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//           className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
//         >
//           <svg className={`w-5 h-5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//           </svg>
//           <span>Advanced Filters</span>
//           {(filterBrand || filterModel || filterProcessor || filterDeviceCondition) && (
//             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
//               Active
//             </span>
//           )}
//         </button>

//         {/* Advanced Filters */}
//         {showAdvancedFilters && (
//           <div className="mt-4 pt-4 border-t border-gray-200">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {/* Brand Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
//                 <select
//                   value={filterBrand}
//                   onChange={(e) => setFilterBrand(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Brands</option>
//                   {brands.map(brand => (
//                     <option key={brand.id} value={brand.id}>{brand.brandName}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Model Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
//                 <select
//                   value={filterModel}
//                   onChange={(e) => setFilterModel(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Models</option>
//                   {models.map(model => (
//                     <option key={model.id} value={model.id}>{model.modelName}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Processor Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Processor</label>
//                 <select
//                   value={filterProcessor}
//                   onChange={(e) => setFilterProcessor(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Processors</option>
//                   {processors.map(processor => (
//                     <option key={processor.id} value={processor.id}>{processor.processorName}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Device Condition Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Device Condition</label>
//                 <select
//                   value={filterDeviceCondition}
//                   onChange={(e) => setFilterDeviceCondition(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Conditions</option>
//                   {deviceConditions.map(condition => (
//                     <option key={condition.id} value={condition.id}>{condition.conditionName}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Clear Filters Button */}
//             {(filterBrand || filterModel || filterProcessor || filterDeviceCondition) && (
//               <div className="mt-4 flex justify-end">
//                 <button
//                   onClick={clearAdvancedFilters}
//                   className="text-sm text-gray-600 hover:text-gray-800 underline"
//                 >
//                   Clear all filters
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Results Count */}
//       {(searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || filterStatus !== 'ALL') && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-blue-800">
//             Showing {filteredJobCards.length} of {jobCards.length} job card{filteredJobCards.length !== 1 ? 's' : ''}
//             {filterStatus !== 'ALL' && ` with ${filterStatus === 'ONE_DAY_SERVICE' ? 'one day service' : `status "${filterStatus.replace(/_/g, ' ')}"`}`}
//             {searchTerm && ` matching "${searchTerm}"`}
//             {(filterBrand || filterModel || filterProcessor || filterDeviceCondition) && ' with selected filters'}
//           </p>
//         </div>
//       )}

//       {/* One Day Service Summary - Only show when not already filtered by one day service (EXCLUDES DELIVERED) */}
//       {filterStatus !== 'ONE_DAY_SERVICE' && filteredJobCards.some(job => job.oneDayService && job.status !== 'DELIVERED') && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//             </svg>
//             <span className="text-red-800 font-medium">
//               🚨 {filteredJobCards.filter(job => job.oneDayService && job.status !== 'DELIVERED').length} One Day Service job card{filteredJobCards.filter(job => job.oneDayService && job.status !== 'DELIVERED').length !== 1 ? 's' : ''} requiring urgent attention
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Waiting for Parts Summary */}
//       {filteredJobCards.some(job => job.status === 'WAITING_FOR_PARTS') && (
//         <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//             </svg>
//             <span className="text-orange-800 font-medium">
//               📦 {filteredJobCards.filter(job => job.status === 'WAITING_FOR_PARTS').length} job card{filteredJobCards.filter(job => job.status === 'WAITING_FOR_PARTS').length !== 1 ? 's' : ''} waiting for parts
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Waiting for Approval Summary */}
//       {filteredJobCards.some(job => job.status === 'WAITING_FOR_APPROVAL') && (
//         <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//             </svg>
//             <span className="text-purple-800 font-medium">
//               👥 {filteredJobCards.filter(job => job.status === 'WAITING_FOR_APPROVAL').length} job card{filteredJobCards.filter(job => job.status === 'WAITING_FOR_APPROVAL').length !== 1 ? 's' : ''} waiting for customer approval
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Job Cards Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Job Details
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Customer
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Device Info
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Phone
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Estimated Cost
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {visibleJobCards.map(job => (
//                 <tr 
//                   key={job.id} 
//                   className={`transition-colors hover:bg-gray-50 ${
//                     job.oneDayService && (job.status === 'PENDING' || job.status === 'IN_PROGRESS') && job.status !== 'DELIVERED'
//                       ? 'bg-red-50 border-l-4 border-l-red-500'  // Red highlight for urgent One Day Service (not delivered)
//                       : job.oneDayService && job.status !== 'DELIVERED'
//                       ? 'bg-orange-50 border-l-4 border-l-orange-500'  // Orange for non-urgent One Day Service (not delivered)
//                       : ''
//                   } ${
//                     job.status === 'WAITING_FOR_PARTS'
//                       ? 'bg-orange-50 border-l-4 border-l-orange-500'
//                       : job.status === 'WAITING_FOR_APPROVAL'
//                       ? 'bg-purple-50 border-l-4 border-l-purple-500'
//                       : ''
//                   }`}
//                 >
//                   <td className="px-6 py-4">
//                     <div className="text-sm font-bold text-gray-900">{job.jobNumber}</div>
//                     <div className="text-xs text-gray-500 mt-1">
//                       {new Date(job.createdAt).toLocaleDateString()}
//                     </div>
//                     {job.oneDayService && job.status !== 'DELIVERED' && (
//                       <span className={`inline-block mt-1 px-2 py-1 text-xs font-bold rounded-full ${
//                         (job.status === 'PENDING' || job.status === 'IN_PROGRESS')
//                           ? 'bg-red-100 text-red-800'  // Urgent styling
//                           : 'bg-orange-100 text-orange-800'  // Non-urgent styling
//                       }`}>
//                         {(job.status === 'PENDING' || job.status === 'IN_PROGRESS') ? '🚨 ONE DAY' : '⚠️ ONE DAY'}
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm font-semibold text-gray-900">{job.customerName}</div>
//                     <div className="text-xs text-gray-500">{job.customerEmail || 'No email'}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm font-medium text-gray-900">{job.deviceType}</div>
//                     <div className="text-xs text-gray-500">
//                       {job.brand?.brandName || 'No brand'} • {job.model?.modelName || 'No model'}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-gray-900">{job.customerPhone}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm font-bold text-green-600">
//                       Rs.{job.estimatedCost?.toFixed(2) || '0.00'}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center space-x-2">
//                       <span className="text-lg">{getStatusIcon(job.status)}</span>
//                       <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
//                         {job.status.replace(/_/g, ' ')}
//                       </span>
//                     </div>
//                     {job.status === 'WAITING_FOR_PARTS' && (
//                       <div className="text-xs text-orange-600 mt-1">Parts needed</div>
//                     )}
//                     {job.status === 'WAITING_FOR_APPROVAL' && (
//                       <div className="text-xs text-purple-600 mt-1">Awaiting customer</div>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-2">
//                       <button 
//                         onClick={() => setViewingJobCard(job.id)}
//                         className="text-blue-600 hover:text-blue-900 transition-colors px-2 py-1 rounded hover:bg-blue-50"
//                         title="View Details"
//                       >
//                         View
//                       </button>
//                       <button 
//                         onClick={() => setEditingJobCard(job.id)}
//                         className="text-green-600 hover:text-green-900 transition-colors px-2 py-1 rounded hover:bg-green-50"
//                         title="Edit Job Card"
//                       >
//                         Edit
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* See More Button */}
//         {filteredJobCards.length > visibleCount && (
//           <div className="flex justify-center py-4 border-t border-gray-200">
//             <button
//               onClick={loadMore}
//               className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
//             >
//               <span>Load More ({filteredJobCards.length - visibleCount} remaining)</span>
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//               </svg>
//             </button>
//             {/* ........................................................................................................*/}
//             <button 
//               onClick={() => downloadJobCardPDF(job)}
//               className="text-indigo-600 hover:text-indigo-900 transition-colors px-2 py-1 rounded hover:bg-indigo-50"
//               title="Download Job Card"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//             </button>
//           </div>
//         )}

//         {filteredJobCards.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             <h3 className="text-xl font-medium text-gray-900 mb-2">
//               {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || filterStatus !== 'ALL' ? 'No Job Cards Found' : 'No Job Cards Yet'}
//             </h3>
//             <p className="text-gray-500 mb-4">
//               {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || filterStatus !== 'ALL'
//                 ? 'No job cards match your search criteria. Try adjusting your filters.'
//                 : 'Create your first job card to get started with repair management.'
//               }
//             </p>
//             {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || filterStatus !== 'ALL' ? (
//               <button
//                 onClick={() => {
//                   setSearchTerm('');
//                   setFilterStatus('ALL');
//                   clearAdvancedFilters();
//                 }}
//                 className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
//               >
//                 Clear All Filters
//               </button>
//             ) : (
//               <button
//                 onClick={onCreateNew}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
//               >
//                 Create Your First Job Card
//               </button>
              
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JobCards;











// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import { useAuth } from '../auth/AuthProvider'; // ✅ IMPORT useAuth
// import JobCardEdit from './JobCardEdit';
// import JobCardView from './JobCardView';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';

// const JobCards = ({ onCreateNew }) => {
//   const { apiCall } = useApi();
//   const { isAdmin } = useAuth(); // ✅ USE useAuth from AuthProvider
  
//   const [jobCards, setJobCards] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [filterStatus, setFilterStatus] = useState('ALL');
//   const [editingJobCard, setEditingJobCard] = useState(null);
//   const [viewingJobCard, setViewingJobCard] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [visibleCount, setVisibleCount] = useState(10);
  
//   // State for advanced filters
//   const [filterBrand, setFilterBrand] = useState('');
//   const [filterModel, setFilterModel] = useState('');
//   const [filterProcessor, setFilterProcessor] = useState('');
//   const [filterDeviceCondition, setFilterDeviceCondition] = useState('');
//   const [brands, setBrands] = useState([]);
//   const [models, setModels] = useState([]);
//   const [processors, setProcessors] = useState([]);
//   const [deviceConditions, setDeviceConditions] = useState([]);
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

//   // ✅ DEBUG: Log admin status
//   useEffect(() => {
//     console.log('🔐 Admin Status:', isAdmin());
//   }, [isAdmin]);

//   // Fetch job cards and filter data
//   const fetchJobCards = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/api/jobcards');
//       // Sort by creation date - newest first
//       const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       setJobCards(sortedData);
//     } catch (err) {
//       setError('Failed to load job cards');
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   // Fetch filter options
//   const fetchFilterData = async () => {
//     try {
//       const [brandsData, modelsData, processorsData, conditionsData] = await Promise.all([
//         apiCall('/api/brands'),
//         apiCall('/api/models'),
//         apiCall('/api/processors'),
//         apiCall('/api/device-conditions')
//       ]);
//       setBrands(brandsData || []);
//       setModels(modelsData || []);
//       setProcessors(processorsData || []);
//       setDeviceConditions(conditionsData || []);
//     } catch (err) {
//       console.error('Error fetching filter data:', err);
//     }
//   };

//   useEffect(() => {
//     fetchJobCards();
//     fetchFilterData();
//   }, []);

//   // Function to add new job card to the top
//   const addNewJobCard = (newJobCard) => {
//     setJobCards(prev => [newJobCard, ...prev]);
//   };

//   // ✅ DELETE JOB CARD FUNCTION
//   const handleDeleteJobCard = async (jobCardId, jobNumber, status) => {
//     // ✅ Check if user is admin before allowing delete
//     if (!isAdmin()) {
//       alert('❌ Only admins can delete job cards');
//       return;
//     }

//     // Only allow deletion of PENDING or CANCELLED job cards
//     if (status !== 'PENDING' && status !== 'CANCELLED') {
//       alert(`❌ Can only delete PENDING or CANCELLED job cards.\nCurrent status: ${status}`);
//       return;
//     }

//     const reason = prompt(`🗑️ Enter reason for deleting job card ${jobNumber}:\n\n(This action cannot be undone)`);
    
//     if (reason && reason.trim()) {
//       try {
//         await apiCall(`/api/jobcards/${jobCardId}`, {
//           method: 'DELETE',
//           body: JSON.stringify({ reason })
//         });
        
//         showSuccessMessage(`✅ Job card ${jobNumber} deleted successfully!`);
//         fetchJobCards();
//       } catch (err) {
//         setError(err.message || `❌ Failed to delete job card ${jobNumber}`);
//         console.error('Delete error:', err);
//       }
//     }
//   };

//   const showSuccessMessage = (message) => {
//     const msg = document.createElement('div');
//     msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium';
//     msg.textContent = message;
//     document.body.appendChild(msg);
//     setTimeout(() => msg.remove(), 3000);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
//       WAITING_FOR_PARTS: 'bg-orange-100 text-orange-800 border-orange-300',
//       WAITING_FOR_APPROVAL: 'bg-purple-100 text-purple-800 border-purple-300',
//       COMPLETED: 'bg-green-100 text-green-800 border-green-300',
//       DELIVERED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
//       CANCELLED: 'bg-red-100 text-red-800 border-red-300',
//       ONE_DAY_SERVICE: 'bg-red-100 text-red-800 border-red-300',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       PENDING: '⏳',
//       IN_PROGRESS: '🔧',
//       WAITING_FOR_PARTS: '📦',
//       WAITING_FOR_APPROVAL: '👥',
//       COMPLETED: '✅',
//       DELIVERED: '🚚',
//       CANCELLED: '❌',
//       ONE_DAY_SERVICE: '🚨',
//     };
//     return icons[status] || '📄';
//   };

//   // Filter job cards by status, search term, AND new filters
//   const filteredJobCards = jobCards.filter(job => {
//     // Handle ONE_DAY_SERVICE filter separately since it's a boolean flag
//     if (filterStatus === 'ONE_DAY_SERVICE') {
//       if (!job.oneDayService) return false;
//     } else {
//       const statusMatch = filterStatus === 'ALL' || job.status === filterStatus;
//       if (!statusMatch) return false;
//     }
    
//     const searchMatch = searchTerm === '' || 
//       job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       job.deviceType?.toLowerCase().includes(searchTerm.toLowerCase());
    
//     // Advanced filter conditions
//     const brandMatch = filterBrand === '' || job.brand?.id === parseInt(filterBrand);
//     const modelMatch = filterModel === '' || job.model?.id === parseInt(filterModel);
//     const processorMatch = filterProcessor === '' || job.processor?.id === parseInt(filterProcessor);
//     const conditionMatch = filterDeviceCondition === '' || job.deviceCondition?.id === parseInt(filterDeviceCondition);

//     return searchMatch && brandMatch && modelMatch && processorMatch && conditionMatch;
//   });

//   // Get only the visible job cards (first N items)
//   const visibleJobCards = filteredJobCards.slice(0, visibleCount);

//   // Function to load more job cards
//   const loadMore = () => {
//     setVisibleCount(prev => prev + 10);
//   };

//   // Function to clear all advanced filters
//   const clearAdvancedFilters = () => {
//     setFilterBrand('');
//     setFilterModel('');
//     setFilterProcessor('');
//     setFilterDeviceCondition('');
//   };

//   // Status filter button style
//   const getStatusButtonStyle = (status) => {
//     const isActive = filterStatus === status;
//     const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
    
//     if (isActive) {
//       const activeStyles = {
//         ALL: 'bg-gray-600 text-white shadow-md',
//         PENDING: 'bg-yellow-500 text-white shadow-md',
//         IN_PROGRESS: 'bg-blue-500 text-white shadow-md',
//         WAITING_FOR_PARTS: 'bg-orange-500 text-white shadow-md',
//         WAITING_FOR_APPROVAL: 'bg-purple-500 text-white shadow-md',
//         COMPLETED: 'bg-green-500 text-white shadow-md',
//         DELIVERED: 'bg-indigo-500 text-white shadow-md',
//         CANCELLED: 'bg-red-500 text-white shadow-md',
//         ONE_DAY_SERVICE: 'bg-red-600 text-white shadow-md',
//       };
//       return `${baseStyle} ${activeStyles[status]}`;
//     }
    
//     return `${baseStyle} bg-gray-100 text-gray-700 hover:bg-gray-200`;
//   };

//   // NEW: Get urgent one day service job cards (only PENDING and IN_PROGRESS - EXCLUDES DELIVERED)
//   const getUrgentOneDayServiceJobCards = () => {
//     return jobCards.filter(job => 
//       job.oneDayService && 
//       (job.status === 'PENDING' || job.status === 'IN_PROGRESS') &&
//       job.status !== 'DELIVERED' // EXCLUDE DELIVERED JOBS
//     );
//   };

//   const urgentOneDayServiceJobs = getUrgentOneDayServiceJobCards();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (viewingJobCard) {
//     return (
//       <JobCardView
//         jobCardId={viewingJobCard}
//         onClose={() => setViewingJobCard(null)}
//         onEdit={(id) => {
//           setViewingJobCard(null);
//           setEditingJobCard(id);
//         }}
//         onStatusChange={fetchJobCards} // Refresh list when status changes
//       />
//     );
//   }

//   if (editingJobCard) {
//     return (
//       <JobCardEdit
//         jobCardId={editingJobCard}
//         onSuccess={(updatedJobCard) => {
//           setEditingJobCard(null);
//           // Update the specific job card in the list
//           setJobCards(prev => prev.map(job => 
//             job.id === editingJobCard ? updatedJobCard : job
//           ));
//         }}
//         onCancel={() => setEditingJobCard(null)}
//       />
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Job Cards</h2>
//           <p className="text-gray-600 mt-1">Total: {jobCards.length} job cards</p>
//         </div>
//         <button
//           onClick={onCreateNew}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span>New Job Card</span>
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}

//       {/* URGENT ONE DAY SERVICE ALERT - Only for PENDING and IN_PROGRESS (EXCLUDES DELIVERED) */}
//       {urgentOneDayServiceJobs.length > 0 && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//               </svg>
//               <div>
//                 <h3 className="text-lg font-bold text-red-800">
//                   🚨 Urgent One Day Service Alert
//                 </h3>
//                 <p className="text-red-700">
//                   {urgentOneDayServiceJobs.length} job card{urgentOneDayServiceJobs.length !== 1 ? 's' : ''} requiring immediate attention (24-hour deadline)
//                 </p>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {urgentOneDayServiceJobs.map(job => (
//                     <span key={job.id} className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
//                       {job.jobNumber} - {job.customerName}
//                       <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
//                         job.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
//                       }`}>
//                         {job.status === 'PENDING' ? '⏳ Pending' : '🔧 In Progress'}
//                       </span>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={() => setFilterStatus('ONE_DAY_SERVICE')}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//             >
//               View All Urgent Jobs
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Search Bar */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//           <input
//             type="text"
//             placeholder="Search by job card number, customer name, phone, or device type..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm('')}
//               className="absolute inset-y-0 right-0 pr-3 flex items-center"
//             >
//               <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Status Filter Buttons - INCLUDING ONE DAY SERVICE */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex flex-wrap gap-2">
//           {['ALL', 'PENDING', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'DELIVERED', 'CANCELLED', 'ONE_DAY_SERVICE'].map(status => (
//             <button
//               key={status}
//               onClick={() => setFilterStatus(status)}
//               className={getStatusButtonStyle(status)}
//             >
//               <span className="capitalize">{status.toLowerCase().replace(/_/g, ' ')}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Advanced Filters Toggle */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <button
//           onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//           className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
//         >
//           <svg className={`w-5 h-5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//           </svg>
//           <span>Advanced Filters</span>
//           {(filterBrand || filterModel || filterProcessor || filterDeviceCondition) && (
//             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
//               Active
//             </span>
//           )}
//         </button>

//         {/* Advanced Filters */}
//         {showAdvancedFilters && (
//           <div className="mt-4 pt-4 border-t border-gray-200">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {/* Brand Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
//                 <select
//                   value={filterBrand}
//                   onChange={(e) => setFilterBrand(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Brands</option>
//                   {brands.map(brand => (
//                     <option key={brand.id} value={brand.id}>{brand.brandName}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Model Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
//                 <select
//                   value={filterModel}
//                   onChange={(e) => setFilterModel(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Models</option>
//                   {models.map(model => (
//                     <option key={model.id} value={model.id}>{model.modelName}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Processor Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Processor</label>
//                 <select
//                   value={filterProcessor}
//                   onChange={(e) => setFilterProcessor(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Processors</option>
//                   {processors.map(processor => (
//                     <option key={processor.id} value={processor.id}>{processor.processorName}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Device Condition Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Device Condition</label>
//                 <select
//                   value={filterDeviceCondition}
//                   onChange={(e) => setFilterDeviceCondition(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Conditions</option>
//                   {deviceConditions.map(condition => (
//                     <option key={condition.id} value={condition.id}>{condition.conditionName}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Clear Filters Button */}
//             {(filterBrand || filterModel || filterProcessor || filterDeviceCondition) && (
//               <div className="mt-4 flex justify-end">
//                 <button
//                   onClick={clearAdvancedFilters}
//                   className="text-sm text-gray-600 hover:text-gray-800 underline"
//                 >
//                   Clear all filters
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Results Count */}
//       {(searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || filterStatus !== 'ALL') && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-blue-800">
//             Showing {filteredJobCards.length} of {jobCards.length} job card{filteredJobCards.length !== 1 ? 's' : ''}
//             {filterStatus !== 'ALL' && ` with ${filterStatus === 'ONE_DAY_SERVICE' ? 'one day service' : `status "${filterStatus.replace(/_/g, ' ')}"`}`}
//             {searchTerm && ` matching "${searchTerm}"`}
//             {(filterBrand || filterModel || filterProcessor || filterDeviceCondition) && ' with selected filters'}
//           </p>
//         </div>
//       )}

//       {/* One Day Service Summary - Only show when not already filtered by one day service (EXCLUDES DELIVERED) */}
//       {filterStatus !== 'ONE_DAY_SERVICE' && filteredJobCards.some(job => job.oneDayService && job.status !== 'DELIVERED') && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//             </svg>
//             <span className="text-red-800 font-medium">
//               🚨 {filteredJobCards.filter(job => job.oneDayService && job.status !== 'DELIVERED').length} One Day Service job card{filteredJobCards.filter(job => job.oneDayService && job.status !== 'DELIVERED').length !== 1 ? 's' : ''} requiring urgent attention
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Waiting for Parts Summary */}
//       {filteredJobCards.some(job => job.status === 'WAITING_FOR_PARTS') && (
//         <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//             </svg>
//             <span className="text-orange-800 font-medium">
//               📦 {filteredJobCards.filter(job => job.status === 'WAITING_FOR_PARTS').length} job card{filteredJobCards.filter(job => job.status === 'WAITING_FOR_PARTS').length !== 1 ? 's' : ''} waiting for parts
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Waiting for Approval Summary */}
//       {filteredJobCards.some(job => job.status === 'WAITING_FOR_APPROVAL') && (
//         <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//             </svg>
//             <span className="text-purple-800 font-medium">
//               👥 {filteredJobCards.filter(job => job.status === 'WAITING_FOR_APPROVAL').length} job card{filteredJobCards.filter(job => job.status === 'WAITING_FOR_APPROVAL').length !== 1 ? 's' : ''} waiting for customer approval
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Job Cards Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Job Details
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Customer
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Device Info
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Phone
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Estimated Cost
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {visibleJobCards.map(job => (
//                 <tr 
//                   key={job.id} 
//                   className={`transition-colors hover:bg-gray-50 ${
//                     job.oneDayService && (job.status === 'PENDING' || job.status === 'IN_PROGRESS') && job.status !== 'DELIVERED'
//                       ? 'bg-red-50 border-l-4 border-l-red-500'  // Red highlight for urgent One Day Service (not delivered)
//                       : job.oneDayService && job.status !== 'DELIVERED'
//                       ? 'bg-orange-50 border-l-4 border-l-orange-500'  // Orange for non-urgent One Day Service (not delivered)
//                       : ''
//                   } ${
//                     job.status === 'WAITING_FOR_PARTS'
//                       ? 'bg-orange-50 border-l-4 border-l-orange-500'
//                       : job.status === 'WAITING_FOR_APPROVAL'
//                       ? 'bg-purple-50 border-l-4 border-l-purple-500'
//                       : ''
//                   }`}
//                 >
//                   <td className="px-6 py-4">
//                     <div className="text-sm font-bold text-gray-900">{job.jobNumber}</div>
//                     <div className="text-xs text-gray-500 mt-1">
//                       {new Date(job.createdAt).toLocaleDateString()}
//                     </div>
//                     {job.oneDayService && job.status !== 'DELIVERED' && (
//                       <span className={`inline-block mt-1 px-2 py-1 text-xs font-bold rounded-full ${
//                         (job.status === 'PENDING' || job.status === 'IN_PROGRESS')
//                           ? 'bg-red-100 text-red-800'  // Urgent styling
//                           : 'bg-orange-100 text-orange-800'  // Non-urgent styling
//                       }`}>
//                         {(job.status === 'PENDING' || job.status === 'IN_PROGRESS') ? '🚨 ONE DAY' : '⚠️ ONE DAY'}
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm font-semibold text-gray-900">{job.customerName}</div>
//                     <div className="text-xs text-gray-500">{job.customerEmail || 'No email'}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm font-medium text-gray-900">{job.deviceType}</div>
//                     <div className="text-xs text-gray-500">
//                       {job.brand?.brandName || 'No brand'} • {job.model?.modelName || 'No model'}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-gray-900">{job.customerPhone}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm font-bold text-green-600">
//                       Rs.{job.estimatedCost?.toFixed(2) || '0.00'}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center space-x-2">
//                       <span className="text-lg">{getStatusIcon(job.status)}</span>
//                       <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
//                         {job.status.replace(/_/g, ' ')}
//                       </span>
//                     </div>
//                     {job.status === 'WAITING_FOR_PARTS' && (
//                       <div className="text-xs text-orange-600 mt-1">Parts needed</div>
//                     )}
//                     {job.status === 'WAITING_FOR_APPROVAL' && (
//                       <div className="text-xs text-purple-600 mt-1">Awaiting customer</div>
//                     )}
//                   </td>
                  
//                   {/* ✅ UPDATED ACTIONS COLUMN */}
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-2">
//                       <button 
//                         onClick={() => setViewingJobCard(job.id)}
//                         className="text-blue-600 hover:text-blue-900 transition-colors px-2 py-1 rounded hover:bg-blue-50"
//                         title="View Details"
//                       >
//                         View
//                       </button>
//                       <button 
//                         onClick={() => setEditingJobCard(job.id)}
//                         className="text-green-600 hover:text-green-900 transition-colors px-2 py-1 rounded hover:bg-green-50"
//                         title="Edit Job Card"
//                       >
//                         Edit
//                       </button>
                      
//                       {/* ✅ DELETE BUTTON - ONLY FOR ADMIN */}
//                       {isAdmin() && (
//                         <button 
//                           onClick={() => handleDeleteJobCard(job.id, job.jobNumber, job.status)}
//                           className="text-red-600 hover:text-red-900 transition-colors px-2 py-1 rounded hover:bg-red-50 font-medium"
//                           title={
//                             job.status === 'PENDING' || job.status === 'CANCELLED'
//                               ? 'Delete Job Card (Admin Only)'
//                               : `Cannot delete ${job.status} job card`
//                           }
//                           disabled={job.status !== 'PENDING' && job.status !== 'CANCELLED'}
//                         >
//                           Delete
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* See More Button */}
//         {filteredJobCards.length > visibleCount && (
//           <div className="flex justify-center py-4 border-t border-gray-200">
//             <button
//               onClick={loadMore}
//               className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
//             >
//               <span>Load More ({filteredJobCards.length - visibleCount} remaining)</span>
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//               </svg>
//             </button>
//           </div>
//         )}

//         {filteredJobCards.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             <h3 className="text-xl font-medium text-gray-900 mb-2">
//               {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || filterStatus !== 'ALL' ? 'No Job Cards Found' : 'No Job Cards Yet'}
//             </h3>
//             <p className="text-gray-500 mb-4">
//               {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || filterStatus !== 'ALL'
//                 ? 'No job cards match your search criteria. Try adjusting your filters.'
//                 : 'Create your first job card to get started with repair management.'
//               }
//             </p>
//             {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || filterStatus !== 'ALL' ? (
//               <button
//                 onClick={() => {
//                   setSearchTerm('');
//                   setFilterStatus('ALL');
//                   clearAdvancedFilters();
//                 }}
//                 className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
//               >
//                 Clear All Filters
//               </button>
//             ) : (
//               <button
//                 onClick={onCreateNew}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
//               >
//                 Create Your First Job Card
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JobCards;




















import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import { useAuth } from '../auth/AuthProvider'; // ✅ IMPORT useAuth
import JobCardEdit from './JobCardEdit';
import JobCardView from './JobCardView';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const JobCards = ({ onCreateNew }) => {
  const { apiCall } = useApi();
  const { isAdmin } = useAuth(); // ✅ USE useAuth from AuthProvider
  
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [editingJobCard, setEditingJobCard] = useState(null);
  const [viewingJobCard, setViewingJobCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  
  // State for advanced filters
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterProcessor, setFilterProcessor] = useState('');
  const [filterDeviceCondition, setFilterDeviceCondition] = useState('');
  const [filterServiceLocation, setFilterServiceLocation] = useState('');
  const [filterServiceType, setFilterServiceType] = useState('');
  const [filterWarranty, setFilterWarranty] = useState('');
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [deviceConditions, setDeviceConditions] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Service location options
  const serviceLocationOptions = [
    { value: 'WALK_IN', label: 'Walk-in' },
    { value: 'PICKUP', label: 'Pickup' },
    { value: 'ONSITE', label: 'On-site' }
  ];

  // Service type options
  const serviceTypeOptions = [
    { value: 'REPAIR', label: 'Repair' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'REPLACEMENT', label: 'Replacement' },
    { value: 'DIAGNOSTICS', label: 'Diagnostics' }
  ];

  // Warranty period options
  const warrantyOptions = [
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '12 Months' },
    { value: '24', label: '24 Months' },
    { value: 'NO_WARRANTY', label: 'No Warranty' }
  ];

  // ✅ DEBUG: Log admin status
  useEffect(() => {
    console.log('🔐 Admin Status:', isAdmin());
  }, [isAdmin]);

  // Fetch job cards and filter data
  const fetchJobCards = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/jobcards');
      // Sort by creation date - newest first
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setJobCards(sortedData);
    } catch (err) {
      setError('Failed to load job cards');
      console.error(err);
    }
    setLoading(false);
  };

  // Fetch filter options
  const fetchFilterData = async () => {
    try {
      const [brandsData, modelsData, processorsData, conditionsData] = await Promise.all([
        apiCall('/api/brands'),
        apiCall('/api/models'),
        apiCall('/api/processors'),
        apiCall('/api/device-conditions')
      ]);
      setBrands(brandsData || []);
      setModels(modelsData || []);
      setProcessors(processorsData || []);
      setDeviceConditions(conditionsData || []);
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  };

  useEffect(() => {
    fetchJobCards();
    fetchFilterData();
  }, []);

  // Function to add new job card to the top
  const addNewJobCard = (newJobCard) => {
    setJobCards(prev => [newJobCard, ...prev]);
  };

  // ✅ DELETE JOB CARD FUNCTION - UPDATED (Only for PENDING jobs)
  const handleDeleteJobCard = async (jobCardId, jobNumber) => {
    // ✅ Check if user is admin (should already be checked, but keeping as safety)
    if (!isAdmin()) {
      alert('❌ Only admins can delete job cards');
      return;
    }

    const reason = prompt(`🗑️ Enter reason for deleting job card ${jobNumber}:\n\n(This action cannot be undone)`);
    
    if (reason && reason.trim()) {
      try {
        await apiCall(`/api/jobcards/${jobCardId}`, {
          method: 'DELETE',
          body: JSON.stringify({ reason })
        });
        
        showSuccessMessage(`✅ Job card ${jobNumber} deleted successfully!`);
        fetchJobCards();
      } catch (err) {
        setError(err.message || `❌ Failed to delete job card ${jobNumber}`);
        console.error('Delete error:', err);
      }
    }
  };

  const showSuccessMessage = (message) => {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
      WAITING_FOR_PARTS: 'bg-orange-100 text-orange-800 border-orange-300',
      WAITING_FOR_APPROVAL: 'bg-purple-100 text-purple-800 border-purple-300',
      COMPLETED: 'bg-green-100 text-green-800 border-green-300',
      DELIVERED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
      ONE_DAY_SERVICE: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: '⏳',
      IN_PROGRESS: '🔧',
      WAITING_FOR_PARTS: '📦',
      WAITING_FOR_APPROVAL: '👥',
      COMPLETED: '✅',
      DELIVERED: '🚚',
      CANCELLED: '❌',
      ONE_DAY_SERVICE: '🚨',
    };
    return icons[status] || '📄';
  };

  // Filter job cards by status, search term, AND new filters
  const filteredJobCards = jobCards.filter(job => {
    // Handle ONE_DAY_SERVICE filter separately since it's a boolean flag
    if (filterStatus === 'ONE_DAY_SERVICE') {
      if (!job.oneDayService) return false;
    } else {
      const statusMatch = filterStatus === 'ALL' || job.status === filterStatus;
      if (!statusMatch) return false;
    }
    
    const searchMatch = searchTerm === '' || 
      job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.deviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.diagnosisDetails?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.deviceSerial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.fault?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Advanced filter conditions
    const brandMatch = filterBrand === '' || job.brand?.id === parseInt(filterBrand);
    const modelMatch = filterModel === '' || job.model?.id === parseInt(filterModel);
    const processorMatch = filterProcessor === '' || job.processor?.id === parseInt(filterProcessor);
    const conditionMatch = filterDeviceCondition === '' || job.deviceCondition?.id === parseInt(filterDeviceCondition);
    
    // New filter conditions
    const serviceLocationMatch = filterServiceLocation === '' || job.serviceLocation === filterServiceLocation;
    const serviceTypeMatch = filterServiceType === '' || job.serviceType === filterServiceType;
    const warrantyMatch = filterWarranty === '' || 
      (filterWarranty === 'NO_WARRANTY' 
        ? (!job.warrantyPeriod || job.warrantyPeriod === 0)
        : job.warrantyPeriod === parseInt(filterWarranty));

    return searchMatch && brandMatch && modelMatch && processorMatch && conditionMatch && 
           serviceLocationMatch && serviceTypeMatch && warrantyMatch;
  });

  // Get only the visible job cards (first N items)
  const visibleJobCards = filteredJobCards.slice(0, visibleCount);

  // Function to load more job cards
  const loadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  // Function to clear all advanced filters
  const clearAdvancedFilters = () => {
    setFilterBrand('');
    setFilterModel('');
    setFilterProcessor('');
    setFilterDeviceCondition('');
    setFilterServiceLocation('');
    setFilterServiceType('');
    setFilterWarranty('');
  };

  // Status filter button style
  const getStatusButtonStyle = (status) => {
    const isActive = filterStatus === status;
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
    
    if (isActive) {
      const activeStyles = {
        ALL: 'bg-gray-600 text-white shadow-md',
        PENDING: 'bg-yellow-500 text-white shadow-md',
        IN_PROGRESS: 'bg-blue-500 text-white shadow-md',
        WAITING_FOR_PARTS: 'bg-orange-500 text-white shadow-md',
        WAITING_FOR_APPROVAL: 'bg-purple-500 text-white shadow-md',
        COMPLETED: 'bg-green-500 text-white shadow-md',
        DELIVERED: 'bg-indigo-500 text-white shadow-md',
        CANCELLED: 'bg-red-500 text-white shadow-md',
        ONE_DAY_SERVICE: 'bg-red-600 text-white shadow-md',
      };
      return `${baseStyle} ${activeStyles[status]}`;
    }
    
    return `${baseStyle} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  };

  // NEW: Get urgent one day service job cards (only PENDING and IN_PROGRESS - EXCLUDES DELIVERED)
  const getUrgentOneDayServiceJobCards = () => {
    return jobCards.filter(job => 
      job.oneDayService && 
      (job.status === 'PENDING' || job.status === 'IN_PROGRESS') &&
      job.status !== 'DELIVERED' // EXCLUDE DELIVERED JOBS
    );
  };

  const urgentOneDayServiceJobs = getUrgentOneDayServiceJobCards();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (viewingJobCard) {
    return (
      <JobCardView
        jobCardId={viewingJobCard}
        onClose={() => setViewingJobCard(null)}
        onEdit={(id) => {
          setViewingJobCard(null);
          setEditingJobCard(id);
        }}
        onStatusChange={fetchJobCards} // Refresh list when status changes
      />
    );
  }

  if (editingJobCard) {
    return (
      <JobCardEdit
        jobCardId={editingJobCard}
        onSuccess={(updatedJobCard) => {
          setEditingJobCard(null);
          // Update the specific job card in the list
          setJobCards(prev => prev.map(job => 
            job.id === editingJobCard ? updatedJobCard : job
          ));
        }}
        onCancel={() => setEditingJobCard(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Cards</h2>
          <p className="text-gray-600 mt-1">Total: {jobCards.length} job cards</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Job Card</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* URGENT ONE DAY SERVICE ALERT - Only for PENDING and IN_PROGRESS (EXCLUDES DELIVERED) */}
      {urgentOneDayServiceJobs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-lg font-bold text-red-800">
                  🚨 Urgent One Day Service Alert
                </h3>
                <p className="text-red-700">
                  {urgentOneDayServiceJobs.length} job card{urgentOneDayServiceJobs.length !== 1 ? 's' : ''} requiring immediate attention (24-hour deadline)
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {urgentOneDayServiceJobs.map(job => (
                    <span key={job.id} className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                      {job.jobNumber} - {job.customerName}
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                        job.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                      }`}>
                        {job.status === 'PENDING' ? '⏳ Pending' : '🔧 In Progress'}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setFilterStatus('ONE_DAY_SERVICE')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              View All Urgent Jobs
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by job card number, customer name, phone, device type, serial, fault, or diagnosis details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Buttons - INCLUDING ONE DAY SERVICE */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'DELIVERED', 'CANCELLED', 'ONE_DAY_SERVICE'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={getStatusButtonStyle(status)}
            >
              <span className="capitalize">{status.toLowerCase().replace(/_/g, ' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className={`w-5 h-5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Advanced Filters</span>
          {(filterBrand || filterModel || filterProcessor || filterDeviceCondition || 
            filterServiceLocation || filterServiceType || filterWarranty) && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.brandName}</option>
                  ))}
                </select>
              </div>

              {/* Model Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Models</option>
                  {models.map(model => (
                    <option key={model.id} value={model.id}>{model.modelName}</option>
                  ))}
                </select>
              </div>

              {/* Processor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processor</label>
                <select
                  value={filterProcessor}
                  onChange={(e) => setFilterProcessor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Processors</option>
                  {processors.map(processor => (
                    <option key={processor.id} value={processor.id}>{processor.processorName}</option>
                  ))}
                </select>
              </div>

              {/* Device Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Device Condition</label>
                <select
                  value={filterDeviceCondition}
                  onChange={(e) => setFilterDeviceCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Conditions</option>
                  {deviceConditions.map(condition => (
                    <option key={condition.id} value={condition.id}>{condition.conditionName}</option>
                  ))}
                </select>
              </div>
              
              {/* Service Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Location</label>
                <select
                  value={filterServiceLocation}
                  onChange={(e) => setFilterServiceLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  {serviceLocationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Service Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <select
                  value={filterServiceType}
                  onChange={(e) => setFilterServiceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {serviceTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Warranty Period Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Period</label>
                <select
                  value={filterWarranty}
                  onChange={(e) => setFilterWarranty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Warranty</option>
                  {warrantyOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filterBrand || filterModel || filterProcessor || filterDeviceCondition || 
              filterServiceLocation || filterServiceType || filterWarranty) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearAdvancedFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      {(searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || 
        filterServiceLocation || filterServiceType || filterWarranty || filterStatus !== 'ALL') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            Showing {filteredJobCards.length} of {jobCards.length} job card{filteredJobCards.length !== 1 ? 's' : ''}
            {filterStatus !== 'ALL' && ` with ${filterStatus === 'ONE_DAY_SERVICE' ? 'one day service' : `status "${filterStatus.replace(/_/g, ' ')}"`}`}
            {searchTerm && ` matching "${searchTerm}"`}
            {(filterBrand || filterModel || filterProcessor || filterDeviceCondition || 
              filterServiceLocation || filterServiceType || filterWarranty) && ' with selected filters'}
          </p>
        </div>
      )}

      {/* One Day Service Summary - Only show when not already filtered by one day service (EXCLUDES DELIVERED) */}
      {filterStatus !== 'ONE_DAY_SERVICE' && filteredJobCards.some(job => job.oneDayService && job.status !== 'DELIVERED') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-800 font-medium">
              🚨 {filteredJobCards.filter(job => job.oneDayService && job.status !== 'DELIVERED').length} One Day Service job card{filteredJobCards.filter(job => job.oneDayService && job.status !== 'DELIVERED').length !== 1 ? 's' : ''} requiring urgent attention
            </span>
          </div>
        </div>
      )}

      {/* Waiting for Parts Summary */}
      {filteredJobCards.some(job => job.status === 'WAITING_FOR_PARTS') && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-orange-800 font-medium">
              📦 {filteredJobCards.filter(job => job.status === 'WAITING_FOR_PARTS').length} job card{filteredJobCards.filter(job => job.status === 'WAITING_FOR_PARTS').length !== 1 ? 's' : ''} waiting for parts
            </span>
          </div>
        </div>
      )}

      {/* Waiting for Approval Summary */}
      {filteredJobCards.some(job => job.status === 'WAITING_FOR_APPROVAL') && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-purple-800 font-medium">
              👥 {filteredJobCards.filter(job => job.status === 'WAITING_FOR_APPROVAL').length} job card{filteredJobCards.filter(job => job.status === 'WAITING_FOR_APPROVAL').length !== 1 ? 's' : ''} waiting for customer approval
            </span>
          </div>
        </div>
      )}

      {/* Job Cards Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device Serial & Fault
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleJobCards.map(job => (
                <tr 
                  key={job.id} 
                  className={`transition-colors hover:bg-gray-50 ${
                    job.oneDayService && (job.status === 'PENDING' || job.status === 'IN_PROGRESS') && job.status !== 'DELIVERED'
                      ? 'bg-red-50 border-l-4 border-l-red-500'  // Red highlight for urgent One Day Service (not delivered)
                      : job.oneDayService && job.status !== 'DELIVERED'
                      ? 'bg-orange-50 border-l-4 border-l-orange-500'  // Orange for non-urgent One Day Service (not delivered)
                      : ''
                  } ${
                    job.status === 'WAITING_FOR_PARTS'
                      ? 'bg-orange-50 border-l-4 border-l-orange-500'
                      : job.status === 'WAITING_FOR_APPROVAL'
                      ? 'bg-purple-50 border-l-4 border-l-purple-500'
                      : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{job.jobNumber}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                    {job.oneDayService && job.status !== 'DELIVERED' && (
                      <span className={`inline-block mt-1 px-2 py-1 text-xs font-bold rounded-full ${
                        (job.status === 'PENDING' || job.status === 'IN_PROGRESS')
                          ? 'bg-red-100 text-red-800'  // Urgent styling
                          : 'bg-orange-100 text-orange-800'  // Non-urgent styling
                      }`}>
                        {(job.status === 'PENDING' || job.status === 'IN_PROGRESS') ? '🚨 ONE DAY' : '⚠️ ONE DAY'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{job.customerName}</div>
                    <div className="text-xs text-gray-500">{job.customerEmail || 'No email'}</div>
                    <div className="text-xs text-gray-500">{job.customerPhone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{job.deviceType}</div>
                    <div className="text-xs text-gray-500">
                      {job.brand?.brandName || 'No brand'} • {job.model?.modelName || 'No model'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {job.processor?.processorName || 'No processor'}
                    </div>
                    {job.diagnosisDetails && (
                      <div className="text-xs text-gray-600 mt-1 truncate max-w-xs" title={job.diagnosisDetails}>
                        🔍 {job.diagnosisDetails.substring(0, 50)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-medium text-gray-700">Serial Number:</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {job.deviceSerial || 'Not Provided'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-700">Reported Fault:</div>
                        <div className="text-sm text-gray-900">
                          {job.fault || 'No fault reported'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStatusIcon(job.status)}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                        {job.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {job.status === 'WAITING_FOR_PARTS' && (
                      <div className="text-xs text-orange-600 mt-1">Parts needed</div>
                    )}
                    {job.status === 'WAITING_FOR_APPROVAL' && (
                      <div className="text-xs text-purple-600 mt-1">Awaiting customer</div>
                    )}
                  </td>
                  
                  {/* ✅ UPDATED ACTIONS COLUMN - Delete button only for admin AND PENDING jobs */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setViewingJobCard(job.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => setEditingJobCard(job.id)}
                        className="text-green-600 hover:text-green-900 transition-colors px-2 py-1 rounded hover:bg-green-50"
                        title="Edit Job Card"
                      >
                        Edit
                      </button>
                      
                      {/* ✅ DELETE BUTTON - ONLY FOR ADMIN AND PENDING JOB CARDS */}
                      {isAdmin() && job.status === 'PENDING' && (
                        <button 
                          onClick={() => handleDeleteJobCard(job.id, job.jobNumber)}
                          className="text-red-600 hover:text-red-900 transition-colors px-2 py-1 rounded hover:bg-red-50 font-medium"
                          title="Delete Job Card (Admin Only - Pending jobs only)"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* See More Button */}
        {filteredJobCards.length > visibleCount && (
          <div className="flex justify-center py-4 border-t border-gray-200">
            <button
              onClick={loadMore}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>Load More ({filteredJobCards.length - visibleCount} remaining)</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {filteredJobCards.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || 
               filterServiceLocation || filterServiceType || filterWarranty || filterStatus !== 'ALL' 
                ? 'No Job Cards Found' 
                : 'No Job Cards Yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || 
               filterServiceLocation || filterServiceType || filterWarranty || filterStatus !== 'ALL'
                ? 'No job cards match your search criteria. Try adjusting your filters.'
                : 'Create your first job card to get started with repair management.'
              }
            </p>
            {searchTerm || filterBrand || filterModel || filterProcessor || filterDeviceCondition || 
             filterServiceLocation || filterServiceType || filterWarranty || filterStatus !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
                  clearAdvancedFilters();
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={onCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create Your First Job Card
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCards;