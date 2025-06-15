import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaEye, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const ProfileViewCard = ({ analytics }) => {
  if (!analytics) return null;
  
  const { totalViews, percentChange } = analytics;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="px-4 py-3 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Who viewed your profile</h3>
          <Link to="/profile/views" className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
            <FaEye className="text-blue-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-800">{totalViews}</p>
            <div className="flex items-center text-sm">
              <span className="text-gray-600">Profile views in the last month</span>
              {percentChange !== 0 && (
                <span className={`ml-2 flex items-center ${
                  percentChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {percentChange > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {Math.abs(percentChange)}%
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <Link 
            to="/profile/views/analytics" 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaChartLine className="mr-2" />
            View analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewCard;