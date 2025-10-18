import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Plus, BarChart3, Settings, CreditCard, User, LogOut,
  ChevronLeft, ChevronRight, Home, FileText, Crown, Key,
  HelpCircle, Bell, Search, Menu, X, Zap, LayoutTemplate
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Topbar } from './ui/Topbar';

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
    { path: '/journeys', label: 'My Journeys', icon: Map },
    { path: '/templates', label: 'Templates', icon: LayoutTemplate },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  const bottomItems = [
    { path: '/account', label: 'Account', icon: Crown },
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

      {/* Sidebar - Clean Figma AI Design */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          bg-white border-r border-gray-200 shadow-soft
          flex flex-col transition-all duration-300
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Scrollable content within fixed sidebar */}
        <div className={`h-full flex flex-col ${isSidebarCollapsed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {/* Logo Section */}
          <div className={`${isSidebarCollapsed ? 'p-4' : 'p-6'} border-b border-gray-100`}>
            <div className="flex items-center justify-between">
            <Link to="/dashboard" className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
              <div className="relative">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Journi
                  </h1>
                  <p className="text-xs text-gray-500">Journey Mapper</p>
                </div>
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
          <div className={`bg-gray-50 rounded-lg p-3 ${isSidebarCollapsed ? 'p-2' : ''}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.plan_type === 'free' ? 'Free Plan' : 'Pro Plan'}
                  </p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && user?.plan_type === 'free' && (
              <button
                onClick={() => navigate('/upgrade')}
                className="w-full mt-3 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-green-50 text-green-600 font-medium border border-green-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  ${isSidebarCollapsed ? 'justify-center px-3' : ''}
                `}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive(item.path) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {!isSidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-green-50 text-green-600 font-medium border border-green-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  ${isSidebarCollapsed ? 'justify-center px-3' : ''}
                `}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive(item.path) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {!isSidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}

          <button
            onClick={handleSignOut}
            className={`
              group w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
              text-gray-600 hover:bg-red-50 hover:text-red-600 hover:shadow-soft
              ${isSidebarCollapsed ? 'justify-center px-3' : ''}
            `}
            title={isSidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className={`w-5 h-5 flex-shrink-0 transition-colors ${
              'text-gray-400 group-hover:text-red-600'
            }`} />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
        </div> {/* End scrollable container */}
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Navigation Bar */}
        <Topbar
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
        />

        {/* Reopen Button (only when sidebar is collapsed) */}
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="fixed left-4 top-20 z-40 p-2 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            title="Open Sidebar"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {React.cloneElement(children as React.ReactElement, { searchQuery })}
        </main>
      </div>
    </div>
  );
}
