import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RequestRecord } from '../../types/index';
import {
  Plus,
  Clock,
  FileText,
  CheckCircle2,
  Layers,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  CreditCard,
  ClipboardList,
  Monitor,
  Laptop,
  FileCheck,
  Check,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    companyRequests,
    selectedCompany,
    setActiveView,
    requestsFilter,
    setRequestsFilter,
    openReviewRequest,
    setSelectedRequestFormType,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>('PEW-AW-2026-0018');
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [genericFormModal, setGenericFormModal] = useState<string | null>(null);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    firstApprover: true,
    finalApprover: true,
    department: true,
    submissionDate: true,
    company: true,
    amount: false,
  });

  // Calculate dynamic KPIs from shared company requests
  const pendingForMeRequests = useMemo(() => {
    return companyRequests.filter(
      (r) => r.status === 'Pending Approval' && r.currentApproverId === currentUser.id
    );
  }, [companyRequests, currentUser]);

  const myActiveRequests = useMemo(() => {
    return companyRequests.filter(
      (r) => r.requesterId === currentUser.id && r.status !== 'Approved' && r.status !== 'Rejected'
    );
  }, [companyRequests, currentUser]);

  const approvedRequests = useMemo(() => {
    return companyRequests.filter((r) => r.status === 'Approved');
  }, [companyRequests]);

  const totalRequestsCount = companyRequests.length;

  // Filter requests for the table
  const filteredRequests = useMemo(() => {
    let list: RequestRecord[] = [];
    if (requestsFilter === 'pending') {
      list = pendingForMeRequests;
    } else if (requestsFilter === 'my') {
      list = companyRequests.filter((r) => r.requesterId === currentUser.id);
    } else if (requestsFilter === 'approved') {
      list = companyRequests.filter((r) => r.status === 'Approved');
    } else {
      list = companyRequests;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.formType.toLowerCase().includes(q) ||
          r.requesterName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          (r.currentApproverName && r.currentApproverName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [requestsFilter, pendingForMeRequests, companyRequests, currentUser, searchQuery]);

  const handleLaunchForm = (formName: string) => {
    if (formName === 'Admin Work Request Form') {
      setSelectedRequestFormType('Admin Work Request');
      setActiveView('create-request');
    } else {
      setGenericFormModal(formName);
    }
  };

  const calculateDuration = (dateStr: string) => {
    const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'}`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner: Greeting + Create Request button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Good morning, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here's what's happening with your requests in <span className="font-semibold text-slate-700">{selectedCompany.code}</span> today.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedRequestFormType('Admin Work Request');
            setActiveView('create-request');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-purple-200 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Request</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pending My Approval */}
        <div
          onClick={() => setRequestsFilter('pending')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            requestsFilter === 'pending'
              ? 'border-purple-300 ring-2 ring-purple-100 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-600">Pending My Approval</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight tabular-nums">
              {pendingForMeRequests.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Requests require your action</div>
          </div>
        </div>

        {/* KPI 2: My Active Requests */}
        <div
          onClick={() => setRequestsFilter('my')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            requestsFilter === 'my'
              ? 'border-purple-300 ring-2 ring-purple-100 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-600">My Active Requests</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight tabular-nums">
              {myActiveRequests.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Requests in progress</div>
          </div>
        </div>

        {/* KPI 3: Approved */}
        <div
          onClick={() => setRequestsFilter('approved')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            requestsFilter === 'approved'
              ? 'border-purple-300 ring-2 ring-purple-100 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-600">Approved</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight tabular-nums">
              {approvedRequests.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Requests completed</div>
          </div>
        </div>

        {/* KPI 4: Total Requests */}
        <div
          onClick={() => setRequestsFilter('all')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            requestsFilter === 'all'
              ? 'border-purple-300 ring-2 ring-purple-100 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-600">Total Requests</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight tabular-nums">
              {totalRequestsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">All requests ({selectedCompany.code})</div>
          </div>
        </div>
      </div>

      {/* Company Request Forms (5 cards matching Image 1) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Company Request Forms</span>
          </div>
          <button
            onClick={() => {
              setSelectedRequestFormType('Admin Work Request');
              setActiveView('create-request');
            }}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>Browse Forms Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Form 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                Payment Request Form
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Request for vendor payment, advance cash, or other payments.
              </p>
            </div>
            <button
              onClick={() => handleLaunchForm('Payment Request Form')}
              className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form 2: Admin Work Request Form (Fully implemented) */}
          <div className="bg-white border-2 border-purple-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative ring-1 ring-purple-100">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  Admin Work Request Form
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Request for administrative work (e.g., new employee setup, documents, visits, etc.).
              </p>
            </div>
            <button
              onClick={() => handleLaunchForm('Admin Work Request Form')}
              className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-700 hover:text-purple-800"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
                <Monitor className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                IT Request Form
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Request for IT services, hardware, software, or network access.
              </p>
            </div>
            <button
              onClick={() => handleLaunchForm('IT Request Form')}
              className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form 4 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Laptop className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                IT Asset Allocation Form
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Allocation of IT assets (laptop, desktop, mobile, etc.) to employees.
              </p>
            </div>
            <button
              onClick={() => handleLaunchForm('IT Asset Allocation Form')}
              className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form 5 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                Undertaking – Guarantee Letter
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Employee undertaking and company guarantee letter.
              </p>
            </div>
            <button
              onClick={() => handleLaunchForm('Undertaking – Guarantee Letter')}
              className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table Section (Matching Image 1) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Table Header: Tabs + Search + Columns dropdown */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmented Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setRequestsFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                requestsFilter === 'pending'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending My Approval ({pendingForMeRequests.length})
            </button>
            <button
              onClick={() => setRequestsFilter('my')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                requestsFilter === 'my'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Requests ({myActiveRequests.length})
            </button>
            <button
              onClick={() => setRequestsFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                requestsFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Requests ({totalRequestsCount})
            </button>
            <button
              onClick={() => setRequestsFilter('approved')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                requestsFilter === 'approved'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved &amp; Archive ({approvedRequests.length})
            </button>
          </div>

          {/* Controls: Search + Columns */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 w-48"
              />
            </div>

            {/* Column settings dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Columns</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showColumnsMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-30 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Toggle Columns
                  </div>
                  {Object.entries(visibleColumns).map(([key, val]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [key]: !prev[key as keyof typeof visibleColumns],
                          }))
                        }
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Request</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Current Approver</th>
                <th className="py-3 px-4">Pending</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No requests found in this view.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isExpanded = expandedRowId === req.id;
                  const isUrgent = req.formData.priority === 'Urgent';

                  return (
                    <React.Fragment key={req.id}>
                      <tr
                        onClick={() => setExpandedRowId(isExpanded ? null : req.id)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-purple-50/30' : ''
                        }`}
                      >
                        {/* Expand toggle + priority strip */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-1 h-8 rounded-full ${
                                isUrgent ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                            />
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 transition-transform ${
                                isExpanded ? 'rotate-180 text-purple-600' : ''
                              }`}
                            />
                          </div>
                        </td>

                        {/* Request ID + Form */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 tracking-tight">{req.id}</div>
                          <div className="text-[11px] text-slate-500">{req.formType}</div>
                        </td>

                        {/* Requester */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                              {req.requesterName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{req.requesterName}</div>
                              <div className="text-[10px] text-slate-400">{req.department}</div>
                            </div>
                          </div>
                        </td>

                        {/* Current Approver */}
                        <td className="py-3 px-4">
                          {req.currentApproverName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[10px]">
                                {req.currentApproverName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800">
                                  {req.currentApproverName}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {req.approvalSteps[req.currentStageIndex]?.assignedRole || 'Approver'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Completed</span>
                          )}
                        </td>

                        {/* Pending Duration */}
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold tabular-nums ${
                              isUrgent ? 'text-red-600 font-bold' : 'text-slate-600'
                            }`}
                          >
                            {calculateDuration(req.updatedAt)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              req.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : req.status === 'Returned for Correction'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : req.status === 'Rejected'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                            {req.status}
                          </span>
                        </td>

                        {/* Action: Review & Sign button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openReviewRequest(req.id);
                            }}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                          >
                            Review &amp; Sign
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Approval Details & Workflow Stepper (Matching Image 1) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60 border-b border-slate-200">
                          <td colSpan={7} className="p-4 pl-14">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                              {/* Left: Approval Details */}
                              <div className="space-y-2 text-xs">
                                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Approval Details</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <span className="text-slate-400">First Approver:</span>
                                  <span className="font-semibold text-slate-700">
                                    {req.firstApproverName || 'Jay Shankar'}
                                  </span>

                                  <span className="text-slate-400">Current Approver:</span>
                                  <span className="font-semibold text-purple-700">
                                    {req.currentApproverName || '—'}
                                  </span>

                                  <span className="text-slate-400">Final Approver:</span>
                                  <span className="font-semibold text-slate-700">
                                    {req.finalApproverName || 'Afzal Kazi'}
                                  </span>

                                  <span className="text-slate-400">Pending Since:</span>
                                  <span className="font-semibold text-slate-700">
                                    {new Date(req.createdAt).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Right: Approval Sequence Stepper */}
                              <div>
                                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Approval Sequence</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {req.approvalSteps.map((step, idx) => {
                                    const isDone = step.status === 'Approved';
                                    const isPending = step.status === 'Pending';
                                    const isLast = idx === req.approvalSteps.length - 1;

                                    return (
                                      <React.Fragment key={step.stageId}>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                              isDone
                                                ? 'bg-emerald-500 text-white'
                                                : isPending
                                                ? 'bg-purple-600 text-white ring-2 ring-purple-200'
                                                : 'bg-slate-200 text-slate-500'
                                            }`}
                                          >
                                            {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                          </div>
                                          <div>
                                            <div className="font-bold text-[11px] text-slate-800">
                                              {step.assignedUserName}
                                            </div>
                                            <div
                                              className={`text-[9px] ${
                                                isDone
                                                  ? 'text-emerald-600 font-semibold'
                                                  : isPending
                                                  ? 'text-purple-600 font-semibold'
                                                  : 'text-slate-400'
                                              }`}
                                            >
                                              {isDone
                                                ? 'Approved'
                                                : isPending
                                                ? 'Pending Approval'
                                                : isLast
                                                ? 'Final Approval'
                                                : 'Waiting'}
                                            </div>
                                          </div>
                                        </div>
                                        {!isLast && (
                                          <div className="w-8 h-[2px] bg-slate-200 mx-1" />
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex justify-between items-center">
          <span>
            Showing 1 to {filteredRequests.length} of {filteredRequests.length} requests
          </span>
          <span className="font-medium text-slate-600">Company: {selectedCompany.fullName}</span>
        </div>
      </div>

      {/* Generic Form Prototype Modal */}
      {genericFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{genericFormModal}</h3>
            <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-800 leading-relaxed">
              This form is part of the PreciSign Form Catalog. The primary official bilingual document implemented for this release is the <strong>Admin Work Request Form (Format Code# PR#21-001FA)</strong> as specified in the business requirements.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setGenericFormModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setGenericFormModal(null);
                  setSelectedRequestFormType('Admin Work Request');
                  setActiveView('create-request');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                Open Admin Work Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
