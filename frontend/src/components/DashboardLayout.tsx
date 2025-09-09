import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Plus, BarChart3, Settings, CreditCard, User, LogOut, 
  ChevronLeft, ChevronRight, Home, FileText, Crown, Key,
  HelpCircle, Bell, Search, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/create', label: 'Create Journey', icon: Plus },
    { path: '/journeys', label: 'My Journeys', icon: Map },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const bottomItems = [
    { path: '/upgrade', label: 'Upgrade Plan', icon: Crown },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed position */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          bg-white border-r border-gray-200 shadow-xl lg:shadow-none
          flex flex-col transition-all duration-300
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarCollapsed ? 'w-20' : 'w-72'}
        `}
      >
        {/* Scrollable content within fixed sidebar */}
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Sidebar Header */}
          <div className={`${isSidebarCollapsed ? 'p-3' : 'p-6'} border-b border-gray-100`}>
            <div className="flex items-center justify-between">
            <Link to="/dashboard" className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Map className="w-6 h-6 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Journi
                </span>
              )}
            </Link>
            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:block p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className={`p-4 border-b border-gray-100 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 ${isSidebarCollapsed ? 'p-2' : ''}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-600">{user?.plan_type === 'free' ? 'Free Plan' : 'Pro Plan'}</p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && user?.plan_type === 'free' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/upgrade')}
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                Upgrade to Pro
              </motion.button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  ${isSidebarCollapsed ? 'justify-center px-2' : ''}
                `}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Spacer to push bottom items down */}
        <div className="flex-1"></div>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  ${isSidebarCollapsed ? 'justify-center px-2' : ''}
                `}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
          
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
              text-gray-600 hover:bg-red-50 hover:text-red-600
              ${isSidebarCollapsed ? 'justify-center px-2' : ''}
            `}
            title={isSidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
        </div> {/* End scrollable container */}
      </aside>

      {/* Main Content Area - Add margin to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                {/* Desktop expand button when sidebar is collapsed */}
                {isSidebarCollapsed && (
                  <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="hidden lg:flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all group"
                  >
<ChevronRight className="w-5 h-5 text-black group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search journeys..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      // Navigate to journeys page if not already there
                      if (location.pathname !== '/journeys' && e.target.value.trim()) {
                        navigate('/journeys');
                      }
                    }}
                    onFocus={() => {
                      // Navigate to journeys page when focusing search
                      if (location.pathname !== '/journeys') {
                        navigate('/journeys');
                      }
                    }}
                    className="pl-10 pr-4 py-2 w-64 lg:w-96 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center space-x-3">
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/create')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Journey</span>
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Pass search query as prop */}
        <main className="flex-1 p-6">
          {React.cloneElement(children as React.ReactElement, { searchQuery })}
        </main>
      </div>
    </div>
  );
}
