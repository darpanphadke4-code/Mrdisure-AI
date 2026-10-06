// src/utils/calculationEngine.js

/**
 * MediSure AI - Insurance Claim & Out-of-Pocket Expense Calculation Engine
 * Note: Illustrative estimation algorithm following standard healthcare insurance rules.
 * This is for advisory and estimation purposes only.
 */

export const EXPENSE_CATEGORIES = [
  { id: 'room', name: 'Room Charges', standardCoverage: 0.95 },
  { id: 'icu', name: 'ICU Charges', standardCoverage: 1.0 },
  { id: 'surgery', name: 'Surgery & OT Charges', standardCoverage: 0.98 },
  { id: 'consultation', name: 'Doctor Consultation & Nursing', standardCoverage: 0.95 },
  { id: 'diagnostics', name: 'Diagnostics & Pathology', standardCoverage: 0.92 },
  { id: 'medicines', name: 'Pharmacy & In-Hospital Medicines', standardCoverage: 0.90 },
  { id: 'supplies', name: 'Medical Supplies & Consumables', standardCoverage: 0.20 }, // Usually excluded or low coverage
  { id: 'other', name: 'Hospital Admin & Other Services', standardCoverage: 0.10 }, // Usually excluded
];

/**
 * Calculates comprehensive insurance settlement estimation
 */
export const calculateClaimEstimate = (expenses = [], conditions = {}) => {
  const {
    sumInsured = 1000000,
    deductible = 10000,
    copayPercent = 10,
    roomRentLimitPerDay = 5000,
    actualRoomChargePerDay = 7500,
    hospitalStayDays = 3,
    hasConsumablesRider = false,
    appliedSublimits = {}, // e.g. { surgery: 200000 }
  } = conditions;

  // 1. Group expenses and compute itemized deductions
  let totalBilled = 0;
  let nonPayableDeductions = 0;
  let roomRentDeductions = 0;
  let sublimitDeductions = 0;

  const itemizedDetails = expenses.map((item) => {
    const itemTotal = (Number(item.amount) || 0) * (Number(item.quantity) || 1);
    totalBilled += itemTotal;

    let itemAdmissible = itemTotal;
    let itemDeduction = 0;
    let reason = 'Covered under general policy terms';

    // Check non-payable items (supplies & other administrative charges)
    if (item.category === 'supplies' && !hasConsumablesRider) {
      itemDeduction = itemTotal * 0.85; // 85% excluded as non-medical consumables
      itemAdmissible = itemTotal - itemDeduction;
      reason = 'Non-payable medical consumables / hygiene packs (IRDAI non-medical list)';
      nonPayableDeductions += itemDeduction;
    } else if (item.category === 'other') {
      itemDeduction = itemTotal * 0.90; // Admin, laundry, registration fees
      itemAdmissible = itemTotal - itemDeduction;
      reason = 'Administrative/service charges not covered by base policy';
      nonPayableDeductions += itemDeduction;
    }

    // Proportionate Room Rent deduction if room exceeds limit
    if (item.category === 'room' && roomRentLimitPerDay > 0 && actualRoomChargePerDay > roomRentLimitPerDay) {
      const roomExcessPerDay = actualRoomChargePerDay - roomRentLimitPerDay;
      const roomDeduction = roomExcessPerDay * (Number(item.quantity) || hospitalStayDays || 1);
      const cappedDeduction = Math.min(roomDeduction, itemTotal);
      itemDeduction += cappedDeduction;
      itemAdmissible = Math.max(0, itemTotal - cappedDeduction);
      reason = `Room category opted exceeds daily limit of ${roomRentLimitPerDay}/day`;
      roomRentDeductions += cappedDeduction;
    }

    return {
      ...item,
      itemTotal,
      itemAdmissible: Math.max(0, itemAdmissible),
      itemDeduction,
      reason,
    };
  });

  // Check category sub-limits (e.g. Surgery sublimit cap)
  Object.keys(appliedSublimits).forEach((cat) => {
    const limit = appliedSublimits[cat];
    if (limit && limit > 0) {
      const catTotalAdmissible = itemizedDetails
        .filter((i) => i.category === cat)
        .reduce((sum, i) => sum + i.itemAdmissible, 0);

      if (catTotalAdmissible > limit) {
        const excess = catTotalAdmissible - limit;
        sublimitDeductions += excess;
      }
    }
  });

  // 2. Base admissible expenses after direct non-coverage
  const baseAdmissible = Math.max(
    0,
    totalBilled - (nonPayableDeductions + roomRentDeductions + sublimitDeductions)
  );

  // 3. Deductible application
  const deductibleApplied = Math.min(deductible, baseAdmissible);
  const amountAfterDeductible = Math.max(0, baseAdmissible - deductibleApplied);

  // 4. Co-payment application
  const copayRatio = (copayPercent || 0) / 100;
  const copayApplied = Math.round(amountAfterDeductible * copayRatio);
  const amountAfterCopay = Math.max(0, amountAfterDeductible - copayApplied);

  // 5. Final Insurer Share vs Sum Insured Cap
  const estimatedInsurerShare = Math.min(amountAfterCopay, sumInsured);
  const sumInsuredExceededDeduction = Math.max(0, amountAfterCopay - sumInsured);

  // 6. Total Patient Out-of-Pocket Share
  const estimatedPatientShare = Math.max(0, totalBilled - estimatedInsurerShare);

  // 7. Structured Waterfall Breakdown for visualizations
  const waterfallSteps = [
    { name: 'Total Hospital Bill', value: totalBilled, type: 'start', color: '#202B27' },
    { name: 'Non-Covered Consumables', value: -Math.round(nonPayableDeductions), type: 'deduction', color: '#E11D48' },
    { name: 'Room Rent Excess', value: -Math.round(roomRentDeductions), type: 'deduction', color: '#F59E0B' },
    { name: 'Sub-limit Caps', value: -Math.round(sublimitDeductions), type: 'deduction', color: '#D97706' },
    { name: 'Policy Deductible', value: -Math.round(deductibleApplied), type: 'deduction', color: '#8B5CF6' },
    { name: `Co-payment (${copayPercent}%)`, value: -Math.round(copayApplied), type: 'deduction', color: '#EC4899' },
    { name: 'Estimated Insurer Payout', value: Math.round(estimatedInsurerShare), type: 'final', color: '#174C3C' },
  ].filter((step) => step.value !== 0 || step.type === 'start' || step.type === 'final');

  return {
    totalBilled,
    admissibleExpenses: baseAdmissible,
    nonPayableDeductions: Math.round(nonPayableDeductions),
    roomRentDeductions: Math.round(roomRentDeductions),
    sublimitDeductions: Math.round(sublimitDeductions),
    deductibleApplied: Math.round(deductibleApplied),
    copayApplied: Math.round(copayApplied),
    sumInsuredExceededDeduction: Math.round(sumInsuredExceededDeduction),
    estimatedInsurerShare: Math.round(estimatedInsurerShare),
    estimatedPatientShare: Math.round(estimatedPatientShare),
    insurerCoverageRatio: totalBilled > 0 ? Math.round((estimatedInsurerShare / totalBilled) * 100) : 0,
    patientShareRatio: totalBilled > 0 ? Math.round((estimatedPatientShare / totalBilled) * 100) : 0,
    itemizedDetails,
    waterfallSteps,
    timestamp: new Date().toISOString(),
  };
};
