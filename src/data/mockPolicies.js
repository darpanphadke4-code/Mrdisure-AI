// src/data/mockPolicies.js

export const initialPolicies = [
  {
    id: "pol-care-supreme-01",
    provider: "Care Health Insurance",
    name: "Care Supreme Platinum Health Plan",
    policyNumber: "CHI/2024/984210XX",
    type: "Comprehensive Family Floater",
    status: "Active",
    analysisStatus: "Verified",
    uploadDate: "2024-04-12",
    effectiveDate: "2024-04-15",
    renewalDate: "2025-04-14",
    sumInsured: 1000000,
    utilizedAmount: 185000,
    remainingAmount: 815000,
    coverageUtilization: 18.5,
    deductible: 15000,
    copayPercent: 10,
    roomRentLimitPerDay: 5000,
    roomCategoryAllowed: "Single Private Room (Up to 1% of Sum Insured)",
    icuLimit: "No capping on ICU charges",
    maternityCover: 50000,
    waitingPeriodPreExisting: "36 months",
    waitingPeriodSpecific: "24 months for specified illnesses",
    waitingPeriodInitial: "30 days (accidental covered immediately)",
    hasConsumablesRider: true,
    fileSize: "4.2 MB",
    pageCount: 14,
    documentExcerpt: {
      totalPages: 4,
      pages: [
        {
          pageNumber: 1,
          title: "Schedule of Insurance & Insured Persons",
          sections: [
            {
              id: "sec-1",
              title: "1. Policy Summary & Sum Insured",
              content: "The Company hereby agrees subject to the terms, conditions, exclusions and definitions contained herein or endorsed, to indemnify the Insured Person(s) up to the Sum Insured of INR 10,00,000/- (Rupees Ten Lakhs Only) against In-patient Hospitalization expenses reasonably and customarily incurred during the Policy Period.",
              clauses: ["clause-sum-insured"]
            },
            {
              id: "sec-2",
              title: "2. Deductible Clause",
              content: "A compulsory annual aggregate deductible of INR 15,000/- applies across all claims in the policy year before liability attaches to the Company. Deductible is waived in case of accidental hospitalizations exceeding 5 consecutive days.",
              clauses: ["clause-deductible"]
            }
          ]
        },
        {
          pageNumber: 2,
          title: "Section 3: In-Patient Hospitalization & Room Rent Limits",
          sections: [
            {
              id: "sec-3",
              title: "3.1 Room Category & Daily Boarding Limit",
              content: "Room Rent, boarding and nursing expenses are covered up to 1% of Sum Insured per day (INR 5,000/day). If the Insured opts for a room category higher than Single Private A/C Room, all associated medical expenses (including doctor consultation and nursing fees) shall be subject to proportionate deduction.",
              clauses: ["clause-room-rent"]
            },
            {
              id: "sec-4",
              title: "3.2 Intensive Care Unit (ICU / ICCU)",
              content: "Intensive Care Unit (ICU) and Intensive Cardiac Care Unit (ICCU) charges are covered at actuals with no sub-limit or percentage capping, provided medically necessary and certified by the treating intensivist.",
              clauses: ["clause-icu"]
            },
            {
              id: "sec-5",
              title: "3.3 Day Care Procedures",
              content: "Coverage extends to over 540 listed Day Care treatments and surgeries requiring less than 24 hours of hospital stay due to technological advancement in surgical procedures.",
              clauses: ["clause-daycare"]
            }
          ]
        },
        {
          pageNumber: 3,
          title: "Section 4: Exclusions & Waiting Periods",
          sections: [
            {
              id: "sec-6",
              title: "4.1 Pre-Existing Diseases (PED)",
              content: "Any condition, ailment, injury or disease diagnosed within 36 months prior to the first policy inception shall not be covered until 36 continuous months of coverage have elapsed without break.",
              clauses: ["clause-ped-waiting"]
            },
            {
              id: "sec-7",
              title: "4.2 General Exclusions",
              content: "Expenses incurred on cosmetic or plastic surgery, non-prescription dietary supplements, investigation and evaluation only admissions, and listed unproven or experimental treatments are explicitly excluded.",
              clauses: ["clause-general-exclusions"]
            },
            {
              id: "sec-8",
              title: "4.3 Co-Payment Condition",
              content: "A mandatory co-payment of 10% applies to all admissible claims for dependent members aged 60 years and above at the time of claim filing.",
              clauses: ["clause-copay"]
            }
          ]
        },
        {
          pageNumber: 4,
          title: "Section 5: Optional Riders & Modern Treatments",
          sections: [
            {
              id: "sec-9",
              title: "5.1 Care Shield Consumables Protection Rider",
              content: "Endorsement CS-2024: Non-payable medical items, including surgical gloves, PPE kits, infusion sets, and needles specified under IRDAI Annexure I, shall be indemnified up to 90% of billed consumable charges.",
              clauses: ["clause-consumables"]
            },
            {
              id: "sec-10",
              title: "5.2 Robotic Surgery & Modern Medical Treatment Sub-limits",
              content: "Coverage for Robotic surgery, Stem cell therapy, Oral chemotherapy, and Immunotherapy is subject to a sub-limit cap of 50% of the base Sum Insured (INR 5,00,000 per policy year).",
              clauses: ["clause-modern-sublimit"]
            }
          ]
        }
      ]
    },
    coverageDetails: [
      { category: "In-patient Hospitalization", limit: "Up to ₹10,00,000", status: "Covered", notes: "Minimum 24h hospitalization required except daycare" },
      { category: "Room Rent & Boarding", limit: "₹5,000/day (1% of SI)", status: "Sub-limit", notes: "Proportionate deduction applies if exceeded" },
      { category: "ICU / ICCU Charges", limit: "No sub-limit", status: "Covered", notes: "Paid at actuals if medically necessary" },
      { category: "Pre-Hospitalization", limit: "60 Days", status: "Covered", notes: "Directly related to admitted medical condition" },
      { category: "Post-Hospitalization", limit: "90 Days", status: "Covered", notes: "Diagnostic bills and follow-up consultations" },
      { category: "Daycare Surgeries", limit: "540+ procedures", status: "Covered", notes: "Advanced laparoscopic and ophthalmic procedures" },
      { category: "Consumables Rider", limit: "90% of consumables", status: "Covered", notes: "Active rider CS-2024" },
      { category: "Ambulance Charges", limit: "₹3,000 per hospitalization", status: "Sub-limit", notes: "Network ambulance transfers" },
    ],
    exclusions: [
      { title: "Cosmetic & Aesthetic Surgery", type: "Permanent Exclusion", details: "Surgeries for cosmetic enhancement unless reconstructive following accidental burns/trauma.", clauseRef: "Clause 4.2.1" },
      { title: "Diagnostic Admission without Treatment", type: "General Exclusion", details: "Admission purely for observation, checkup, or diagnostic blood tests without active treatment.", clauseRef: "Clause 4.2.4" },
      { title: "Pre-Existing Conditions (36 Months)", type: "Waiting Period", details: "Hypertension, Type 2 Diabetes, or Thyroid ailments pre-dating policy issuance.", clauseRef: "Clause 4.1.1" },
      { title: "Unproven Treatments & Stem Cells", type: "Standard Exclusion", details: "Treatments not established in accepted medical peer-reviewed consensus.", clauseRef: "Clause 4.2.9" },
    ],
    limitsAndConditions: [
      { name: "Annual Deductible", value: "₹15,000", description: "First ₹15,000 of admissible hospital bill borne by policyholder each policy year.", verified: true },
      { name: "Senior Member Co-Payment", value: "10%", description: "Applicable only if claimant age >= 60 at time of admission.", verified: true },
      { name: "Room Rent Daily Cap", value: "₹5,000 / day", description: "Proportionate deduction triggered if higher room category chosen.", verified: true },
      { name: "Robotic Surgery Sub-limit", value: "₹5,00,000", description: "Maximum payout for robotic/cyberknife interventions.", verified: false },
    ],
    keyClauses: [
      {
        id: "clause-room-rent",
        title: "Clause 3.1: Room Rent Proportionate Deduction",
        pageNumber: 2,
        snippet: "If the Insured opts for a room category higher than Single Private A/C Room, all associated medical expenses shall be subject to proportionate deduction.",
        importance: "Critical",
        explanation: "Selecting a Deluxe or Suite room will reduce payouts not just for room rent, but proportionally for surgeon fees and doctor rounds."
      },
      {
        id: "clause-deductible",
        title: "Clause 1.2: Annual Aggregate Deductible",
        pageNumber: 1,
        snippet: "A compulsory annual aggregate deductible of INR 15,000/- applies across all claims in the policy year.",
        importance: "High",
        explanation: "The first ₹15,000 will always be deducted from your first claim in this policy year."
      },
      {
        id: "clause-ped-waiting",
        title: "Clause 4.1: 36-Month PED Waiting Period",
        pageNumber: 3,
        snippet: "Any condition diagnosed within 36 months prior shall not be covered until 36 continuous months of coverage have elapsed.",
        importance: "High",
        explanation: "Disclose pre-existing conditions and verify policy tenure to avoid immediate rejection."
      },
      {
        id: "clause-consumables",
        title: "Clause 5.1: Care Shield Consumables Rider",
        pageNumber: 4,
        snippet: "Non-payable medical items under IRDAI Annexure I shall be indemnified up to 90%.",
        importance: "Medium",
        explanation: "Protects against standard hospital deductions for gloves, PPE, syringes, and sanitary kits."
      }
    ]
  },
  {
    id: "pol-star-comp-02",
    provider: "Star Health & Allied Insurance",
    name: "Star Comprehensive Gold Insurance",
    policyNumber: "SHAI/2023/554901YY",
    type: "Individual Health Insurance",
    status: "Active",
    analysisStatus: "Verified",
    uploadDate: "2024-01-20",
    effectiveDate: "2024-02-01",
    renewalDate: "2025-01-31",
    sumInsured: 1500000,
    utilizedAmount: 0,
    remainingAmount: 1500000,
    coverageUtilization: 0,
    deductible: 0,
    copayPercent: 0,
    roomRentLimitPerDay: 0, // No cap
    roomCategoryAllowed: "Single Private A/C Room (No daily monetary cap)",
    icuLimit: "Covered up to Sum Insured",
    maternityCover: 50000,
    waitingPeriodPreExisting: "36 months",
    waitingPeriodSpecific: "24 months",
    waitingPeriodInitial: "30 days",
    hasConsumablesRider: false,
    fileSize: "5.8 MB",
    pageCount: 18,
    documentExcerpt: {
      totalPages: 3,
      pages: [
        {
          pageNumber: 1,
          title: "Schedule of Insurance & In-Patient Coverage",
          sections: [
            {
              id: "sec-s1",
              title: "1. Basic Hospitalization Benefit",
              content: "The company covers in-patient hospitalization up to the Sum Insured of INR 15,00,000 for any Single Private A/C Room without daily monetary sub-limit capping. 0% co-payment applies for all network hospital claims.",
              clauses: ["clause-star-room"]
            }
          ]
        },
        {
          pageNumber: 2,
          title: "Section 2: Maternity & Newborn Benefits",
          sections: [
            {
              id: "sec-s2",
              title: "2.1 Maternity Expenses Sub-limit",
              content: "Normal delivery expenses are capped at INR 30,000 and Caesarean delivery at INR 50,000 per event. A waiting period of 24 continuous months applies from first inception.",
              clauses: ["clause-star-maternity"]
            }
          ]
        },
        {
          pageNumber: 3,
          title: "Section 3: Exclusions & Non-Medical Deductions",
          sections: [
            {
              id: "sec-s3",
              title: "3.1 Non-Payable Consumables",
              content: "Non-medical consumables including surgical gloves, face masks, sanitizers, and admission kits are excluded from claim settlement as per IRDAI list. Deductions typically average 8-12% of total hospital bill.",
              clauses: ["clause-star-consumables"]
            }
          ]
        }
      ]
    },
    coverageDetails: [
      { category: "In-patient Hospitalization", limit: "Up to ₹15,00,000", status: "Covered", notes: "No co-pay at network hospitals" },
      { category: "Room Rent", limit: "Single Private A/C", status: "Covered", notes: "No monetary per-day ceiling" },
      { category: "ICU Charges", limit: "Actuals", status: "Covered", notes: "Covered in full" },
      { category: "Maternity Coverage", limit: "₹50,000 Caesarean / ₹30k Normal", status: "Sub-limit", notes: "24 months waiting period" },
      { category: "Newborn Baby Cover", limit: "₹1,00,000 from Day 1", status: "Covered", notes: "Subject to maternity eligibility" },
      { category: "Air Ambulance", limit: "₹2,50,000 per policy year", status: "Sub-limit", notes: "Emergency inter-hospital transport" },
    ],
    exclusions: [
      { title: "Non-Medical Items & Consumables", type: "Standard Exclusion", details: "Syringes, gloves, registration charges excluded (no active rider).", clauseRef: "Section 3.1" },
      { title: "Dental & Vision Outpatient", type: "Exclusion", details: "OPD dental and glasses not covered unless arising from trauma.", clauseRef: "Section 3.4" },
    ],
    limitsAndConditions: [
      { name: "Annual Deductible", value: "₹0", description: "Zero deductible plan.", verified: true },
      { name: "Co-Payment", value: "0%", description: "No co-payment across any age group.", verified: true },
      { name: "Room Category", value: "Single Private A/C", description: "No daily tariff limit as long as room is single private.", verified: true },
      { name: "Maternity Sub-limit", value: "₹50,000", description: "Fixed limit for pregnancy & C-section.", verified: true },
    ],
    keyClauses: [
      {
        id: "clause-star-room",
        title: "Clause 1: Single Private Room Freedom",
        pageNumber: 1,
        snippet: "Single Private A/C Room without daily monetary sub-limit capping.",
        importance: "Critical",
        explanation: "You can stay in any standard private AC room without worrying about proportionate deductions."
      },
      {
        id: "clause-star-maternity",
        title: "Clause 2.1: Maternity Waiting Period & Cap",
        pageNumber: 2,
        snippet: "Caesarean delivery capped at INR 50,000. 24 months waiting period applies.",
        importance: "Medium",
        explanation: "Pregnancy costs beyond ₹50,000 must be borne out of pocket."
      }
    ]
  },
  {
    id: "pol-hdfc-optima-03",
    provider: "HDFC ERGO General Insurance",
    name: "Optima Secure Comprehensive Health",
    policyNumber: "HDFC/2024/771920ZZ",
    type: "Individual + Critical Illness",
    status: "Active",
    analysisStatus: "Pending Analysis",
    uploadDate: "2024-05-02",
    effectiveDate: "2024-05-10",
    renewalDate: "2025-05-09",
    sumInsured: 2000000,
    utilizedAmount: 0,
    remainingAmount: 2000000,
    coverageUtilization: 0,
    deductible: 25000,
    copayPercent: 0,
    roomRentLimitPerDay: 0,
    roomCategoryAllowed: "Any Room Category except Suite",
    icuLimit: "No limit",
    maternityCover: 0,
    waitingPeriodPreExisting: "36 months",
    waitingPeriodSpecific: "24 months",
    waitingPeriodInitial: "30 days",
    hasConsumablesRider: true,
    fileSize: "6.1 MB",
    pageCount: 22,
    documentExcerpt: {
      totalPages: 2,
      pages: [
        {
          pageNumber: 1,
          title: "Schedule of Benefits & Secure Benefit",
          sections: [
            {
              id: "sec-h1",
              title: "1. 2X Secure Benefit & Base Sum Insured",
              content: "Base Sum Insured of INR 20,00,000 automatically doubles to INR 40,00,000 from Day 1 for qualifying hospitalization claims, providing 2X coverage without additional premium loading.",
              clauses: ["clause-hdfc-secure"]
            }
          ]
        },
        {
          pageNumber: 2,
          title: "Section 2: Deductibles & Co-pay Terms",
          sections: [
            {
              id: "sec-h2",
              title: "2.1 Voluntary Deductible Opt-In",
              content: "Insured has selected an aggregate voluntary deductible of INR 25,000 per policy year in return for a 25% premium discount. Insured bears initial INR 25,000 of cumulative eligible claims.",
              clauses: ["clause-hdfc-deductible"]
            }
          ]
        }
      ]
    },
    coverageDetails: [
      { category: "In-patient Hospitalization", limit: "₹20,00,000 (Doubles to ₹40L)", status: "Covered", notes: "Secure benefit active from Day 1" },
      { category: "Room Rent", limit: "Any Room except Suite", status: "Covered", notes: "Deluxe rooms allowed without proportionate cut" },
      { category: "ICU Charges", limit: "Actuals", status: "Covered", notes: "No sub-limits" },
      { category: "Restoration Benefit", limit: "100% automatic restore", status: "Covered", notes: "Unlimited restores for unrelated illnesses" },
    ],
    exclusions: [
      { title: "Maternity & Newborn Cover", type: "Not Included", details: "Maternity benefits not included in Optima Secure standard tier.", clauseRef: "Section 4.1" },
      { title: "External Prosthetics & Devices", type: "Exclusion", details: "Hearing aids, spectacles, contact lenses and external orthopedic apparatus.", clauseRef: "Section 4.8" },
    ],
    limitsAndConditions: [
      { name: "Voluntary Deductible", value: "₹25,000", description: "First ₹25,000 borne by policyholder.", verified: true },
      { name: "Room Rent Limit", value: "Any except Suite", description: "Single and Twin-sharing and Deluxe eligible.", verified: true },
      { name: "Co-Payment", value: "0%", description: "No co-payment across all tiers.", verified: true },
    ],
    keyClauses: [
      {
        id: "clause-hdfc-secure",
        title: "Clause 1.1: 2X Secure Benefit Multiplier",
        pageNumber: 1,
        snippet: "Base Sum Insured of INR 20,00,000 automatically doubles to INR 40,00,000 from Day 1.",
        importance: "Critical",
        explanation: "Doubled coverage pool ensures you won't run out of funds during major medical emergencies."
      },
      {
        id: "clause-hdfc-deductible",
        title: "Clause 2.1: Voluntary Annual Deductible",
        pageNumber: 2,
        snippet: "Insured bears initial INR 25,000 of cumulative eligible claims.",
        importance: "High",
        explanation: "Keep ₹25,000 ready in emergency savings for hospital bill entry."
      }
    ]
  }
];
