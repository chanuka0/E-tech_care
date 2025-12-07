// import { useState, useEffect, useRef } from 'react';
// import SockJS from 'sockjs-client';
// import { Stomp } from '@stomp/stompjs';

// // Notification Bell Component
// const NotificationBell = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const dropdownRef = useRef(null);
//   const stompClient = useRef(null);

//   const API_URL = 'http://localhost:8081';
//   const token = localStorage.getItem('token');

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/api/notifications`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setNotifications(data);
//         const unread = data.filter(n => !n.isRead).length;
//         setUnreadCount(unread);
//       }
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//     }
//     setLoading(false);
//   };

//   // Mark notification as read
//   const markAsRead = async (notificationId) => {
//     try {
//       const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         // Update local state
//         setNotifications(prev =>
//           prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
//         );
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }
//     } catch (error) {
//       console.error('Error marking notification as read:', error);
//     }
//   };

//   // Mark all as read
//   const markAllAsRead = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/notifications/read-all`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
//         setUnreadCount(0);
//       }
//     } catch (error) {
//       console.error('Error marking all as read:', error);
//     }
//   };

//   // WebSocket connection
//   useEffect(() => {
//     fetchNotifications();

//     // Connect to WebSocket
//     const socket = new SockJS(`${API_URL}/ws`);
//     const client = Stomp.over(socket);

//     client.connect(
//       {},
//       () => {
//         console.log('✅ WebSocket Connected');

//         // Subscribe to notifications
//         client.subscribe('/topic/notifications', (message) => {
//           const notification = JSON.parse(message.body);
//           console.log('🔔 New notification:', notification);

//           // Add new notification to the list
//           setNotifications(prev => [notification, ...prev]);
//           setUnreadCount(prev => prev + 1);

//           // Show browser notification if permission granted
//           if (Notification.permission === 'granted') {
//             new Notification('New Notification', {
//               body: notification.message,
//               icon: '/notification-icon.png',
//             });
//           }
//         });

//         // Subscribe to read updates
//         client.subscribe('/topic/notifications/read', (message) => {
//           const notificationId = JSON.parse(message.body);
//           setNotifications(prev =>
//             prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
//           );
//         });

//         // Subscribe to read all updates
//         client.subscribe('/topic/notifications/read-all', () => {
//           setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
//           setUnreadCount(0);
//         });
//       },
//       (error) => {
//         console.error('❌ WebSocket connection error:', error);
//       }
//     );

//     stompClient.current = client;

//     // Request notification permission
//     if (Notification.permission === 'default') {
//       Notification.requestPermission();
//     }

//     return () => {
//       if (stompClient.current) {
//         stompClient.current.disconnect();
//       }
//     };
//   }, []);

//   // Get notification icon based on type
//   const getNotificationIcon = (type) => {
//     const icons = {
//       LOW_STOCK: '📦',
//       PENDING_JOB: '⏳',
//       DAMAGED_ITEM: '⚠️',
//       INVOICE_CREATED: '📄',
//       JOB_CANCELLED: '❌',
//       STOCK_UPDATE: '📊',
//       ITEM_REMOVED: '🗑️',
//       INVOICE_DELETED: '🚫',
//       JOB_UPDATED: '🔄',
//       DELIVERED: '✅',
//       PAYMENT_RECEIVED: '💰',
//       JOB_STATUS_CHANGED: '🔔',
//       JOB_COMPLETED: '✨',
//     };
//     return icons[type] || '🔔';
//   };

//   // Get notification color based on type
//   const getNotificationColor = (type) => {
//     const colors = {
//       LOW_STOCK: 'text-orange-600 bg-orange-50',
//       PENDING_JOB: 'text-yellow-600 bg-yellow-50',
//       DAMAGED_ITEM: 'text-red-600 bg-red-50',
//       INVOICE_CREATED: 'text-blue-600 bg-blue-50',
//       JOB_CANCELLED: 'text-red-600 bg-red-50',
//       STOCK_UPDATE: 'text-green-600 bg-green-50',
//       ITEM_REMOVED: 'text-gray-600 bg-gray-50',
//       INVOICE_DELETED: 'text-red-600 bg-red-50',
//       JOB_UPDATED: 'text-blue-600 bg-blue-50',
//       DELIVERED: 'text-green-600 bg-green-50',
//       PAYMENT_RECEIVED: 'text-green-600 bg-green-50',
//       JOB_STATUS_CHANGED: 'text-purple-600 bg-purple-50',
//       JOB_COMPLETED: 'text-green-600 bg-green-50',
//     };
//     return colors[type] || 'text-gray-600 bg-gray-50';
//   };

