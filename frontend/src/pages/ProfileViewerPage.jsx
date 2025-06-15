import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { FaChevronLeft, FaCalendarAlt, FaEye, FaChartLine, FaBuilding, FaFilter } from 'react-icons/fa';

const ProfileViewersPage = () => {
  const [viewers, setViewers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    fetchViewers();
  }, [period, page]);
  
  const fetchViewers = async () => {
    try {
      setLoading(true);
      const response = await api.getProfileViewers({
        limit: 10,
        page,
        period
      });
      
      setViewers(response.viewers || []);
      setPagination(response.pagination || {});
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile viewers:', err);
      setError('Failed to load profile viewers');
      setLoading(false);
    }
  };
  
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setPage(1); // Reset to first page when changing period
  };
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link to="/profile" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <FaChevronLeft className="mr-2" />
          Back to Profile
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Who viewed your profile</h1>
        </div>
        
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaCalendarAlt />
              <span>Showing data for:</span>
              <select
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="day">Last 24 hours</option>
                <option value="week">Last week</option>
                <option value="month">Last month</option>
                <option value="year">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
            
            <Link 
              to="/profile/views/analytics" 
              className="mt-2 sm:mt-0 flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              <FaChartLine className="mr-1" />
              View analytics
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : viewers.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <FaEye className="text-4xl text-gray-400" />
            </div>
            <p>No profile views in this time period</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {viewers.map((viewer, index) => (
              <div key={index} className="px-6 py-4 flex items-center">
                {viewer.anonymous ? (
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
                    <FaEye />
                  </div>
                ) : viewer.limited ? (
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <FaBuilding />
                  </div>
                ) : (
                  <img
                    src={viewer.profilePicture || 'https://via.placeholder.com/40'}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">
                        {viewer.anonymous ? 'Anonymous viewer' : 
                         viewer.limited ? viewer.title : 
                         viewer.deleted ? 'Deleted user' :
                         `${viewer.firstName} ${viewer.lastName}`}
                      </h3>
                      
                      <p className="text-sm text-gray-600">
                        {viewer.anonymous ? 'Profile viewed anonymously' : 
                         viewer.limited ? viewer.description : 
                         viewer.deleted ? 'This user no longer has an account' :
                         viewer.headline || viewer.industry || 'Professional'}
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <div>
                        {new Date(viewer.lastViewed).toLocaleDateString()}
                      </div>
                      <div className="text-right">
                        {viewer.viewCount > 1 && `${viewer.viewCount} views`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${
                  page === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                Previous
              </button>
              
              <span className="text-gray-700">
                Page {page} of {pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.pages}
                className={`px-4 py-2 rounded ${
                  page === pagination.pages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Profile views privacy</h2>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            Control how your profile appears when you view other profiles:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                type="radio"
                id="visibility-full"
                name="visibility"
                value="full"
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                onChange={() => api.updateProfileViewPrivacy('full')}
                defaultChecked
              />
              <label htmlFor="visibility-full" className="ml-3">
                <div className="text-sm font-medium text-gray-700">Full visibility</div>
                <p className="text-xs text-gray-500">
                  Others can see your name and details when you view their profile
                </p>
              </label>
            </div>
            
            <div className="flex items-start">
              <input
                type="radio"
                id="visibility-limited"
                name="visibility"
                value="limited"
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                onChange={() => api.updateProfileViewPrivacy('limited')}
              />
              <label htmlFor="visibility-limited" className="ml-3">
                <div className="text-sm font-medium text-gray-700">Limited visibility</div>
                <p className="text-xs text-gray-500">
                  Others can see only your industry and company (not your name)
                </p>
              </label>
            </div>
            
            <div className="flex items-start">
              <input
                type="radio"
                id="visibility-anonymous"
                name="visibility"
                value="anonymous"
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                onChange={() => api.updateProfileViewPrivacy('anonymous')}
              />
              <label htmlFor="visibility-anonymous" className="ml-3">
                <div className="text-sm font-medium text-gray-700">Anonymous mode</div>
                <p className="text-xs text-gray-500">
                  Others will see you as an anonymous viewer (no details shared)
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewersPage;