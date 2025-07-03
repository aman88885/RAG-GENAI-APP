import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAccountSettings = () => {
    setShowAccountModal(true);
    setIsDropdownOpen(false);
  };

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="bg-blue-600 p-2 rounded-full">
            <User className="h-4 w-4 text-white" />
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={handleAccountSettings}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-3" />
                Account Settings
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Settings Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Profile Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-4 rounded-full">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user.fullName}</h3>
                    <p className="text-blue-600 font-medium">{user.role || 'User'}</p>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Account Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Full Name</span>
                      <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">User ID</span>
                      <span className="text-sm font-mono text-gray-700 bg-gray-200 px-2 py-1 rounded">
                        {user.id}
                      </span>
                    </div>
                    {user.role && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Role</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{user.role}</span>
                      </div>
                    )}
                    {user.isActive !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {(user.createdAt || user.updatedAt) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Account Timeline</h4>
                    <div className="space-y-3">
                      {user.createdAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Created</span>
                          <span className="text-sm text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      {user.updatedAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Last Updated</span>
                          <span className="text-sm text-gray-900">
                            {new Date(user.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;