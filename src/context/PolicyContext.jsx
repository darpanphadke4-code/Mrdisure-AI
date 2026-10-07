// src/context/PolicyContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialPolicies } from '../data/mockPolicies';
import { policyService } from '../services/policyService';
import { reportService } from '../services/reportService';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const PolicyContext = createContext(null);

const DEFAULT_ACTIVITIES = [
  {
    id: "act-1",
    type: "report",
    title: "Claim Estimate Generated",
    description: "Laparoscopic Gallbladder Cholecystectomy analysis completed",
    policyName: "Care Supreme Platinum",
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "act-2",
    type: "chat",
    title: "AI Assistant Consultation",
    description: "Inquired about Room Rent limits and proportionate deduction rules",
    policyName: "Care Supreme Platinum",
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "act-3",
    type: "upload",
    title: "New Policy Uploaded",
    description: "Uploaded Optima Secure Comprehensive Health (22 pages)",
    policyName: "HDFC ERGO Optima",
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "act-4",
    type: "analysis",
    title: "Policy Clause Extraction Complete",
    description: "Identified 4 key clauses, waiting period rules, and 2 exclusions",
    policyName: "Star Comprehensive Gold",
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
  }
];

export const PolicyProvider = ({ children }) => {
  const [policies, setPolicies] = useState(() => {
    try {
      const stored = localStorage.getItem('medisure_policies');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed reading localStorage', e);
    }
    return initialPolicies;
  });

  const [selectedPolicyId, setSelectedPolicyId] = useState(() => {
    try {
      const stored = localStorage.getItem('medisure_policies');
      if (stored) {
        const list = JSON.parse(stored);
        if (list && list.length > 0) return list[0].id;
      }
    } catch (e) {}
    return "pol-care-supreme-01";
  });

  const [reports, setReports] = useState(() => reportService.getReports());
  const [user, setUser] = useState(() => authService.getUser());
  const [activities, setActivities] = useState(() => {
    try {
      const stored = localStorage.getItem('medisure_activities');
      return stored ? JSON.parse(stored) : DEFAULT_ACTIVITIES;
    } catch {
      return DEFAULT_ACTIVITIES;
    }
  });

  // Re-fetch policies from backend API on mount
  useEffect(() => {
    let isMounted = true;
    policyService.getPolicies().then((fetched) => {
      if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
        setPolicies(fetched);
      }
    }).catch((e) => {
      console.warn('Error fetching policies on mount:', e);
    });
    return () => { isMounted = false; };
  }, []);

  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0] || null;

  const addActivity = (activity) => {
    const newEntry = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...activity,
    };
    const updated = [newEntry, ...activities.slice(0, 15)];
    setActivities(updated);
    try {
      localStorage.setItem('medisure_activities', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save activities', e);
    }
  };

  const handleUploadPolicy = async (file, metadata, onProgress) => {
    const newPolicy = await policyService.uploadPolicy(file, metadata, onProgress);
    const updatedList = await policyService.getPolicies();
    setPolicies(updatedList);
    setSelectedPolicyId(newPolicy.id);
    addActivity({
      type: "upload",
      title: "New Policy Uploaded",
      description: `Uploaded "${newPolicy.name}" (${newPolicy.fileSize || 'PDF'})`,
      policyName: newPolicy.name,
    });
    return newPolicy;
  };

  const handleDeletePolicy = async (id) => {
    const polToDelete = policies.find((p) => p.id === id);
    const updated = await policyService.deletePolicy(id);
    setPolicies(updated);
    if (selectedPolicyId === id) {
      setSelectedPolicyId(updated[0]?.id || null);
    }
    toast.success(`Policy "${polToDelete?.name || ''}" removed`);
  };

  const handleSaveReport = (report) => {
    const saved = reportService.saveReport(report);
    const updated = reportService.getReports();
    setReports(updated);
    addActivity({
      type: "report",
      title: "Cost Analysis Saved",
      description: `${report.reportName} for ₹${report.totalBilled.toLocaleString('en-IN')}`,
      policyName: report.policyName,
    });
    toast.success("Analysis report saved successfully!");
    return saved;
  };

  const handleDeleteReport = (id) => {
    const updated = reportService.deleteReport(id);
    setReports(updated);
    toast.success("Report deleted");
  };

  const handleUpdateUser = (updates) => {
    const updated = authService.updateUser(updates);
    setUser(updated);
    toast.success("Settings updated");
  };

  const handleResetAllDemoData = () => {
    authService.clearAllDemoData();
    const defaultPols = policyService.resetPolicies();
    const defaultReps = reportService.resetReports();
    const defaultUsr = authService.getUser();
    setPolicies(defaultPols);
    setSelectedPolicyId(defaultPols[0]?.id || null);
    setReports(defaultReps);
    setUser(defaultUsr);
    setActivities(DEFAULT_ACTIVITIES);
    localStorage.setItem('medisure_activities', JSON.stringify(DEFAULT_ACTIVITIES));
    toast.success("Demo data reset to initial state");
  };

  return (
    <PolicyContext.Provider
      value={{
        policies,
        selectedPolicy,
        selectedPolicyId,
        setSelectedPolicyId,
        reports,
        user,
        activities,
        uploadPolicy: handleUploadPolicy,
        deletePolicy: handleDeletePolicy,
        saveReport: handleSaveReport,
        deleteReport: handleDeleteReport,
        updateUser: handleUpdateUser,
        resetAllDemoData: handleResetAllDemoData,
        addActivity,
      }}
    >
      {children}
    </PolicyContext.Provider>
  );
};

export const usePolicy = () => {
  const context = useContext(PolicyContext);
  if (!context) {
    throw new Error('usePolicy must be used within a PolicyProvider');
  }
  return context;
};
