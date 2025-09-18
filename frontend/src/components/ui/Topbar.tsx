import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Bell, Plus, Menu, ChevronRight,
  Settings, User, LogOut
} from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

interface TopbarProps {
  onMenuClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  user?: {
    name?: string;
    email?: string;
    plan_type?: string;
  };
}

export function Topbar({
  onMenuClick,
  searchQuery = '',
  onSearchChange,
  user
}: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchFocus = () => {
    if (location.pathname !== '/journeys') {
      navigate('/journeys');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
    if (location.pathname !== '/journeys' && e.target.value.trim()) {
      navigate('/journeys');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 backdrop-blur-lg bg-opacity-95">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search journeys..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                className="pl-10 pr-4 py-2.5 w-48 sm:w-64 lg:w-96 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
                <ChevronRight className="w-4 h-4 transition-transform" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-hard border border-gray-200 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">
                      {user?.name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                      {user?.plan_type === 'free' ? 'Free Plan' : 'Pro Plan'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </button>

                    <button
                      onClick={() => {
                        navigate('/upgrade');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      Upgrade Plan
                    </button>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {
                        // Handle sign out
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* New Journey Button */}
            <PrimaryButton
              onClick={() => navigate('/create')}
              size="md"
              className="hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Journey
            </PrimaryButton>
          </div>
        </div>
      </div>
    </header>
  );
}