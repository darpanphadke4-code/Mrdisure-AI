// src/components/layout/AppLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { PolicyUploadModal } from '../policies/PolicyUploadModal';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="flex h-screen bg-warmWhite overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <AppSidebar onOpenUpload={() => setIsUploadOpen(true)} />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden shadow-elevated ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AppSidebar
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenUpload={() => {
            setMobileMenuOpen(false);
            setIsUploadOpen(true);
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <AppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ onOpenUpload: () => setIsUploadOpen(true) }} />
          </div>
        </main>
      </div>

      {/* Global Upload Policy Modal */}
      <PolicyUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
};
