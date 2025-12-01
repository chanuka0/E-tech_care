// // components/RouteGuard.jsx
// import { useAuth } from '../auth/AuthProvider';

// const RouteGuard = ({ children, requireAdmin = false }) => {
//   const { isAuthenticated, isAdmin, user } = useAuth();

//   console.log('RouteGuard Debug:', {
//     isAuthenticated,
//     isAdmin: isAdmin(),
//     user,
//     requireAdmin
//   });

//   if (!isAuthenticated) {
//     // Redirect to login if not authenticated
//     return null; // The AuthWrapper will handle redirection
//   }

//   if (requireAdmin && !isAdmin()) {
//     // Show access denied for non-admin users trying to access admin-only routes
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//           </svg>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
//           <p className="text-gray-600">You don't have permission to access this page.</p>
//         </div>
//       </div>
//     );
//   }

//   return children;
// };

// export default RouteGuard;