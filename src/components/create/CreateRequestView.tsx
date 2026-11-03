import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminWorkFormData, PriorityLevel, AttachmentItem } from '../../types/index';
import { AdminWorkRequestDocument } from '../document/AdminWorkRequestDocument';
import { SignatureModal } from '../modals/SignatureModal';
import {
  FileText,
  Printer,
  Download,
  Maximize2,
  Minimize2,
  Save,
  RotateCcw,
  Send,
  Calendar,
  AlertCircle,
  CheckCircle,
  Paperclip,
  Upload,
  Trash2,
} from 'lucide-react';

export const CreateRequestView: React.FC = () => {
  const {
    currentUser,
    selectedCompany,
    currentWorkflow,
    draftFormData,
    saveDraft,
    clearDraft,
    submitNewRequest,
    setActiveView,
    openReviewRequest,
  } = useApp();

  const [dateOfRequest, setDateOfRequest] = useState(() => {
    return (
      draftFormData?.dateOfRequest ||
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    );
  });

  const [department, setDepartment] = useState(
    draftFormData?.department || currentUser.department || 'Admin'
  );

  const [priority, setPriority] = useState<PriorityLevel>(
    (draftFormData?.priority as PriorityLevel) || 'Urgent'
  );

  const [workDescription, setWorkDescription] = useState(
    draftFormData?.workDescription ||
      'Renovation of the main meeting room (carpet replacement, painting and lighting upgrade). Please arrange vendor quotation and approval.'
  );

  const [documents, setDocuments] = useState(
    draftFormData?.documents || {
      onlineDocumentChamber: true,
      physicalDocumentChamber: false,
      companyDocumentAjeer: false,
      employeeSalaryCertificate: false,
      permanentEmploymentVisa: false,
      workVisitVisa: false,
      businessVisitVisa: false,
      agencyWakala: false,
      others: false,
      othersDescription: '',
    }
  );

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [autoPreview, setAutoPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Auto-save draft on changes
  useEffect(() => {
    saveDraft({
      dateOfRequest,
      department,
      priority,
      workDescription,
      documents,
    });
  }, [dateOfRequest, department, priority, workDescription, documents]);

  // Construct active document preview data:
  // Note: Requester signature is intentionally undefined before submission confirmation
  // to prevent displaying a completed cursive signature on draft forms.
  const previewData: AdminWorkFormData = {
    dateOfRequest,
    companyId: selectedCompany.id,
    companyName: selectedCompany.fullName,
    requesterId: currentUser.id,
    requesterName: currentUser.name,
    department,
    priority,
    workDescription,
    documents,
    requesterSignatureName: undefined,
    requesterSignatureDataUrl: undefined,
    approvalAuthoritySignatureName: undefined,
    approvalAuthoritySignatureDataUrl: undefined,
  };

  const handleDocumentToggle = (key: keyof typeof documents) => {
    setDocuments((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const sizeFormatted =
          file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;

        const newAtt: AttachmentItem = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          sizeBytes: file.size,
          sizeFormatted,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser.name,
          mimeType: file.type || 'application/octet-stream',
          dataUrl,
        };

        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
    // Reset file input
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the form entries?')) {
      clearDraft();
      setWorkDescription('');
      setAttachments([]);
      setDocuments({
        onlineDocumentChamber: false,
        physicalDocumentChamber: false,
        companyDocumentAjeer: false,
        employeeSalaryCertificate: false,
        permanentEmploymentVisa: false,
        workVisitVisa: false,
        businessVisitVisa: false,
        agencyWakala: false,
        others: false,
        othersDescription: '',
      });
      setFeedbackSuccess('Form cleared.');
      setTimeout(() => setFeedbackSuccess(null), 3000);
    }
  };

  const handleTriggerSubmit = () => {
    setValidationError(null);
    if (!workDescription.trim()) {
      setValidationError('Please enter a work description before submitting.');
      return;
    }
    // Open signature confirmation modal
    setSignatureModalOpen(true);
  };

  const handleConfirmedSubmit = (signatureDataUrl: string) => {
    const result = submitNewRequest(
      previewData,
      attachments,
      attachments.length > 0
        ? `Request submitted with ${attachments.length} supporting attachment(s).`
        : 'Request submitted.',
      signatureDataUrl
    );

    if (result.success && result.newId) {
      setFeedbackSuccess(`Request ${result.newId} submitted successfully!`);
      // Navigate to review & sign for this request
      setTimeout(() => {
        openReviewRequest(result.newId!);
      }, 800);
    } else {
      setValidationError(result.error || 'Failed to submit request.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className="hover:text-purple-600 transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-slate-400">New Request</span>
            <span>/</span>
            <span className="text-purple-700 font-semibold">Admin Work Request</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Admin Work Request
              </h1>
              <p className="text-xs text-slate-500">
                Fill in the details below. The form will be generated as per company format (PR#21-001FA).
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Routing Summary */}
        <div className="bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs flex items-center gap-3">
          <span className="font-semibold text-slate-700">Approval Route:</span>
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="text-purple-700 font-bold">{currentUser.name}</span>
            <span>(Submit)</span>
            <span className="text-slate-400">→</span>
            <span className="font-semibold text-slate-800">Shekar</span>
            <span>(GM)</span>
            <span className="text-slate-400">→</span>
            <span className="font-semibold text-slate-800">Afzal Kazi</span>
            <span>(Director)</span>
          </div>
        </div>
      </div>

      {/* Validation feedback alerts */}
      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {feedbackSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Split-Screen: Left Input (50%) + Right Document Preview (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Input Panel (5 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
          {/* Section: Request Information */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Request Information
              </h2>
              <span className="text-[11px] text-slate-400 font-normal">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date of Request */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>Date of Request</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dateOfRequest}
                    onChange={(e) => setDateOfRequest(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-medium"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>Company</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedCompany.fullName}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>

              {/* Requester */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>Name of the Requester</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentUser.name}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>Department</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-medium"
                />
              </div>
            </div>

            {/* Priority selection */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Priority</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Urgent', 'Medium', 'Low'] as PriorityLevel[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      priority === p
                        ? 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p === 'Urgent'
                          ? 'bg-red-500'
                          : p === 'Medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Work Description */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>Work Description</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {workDescription.length} / 500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Specify administrative work details, room renovation, visa requests, etc."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed font-normal"
              />
            </div>
          </div>

          {/* Section: Documents Checklist (Matching original form) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Documents Checklist
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={documents.onlineDocumentChamber}
                  onChange={() => handleDocumentToggle('onlineDocumentChamber')}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-700">1. Online Document Chamber</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={documents.workVisitVisa}
                  onChange={() => handleDocumentToggle('workVisitVisa')}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-700">6. Work Visit Visa</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={documents.physicalDocumentChamber}
                  onChange={() => handleDocumentToggle('physicalDocumentChamber')}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-700">2. Physical Document Chamber</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={documents.businessVisitVisa}
                  onChange={() => handleDocumentToggle('businessVisitVisa')}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-700">7. Business Visit Visa</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={documents.companyDocumentAjeer}
                  onChange={() => handleDocumentToggle('companyDocumentAjeer')}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-700">3. Company document Ajeer</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={documents.agencyWakala}
                  onChange={() => handleDocumentToggle('agencyWakala')}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-700">8. Agency Wakala</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={documents.employeeSalaryCertificate}
                  onChange={() => handleDocumentToggle('employeeSalaryCertificate')}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-700">4. Employee Salary Certificate</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={documents.permanentEmploymentVisa}
                  onChange={() => handleDocumentToggle('permanentEmploymentVisa')}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-700">5. Permanent Employment Visa</span>
              </label>
            </div>

            {/* Others entry */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={documents.others}
                onChange={() => handleDocumentToggle('others')}
                className="rounded text-purple-600 focus:ring-purple-500"
                id="check-others"
              />
              <label htmlFor="check-others" className="text-xs font-semibold text-slate-700 shrink-0">
                9. Others:
              </label>
              <input
                type="text"
                placeholder="Describe additional document if applicable..."
                value={documents.othersDescription}
                onChange={(e) =>
                  setDocuments((prev) => ({
                    ...prev,
                    others: true,
                    othersDescription: e.target.value,
                  }))
                }
                className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Section: Supporting Attachments (Upload & Management) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Supporting Attachments ({attachments.length})</span>
              </h2>
              <label className="cursor-pointer text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors">
                <Upload className="w-3 h-3" />
                <span>Add Files</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {attachments.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500">
                No attachments added. Upload quotes, specifications, or reference files (optional).
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase">
                        {att.name.split('.').pop() || 'FILE'}
                      </span>
                      <span className="font-medium text-slate-800 truncate">{att.name}</span>
                      <span className="text-[10px] text-slate-400">({att.sizeFormatted})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Signatures Preview */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Signatures
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Requester Signature (Name)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${currentUser.name} (Upon submission)`}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Approval Authority Signature (Name)
                </label>
                <input
                  type="text"
                  readOnly
                  value="Pending Workflow Approval"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 italic cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  saveDraft({
                    dateOfRequest,
                    department,
                    priority,
                    workDescription,
                    documents,
                  });
                  setFeedbackSuccess('Draft saved locally.');
                  setTimeout(() => setFeedbackSuccess(null), 2500);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Form</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleTriggerSubmit}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Request</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Document Preview (6 cols) */}
        <div
          className={`lg:col-span-6 space-y-4 ${
            isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/90 p-8 overflow-y-auto' : ''
          }`}
        >
          {/* Preview Toolbar */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Form Preview (Print Format)</span>
              <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Live Bilingual
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto preview toggle */}
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <span>Auto Preview</span>
                <input
                  type="checkbox"
                  checked={autoPreview}
                  onChange={(e) => setAutoPreview(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
              </label>

              {/* Print / Save as PDF */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1 px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                title="Print or Save as PDF via browser print dialog"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF (A4)</span>
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1 text-slate-500 hover:text-slate-800 rounded"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Rendered Bilingual Document Container */}
          <div className="printable-area bg-slate-100 p-4 rounded-xl border border-slate-200 overflow-x-auto flex justify-center">
            {autoPreview ? (
              <AdminWorkRequestDocument data={previewData} />
            ) : (
              <div className="p-12 text-center text-xs text-slate-400">
                Auto-preview is paused.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Confirmation Modal */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        user={currentUser}
        title="Confirm Requester E-Signature"
        confirmLabel="Sign & Submit to Workflow"
        onConfirm={handleConfirmedSubmit}
      />
    </div>
  );
};
