// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PolicyProvider } from './context/PolicyContext';
import { LandingPage } from './pages/LandingPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { PolicyDetailsPage } from './pages/PolicyDetailsPage';
import { AssistantPage } from './pages/AssistantPage';
import { CostEstimatorPage } from './pages/CostEstimatorPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <PolicyProvider>
      <BrowserRouter>
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#FFFFFF',
              color: '#202B27',
              border: '1px solid #DCEBE4',
              borderRadius: '1rem',
              boxShadow: '0 10px 25px -5px rgba(23, 76, 60, 0.1)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              padding: '0.75rem 1rem',
            },
            success: {
              iconTheme: {
                primary: '#174C3C',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#E11D48',
                secondary: '#FFFFFF',
              },
            },
          }}
        />

        {/* Application Navigation Routes */}
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated Application Shell */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="policies" element={<PoliciesPage />} />
            <Route path="policies/:policyId" element={<PolicyDetailsPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="calculator" element={<CostEstimatorPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PolicyProvider>
  );
}