//   // Format time ago
//   const formatTimeAgo = (date) => {
//     const now = new Date();
//     const notificationDate = new Date(date);
//     const diffInSeconds = Math.floor((now - notificationDate) / 1000);

//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
//     return `${Math.floor(diffInSeconds / 86400)}d ago`;
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* Notification Bell Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
//       >
//         <svg
//           className="w-6 h-6 text-gray-600"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//           />
//         </svg>
//         {unreadCount > 0 && (
//           <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
//             {unreadCount > 9 ? '9+' : unreadCount}
//           </span>
//         )}
//       </button>

//       {/* Notification Dropdown */}
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
//           {/* Header */}
//           <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Notifications
//               {unreadCount > 0 && (
//                 <span className="ml-2 text-sm text-gray-500">
//                   ({unreadCount} unread)
//                 </span>
//               )}
//             </h3>
//             {unreadCount > 0 && (
//               <button
//                 onClick={markAllAsRead}
//                 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Mark all as read
//               </button>
//             )}
//           </div>

//           {/* Notifications List */}
//           <div className="overflow-y-auto flex-1">
//             {loading ? (
//               <div className="flex justify-center items-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 <svg
//                   className="w-12 h-12 mx-auto mb-3 text-gray-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
//                   />
//                 </svg>
//                 <p className="font-medium">No notifications</p>
//                 <p className="text-sm">You're all caught up!</p>
//               </div>
//             ) : (
//               <div className="divide-y divide-gray-100">
//                 {notifications.map((notification) => (
//                   <div
//                     key={notification.id}
//                     className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
//                       !notification.isRead ? 'bg-blue-50' : ''
//                     }`}
//                     onClick={() => !notification.isRead && markAsRead(notification.id)}
//                   >
//                     <div className="flex items-start space-x-3">
//                       {/* Icon */}
//                       <div
//                         className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
//                           notification.type
//                         )}`}
//                       >
//                         <span className="text-xl">
//                           {getNotificationIcon(notification.type)}
//                         </span>
//                       </div>

//                       {/* Content */}
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900">
//                           {notification.type.replace(/_/g, ' ')}
//                         </p>
//                         <p className="text-sm text-gray-600 mt-1">
//                           {notification.message}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                           {formatTimeAgo(notification.createdAt)}
//                         </p>
//                       </div>

//                       {/* Unread indicator */}
//                       {!notification.isRead && (
//                         <div className="flex-shrink-0">
//                           <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           {notifications.length > 0 && (
//             <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
//               <button
//                 onClick={fetchNotifications}
//                 className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Refresh Notifications
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationBell;


// import { useState, useEffect, useRef } from 'react';

// // Notification Bell Component - Using Native WebSocket
// const NotificationBell = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [wsConnected, setWsConnected] = useState(false);
//   const dropdownRef = useRef(null);
//   const wsRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);

//   const API_URL = 'http://localhost:8081';
//   const WS_URL = 'ws://localhost:8081/ws';
//   const token = localStorage.getItem('token');

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Fetch notifications from API
//   const fetchNotifications = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/api/notifications`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setNotifications(data);
//         const unread = data.filter(n => !n.isRead).length;
//         setUnreadCount(unread);
//       }
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//     }
//     setLoading(false);
//   };

//   // Mark notification as read
//   const markAsRead = async (notificationId) => {
//     try {
//       const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setNotifications(prev =>
//           prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
//         );
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }
//     } catch (error) {
//       console.error('Error marking notification as read:', error);
//     }
//   };

//   // Mark all as read
//   const markAllAsRead = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/notifications/read-all`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
//         setUnreadCount(0);
//       }
//     } catch (error) {
//       console.error('Error marking all as read:', error);
//     }
//   };

//   // WebSocket connection using STOMP protocol manually
//   const connectWebSocket = () => {
//     try {
//       // Connect to SockJS endpoint
//       const ws = new WebSocket(`${WS_URL}/websocket`);
      
//       ws.onopen = () => {
//         console.log('✅ WebSocket Connected');
//         setWsConnected(true);
        
