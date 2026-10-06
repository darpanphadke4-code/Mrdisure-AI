// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, FileText, Lock, HelpCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-forest-900 text-warmWhite border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-forest-700 flex items-center justify-center text-white border border-forest-600">
                <Shield className="w-5 h-5 text-softTeal" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                MediSure<span className="text-softTeal ml-0.5 font-sans font-medium text-lg">AI</span>
              </span>
            </div>
            <p className="text-xs text-sage-200 leading-relaxed">
              Empowering patients and policyholders with clear, AI-driven medical insurance clause analysis and accurate out-of-pocket hospital expense estimation.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-sage-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Frontend Prototype v1.0 · Fast & Mock-Ready</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-softTeal mb-4 font-heading">
              Platform Features
            </h4>
            <ul className="space-y-2.5 text-xs text-sage-200">
              <li><Link to="/app/policies" className="hover:text-white transition-colors">Policy Clause Extraction</Link></li>
              <li><Link to="/app/assistant" className="hover:text-white transition-colors">AI Insurance Research Assistant</Link></li>
              <li><Link to="/app/calculator" className="hover:text-white transition-colors">Out-of-Pocket Cost Estimator</Link></li>
              <li><Link to="/app/reports" className="hover:text-white transition-colors">Audit & Settlement Reports</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-softTeal mb-4 font-heading">
              Insurance Literacy
            </h4>
            <ul className="space-y-2.5 text-xs text-sage-200">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How Room Rent Limits Work</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Understanding Proportionate Deductions</a></li>
              <li><a href="#faqs" className="hover:text-white transition-colors">Waiting Periods & PED Disclosures</a></li>
              <li><a href="#preview" className="hover:text-white transition-colors">IRDAI Non-Medical Consumables List</a></li>
            </ul>
          </div>

          {/* Disclaimers & Regulatory */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-softTeal mb-4 font-heading">
              Trust & Advisory Notice
            </h4>
            <p className="text-[11px] text-sage-300 leading-relaxed mb-3">
              MediSure AI provides educational summaries and mathematical claim simulations. It does not replace formal cashless pre-authorization or claims assessment by licensed insurance companies or TPAs.
            </p>
            <div className="flex items-center gap-3 text-xs text-sage-200">
              <span className="inline-flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-softTeal" /> Client-Side Demo</span>
              <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-softTeal" /> Standard IRDAI Rules</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-forest-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-sage-300 gap-4">
          <p>© {new Date().getFullYear()} MediSure AI. Built with clinical and fintech precision.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Disclaimer Notice</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
