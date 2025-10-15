import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';

const JobCards = () => {
  const { apiCall } = useApi();
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchJobCards = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/jobcards');
      setJobCards(data);
    } catch (err) {
      setError('Failed to load job cards');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobCards();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredJobCards = filterStatus === 'ALL' 
    ? jobCards 
    : jobCards.filter(job => job.status === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Job Cards</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
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

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobCards.map(job => (
          <div key={job.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{job.jobNumber}</h3>
                <p className="text-sm text-gray-500">{job.customerName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Device:</span>
                <span className="font-medium text-gray-900">{job.deviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{job.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Cost:</span>
                <span className="font-medium text-green-600">${job.estimatedCost?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 line-clamp-2">{job.faultDescription}</p>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 rounded-lg transition-colors">
                View
              </button>
              <button className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 font-medium py-2 rounded-lg transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredJobCards.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Job Cards Found</h3>
          <p className="text-gray-500">Create your first job card to get started</p>
        </div>
      )}
    </div>
  );
};

export default JobCards;