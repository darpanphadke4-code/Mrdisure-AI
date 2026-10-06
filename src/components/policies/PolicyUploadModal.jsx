// src/components/policies/PolicyUploadModal.jsx
import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { usePolicy } from '../../context/PolicyContext';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PolicyUploadModal = ({ isOpen, onClose }) => {
  const { uploadPolicy } = usePolicy();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  const [newPolicyResult, setNewPolicyResult] = useState(null);

  // Form metadata for simulated parsing
  const [metadata, setMetadata] = useState({
    provider: 'Niva Bupa Health Insurance',
    policyName: 'Health Companion Gold Policy',
    policyNumber: 'NB/2024/774819X',
    policyType: 'Individual Comprehensive',
    sumInsured: 1000000,
    deductible: 10000,
    copayPercent: 0,
    roomRentLimit: 5000,
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF policy document');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds the 25 MB limit');
      return;
    }

    setSelectedFile(file);
    // Auto-fill policy name from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    setMetadata((prev) => ({
      ...prev,
      policyName: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    }));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadState('idle');
    setNewPolicyResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setUploadState('uploading');
    setUploadProgress(10);

    try {
      const result = await uploadPolicy(
        selectedFile,
        metadata,
        (progress) => {
          setUploadProgress(progress);
          if (progress > 60 && progress < 100) {
            setUploadState('processing');
          }
        }
      );

      setNewPolicyResult(result);
      setUploadState('success');
      toast.success('Policy document parsed into frontend demo state!');
    } catch (error) {
      setUploadState('error');
      toast.error('Failed to parse policy document.');
    }
  };

  const handleResetAndClose = () => {
    handleRemoveFile();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Upload Insurance Policy Document"
      subtitle="PDF upload with simulated AI clause extraction & table parsing"
      maxWidth="max-w-xl"
    >
      {uploadState === 'success' && newPolicyResult ? (
        /* Success State */
        <div className="py-6 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-subtle">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-forest-900 font-heading">
              Policy Successfully Ingested (Demo Simulation)
            </h4>
            <p className="text-xs text-charcoal-500 max-w-md mx-auto mt-1">
              Your document <strong className="text-charcoal-800">{selectedFile?.name}</strong> has been parsed into the local demo workspace with mock extracted clauses.
            </p>
          </div>

          <div className="bg-forest-50 p-4 rounded-xl border border-forest-100 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-charcoal-400">Extracted Provider:</span>
              <span className="font-bold text-forest-900">{newPolicyResult.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-400">Sum Insured:</span>
              <span className="font-bold text-forest-900">₹{newPolicyResult.sumInsured.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-400">Room Rent Limit:</span>
              <span className="font-bold text-forest-900">₹{newPolicyResult.roomRentLimitPerDay}/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-400">Deductible:</span>
              <span className="font-bold text-forest-900">₹{newPolicyResult.deductible.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Button variant="primary" onClick={handleResetAndClose}>
              View in Policies Dashboard
            </Button>
          </div>
        </div>
      ) : (
        /* Upload & Form State */
        <div className="space-y-5">
          {/* Notice banner */}
          <div className="p-3 bg-warmWhite rounded-xl border border-borderGray flex items-start gap-2.5 text-xs text-charcoal-600">
            <Sparkles className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
            <span>
              <strong>Frontend Prototype Demo:</strong> This form simulates OCR parsing and clause analysis. In production, this connects to FastAPI and doc-intelligence OCR models.
            </span>
          </div>

          {/* Drag & Drop Box */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-forest-600 bg-forest-50/50'
                  : 'border-sage-300 hover:border-forest-500 hover:bg-forest-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 bg-forest-50 text-forest-700 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-forest-100 shadow-subtle">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-forest-900 font-heading">
                Drag and drop your insurance policy PDF here
              </p>
              <p className="text-xs text-charcoal-400 mt-1">
                or click to browse from your device
              </p>
              <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-white rounded-full border border-borderGray text-[11px] text-charcoal-500">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
                <span>Format: PDF · Max size: 25 MB</span>
              </div>
            </div>
          ) : (
            /* Selected File Card */
            <div className="p-4 bg-white rounded-xl border border-forest-200 shadow-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-charcoal-900 truncate max-w-[280px]">
                      {selectedFile.name}
                    </h5>
                    <p className="text-[11px] text-charcoal-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for analysis
                    </p>
                  </div>
                </div>
                {uploadState === 'idle' && (
                  <button
                    onClick={handleRemoveFile}
                    className="p-1 text-charcoal-400 hover:text-rose-600 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Progress Bar during Upload */}
              {uploadState !== 'idle' && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-charcoal-500 font-medium">
                    <span>
                      {uploadState === 'uploading' && 'Simulating document upload...'}
                      {uploadState === 'processing' && 'Extracting clauses & room rent limits...'}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-forest-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-forest-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form metadata fields for realistic demo control */}
          <div className="bg-warmWhite/70 p-4 rounded-xl border border-borderGray space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 font-heading">
              Extracted Parameters (Editable Demo Controls)
            </h5>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-charcoal-500 text-[11px] mb-1 font-medium">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  value={metadata.provider}
                  onChange={(e) => setMetadata({ ...metadata, provider: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-borderGray rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-charcoal-500 text-[11px] mb-1 font-medium">
                  Policy Name
                </label>
                <input
                  type="text"
                  value={metadata.policyName}
                  onChange={(e) => setMetadata({ ...metadata, policyName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-borderGray rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-charcoal-500 text-[11px] mb-1 font-medium">
                  Sum Insured (₹)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={metadata.sumInsured}
                  onChange={(e) => setMetadata({ ...metadata, sumInsured: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-borderGray rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-charcoal-500 text-[11px] mb-1 font-medium">
                  Room Rent Limit / Day (₹)
                </label>
                <input
                  type="number"
                  step="500"
                  value={metadata.roomRentLimit}
                  onChange={(e) => setMetadata({ ...metadata, roomRentLimit: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-borderGray rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-borderGray">
            <Button
              variant="ghost"
              onClick={handleResetAndClose}
              disabled={uploadState === 'uploading' || uploadState === 'processing'}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!selectedFile || uploadState === 'uploading' || uploadState === 'processing'}
              isLoading={uploadState === 'uploading' || uploadState === 'processing'}
              onClick={handleStartUpload}
            >
              Start Analysis
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
