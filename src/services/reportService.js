// src/services/reportService.js
import { initialReports } from '../data/mockReports';
import { formatCurrency, formatDate } from '../utils/formatters';

const REPORTS_KEY = 'medisure_reports';

export const reportService = {
  /**
   * Get all reports
   */
  getReports: () => {
    try {
      const stored = localStorage.getItem(REPORTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to fetch reports from localStorage', e);
    }
    localStorage.setItem(REPORTS_KEY, JSON.stringify(initialReports));
    return initialReports;
  },

  /**
   * Get single report
   */
  getReportById: (id) => {
    const list = reportService.getReports();
    return list.find((r) => r.id === id) || list[0] || null;
  },

  /**
   * Save a new report
   */
  saveReport: (report) => {
    const reports = reportService.getReports();
    const updated = [report, ...reports];
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    return report;
  },

  /**
   * Delete report
   */
  deleteReport: (id) => {
    const reports = reportService.getReports();
    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Reset reports
   */
  resetReports: () => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(initialReports));
    return initialReports;
  },

  /**
   * Generate clean printable HTML / trigger browser print for client-side export
   */
  printReport: (report) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow popups to print/download the report.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MediSure AI Report - ${report.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #202B27; margin: 40px; }
          .header { border-bottom: 2px solid #174C3C; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 24px; font-weight: 700; color: #174C3C; }
          .meta { font-size: 13px; color: #6C7B74; text-align: right; }
          .title-section { margin: 24px 0; }
          .title-section h1 { font-size: 22px; margin: 0 0 6px 0; color: #174C3C; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; background: #F7F8F5; padding: 16px; border-radius: 8px; }
          .stat-box { margin-bottom: 8px; }
          .stat-label { font-size: 11px; text-transform: uppercase; color: #6C7B74; letter-spacing: 0.5px; }
          .stat-value { font-size: 15px; font-weight: 600; color: #202B27; margin-top: 2px; }
          .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
          .card { border: 1px solid #E8ECE8; border-radius: 8px; padding: 16px; }
          .card-title { font-size: 13px; color: #6C7B74; margin-bottom: 6px; }
          .card-amount { font-size: 28px; font-weight: 700; }
          .insurer { color: #174C3C; border-top: 4px solid #174C3C; }
          .patient { color: #E11D48; border-top: 4px solid #E11D48; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th { background: #E8ECE8; text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; }
          td { padding: 10px 12px; border-bottom: 1px solid #E8ECE8; font-size: 13px; }
          .disclaimer { margin-top: 36px; padding: 14px; background: #FFFBEB; border-left: 4px solid #F59E0B; font-size: 12px; color: #92400E; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">MediSure AI · Policy Analysis</div>
          <div class="meta">
            <div>Report Ref: <strong>${report.id}</strong></div>
            <div>Generated: ${formatDate(report.dateCreated)}</div>
          </div>
        </div>

        <div class="title-section">
          <h1>${report.reportName}</h1>
          <p style="color: #6C7B74; margin: 0;">Policy: <strong>${report.policyName}</strong> (${report.provider})</p>
        </div>

        <div class="grid">
          <div>
            <div class="stat-box">
              <div class="stat-label">Patient Name</div>
              <div class="stat-value">${report.patientName} (${report.patientAge} yrs)</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Diagnosis</div>
              <div class="stat-value">${report.diagnosis}</div>
            </div>
          </div>
          <div>
            <div class="stat-box">
              <div class="stat-label">Hospital & Treatment</div>
              <div class="stat-value">${report.hospitalName} (${report.treatmentType})</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Admission Dates</div>
              <div class="stat-value">${formatDate(report.admissionDate)} to ${formatDate(report.dischargeDate)}</div>
            </div>
          </div>
        </div>

        <div class="cards">
          <div class="card insurer">
            <div class="card-title">Estimated Insurer Payout</div>
            <div class="card-amount">${formatCurrency(report.estimatedInsurerShare)}</div>
          </div>
          <div class="card patient">
            <div class="card-title">Estimated Patient Out-of-Pocket</div>
            <div class="card-amount">${formatCurrency(report.estimatedPatientShare)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Calculation Breakdown Step</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Hospital Billed Amount</td>
              <td style="text-align: right; font-weight: 600;">${formatCurrency(report.totalBilled)}</td>
            </tr>
            <tr>
              <td>Non-Covered Consumables / Admin Charges</td>
              <td style="text-align: right; color: #E11D48;">-${formatCurrency(report.nonPayableDeductions)}</td>
            </tr>
            <tr>
              <td>Room Rent Proportionate Reduction</td>
              <td style="text-align: right; color: #E11D48;">-${formatCurrency(report.roomRentDeductions)}</td>
            </tr>
            <tr>
              <td>Annual Aggregate Deductible</td>
              <td style="text-align: right; color: #8B5CF6;">-${formatCurrency(report.deductibleApplied)}</td>
            </tr>
            <tr>
              <td>Co-Payment Applied</td>
              <td style="text-align: right; color: #EC4899;">-${formatCurrency(report.copayApplied || 0)}</td>
            </tr>
            <tr style="background: #F7F8F5; font-weight: 700;">
              <td>Net Admissible Claim Payable by Insurer</td>
              <td style="text-align: right; color: #174C3C;">${formatCurrency(report.estimatedInsurerShare)}</td>
            </tr>
          </tbody>
        </table>

        <div class="disclaimer">
          <strong>Important Disclaimer:</strong> This document represents an illustrative simulation generated by MediSure AI frontend prototype. Settlement is subject to final verification of official medical records by the Insurer / Third Party Administrator (TPA) and specific policy endorsements.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
};
