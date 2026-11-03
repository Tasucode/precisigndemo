import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminWorkFormData } from '../../types/index';
import { AdminWorkRequestDocument } from '../document/AdminWorkRequestDocument';
import { SignatureModal } from '../modals/SignatureModal';
import {
  FileText,
  Clock,
  Printer,
  Download,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Send,
  Eye,
  ShieldAlert,
  Paperclip,
} from 'lucide-react';

export const ReviewSignView: React.FC = () => {
  const {
    selectedRequestId,
    companyRequests,
    currentUser,
    approveRequest,
    returnRequest,
    rejectRequestAction,
    directorOverrideAction,
    resubmitRequest,
    setActiveView,
  } = useApp();

  // Find active request
  const request = companyRequests.find((r) => r.id === selectedRequestId) || companyRequests[0];

  const [comment, setComment] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<number>(request ? request.documentVersion : 1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<'return' | 'reject' | 'override' | 'resubmit' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Full correction form state if resubmitting
  const [correctedForm, setCorrectedForm] = useState<AdminWorkFormData>(request ? request.formData : ({} as any));

  if (!request) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="text-slate-400">No request selected.</div>
        <button
          onClick={() => setActiveView('dashboard')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Active form data according to selected version
  const activeFormData =
    selectedVersion === request.documentVersion
      ? request.formData
      : request.versionSnapshots.find((v) => v.version === selectedVersion)?.formData || request.formData;

  const currentStep = request.approvalSteps[request.currentStageIndex];
  const isAssignedApprover =
    request.status === 'Pending Approval' && currentStep?.assignedUserId === currentUser.id;
  const isRequester = request.requesterId === currentUser.id;
  const isDirector = currentUser.role === 'Director';

  const calculateDuration = (dateStr: string) => {
    const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hrs ${mins} min`;
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(request.id);
    setActionSuccess('Request ID copied to clipboard');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleViewAttachment = (att: any) => {
    if (att.dataUrl) {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${att.dataUrl}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      }
    } else {
      setActionSuccess(
        `Prototype note: "${att.name}" is a sample reference item without local binary data. Upload a real file on Create Request to preview content.`
      );
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleDownloadAttachment = (att: any) => {
    if (att.dataUrl) {
      const a = document.createElement('a');
      a.href = att.dataUrl;
      a.download = att.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setActionSuccess(`Downloaded ${att.name}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(
        `Prototype note: Binary data for "${att.name}" is not stored in this browser session. Upload a real file on Create Request to test download.`
      );
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleApproveClick = () => {
    setActionError(null);
    if (!isAssignedApprover && !isDirector) {
      setActionError(`Unauthorized: Stage is assigned to ${currentStep?.assignedUserName}.`);
      return;
    }
    setSignatureModalOpen(true);
  };

  const handleConfirmedApproval = (signatureDataUrl: string) => {
    const result = approveRequest(request.id, comment.trim() || undefined, signatureDataUrl);
    if (result.success) {
      setActionSuccess('Request stage approved successfully!');
      setComment('');
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(result.error || 'Failed to approve request');
    }
  };

  const handleReturnSubmit = () => {
    if (!actionReason.trim()) {
      setActionError('Reason is required to return for correction.');
      return;
    }
    const result = returnRequest(request.id, actionReason.trim());
    if (result.success) {
      setActionModal(null);
      setActionReason('');
      setActionSuccess('Request returned for correction.');
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(result.error || 'Failed to return request');
    }
  };

  const handleRejectSubmit = () => {
    if (!actionReason.trim()) {
      setActionError('Reason is required to reject request.');
      return;
    }
    const result = rejectRequestAction(request.id, actionReason.trim());
    if (result.success) {
      setActionModal(null);
      setActionReason('');
      setActionSuccess('Request rejected.');
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(result.error || 'Failed to reject request');
    }
  };

  const handleOverrideSubmit = () => {
    if (!actionReason.trim()) {
      setActionError('Reason is required for Director Override.');
      return;
    }
    const result = directorOverrideAction(request.id, actionReason.trim());
    if (result.success) {
      setActionModal(null);
      setActionReason('');
      setActionSuccess('Request approved via Director Override.');
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(result.error || 'Failed to execute director override');
    }
  };

  const handleResubmitAction = () => {
    const result = resubmitRequest(
      request.id,
      correctedForm,
      actionReason || 'Corrected per approver feedback'
    );
    if (result.success) {
      setActionModal(null);
      setActionReason('');
      setActionSuccess('Request resubmitted successfully!');
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(result.error || 'Failed to resubmit request');
    }
  };

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className="hover:text-purple-600 transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <button
              onClick={() => setActiveView('requests')}
              className="hover:text-purple-600 transition-colors"
            >
              Pending My Approval
            </button>
            <span>/</span>
            <span className="text-purple-700 font-semibold">{request.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Review &amp; Sign</h1>
              <p className="text-xs text-slate-500">
                Review the submitted document and take an action.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Split Layout: Left 32% (4 cols) & Right 68% (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: 32% Approval Controls */}
        <div className="no-print lg:col-span-4 space-y-4">
          {/* Card: Document Type & Status Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">{request.formType}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs font-bold text-slate-700">{request.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Copy Request ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : request.status === 'Returned for Correction'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : request.status === 'Rejected'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                  {request.status}
                </span>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Pending for {calculateDuration(request.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Approval Workflow Stepper (Matching Image 3) */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Approval Workflow</span>
              </div>

              {/* Horizontal visual stepper */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between gap-2 overflow-x-auto">
                {/* Requester Step */}
                <div className="flex flex-col items-center text-center min-w-[70px]">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-1 shadow-xs">
                    ✓
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {request.requesterName}
                  </div>
                  <div className="text-[10px] text-slate-500">Requester</div>
                  <span className="mt-1 text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                    Submitted
                  </span>
                </div>

                {/* Workflow stages */}
                {request.approvalSteps.map((step, idx) => {
                  const isDone = step.status === 'Approved';
                  const isCurrent =
                    step.status === 'Pending' && request.status === 'Pending Approval';
                  const isBypassed = step.status === 'Bypassed';

                  return (
                    <React.Fragment key={step.stageId}>
                      <div className="h-[2px] w-6 bg-slate-300 mx-1 shrink-0" />
                      <div className="flex flex-col items-center text-center min-w-[80px]">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 shadow-xs ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-purple-600 text-white ring-2 ring-purple-200 animate-pulse'
                              : isBypassed
                              ? 'bg-slate-300 text-slate-600'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {isDone ? '✓' : isBypassed ? '—' : idx + 1}
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {step.assignedUserName}
                        </div>
                        <div className="text-[10px] text-slate-500">{step.assignedRole}</div>
                        <span
                          className={`mt-1 text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCurrent
                              ? 'bg-purple-100 text-purple-800'
                              : isBypassed
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isDone
                            ? 'Approved'
                            : isCurrent
                            ? step.assignedUserId === currentUser.id
                              ? 'Pending (You)'
                              : 'Pending'
                            : isBypassed
                            ? 'Bypassed'
                            : 'Waiting'}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Approval History List (Matching Image 3) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>Approval History</span>
                <span className="text-[10px] font-normal text-slate-400">
                  {request.approvalHistory.length} events
                </span>
              </div>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden text-xs">
                {request.approvalHistory.map((h, i) => (
                  <div key={h.id || i} className="p-2.5 bg-slate-50/50 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span className="text-slate-400 text-[10px]">#{i + 1}</span>
                        <span>{h.actionByName}</span>
                        <span className="text-[10px] text-slate-400">({h.actionByRole})</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          h.action === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : h.action === 'Returned for Correction'
                            ? 'bg-amber-100 text-amber-800'
                            : h.action === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {h.action}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(h.dateTime).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {h.comments && (
                      <div className="mt-1 text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-100 italic">
                        "{h.comments}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                  <span>Attachments ({request.attachments.length})</span>
                </span>
              </div>
              <div className="space-y-1.5">
                {request.attachments.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">No files attached.</div>
                ) : (
                  request.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1 py-0.5 rounded uppercase">
                          {att.name.split('.').pop() || 'FILE'}
                        </span>
                        <span className="font-medium text-slate-800 truncate">{att.name}</span>
                        <span className="text-[10px] text-slate-400">({att.sizeFormatted})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewAttachment(att)}
                          className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Preview attachment"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment(att)}
                          className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Download attachment"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Approver Action Panel */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              {/* Optional Comment for approval */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Comment (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your approval comment or notes..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-normal"
                />
              </div>

              {/* Action buttons depending on state and user */}
              {request.status === 'Pending Approval' ? (
                <div>
                  {isAssignedApprover ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActionModal('reject')}
                        className="flex-1 py-2 px-3 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => setActionModal('return')}
                        className="flex-1 py-2 px-3 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Return for Correction</span>
                      </button>

                      <button
                        onClick={handleApproveClick}
                        className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Approve &amp; Sign</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                        Stage is currently assigned to{' '}
                        <strong className="text-slate-900">{currentStep?.assignedUserName}</strong>.
                        You are logged in as{' '}
                        <strong>
                          {currentUser.name} ({currentUser.role})
                        </strong>
                        .
                      </div>

                      {/* Director Override affordance */}
                      {isDirector && (
                        <button
                          onClick={() => setActionModal('override')}
                          className="w-full py-2 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Director Override Approval</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : request.status === 'Returned for Correction' && isRequester ? (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    This request was returned for correction. Please edit details and resubmit as a
                    new document version.
                  </div>
                  <button
                    onClick={() => {
                      setCorrectedForm({ ...request.formData });
                      setActionReason('');
                      setActionModal('resubmit');
                    }}
                    className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Edit &amp; Resubmit New Version</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 text-center font-medium">
                  Request is {request.status}. No pending actions required.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: 68% Document Preview (Matching Image 3) */}
        <div
          className={`lg:col-span-8 space-y-4 ${
            isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/90 p-8 overflow-y-auto' : ''
          }`}
        >
          {/* Document Toolbar */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-800">
                Document Preview ({request.status})
              </span>

              {/* Version Selector */}
              {request.versionSnapshots.length > 1 && (
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(Number(e.target.value))}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 font-semibold text-purple-700 bg-purple-50"
                >
                  {request.versionSnapshots.map((v) => (
                    <option key={v.version} value={v.version}>
                      Version {v.version} ({new Date(v.updatedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Pagination info */}
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <button className="text-slate-400 hover:text-slate-600">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold text-slate-700">1 / 1</span>
                <button className="text-slate-400 hover:text-slate-600">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
                  className="hover:text-slate-800"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="tabular-nums font-semibold text-slate-700 px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
                  className="hover:text-slate-800"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>

              {/* Print / Save as PDF */}
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1 px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                title="Print official document or Save as PDF"
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

          {/* Rendered Official Bilingual Document */}
          <div
            className="printable-area bg-slate-200/70 p-6 rounded-xl border border-slate-300 overflow-x-auto flex justify-center shadow-inner"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            <AdminWorkRequestDocument data={activeFormData} />
          </div>
        </div>
      </div>

      {/* Signature Confirmation Modal */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        user={currentUser}
        title="Confirm Approval Authority E-Signature"
        confirmLabel="Approve & Apply Signature"
        onConfirm={handleConfirmedApproval}
      />

      {/* Action Modals: Return / Reject / Override / Resubmit */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 my-8">
            <h3 className="text-base font-bold text-slate-900">
              {actionModal === 'return'
                ? 'Return Request for Correction'
                : actionModal === 'reject'
                ? 'Reject Request'
                : actionModal === 'override'
                ? 'Director Override Approval'
                : 'Resubmit Corrected Request (New Version)'}
            </h3>

            {actionModal === 'resubmit' ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                {/* Priority Selection */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Priority Level:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Urgent', 'Medium', 'Low'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCorrectedForm((prev) => ({ ...prev, priority: p }))}
                        className={`py-1.5 px-2 rounded-lg border font-semibold text-xs ${
                          correctedForm.priority === p
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Department:</label>
                    <input
                      type="text"
                      value={correctedForm.department || ''}
                      onChange={(e) =>
                        setCorrectedForm((prev) => ({ ...prev, department: e.target.value }))
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Date of Request:</label>
                    <input
                      type="text"
                      value={correctedForm.dateOfRequest || ''}
                      onChange={(e) =>
                        setCorrectedForm((prev) => ({ ...prev, dateOfRequest: e.target.value }))
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Work Description */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Work Description:</label>
                  <textarea
                    rows={3}
                    value={correctedForm.workDescription || ''}
                    onChange={(e) =>
                      setCorrectedForm((prev) => ({ ...prev, workDescription: e.target.value }))
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                {/* Checklist Corrections */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="font-semibold text-slate-700">Documents Checklist:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={correctedForm.documents?.onlineDocumentChamber || false}
                        onChange={(e) =>
                          setCorrectedForm((prev) => ({
                            ...prev,
                            documents: {
                              ...prev.documents,
                              onlineDocumentChamber: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>1. Online Chamber</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={correctedForm.documents?.physicalDocumentChamber || false}
                        onChange={(e) =>
                          setCorrectedForm((prev) => ({
                            ...prev,
                            documents: {
                              ...prev.documents,
                              physicalDocumentChamber: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>2. Physical Chamber</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={correctedForm.documents?.companyDocumentAjeer || false}
                        onChange={(e) =>
                          setCorrectedForm((prev) => ({
                            ...prev,
                            documents: {
                              ...prev.documents,
                              companyDocumentAjeer: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>3. Ajeer Document</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={correctedForm.documents?.employeeSalaryCertificate || false}
                        onChange={(e) =>
                          setCorrectedForm((prev) => ({
                            ...prev,
                            documents: {
                              ...prev.documents,
                              employeeSalaryCertificate: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>4. Salary Certificate</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={correctedForm.documents?.permanentEmploymentVisa || false}
                        onChange={(e) =>
                          setCorrectedForm((prev) => ({
                            ...prev,
                            documents: {
                              ...prev.documents,
                              permanentEmploymentVisa: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>5. Employment Visa</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={correctedForm.documents?.workVisitVisa || false}
                        onChange={(e) =>
                          setCorrectedForm((prev) => ({
                            ...prev,
                            documents: {
                              ...prev.documents,
                              workVisitVisa: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>6. Work Visit Visa</span>
                    </label>
                  </div>
                </div>

                {/* Change Note */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <label className="font-semibold text-slate-700">Change Note (Required):</label>
                  <input
                    type="text"
                    placeholder="Describe corrections made (e.g., Attached revised quote and adjusted timeline)..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {actionModal === 'override' ? 'Justification Reason (Mandatory):' : 'Reason / Note (Mandatory):'}
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="State clear reasons for audit history..."
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActionModal(null);
                  setActionReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (actionModal === 'return') handleReturnSubmit();
                  if (actionModal === 'reject') handleRejectSubmit();
                  if (actionModal === 'override') handleOverrideSubmit();
                  if (actionModal === 'resubmit') handleResubmitAction();
                }}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg cursor-pointer ${
                  actionModal === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : actionModal === 'return'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
