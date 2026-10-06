// src/data/mockChat.js

export const initialSessions = [
  {
    id: "session-1",
    title: "Surgery & Room Rent Coverage",
    policyId: "pol-care-supreme-01",
    createdAt: "2024-05-18T10:30:00Z",
    messages: [
      {
        id: "msg-1-1",
        sender: "user",
        text: "Does my Care Supreme plan cover laparoscopic gallbladder surgery, and what room can I take without paying out of pocket?",
        timestamp: "10:30 AM",
      },
      {
        id: "msg-1-2",
        sender: "assistant",
        text: "Yes, your Care Supreme Platinum plan covers laparoscopic gallbladder surgery (Cholecystectomy) in full, subject to your room category selection and applicable deductible.",
        timestamp: "10:31 AM",
        explanation: "Daycare and in-patient surgeries requiring advanced laparoscopy are covered under Section 3.3. However, pay attention to the Room Rent clause: your policy covers up to 1% of Sum Insured per day (₹5,000/day) for a Single Private Room. If you select a Deluxe or Suite room (e.g. ₹8,000/day), proportionate deduction will apply to doctor and nursing charges.",
        clauses: [
          {
            title: "Clause 3.1: Room Rent Proportionate Deduction",
            page: 2,
            snippet: "Room Rent, boarding and nursing expenses are covered up to 1% of Sum Insured per day (INR 5,000/day). Higher rooms trigger proportionate deductions."
          },
          {
            title: "Clause 3.3: Day Care Procedures",
            page: 2,
            snippet: "Coverage extends to over 540 listed Day Care treatments and surgeries requiring less than 24 hours of hospital stay."
          }
        ],
        confidence: "High (Direct Clause Match)",
        hasTransferableEstimate: true,
        estimatePayload: {
          procedure: "Laparoscopic Gallbladder Surgery",
          suggestedRoomLimit: 5000,
          deductible: 15000,
          copay: 0,
        }
      }
    ]
  },
  {
    id: "session-2",
    title: "Waiting Periods for Pre-existing Conditions",
    policyId: "pol-care-supreme-01",
    createdAt: "2024-05-14T14:15:00Z",
    messages: [
      {
        id: "msg-2-1",
        sender: "user",
        text: "Explain my waiting periods for hypertension and diabetes.",
        timestamp: "02:15 PM",
      },
      {
        id: "msg-2-2",
        sender: "assistant",
        text: "Under your Care Supreme policy, pre-existing diseases (PED) like Hypertension or Diabetes carry a 36-month (3 years) waiting period from your policy inception date.",
        timestamp: "02:16 PM",
        explanation: "Since your policy commenced on 15 April 2024, pre-existing conditions disclosed at the time of proposal will be covered after 14 April 2027. Note: Specific conditions like cataract, hernia, or joint replacements also carry a 24-month waiting period regardless of whether they were pre-existing.",
        clauses: [
          {
            title: "Clause 4.1: Pre-Existing Diseases (PED)",
            page: 3,
            snippet: "Any condition diagnosed within 36 months prior to inception shall not be covered until 36 continuous months of coverage have elapsed."
          }
        ],
        confidence: "High (Verified against Section 4.1)",
        hasTransferableEstimate: false,
      }
    ]
  }
];

export const promptSuggestions = [
  { text: "What does my policy cover?", category: "Coverage" },
  { text: "Does it cover surgery?", category: "Surgical" },
  { text: "Explain my waiting periods.", category: "Waiting Period" },
  { text: "What expenses are excluded?", category: "Exclusions" },
  { text: "How much of my sum insured remains?", category: "Balance" },
  { text: "Estimate my hospital bill for surgery.", category: "Estimator" },
];

export const fallbackResponses = {
  coverage: {
    text: "Your selected policy provides comprehensive hospitalization coverage, covering in-patient medical expenses, pre-hospitalization (60 days), post-hospitalization (90 days), and daycare procedures.",
    clauses: [
      { title: "Section 1: In-Patient Hospitalization", page: 1, snippet: "The Company indemnifies against in-patient hospitalization expenses reasonably and customarily incurred." }
    ],
    confidence: "High (Standard Benefit Schedule)"
  },
  surgery: {
    text: "Yes, surgical interventions including elective and emergency surgeries are covered. Modern treatments like robotic surgery are also supported up to applicable sub-limits.",
    clauses: [
      { title: "Clause 5.2: Modern Treatments & Robotic Surgery", page: 4, snippet: "Coverage for Robotic surgery is subject to a sub-limit cap of 50% of the base Sum Insured." }
    ],
    confidence: "High (Direct Clause Match)",
    hasTransferableEstimate: true,
  },
  waiting: {
    text: "Your policy has a 30-day initial waiting period (except for accidents), a 24-month waiting period for specified slow-developing ailments (hernia, cataract, stones), and a 36-month waiting period for pre-existing diseases.",
    clauses: [
      { title: "Section 4.1 & 4.2: Waiting Periods", page: 3, snippet: "Initial 30 days, specific illnesses 24 months, pre-existing diseases 36 months." }
    ],
    confidence: "High (Policy Verified)"
  },
  exclusions: {
    text: "Primary exclusions include cosmetic or aesthetic procedures, pure diagnostic hospital admissions without medical necessity, unproven experimental therapies, and dental/vision care unless caused by accidental trauma.",
    clauses: [
      { title: "Section 4.2: General Exclusions", page: 3, snippet: "Cosmetic surgery, non-prescription dietary supplements, and diagnostic checkups without treatment are excluded." }
    ],
    confidence: "High (Explicit Exclusion Schedule)"
  },
  balance: {
    text: "Based on your active policy record, your current remaining Sum Insured is available in your dashboard overview. You have healthy coverage remaining for this policy year.",
    clauses: [
      { title: "Schedule of Insurance", page: 1, snippet: "Annual aggregate limit applies across all approved claims in the policy year." }
    ],
    confidence: "Medium (Derived from active claim ledger)"
  },
  estimate: {
    text: "I can help you simulate your hospital expenses. For major surgeries or planned admissions, your out-of-pocket costs will depend on room category, deductible (₹15,000 for this policy), and non-medical consumables.",
    clauses: [
      { title: "Clause 3.1 & 1.2: Room Limit & Deductibles", page: 2, snippet: "Proportionate room deductions and deductible conditions apply." }
    ],
    confidence: "High",
    hasTransferableEstimate: true,
    estimatePayload: {
      procedure: "Hospital Surgical Admission",
      suggestedRoomLimit: 5000,
      deductible: 15000,
      copay: 10,
    }
  },
  unknown: {
    text: "I searched the policy document, but I could not find a conclusive clause regarding that specific item. In real insurance operations, ambiguous terms require checking the insurer's non-standard endorsements or raising a pre-authorization query with the TPA.",
    clauses: [],
    confidence: "Low / Insufficient Data (Manual verification recommended)"
  }
};
