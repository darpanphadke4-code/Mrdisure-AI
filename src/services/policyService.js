// src/services/policyService.js
import { initialPolicies } from '../data/mockPolicies';

const STORAGE_KEY = 'medisure_policies';

export const policyService = {
  /**
   * Fetch all policies from localStorage or defaults
   */
  getPolicies: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read policies from localStorage', e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPolicies));
    return initialPolicies;
  },

  /**
   * Get policy by unique ID
   */
  getPolicyById: (id) => {
    const list = policyService.getPolicies();
    return list.find((p) => p.id === id) || list[0] || null;
  },

  /**
   * Simulate uploading a new policy document with realistic progress
   */
  uploadPolicy: (file, metadata, onProgress) => {
    return new Promise((resolve) => {
      let progress = 10;
      onProgress(progress);

      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          onProgress(100);

          setTimeout(() => {
            const policies = policyService.getPolicies();
            const newId = `pol-${Date.now()}`;
            const newPolicy = {
              id: newId,
              provider: metadata.provider || "Max Bupa Health",
              name: metadata.policyName || file.name.replace(/\.[^/.]+$/, ""),
              policyNumber: metadata.policyNumber || `MBH/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`,
              type: metadata.policyType || "Individual Comprehensive",
              status: "Active",
              analysisStatus: "Pending Analysis",
              uploadDate: new Date().toISOString().split('T')[0],
              effectiveDate: new Date().toISOString().split('T')[0],
              renewalDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
              sumInsured: Number(metadata.sumInsured) || 1000000,
              utilizedAmount: 0,
              remainingAmount: Number(metadata.sumInsured) || 1000000,
              coverageUtilization: 0,
              deductible: Number(metadata.deductible) || 10000,
              copayPercent: Number(metadata.copayPercent) || 0,
              roomRentLimitPerDay: Number(metadata.roomRentLimit) || 5000,
              roomCategoryAllowed: "Single Private Room (Up to 1% of Sum Insured)",
              icuLimit: "No sub-limits on ICU care",
              maternityCover: 50000,
              waitingPeriodPreExisting: "36 months",
              waitingPeriodSpecific: "24 months",
              waitingPeriodInitial: "30 days",
              hasConsumablesRider: true,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              pageCount: 12,
              documentExcerpt: {
                totalPages: 2,
                pages: [
                  {
                    pageNumber: 1,
                    title: "Schedule of Insurance (Extracted from Uploaded PDF)",
                    sections: [
                      {
                        id: "sec-up-1",
                        title: "1. Uploaded Policy Schedule",
                        content: `This policy document was uploaded as "${file.name}". Initial optical layout extraction identified Base Sum Insured of ₹${Number(metadata.sumInsured || 1000000).toLocaleString('en-IN')}. AI clause verification is in progress.`,
                        clauses: ["clause-uploaded-summary"]
                      }
                    ]
                  },
                  {
                    pageNumber: 2,
                    title: "Section 2: Room Rent and Co-pay Terms",
                    sections: [
                      {
                        id: "sec-up-2",
                        title: "2.1 Extracted Limits",
                        content: `Daily room boarding limit extracted: ₹${Number(metadata.roomRentLimit || 5000).toLocaleString('en-IN')}/day. Co-pay condition detected as ${metadata.copayPercent || 0}%. Verified against IRDAI standard guidelines.`,
                        clauses: ["clause-uploaded-limits"]
                      }
                    ]
                  }
                ]
              },
              coverageDetails: [
                { category: "In-patient Hospitalization", limit: `Up to ₹${(metadata.sumInsured || 1000000).toLocaleString('en-IN')}`, status: "Covered", notes: "Requires minimum 24-hr admission" },
                { category: "Room Rent Daily Cap", limit: `₹${(metadata.roomRentLimit || 5000).toLocaleString('en-IN')}/day`, status: "Sub-limit", notes: "Proportionate deduction on higher room" },
                { category: "ICU Charges", limit: "Actuals", status: "Covered", notes: "No sub-limits" },
                { category: "Consumables Rider", limit: "Included", status: "Covered", notes: "Protects against non-medical deductions" },
              ],
              exclusions: [
                { title: "Standard Aesthetic & Cosmetic Care", type: "Standard Exclusion", details: "Cosmetic procedures excluded unless trauma reconstructive.", clauseRef: "Section 4.1" },
                { title: "Pre-Existing Conditions", type: "Waiting Period", details: "36-month waiting period on disclosed conditions.", clauseRef: "Section 4.2" }
              ],
              limitsAndConditions: [
                { name: "Annual Deductible", value: `₹${(metadata.deductible || 10000).toLocaleString('en-IN')}`, description: "Aggregate annual deductible.", verified: false },
                { name: "Co-Payment", value: `${metadata.copayPercent || 0}%`, description: "Self-borne percentage per claim.", verified: false },
              ],
              keyClauses: [
                {
                  id: "clause-uploaded-limits",
                  title: "Extracted Room Rent Provision",
                  pageNumber: 2,
                  snippet: `Daily room boarding limit extracted: ₹${Number(metadata.roomRentLimit || 5000).toLocaleString('en-IN')}/day.`,
                  importance: "High",
                  explanation: "Confirm with your official policy schedule before filing a cashless admission request."
                }
              ]
            };

            const updated = [newPolicy, ...policies];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            resolve(newPolicy);
          }, 400);
        } else {
          onProgress(progress);
        }
      }, 250);
    });
  },

  /**
   * Delete a policy by ID
   */
  deletePolicy: (id) => {
    const list = policyService.getPolicies();
    const updated = list.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Reset demo policies back to defaults
   */
  resetPolicies: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPolicies));
    return initialPolicies;
  }
};
