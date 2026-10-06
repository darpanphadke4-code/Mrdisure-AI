// src/components/dashboard/QuickActions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { FileUp, Bot, Calculator, FileBarChart, ArrowUpRight } from 'lucide-react';

export const QuickActions = ({ onOpenUpload }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Upload a Policy",
      description: "Upload policy PDF to extract clauses & limits",
      icon: FileUp,
      color: "bg-forest-50 text-forest-700 border-forest-100",
      onClick: onOpenUpload,
    },
    {
      title: "Ask AI Assistant",
      description: "Ask policy-specific questions with clause citations",
      icon: Bot,
      color: "bg-softTeal text-forest-900 border-softTeal-border",
      onClick: () => navigate('/app/assistant'),
    },
    {
      title: "Estimate Expenses",
      description: "Simulate hospital bill out-of-pocket settlement",
      icon: Calculator,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      onClick: () => navigate('/app/calculator'),
    },
    {
      title: "View Reports",
      description: "Access and print saved cost audit reports",
      icon: FileBarChart,
      color: "bg-sage-50 text-forest-800 border-sage-200",
      onClick: () => navigate('/app/reports'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <div
            key={act.title}
            onClick={act.onClick}
            className="group bg-white p-4 rounded-2xl border border-borderGray hover:border-forest-300 hover:shadow-card transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="w-6 h-6 rounded-full bg-forest-50 flex items-center justify-center text-forest-700 group-hover:bg-forest-700 group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <h4 className="text-sm font-bold text-forest-900 font-heading mb-1">
                {act.title}
              </h4>
              <p className="text-xs text-charcoal-400 leading-relaxed">
                {act.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
