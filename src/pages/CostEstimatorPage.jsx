// src/pages/CostEstimatorPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePolicy } from '../context/PolicyContext';
import { calculatorService } from '../services/calculatorService';
import { reportService } from '../services/reportService';
import { presetScenarios } from '../data/mockExpenses';
import { ExpenseEntryStep } from '../components/calculator/ExpenseEntryStep';
import { ResultsStep } from '../components/calculator/ResultsStep';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../utils/formatters';
import {
  Shield,
  User,
  ListPlus,
  Sliders,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CostEstimatorPage = () => {
  const location = useLocation();
  const { policies, selectedPolicy, selectedPolicyId, setSelectedPolicyId, saveReport } = usePolicy();

  // Wizard current active step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Selected Policy State
  const activePolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0];

  // Patient Info State (Step 2)
  const [patientInfo, setPatientInfo] = useState({
    patientName: 'Darpan Patel',
    age: 34,
    diagnosis: 'Laparoscopic Gallbladder Cholecystectomy',
    hospitalName: 'Apollo Multispeciality Hospital',
    admissionDate: new Date().toISOString().split('T')[0],
    dischargeDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    treatmentType: 'Planned Inpatient Surgery',
  });

  // Expense Items State (Step 3) - start with Gallbladder preset items
  const [expenses, setExpenses] = useState(() => presetScenarios[0].items);

  // Policy Conditions State (Step 4) - extracted & editable
  const [conditions, setConditions] = useState({
    sumInsured: activePolicy?.sumInsured || 1000000,
    deductible: activePolicy?.deductible || 15000,
    copayPercent: activePolicy?.copayPercent || 10,
    roomRentLimitPerDay: activePolicy?.roomRentLimitPerDay || 5000,
    actualRoomChargePerDay: 8000,
    hospitalStayDays: 3,
    hasConsumablesRider: !!activePolicy?.hasConsumablesRider,
    confirmedUnverified: true,
  });

  // Calculation Results State (Step 5)
  const [estimateResult, setEstimateResult] = useState(null);

  // Handle incoming transfer state from AI assistant
  useEffect(() => {
    if (location.state?.fromChat) {
      const { procedure, suggestedRoomLimit, deductible, copay } = location.state.fromChat;
      if (procedure) {
        setPatientInfo((prev) => ({ ...prev, diagnosis: procedure }));
      }
      setConditions((prev) => ({
        ...prev,
        roomRentLimitPerDay: suggestedRoomLimit !== undefined ? suggestedRoomLimit : prev.roomRentLimitPerDay,
        deductible: deductible !== undefined ? deductible : prev.deductible,
        copayPercent: copay !== undefined ? copay : prev.copayPercent,
      }));
      setCurrentStep(3); // Jump straight to expense review
      toast.success('Applied policy conditions from assistant');
    }
  }, [location.state]);

  // Sync policy conditions when active policy changes
  useEffect(() => {
    if (activePolicy) {
      setConditions((prev) => ({
        ...prev,
        sumInsured: activePolicy.sumInsured,
        deductible: activePolicy.deductible,
        copayPercent: activePolicy.copayPercent,
        roomRentLimitPerDay: activePolicy.roomRentLimitPerDay,
        hasConsumablesRider: !!activePolicy.hasConsumablesRider,
      }));
    }
  }, [activePolicy]);

  // Load a preset template
  const handleLoadScenario = (scen) => {
    setPatientInfo((prev) => ({
      ...prev,
      diagnosis: scen.diagnosis,
      hospitalName: scen.hospitalName,
      patientName: scen.patientName,
      age: scen.patientAge,
      treatmentType: scen.treatmentType,
    }));
    setExpenses(scen.items);
    setConditions((prev) => ({
      ...prev,
      actualRoomChargePerDay: scen.roomDailyCharge,
      hospitalStayDays: scen.stayDays,
    }));
    toast.success(`Loaded "${scen.name}" scenario`);
  };

  // Run calculation and proceed to Step 5
  const handleRunCalculation = () => {
    if (expenses.length === 0) {
      toast.error('Please add at least one medical expense item');
      return;
    }

    const result = calculatorService.estimateClaim(expenses, conditions);
    setEstimateResult(result);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Settlement estimation calculated!');
  };

  const stepsHeader = [
    { num: 1, title: 'Select Policy', icon: Shield },
    { num: 2, title: 'Patient Info', icon: User },
    { num: 3, title: 'Medical Expenses', icon: ListPlus },
    { num: 4, title: 'Policy Rules', icon: Sliders },
    { num: 5, title: 'Results & Audit', icon: FileCheck2 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-forest-900 font-heading">
            Out-of-Pocket Cost Estimator
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-400 mt-0.5">
            Simulate planned or post-discharge hospital bills against active policy terms
          </p>
        </div>

        {currentStep < 5 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-charcoal-500">
              Step {currentStep} of 5
            </span>
          </div>
        )}
      </div>

      {/* Wizard Step Progression Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-borderGray shadow-subtle overflow-x-auto">
        <div className="flex items-center justify-between min-w-[550px]">
          {stepsHeader.map((s, idx) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            const Icon = s.icon;

            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => {
                    // Allow jumping back to earlier steps or to step 5 if already calculated
                    if (s.num < currentStep || (s.num === 5 && estimateResult)) {
                      setCurrentStep(s.num);
                    }
                  }}
                  className={`flex items-center gap-2 text-xs font-semibold rounded-xl px-2.5 py-1.5 transition-all ${
                    isCurrent
                      ? 'bg-forest-700 text-white shadow-sm'
                      : isCompleted
                      ? 'text-forest-800 hover:bg-forest-50'
                      : 'text-charcoal-400 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isCurrent
                        ? 'bg-white text-forest-800'
                        : isCompleted
                        ? 'bg-forest-100 text-forest-800'
                        : 'bg-warmWhite text-charcoal-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" /> : s.num}
                  </div>
                  <span>{s.title}</span>
                </button>

                {idx < stepsHeader.length - 1 && (
                  <div
                    className={`h-[1.5px] flex-1 mx-2 transition-colors ${
                      isCompleted ? 'bg-forest-600' : 'bg-borderGray'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Select Policy */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-borderGray shadow-subtle space-y-6">
          <div className="max-w-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-forest-900 font-heading">
                Step 1: Choose Policy for Calculation
              </h3>
              <p className="text-xs text-charcoal-400 mt-0.5">
                Select from your uploaded health insurance policies to load its terms & conditions
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
                Active Insurance Policy
              </label>
              <select
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                className="w-full px-4 py-2.5 bg-warmWhite border border-borderGray rounded-xl text-sm font-semibold text-charcoal-800 focus:outline-none focus:ring-1 focus:ring-forest-500"
              >
                {policies.map((pol) => (
                  <option key={pol.id} value={pol.id}>
                    {pol.provider} — {pol.name} (Cover: ₹{(pol.sumInsured / 100000).toFixed(1)}L)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Policy Terms Snapshot */}
            {activePolicy && (
              <div className="p-4 bg-forest-50/70 border border-forest-100 rounded-xl space-y-3 text-xs">
                <span className="font-bold text-forest-900 block font-heading">
                  Loaded Policy Parameter Snapshot:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-forest-100">
                    <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Sum Insured</span>
                    <span className="font-bold text-forest-900 text-sm">{formatCurrency(activePolicy.sumInsured)}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-forest-100">
                    <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Room Rent Limit</span>
                    <span className="font-bold text-charcoal-800 text-sm">
                      {activePolicy.roomRentLimitPerDay > 0 ? `₹${activePolicy.roomRentLimitPerDay}/day` : 'No Cap'}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-forest-100">
                    <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Annual Deductible</span>
                    <span className="font-bold text-charcoal-800 text-sm">{formatCurrency(activePolicy.deductible)}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-forest-100">
                    <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Co-Payment</span>
                    <span className="font-bold text-charcoal-800 text-sm">{activePolicy.copayPercent}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-borderGray">
            <Button
              variant="primary"
              rightIcon={ArrowRight}
              onClick={() => setCurrentStep(2)}
            >
              Continue to Patient Info
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Patient Information */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-borderGray shadow-subtle space-y-6">
          <div className="max-w-3xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-forest-900 font-heading">
                Step 2: Patient & Hospital Admission Details
              </h3>
              <p className="text-xs text-charcoal-400 mt-0.5">
                Sensitive details are completely optional and stay within your local browser session
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Patient Name or Pseudonym
                </label>
                <input
                  type="text"
                  value={patientInfo.patientName}
                  onChange={(e) => setPatientInfo({ ...patientInfo, patientName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Patient Age
                </label>
                <input
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Diagnosis / Planned Surgery
                </label>
                <input
                  type="text"
                  value={patientInfo.diagnosis}
                  onChange={(e) => setPatientInfo({ ...patientInfo, diagnosis: e.target.value })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Treating Hospital Name
                </label>
                <input
                  type="text"
                  value={patientInfo.hospitalName}
                  onChange={(e) => setPatientInfo({ ...patientInfo, hospitalName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Admission Date
                </label>
                <input
                  type="date"
                  value={patientInfo.admissionDate}
                  onChange={(e) => setPatientInfo({ ...patientInfo, admissionDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Discharge Date
                </label>
                <input
                  type="date"
                  value={patientInfo.dischargeDate}
                  onChange={(e) => setPatientInfo({ ...patientInfo, dischargeDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-charcoal-600 font-medium mb-1">
                  Treatment / Care Classification
                </label>
                <select
                  value={patientInfo.treatmentType}
                  onChange={(e) => setPatientInfo({ ...patientInfo, treatmentType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                >
                  <option value="Planned Inpatient Surgery">Planned Inpatient Surgery</option>
                  <option value="Emergency Hospitalization">Emergency Hospitalization</option>
                  <option value="Daycare Surgical Procedure">Daycare Surgical Procedure (Under 24h)</option>
                  <option value="Critical Care / ICU Admission">Critical Care / ICU Admission</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-borderGray">
            <Button
              variant="ghost"
              leftIcon={ArrowLeft}
              onClick={() => setCurrentStep(1)}
            >
              Back to Policy
            </Button>
            <Button
              variant="primary"
              rightIcon={ArrowRight}
              onClick={() => setCurrentStep(3)}
            >
              Continue to Medical Expenses
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Medical Expense Entry */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-borderGray shadow-subtle space-y-6">
          <div>
            <h3 className="text-base font-bold text-forest-900 font-heading">
              Step 3: Enter Hospital Expenses & Bill Line Items
            </h3>
            <p className="text-xs text-charcoal-400 mt-0.5">
              Add individual items or load a benchmark clinical template
            </p>
          </div>

          <ExpenseEntryStep
            expenses={expenses}
            setExpenses={setExpenses}
            onLoadScenario={handleLoadScenario}
          />

          <div className="flex justify-between pt-4 border-t border-borderGray">
            <Button
              variant="ghost"
              leftIcon={ArrowLeft}
              onClick={() => setCurrentStep(2)}
            >
              Back to Patient Info
            </Button>
            <Button
              variant="primary"
              rightIcon={ArrowRight}
              disabled={expenses.length === 0}
              onClick={() => setCurrentStep(4)}
            >
              Configure Policy Rules
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Policy Conditions Verification */}
      {currentStep === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-borderGray shadow-subtle space-y-6">
          <div className="max-w-3xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-forest-900 font-heading">
                Step 4: Verify Extracted Policy Rules for Calculation
              </h3>
              <p className="text-xs text-charcoal-400 mt-0.5">
                Review or fine-tune deduction limits extracted from the policy before executing settlement
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Policy Room Rent Daily Cap (₹/day)
                </label>
                <input
                  type="number"
                  value={conditions.roomRentLimitPerDay}
                  onChange={(e) => setConditions({ ...conditions, roomRentLimitPerDay: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
                <span className="text-[10px] text-charcoal-400 mt-1 block">Set 0 if policy has No Room Limit</span>
              </div>

              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Actual Hospital Room Tariff Billed (₹/day)
                </label>
                <input
                  type="number"
                  value={conditions.actualRoomChargePerDay}
                  onChange={(e) => setConditions({ ...conditions, actualRoomChargePerDay: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
                <span className="text-[10px] text-amber-700 mt-1 block">
                  {conditions.actualRoomChargePerDay > conditions.roomRentLimitPerDay && conditions.roomRentLimitPerDay > 0
                    ? `⚠️ Exceeds limit by ₹${conditions.actualRoomChargePerDay - conditions.roomRentLimitPerDay}/day`
                    : 'Within policy limit'}
                </span>
              </div>

              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Annual Aggregate Deductible (₹)
                </label>
                <input
                  type="number"
                  value={conditions.deductible}
                  onChange={(e) => setConditions({ ...conditions, deductible: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Applicable Co-Payment (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={conditions.copayPercent}
                  onChange={(e) => setConditions({ ...conditions, copayPercent: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Hospital Stay Length (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={conditions.hospitalStayDays}
                  onChange={(e) => setConditions({ ...conditions, hospitalStayDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-charcoal-600 font-medium mb-1">
                  Consumables Rider Active?
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conditions.hasConsumablesRider}
                      onChange={(e) => setConditions({ ...conditions, hasConsumablesRider: e.target.checked })}
                      className="rounded text-forest-700 focus:ring-forest-500"
                    />
                    <span className="font-semibold text-charcoal-800">Yes, policy covers consumables</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="p-3 bg-warmWhite rounded-xl border border-borderGray flex items-center gap-2.5">
              <input
                type="checkbox"
                id="confirm-rules"
                checked={conditions.confirmedUnverified}
                onChange={(e) => setConditions({ ...conditions, confirmedUnverified: e.target.checked })}
                className="rounded text-forest-700 focus:ring-forest-500"
              />
              <label htmlFor="confirm-rules" className="text-xs text-charcoal-700 cursor-pointer">
                I verify that the above deductible and room rent rates match my policy schedule.
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-borderGray">
            <Button
              variant="ghost"
              leftIcon={ArrowLeft}
              onClick={() => setCurrentStep(3)}
            >
              Back to Expenses
            </Button>
            <Button
              variant="primary"
              disabled={!conditions.confirmedUnverified}
              rightIcon={Sparkles}
              onClick={handleRunCalculation}
            >
              Execute Estimate Calculation
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: Visual Results Dashboard */}
      {currentStep === 5 && estimateResult && (
        <ResultsStep
          estimate={estimateResult}
          patientInfo={patientInfo}
          policy={activePolicy}
          onSaveReport={async () => {
            const newReport = {
              reportName: `${patientInfo.diagnosis || 'Hospital Claim'} - Estimate Analysis`,
              policyId: activePolicy?.id,
              policyName: activePolicy?.name,
              provider: activePolicy?.provider,
              patientName: patientInfo.patientName || "Insured Patient",
              patientAge: Number(patientInfo.age) || 35,
              diagnosis: patientInfo.diagnosis || "Medical Inpatient Treatment",
              hospitalName: patientInfo.hospitalName || "Partner Network Hospital",
              treatmentType: patientInfo.treatmentType || "Inpatient Care",
              admissionDate: patientInfo.admissionDate || new Date().toISOString().split('T')[0],
              dischargeDate: patientInfo.dischargeDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
              dateCreated: new Date().toISOString().split('T')[0],
              totalBilled: estimateResult.totalBilled,
              estimatedInsurerShare: estimateResult.estimatedInsurerShare,
              estimatedPatientShare: estimateResult.estimatedPatientShare,
              deductibleApplied: estimateResult.deductibleApplied,
              copayApplied: estimateResult.copayApplied,
              nonPayableDeductions: estimateResult.nonPayableDeductions,
              roomRentDeductions: estimateResult.roomRentDeductions,
              status: "Completed",
              itemizedCount: estimateResult.itemizedDetails?.length || 0,
              notes: `Automated estimate generated using MediSure AI. Policy deductible: ₹${Number(estimateResult.deductibleApplied || 0).toLocaleString('en-IN')}, Room rent limit: ₹${activePolicy?.roomRentLimitPerDay || 0}/day.`,
            };
            return await saveReport(newReport);
          }}
          onEditScenario={() => setCurrentStep(3)}
          onDownloadReport={() => {
            const tempReport = {
              id: `SIM-${Date.now()}`,
              reportName: `${patientInfo.diagnosis} - Estimate Analysis`,
              policyId: activePolicy.id,
              policyName: activePolicy.name,
              provider: activePolicy.provider,
              patientName: patientInfo.patientName,
              patientAge: patientInfo.age,
              diagnosis: patientInfo.diagnosis,
              hospitalName: patientInfo.hospitalName,
              treatmentType: patientInfo.treatmentType,
              admissionDate: patientInfo.admissionDate,
              dischargeDate: patientInfo.dischargeDate,
              dateCreated: new Date().toISOString().split('T')[0],
              totalBilled: estimateResult.totalBilled,
              estimatedInsurerShare: estimateResult.estimatedInsurerShare,
              estimatedPatientShare: estimateResult.estimatedPatientShare,
              deductibleApplied: estimateResult.deductibleApplied,
              copayApplied: estimateResult.copayApplied,
              nonPayableDeductions: estimateResult.nonPayableDeductions,
              roomRentDeductions: estimateResult.roomRentDeductions,
              status: 'Simulated',
            };
            reportService.printReport(tempReport);
          }}
        />
      )}
    </div>
  );
};
