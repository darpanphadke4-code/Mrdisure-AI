// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { usePolicy } from '../context/PolicyContext';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  User,
  Sliders,
  Shield,
  Info,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { user, updateUser, resetAllDemoData } = usePolicy();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'preferences' | 'privacy' | 'about'
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
  });

  const [preferencesForm, setPreferencesForm] = useState({
    currency: user.preferences?.currency || 'INR',
    dateFormat: user.preferences?.dateFormat || 'DD/MM/YYYY',
    emailNotifications: user.preferences?.emailNotifications ?? true,
    claimReminders: user.preferences?.claimReminders ?? true,
    weeklyReportDigest: user.preferences?.weeklyReportDigest ?? false,
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
    });
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    updateUser({
      preferences: preferencesForm,
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'privacy', label: 'Privacy & Storage', icon: Shield },
    { id: 'about', label: 'About MediSure AI', icon: Info },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-forest-900 font-heading">
          Platform Settings
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-400 mt-0.5">
          Manage your simulated user profile, currency displays, notifications, and local browser data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Tabs (Vertical on desktop) */}
        <div className="md:col-span-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-forest-900 hover:bg-white bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-forest-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="md:col-span-9 bg-white p-6 rounded-2xl border border-borderGray shadow-subtle">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="pb-4 border-b border-borderGray">
                <h3 className="text-base font-bold text-forest-900 font-heading">
                  User Profile Information
                </h3>
                <p className="text-xs text-charcoal-400">
                  Simulated policyholder identity for demo reports and dashboard displays
                </p>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-forest-200 shadow-subtle"
                />
                <div>
                  <h4 className="text-sm font-bold text-charcoal-900">{user.name}</h4>
                  <p className="text-xs text-charcoal-400">{user.role}</p>
                  <span className="inline-block mt-1 text-[10px] text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-100 font-medium">
                    Member Since {user.memberSince}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-charcoal-600 font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-charcoal-600 font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-charcoal-600 font-medium mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-borderGray">
                <Button type="submit" variant="primary" leftIcon={Save}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div className="pb-4 border-b border-borderGray">
                <h3 className="text-base font-bold text-forest-900 font-heading">
                  System Preferences
                </h3>
                <p className="text-xs text-charcoal-400">
                  Configure formatting standards and simulated notification reminders
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-charcoal-600 font-medium mb-1">
                    Display Currency
                  </label>
                  <select
                    value={preferencesForm.currency}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, currency: e.target.value })}
                    className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                  >
                    <option value="INR">Indian Rupee (₹ - Lakhs/Crores)</option>
                    <option value="USD">US Dollar ($ - Millions)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-charcoal-600 font-medium mb-1">
                    Date Format
                  </label>
                  <select
                    value={preferencesForm.dateFormat}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, dateFormat: e.target.value })}
                    className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-borderGray text-xs">
                <span className="font-bold text-charcoal-700 block font-heading">
                  Notification Triggers (Simulated)
                </span>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferencesForm.claimReminders}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, claimReminders: e.target.checked })}
                    className="rounded text-forest-700 focus:ring-forest-500"
                  />
                  <span>Remind me when annual policy deductible is fulfilled</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferencesForm.emailNotifications}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, emailNotifications: e.target.checked })}
                    className="rounded text-forest-700 focus:ring-forest-500"
                  />
                  <span>Notify when policy renewal date is within 90 days</span>
                </label>
              </div>

              <div className="flex justify-end pt-4 border-t border-borderGray">
                <Button type="submit" variant="primary" leftIcon={Save}>
                  Save Preferences
                </Button>
              </div>
            </form>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 text-xs text-charcoal-700">
              <div className="pb-4 border-b border-borderGray">
                <h3 className="text-base font-bold text-forest-900 font-heading">
                  Data Privacy & Demo Browser Storage
                </h3>
                <p className="text-xs text-charcoal-400">
                  Transparency regarding local state persistence in this prototype
                </p>
              </div>

              <div className="p-4 bg-warmWhite rounded-xl border border-borderGray space-y-2">
                <h5 className="font-bold text-forest-900">Where is my data stored?</h5>
                <p className="leading-relaxed">
                  In this current prototype phase, all uploaded demo policies, conversation sessions, and generated reports are stored strictly in your browser&apos;s <code>localStorage</code>. No real medical records or insurance documents are transmitted to external servers.
                </p>
              </div>

              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold font-heading">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Reset All Demo Data</span>
                </div>
                <p className="text-charcoal-600 leading-relaxed">
                  Resetting demo data will clear all uploaded test policies, chat inquiries, and saved simulation reports, returning the workspace to its default pre-configured benchmark state.
                </p>
                <div>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={RotateCcw}
                    onClick={() => setShowResetConfirm(true)}
                  >
                    Reset Demo State
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-5 text-xs text-charcoal-700">
              <div className="pb-4 border-b border-borderGray">
                <h3 className="text-base font-bold text-forest-900 font-heading">
                  About MediSure AI
                </h3>
                <p className="text-xs text-charcoal-400">
                  AI-Powered Medical Insurance Clause Extraction & Expense Estimator
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-warmWhite rounded-xl border border-borderGray">
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Version</span>
                  <span className="font-bold text-forest-900 text-sm">v1.0.0 (Phase 1 Frontend Prototype)</span>
                </div>
                <div className="p-3.5 bg-warmWhite rounded-xl border border-borderGray">
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Architecture</span>
                  <span className="font-bold text-forest-900 text-sm">React + Tailwind + Mock Services</span>
                </div>
              </div>

              <div className="space-y-2 leading-relaxed">
                <h5 className="font-bold text-forest-900">Future Integration Roadmap:</h5>
                <ul className="list-disc pl-5 space-y-1 text-charcoal-600">
                  <li><strong>FastAPI Backend:</strong> Real-time OCR document ingestion and clause vectorization.</li>
                  <li><strong>PostgreSQL:</strong> Multi-tenant policy storage with granular role-based access.</li>
                  <li><strong>AI Agent Integration:</strong> Grounded LLM reasoning with citation verification against IRDAI guidelines.</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Disclaimer:</strong> MediSure AI is designed as an advisory insurance literacy and out-of-pocket calculation tool. All insurance claims and approvals are governed by the policyholder&apos;s contract with their respective insurance underwriter and designated Third Party Administrator (TPA).
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetAllDemoData}
        title="Reset All Demo Data"
        message="This will reset all policies, chat sessions, and saved reports back to the initial sample state. Are you sure you want to proceed?"
        confirmText="Yes, Reset Everything"
      />
    </div>
  );
};