//         // Send STOMP CONNECT frame
//         const connectFrame = 'CONNECT\naccept-version:1.0,1.1,2.0\n\n\x00';
//         ws.send(connectFrame);
//       };

//       ws.onmessage = (event) => {
//         const message = event.data;
        
//         // Handle STOMP CONNECTED frame
//         if (message.startsWith('CONNECTED')) {
//           console.log('✅ STOMP Connected');
          
//           // Subscribe to notifications topic
//           const subscribeFrame = 'SUBSCRIBE\nid:sub-0\ndestination:/topic/notifications\n\n\x00';
//           ws.send(subscribeFrame);
          
//           // Subscribe to read notifications
//           const subscribeReadFrame = 'SUBSCRIBE\nid:sub-1\ndestination:/topic/notifications/read\n\n\x00';
//           ws.send(subscribeReadFrame);
          
//           // Subscribe to read all notifications
//           const subscribeReadAllFrame = 'SUBSCRIBE\nid:sub-2\ndestination:/topic/notifications/read-all\n\n\x00';
//           ws.send(subscribeReadAllFrame);
//         }
        
//         // Handle STOMP MESSAGE frame
//         if (message.startsWith('MESSAGE')) {
//           const lines = message.split('\n');
//           const destination = lines.find(l => l.startsWith('destination:'))?.split(':')[1];
//           const bodyStart = message.indexOf('\n\n') + 2;
//           const bodyEnd = message.lastIndexOf('\x00');
//           const body = message.substring(bodyStart, bodyEnd);
          
//           try {
//             if (destination === '/topic/notifications') {
//               const notification = JSON.parse(body);
//               console.log('🔔 New notification:', notification);
              
//               setNotifications(prev => [notification, ...prev]);
//               setUnreadCount(prev => prev + 1);
              
//               // Show browser notification
//               if (Notification.permission === 'granted') {
//                 new Notification('New Notification', {
//                   body: notification.message,
//                   icon: '/notification-icon.png',
//                 });
//               }
//             } else if (destination === '/topic/notifications/read') {
//               const notificationId = JSON.parse(body);
//               setNotifications(prev =>
//                 prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
//               );
//             } else if (destination === '/topic/notifications/read-all') {
//               setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
//               setUnreadCount(0);
//             }
//           } catch (err) {
//             console.error('Error parsing notification:', err);
//           }
//         }
//       };

//       ws.onerror = (error) => {
//         console.error('❌ WebSocket error:', error);
//         setWsConnected(false);
//       };

//       ws.onclose = () => {
//         console.log('❌ WebSocket disconnected');
//         setWsConnected(false);
        
//         // Attempt to reconnect after 5 seconds
//         reconnectTimeoutRef.current = setTimeout(() => {
//           console.log('🔄 Attempting to reconnect...');
//           connectWebSocket();
//         }, 5000);
//       };

//       wsRef.current = ws;
//     } catch (error) {
//       console.error('Error connecting to WebSocket:', error);
//     }
//   };

//   // Initialize
//   useEffect(() => {
//     fetchNotifications();
//     connectWebSocket();

//     // Request notification permission
//     if (Notification.permission === 'default') {
//       Notification.requestPermission();
//     }

//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Get notification icon
//   const getNotificationIcon = (type) => {
//     const icons = {
//       LOW_STOCK: '📦',
//       PENDING_JOB: '⏳',
//       DAMAGED_ITEM: '⚠️',
//       INVOICE_CREATED: '📄',
//       JOB_CANCELLED: '❌',
//       STOCK_UPDATE: '📊',
//       ITEM_REMOVED: '🗑️',
//       INVOICE_DELETED: '🚫',
//       JOB_UPDATED: '🔄',
//       DELIVERED: '✅',
//       PAYMENT_RECEIVED: '💰',
//       JOB_STATUS_CHANGED: '🔔',
//       JOB_COMPLETED: '✨',
//     };
//     return icons[type] || '🔔';
//   };

