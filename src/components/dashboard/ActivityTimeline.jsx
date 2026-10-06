// src/components/dashboard/ActivityTimeline.jsx
import React from 'react';
import { Card, CardHeader } from '../common/Card';
import { formatRelativeTime } from '../../utils/formatters';
import { FileUp, FileCheck2, Calculator, MessageSquare, Clock } from 'lucide-react';

export const ActivityTimeline = ({ activities = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'upload':
        return { icon: FileUp, bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'analysis':
        return { icon: FileCheck2, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'report':
        return { icon: Calculator, bg: 'bg-forest-50 text-forest-700 border-forest-200' };
      case 'chat':
        return { icon: MessageSquare, bg: 'bg-sage-50 text-sage-700 border-sage-200' };
      default:
        return { icon: Clock, bg: 'bg-charcoal-50 text-charcoal-700 border-charcoal-200' };
    }
  };

  return (
    <Card padding="p-5" className="h-full flex flex-col">
      <CardHeader
        title="Recent Activity"
        subtitle="Audit trail of policy uploads & simulated analyses"
      />

      <div className="space-y-4 overflow-y-auto pr-1 grow max-h-[380px]">
        {activities.length === 0 ? (
          <p className="text-xs text-charcoal-400 py-6 text-center">No recent activities.</p>
        ) : (
          activities.map((act, index) => {
            const { icon: Icon, bg } = getIcon(act.type);
            const isLast = index === activities.length - 1;

            return (
              <div key={act.id} className="relative flex gap-3.5 group">
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-[15px] top-8 bottom-[-16px] w-[1.5px] bg-borderGray group-hover:bg-forest-200 transition-colors" />
                )}

                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 z-10 ${bg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="grow min-w-0 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-charcoal-800 truncate font-heading">
                      {act.title}
                    </h5>
                    <span className="text-[10px] text-charcoal-400 shrink-0">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-0.5 leading-snug line-clamp-2">
                    {act.description}
                  </p>
                  {act.policyName && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                      {act.policyName}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
