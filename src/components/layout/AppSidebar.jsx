// src/components/layout/AppSidebar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Bot,
  Calculator,
  FileBarChart,
  Settings,
  Shield,
  ExternalLink,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { usePolicy } from '../../context/PolicyContext';

export const AppSidebar = ({ onCloseMobile, onOpenUpload }) => {
  const { user, selectedPolicy, policies } = usePolicy();

  const navigation = [
    { name: 'Overview', to: '/app/dashboard', icon: LayoutDashboard },
    { name: 'My Policies', to: '/app/policies', icon: ShieldCheck, badge: policies.length },
    { name: 'AI Assistant', to: '/app/assistant', icon: Bot, isAi: true },
    { name: 'Cost Estimator', to: '/app/calculator', icon: Calculator },
    { name: 'Analysis Reports', to: '/app/reports', icon: FileBarChart },
    { name: 'Settings', to: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-borderGray flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-borderGray">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-white shadow-subtle">
              <Shield className="w-4 h-4 text-softTeal" />
            </div>
            <span className="font-heading font-extrabold text-lg text-forest-900 tracking-tight">
              MediSure<span className="text-forest-500 font-sans text-base ml-0.5">AI</span>
            </span>
          </Link>
        </div>

        {/* Selected Policy Quick Status Card */}
        {selectedPolicy && (
          <div className="mx-4 mt-4 p-3 bg-forest-50/70 border border-forest-100 rounded-xl">
            <div className="flex items-center justify-between text-[11px] font-semibold text-forest-800 mb-1">
              <span className="uppercase tracking-wider">Active Policy</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-semibold text-charcoal-800 truncate" title={selectedPolicy.name}>
              {selectedPolicy.name}
            </div>
            <div className="text-[11px] text-charcoal-400 mt-0.5 flex justify-between">
              <span>Cover: ₹{(selectedPolicy.sumInsured / 100000).toFixed(1)}L</span>
              <Link
                to={`/app/policies/${selectedPolicy.id}`}
                onClick={onCloseMobile}
                className="text-forest-700 font-medium hover:underline inline-flex items-center gap-0.5"
              >
                Clauses <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-3 mt-4 space-y-1">
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">
            Navigation
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-forest-700 text-white font-semibold shadow-sm'
                      : 'text-charcoal-600 hover:text-forest-900 hover:bg-forest-50/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-forest-600'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-forest-800 text-softTeal'
                            : 'bg-forest-100 text-forest-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.isAi && !isActive && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-softTeal text-forest-900">
                        AI
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Action Upload in Sidebar */}
        {onOpenUpload && (
          <div className="px-4 mt-6">
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onOpenUpload();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl bg-forest-50 text-forest-800 border border-forest-200 hover:bg-forest-100 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-forest-700" />
              <span>Upload New Policy</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer User Profile & Back to Landing */}
      <div className="p-4 border-t border-borderGray bg-warmWhite/40">
        <Link
          to="/"
          className="flex items-center justify-between text-xs text-charcoal-400 hover:text-forest-800 mb-3 px-1 py-1 rounded transition-colors"
          title="Return to Public Landing Page"
        >
          <span className="inline-flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </span>
          <span className="text-[10px] bg-charcoal-100 px-1 rounded">Esc</span>
        </Link>

        {/* Profile Card */}
        <Link
          to="/app/settings"
          onClick={onCloseMobile}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-forest-50 transition-colors group"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-forest-200"
          />
          <div className="grow min-w-0">
            <div className="text-xs font-bold text-charcoal-800 truncate group-hover:text-forest-800">
              {user.name}
            </div>
            <div className="text-[11px] text-charcoal-400 truncate">
              {user.email}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-charcoal-300 group-hover:text-forest-700 shrink-0" />
        </Link>
      </div>
    </aside>
  );
};