//   // Get notification color
//   const getNotificationColor = (type) => {
//     const colors = {
//       LOW_STOCK: 'text-orange-600 bg-orange-50',
//       PENDING_JOB: 'text-yellow-600 bg-yellow-50',
//       DAMAGED_ITEM: 'text-red-600 bg-red-50',
//       INVOICE_CREATED: 'text-blue-600 bg-blue-50',
//       JOB_CANCELLED: 'text-red-600 bg-red-50',
//       STOCK_UPDATE: 'text-green-600 bg-green-50',
//       ITEM_REMOVED: 'text-gray-600 bg-gray-50',
//       INVOICE_DELETED: 'text-red-600 bg-red-50',
//       JOB_UPDATED: 'text-blue-600 bg-blue-50',
//       DELIVERED: 'text-green-600 bg-green-50',
//       PAYMENT_RECEIVED: 'text-green-600 bg-green-50',
//       JOB_STATUS_CHANGED: 'text-purple-600 bg-purple-50',
//       JOB_COMPLETED: 'text-green-600 bg-green-50',
//     };
//     return colors[type] || 'text-gray-600 bg-gray-50';
//   };

//   // Format time ago
//   const formatTimeAgo = (date) => {
//     const now = new Date();
//     const notificationDate = new Date(date);
//     const diffInSeconds = Math.floor((now - notificationDate) / 1000);

//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
//     return `${Math.floor(diffInSeconds / 86400)}d ago`;
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* Notification Bell Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
//       >
//         <svg
//           className="w-6 h-6 text-gray-600"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//           />
//         </svg>
//         {unreadCount > 0 && (
//           <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
//             {unreadCount > 9 ? '9+' : unreadCount}
//           </span>
//         )}
        
//         {/* WebSocket connection indicator */}
//         {wsConnected && (
//           <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
//         )}
//       </button>

//       {/* Notification Dropdown */}
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
//           {/* Header */}
//           <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Notifications
//               {unreadCount > 0 && (
//                 <span className="ml-2 text-sm text-gray-500">
//                   ({unreadCount} unread)
//                 </span>
//               )}
//             </h3>
//             {unreadCount > 0 && (
//               <button
//                 onClick={markAllAsRead}
//                 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Mark all as read
//               </button>
//             )}
//           </div>

//           {/* Notifications List */}
//           <div className="overflow-y-auto flex-1">
//             {loading ? (
//               <div className="flex justify-center items-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 <svg
//                   className="w-12 h-12 mx-auto mb-3 text-gray-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
//                   />
//                 </svg>
//                 <p className="font-medium">No notifications</p>
//                 <p className="text-sm">You're all caught up!</p>
//               </div>
//             ) : (
//               <div className="divide-y divide-gray-100">
//                 {notifications.map((notification) => (
//                   <div
//                     key={notification.id}
//                     className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
//                       !notification.isRead ? 'bg-blue-50' : ''
//                     }`}
//                     onClick={() => !notification.isRead && markAsRead(notification.id)}
//                   >
//                     <div className="flex items-start space-x-3">
//                       {/* Icon */}
//                       <div
//                         className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
//                           notification.type
//                         )}`}
//                       >
//                         <span className="text-xl">
//                           {getNotificationIcon(notification.type)}
//                         </span>
//                       </div>

//                       {/* Content */}
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900">
//                           {notification.type.replace(/_/g, ' ')}
//                         </p>
//                         <p className="text-sm text-gray-600 mt-1">
//                           {notification.message}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                           {formatTimeAgo(notification.createdAt)}
//                         </p>
//                       </div>

//                       {/* Unread indicator */}
//                       {!notification.isRead && (
//                         <div className="flex-shrink-0">
//                           <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           {notifications.length > 0 && (
//             <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
//               <button
//                 onClick={fetchNotifications}
//                 className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Refresh Notifications
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationBell;

