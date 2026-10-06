// src/data/mockExpenses.js

export const presetScenarios = [
  {
    id: "scenario-gallbladder",
    name: "Laparoscopic Gallbladder Surgery (Cholecystectomy)",
    hospitalName: "Apollo Multispeciality Hospital",
    treatmentType: "Planned Daycare / 3-Day Inpatient",
    diagnosis: "Acute Cholelithiasis with symptomatic cholecystitis",
    patientName: "Darpan Patel",
    patientAge: 34,
    stayDays: 3,
    roomDailyCharge: 8000,
    items: [
      { id: "exp-1", category: "room", description: "Deluxe Single A/C Room (3 days)", amount: 8000, quantity: 3, notes: "Deluxe tier chosen" },
      { id: "exp-2", category: "surgery", description: "Laparoscopic OT & Instrumentation", amount: 110000, quantity: 1, notes: "Includes laparoscopic trocar kits" },
      { id: "exp-3", category: "consultation", description: "Senior GI Surgeon & Anesthetist Fees", amount: 45000, quantity: 1, notes: "Pre-op, surgical, and post-op rounds" },
      { id: "exp-4", category: "diagnostics", description: "Pre-operative Abdominal USG & Blood Work", amount: 18000, quantity: 1, notes: "Ultrasound, CBC, LFT, viral markers" },
      { id: "exp-5", category: "medicines", description: "IV Antibiotics & Post-surgical Pain Medication", amount: 26000, quantity: 1, notes: "Hospital formulary pharmacy" },
      { id: "exp-6", category: "supplies", description: "Disposable Laparoscopic Drape & PPE Packs", amount: 22000, quantity: 1, notes: "Consumable items under IRDAI Annexure I" },
      { id: "exp-7", category: "other", description: "Hospital Admission & Biomedical Waste Handling", amount: 12000, quantity: 1, notes: "Administrative and utility charges" },
    ]
  },
  {
    id: "scenario-knee-replacement",
    name: "Unilateral Total Knee Replacement (TKR)",
    hospitalName: "Max Healthcare Institute",
    treatmentType: "Major Elective Surgery",
    diagnosis: "Severe Osteoarthritis Grade IV (Right Knee)",
    patientName: "Kailash Patel (Father)",
    patientAge: 64,
    stayDays: 5,
    roomDailyCharge: 7000,
    items: [
      { id: "exp-k1", category: "room", description: "Private In-patient Room (5 days)", amount: 7000, quantity: 5, notes: "Standard private room" },
      { id: "exp-k2", category: "surgery", description: "Total Knee Arthroplasty OT & High-flex Implant", amount: 240000, quantity: 1, notes: "Titanium femoral & tibial components" },
      { id: "exp-k3", category: "consultation", description: "Orthopedic Chief Surgeon & Anesthesiology", amount: 65000, quantity: 1, notes: "Includes post-op physiotherapy monitoring" },
      { id: "exp-k4", category: "diagnostics", description: "Pre-op Bilateral Standing Knee X-Rays & MRI", amount: 22000, quantity: 1, notes: "Radiology & cardiac clearance tests" },
      { id: "exp-k5", category: "medicines", description: "DVT Prophylaxis, Antibiotics & Analgesia", amount: 35000, quantity: 1, notes: "Injectable enoxaparin & pain management" },
      { id: "exp-k6", category: "supplies", description: "Surgical cement, bone wax, disposable gowns", amount: 32000, quantity: 1, notes: "Surgical consumables" },
      { id: "exp-k7", category: "other", description: "Hospital documentation & rehab kit", amount: 11000, quantity: 1, notes: "Walker frame & discharge briefing" },
    ]
  },
  {
    id: "scenario-dengue",
    name: "Acute Dengue Fever with Thrombocytopenia",
    hospitalName: "Fortis Hospital",
    treatmentType: "Emergency Medical Inpatient",
    diagnosis: "Dengue Hemorrhagic Fever with platelet count < 30,000",
    patientName: "Aarav Patel",
    patientAge: 5,
    stayDays: 4,
    roomDailyCharge: 6000,
    items: [
      { id: "exp-d1", category: "icu", description: "Pediatric High Dependency Unit (HDU) 2 days", amount: 12000, quantity: 2, notes: "Critical platelet monitoring" },
      { id: "exp-d2", category: "room", description: "Pediatric Semi-Private Room (2 days)", amount: 5000, quantity: 2, notes: "Post-stabilization recovery" },
      { id: "exp-d3", category: "consultation", description: "Pediatrician & Intensivist Daily Consults", amount: 24000, quantity: 1, notes: "Twice daily specialist visits" },
      { id: "exp-d4", category: "diagnostics", description: "Frequent Platelet Monitoring & Dengue Serology", amount: 16000, quantity: 1, notes: "Serial CBC every 12 hours" },
      { id: "exp-d5", category: "medicines", description: "IV Hydration, Antipyretics & Supportive Therapy", amount: 14000, quantity: 1, notes: "IV fluids & oral medications" },
      { id: "exp-d6", category: "supplies", description: "Pediatric IV Cannulas, Infusion sets & masks", amount: 8000, quantity: 1, notes: "Infusion tubing and disposables" },
    ]
  }
];
