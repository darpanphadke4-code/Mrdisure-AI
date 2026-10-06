// src/services/calculatorService.js
import { calculateClaimEstimate } from '../utils/calculationEngine';
import { presetScenarios } from '../data/mockExpenses';
import { reportService } from './reportService';

export const calculatorService = {
  /**
   * Run settlement estimation calculation
   */
  estimateClaim: (expenses, conditions) => {
    return calculateClaimEstimate(expenses, conditions);
  },

  /**
   * Get built-in hospital bill templates
   */
  getPresetScenarios: () => {
    return presetScenarios;
  },

  getScenarioById: (id) => {
    return presetScenarios.find((s) => s.id === id) || presetScenarios[0];
  },

  /**
   * Save calculation result as a formal report
   */
  saveAsReport: (estimateData, patientInfo, policy) => {
    const newReport = {
      id: `rep-${Date.now()}`,
      reportName: `${patientInfo.diagnosis || 'Hospital Claim'} - Estimate Analysis`,
      policyId: policy.id,
      policyName: policy.name,
      provider: policy.provider,
      patientName: patientInfo.patientName || "Insured Patient",
      patientAge: Number(patientInfo.age) || 35,
      diagnosis: patientInfo.diagnosis || "Medical Inpatient Treatment",
      hospitalName: patientInfo.hospitalName || "Partner Network Hospital",
      treatmentType: patientInfo.treatmentType || "Inpatient Care",
      admissionDate: patientInfo.admissionDate || new Date().toISOString().split('T')[0],
      dischargeDate: patientInfo.dischargeDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      dateCreated: new Date().toISOString().split('T')[0],
      totalBilled: estimateData.totalBilled,
      estimatedInsurerShare: estimateData.estimatedInsurerShare,
      estimatedPatientShare: estimateData.estimatedPatientShare,
      deductibleApplied: estimateData.deductibleApplied,
      copayApplied: estimateData.copayApplied,
      nonPayableDeductions: estimateData.nonPayableDeductions,
      roomRentDeductions: estimateData.roomRentDeductions,
      status: "Completed",
      itemizedCount: estimateData.itemizedDetails?.length || 0,
      notes: `Automated estimate generated using MediSure AI. Policy deductible: ₹${estimateData.deductibleApplied.toLocaleString('en-IN')}, Room rent limit: ₹${policy.roomRentLimitPerDay || 0}/day.`,
    };

    return reportService.saveReport(newReport);
  }
};