import { useState, useEffect, useRef } from 'react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const dropdownRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  const API_URL = 'http://localhost:8081';
  const WS_URL = 'ws://localhost:8081/ws';
  const token = localStorage.getItem('token');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        const unread = data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Cleanup WebSocket
  const cleanupWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setWsConnected(false);
  };

  // WebSocket connection using STOMP protocol
  const connectWebSocket = () => {
    // Prevent duplicate connections
    if (isConnectingRef.current || wsRef.current) {
      return;
    }

    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(`${WS_URL}/websocket`);
      
      ws.onopen = () => {
        console.log('✅ WebSocket Connected');
        isConnectingRef.current = false;
        setWsConnected(true);
        
        // Send STOMP CONNECT frame
        const connectFrame = 'CONNECT\naccept-version:1.0,1.1,2.0\n\n\x00';
        ws.send(connectFrame);
      };

      ws.onmessage = (event) => {
        const message = event.data;
        
        // Handle STOMP CONNECTED frame
        if (message.startsWith('CONNECTED')) {
          console.log('✅ STOMP Connected');
          
          // Subscribe to notifications topic
          const subscribeFrame = 'SUBSCRIBE\nid:sub-0\ndestination:/topic/notifications\n\n\x00';
          ws.send(subscribeFrame);
          
          // Subscribe to read notifications
          const subscribeReadFrame = 'SUBSCRIBE\nid:sub-1\ndestination:/topic/notifications/read\n\n\x00';
          ws.send(subscribeReadFrame);
          
          // Subscribe to read all notifications
          const subscribeReadAllFrame = 'SUBSCRIBE\nid:sub-2\ndestination:/topic/notifications/read-all\n\n\x00';
          ws.send(subscribeReadAllFrame);
        }
        
        // Handle STOMP MESSAGE frame
        if (message.startsWith('MESSAGE')) {
          const lines = message.split('\n');
          const destination = lines.find(l => l.startsWith('destination:'))?.split(':')[1];
          const bodyStart = message.indexOf('\n\n') + 2;
          const bodyEnd = message.lastIndexOf('\x00');
          const body = message.substring(bodyStart, bodyEnd);
          
          try {
            if (destination === '/topic/notifications') {
              const notification = JSON.parse(body);
              console.log('🔔 New notification:', notification);
              
              // Check if notification already exists to prevent duplicates
              setNotifications(prev => {
                const exists = prev.some(n => n.id === notification.id);
                if (exists) {
                  console.log('⚠️ Duplicate notification received, skipping:', notification.id);
                  return prev;
                }
                return [notification, ...prev];
              });
              
              setUnreadCount(prev => prev + 1);
              
              // Show browser notification
              if (Notification.permission === 'granted') {
                new Notification('New Notification', {
                  body: notification.message,
                  icon: '/notification-icon.png',
                });
              }
            } else if (destination === '/topic/notifications/read') {
              const notificationId = JSON.parse(body);
              setNotifications(prev =>
                prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
              );
            } else if (destination === '/topic/notifications/read-all') {
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
              setUnreadCount(0);
            }
          } catch (err) {
            console.error('Error parsing notification:', err);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        isConnectingRef.current = false;
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        isConnectingRef.current = false;
        setWsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      isConnectingRef.current = false;
    }
  };

  // Initialize
  useEffect(() => {
    fetchNotifications();
    connectWebSocket();

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      cleanupWebSocket();
    };
  }, []);

  // Get notification icon
  const getNotificationIcon = (type) => {
    const icons = {
      LOW_STOCK: '📦',
      PENDING_JOB: '⏳',
      DAMAGED_ITEM: '⚠️',
      INVOICE_CREATED: '📄',
      JOB_CANCELLED: '❌',
      STOCK_UPDATE: '📊',
      ITEM_REMOVED: '🗑️',
      INVOICE_DELETED: '🚫',
      JOB_UPDATED: '🔄',
      DELIVERED: '✅',
      PAYMENT_RECEIVED: '💰',
      JOB_STATUS_CHANGED: '🔔',
      JOB_COMPLETED: '✨',
    };
    return icons[type] || '🔔';
  };

  // Get notification color
  const getNotificationColor = (type) => {
    const colors = {
      LOW_STOCK: 'text-orange-600 bg-orange-50',
      PENDING_JOB: 'text-yellow-600 bg-yellow-50',
      DAMAGED_ITEM: 'text-red-600 bg-red-50',
      INVOICE_CREATED: 'text-blue-600 bg-blue-50',
      JOB_CANCELLED: 'text-red-600 bg-red-50',
      STOCK_UPDATE: 'text-green-600 bg-green-50',
      ITEM_REMOVED: 'text-gray-600 bg-gray-50',
      INVOICE_DELETED: 'text-red-600 bg-red-50',
      JOB_UPDATED: 'text-blue-600 bg-blue-50',
      DELIVERED: 'text-green-600 bg-green-50',
      PAYMENT_RECEIVED: 'text-green-600 bg-green-50',
      JOB_STATUS_CHANGED: 'text-purple-600 bg-purple-50',
      JOB_COMPLETED: 'text-green-600 bg-green-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* WebSocket connection indicator */}
        {wsConnected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        <span className="text-xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={fetchNotifications}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Refresh Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;