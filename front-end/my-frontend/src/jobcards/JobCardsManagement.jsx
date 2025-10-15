// //import  { useState } from 'react';
// import { useState, useEffect } from 'react';
// import {useApi} from '../services/apiService.jsx'



// const JobCardsManagement = () => {
//   const { apiCall } = useApi();
//   const [jobCards, setJobCards] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchJobCards = async () => {
//     setLoading(true);
//     try {
//       const data = await apiCall('/api/job-cards');
//       setJobCards(data);
//     } catch (err) {
//       console.error('Failed to fetch job cards:', err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchJobCards();
//   }, []);

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Job Cards Management</h2>
//         <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
//           Create Job Card
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-32">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Job Card #
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Customer
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Brand
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Total Amount
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Expected Delivery
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {jobCards.map(jobCard => (
//                   <tr key={jobCard.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {jobCard.jobCardNumber}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">{jobCard.customerName}</div>
//                         <div className="text-sm text-gray-500">{jobCard.contactNumber}</div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {jobCard.laptopBrandName}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         jobCard.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
//                         jobCard.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
//                         jobCard.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
//                         'bg-gray-100 text-gray-800'
//                       }`}>
//                         {jobCard.statusDisplayName}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       ${jobCard.totalAmount?.toFixed(2)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {jobCard.expectedDeliveryDate ? new Date(jobCard.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button className="text-indigo-600 hover:text-indigo-900 mr-4">
//                         View
//                       </button>
//                       <button className="text-green-600 hover:text-green-900">
//                         Edit
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
// export default JobCardsManagement