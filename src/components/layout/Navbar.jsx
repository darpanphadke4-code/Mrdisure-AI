// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, ArrowRight, Activity } from 'lucide-react';
import { Button } from '../common/Button';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Preview", href: "#preview" },
    { label: "FAQs", href: "#faqs" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-warmWhite/85 backdrop-blur-md border-b border-borderGray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-subtle group-hover:bg-forest-800 transition-colors">
              <Shield className="w-5 h-5 text-softTeal" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-tight text-forest-900">
                  MediSure<span className="text-forest-500 font-sans font-semibold text-lg ml-0.5">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-forest-100 text-forest-800 border border-forest-200">
                  Prototype
                </span>
              </div>
              <span className="text-[10px] text-charcoal-400 font-medium hidden sm:inline -mt-1">
                AI Medical Insurance Analyzer
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-charcoal-600 hover:text-forest-800 hover:bg-forest-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/dashboard')}
            >
              Sign In (Demo)
            </Button>
            <Button
              variant="primary"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/app/dashboard')}
            >
              Launch Platform
            </Button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-borderGray"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-borderGray bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-forest-50 hover:text-forest-800"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-borderGray flex flex-col gap-2">
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/app/dashboard');
              }}
            >
              Sign In (Demo)
            </Button>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              rightIcon={ArrowRight}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/app/dashboard');
              }}
            >
              Launch Platform
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
