// src/components/layout/AppHeader.jsx
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronDown,
  Shield,
  FileCheck2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { usePolicy } from '../../context/PolicyContext';

export const AppHeader = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const { policies, selectedPolicyId, setSelectedPolicyId, user } = usePolicy();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Dynamic Page Title & Breadcrumb
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return { title: 'Dashboard Overview', breadcrumb: 'Overview' };
    if (path.includes('/policies/') && path.split('/').length > 3) return { title: 'Policy Details & Document Viewer', breadcrumb: 'Policies / Analysis' };
    if (path.includes('/policies')) return { title: 'My Insurance Policies', breadcrumb: 'Policies' };
    if (path.includes('/assistant')) return { title: 'AI Policy Assistant', breadcrumb: 'AI Assistant' };
    if (path.includes('/calculator')) return { title: 'Out-of-Pocket Cost Estimator', breadcrumb: 'Cost Estimator' };
    if (path.includes('/reports')) return { title: 'Analysis Reports', breadcrumb: 'Reports' };
    if (path.includes('/settings')) return { title: 'Account & Platform Settings', breadcrumb: 'Settings' };
    return { title: 'MediSure AI', breadcrumb: 'App' };
  };

  const { title, breadcrumb } = getPageInfo();

  const mockNotifications = [
    {
      id: 1,
      title: 'Policy Analysis Complete',
      desc: 'Care Supreme Platinum verified with 4 extracted clauses',
      time: '10m ago',
      icon: FileCheck2,
      unread: true,
    },
    {
      id: 2,
      title: 'Room Rent Limit Alert',
      desc: 'Deluxe room category may trigger 15-20% proportionate cut',
      time: '1h ago',
      icon: AlertCircle,
      unread: true,
    },
    {
      id: 3,
      title: 'Policy Renewal Reminder',
      desc: 'Star Comprehensive renews in 120 days',
      time: '1d ago',
      icon: Shield,
      unread: false,
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-borderGray px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-borderGray/60"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-medium">
            <span>MediSure</span>
            <span>/</span>
            <span className="text-forest-700 font-semibold">{breadcrumb}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-forest-900 leading-none mt-0.5 font-heading">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Actions: Policy Selector + Notifications + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Policy Selector Dropdown */}
        <div className="hidden sm:flex items-center gap-2 bg-warmWhite border border-borderGray rounded-xl px-2.5 py-1 text-xs">
          <Shield className="w-3.5 h-3.5 text-forest-700 shrink-0" />
          <span className="text-charcoal-400 font-medium hidden md:inline">Active:</span>
          <select
            value={selectedPolicyId}
            onChange={(e) => setSelectedPolicyId(e.target.value)}
            className="bg-transparent font-semibold text-charcoal-800 focus:outline-none cursor-pointer text-xs pr-1 max-w-[150px] md:max-w-[200px] truncate"
          >
            {policies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.provider} · {p.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-charcoal-500 hover:text-forest-800 hover:bg-forest-50 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-forest-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-borderGray shadow-elevated z-50 p-3"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-borderGray px-2">
                <span className="text-xs font-bold text-charcoal-800 font-heading">Notifications</span>
                <span className="text-[10px] bg-forest-100 text-forest-800 font-bold px-1.5 py-0.5 rounded">2 New</span>
              </div>
              <div className="divide-y divide-borderGray/60 max-h-72 overflow-y-auto mt-1">
                {mockNotifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div key={notif.id} className="p-2.5 hover:bg-warmWhite rounded-xl transition-colors">
                      <div className="flex gap-2.5 items-start">
                        <div className="p-1.5 rounded-lg bg-forest-50 text-forest-700 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="grow min-w-0">
                          <p className="text-xs font-semibold text-charcoal-800">{notif.title}</p>
                          <p className="text-[11px] text-charcoal-400 mt-0.5 line-clamp-2">{notif.desc}</p>
                          <span className="text-[10px] text-sage-500 mt-1 block">{notif.time}</span>
                        </div>
                        {notif.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-forest-600 shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-forest-50 border border-transparent hover:border-forest-100 transition-colors"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover border border-forest-200"
            />
            <span className="text-xs font-semibold text-charcoal-700 hidden sm:inline">
              {user.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-borderGray shadow-elevated z-50 p-2 text-xs"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="px-3 py-2 border-b border-borderGray mb-1">
                <p className="font-bold text-charcoal-800">{user.name}</p>
                <p className="text-[11px] text-charcoal-400 truncate">{user.email}</p>
              </div>
              <Link
                to="/app/settings"
                onClick={() => setShowUserMenu(false)}
                className="block px-3 py-1.5 text-charcoal-600 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition-colors"
              >
                Settings & Preferences
              </Link>
              <Link
                to="/"
                onClick={() => setShowUserMenu(false)}
                className="block px-3 py-1.5 text-charcoal-600 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition-colors"
              >
                Landing Page
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
