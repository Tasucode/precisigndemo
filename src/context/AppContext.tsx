import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Company,
  UserProfile,
  WorkflowConfig,
  RequestRecord,
  CompanyId,
  AdminWorkFormData,
  AttachmentItem,
} from '../types/index';
import { dataService } from '../services/repository';
import {
  createNewRequestRecord,
  approveRequestStage,
  returnRequestForCorrection,
  resubmitCorrectedRequest,
  rejectRequest,
  directorOverrideApprove,
} from '../utils/workflowEngine';

interface AppContextType {
  companies: Company[];
  selectedCompanyId: CompanyId;
  selectedCompany: Company;
  setSelectedCompanyId: (id: CompanyId) => void;
  users: UserProfile[];
  currentUser: UserProfile;
  setCurrentUserId: (id: string) => void;
  updateUserSignature: (userId: string, signatureDataUrl?: string, signatureStyleText?: string) => void;
  requests: RequestRecord[];
  companyRequests: RequestRecord[];
  workflows: WorkflowConfig[];
  currentWorkflow: WorkflowConfig;
  saveWorkflow: (updated: WorkflowConfig) => void;
  
  // Navigation
  activeView: 'dashboard' | 'create-request' | 'review-sign' | 'requests' | 'workflow-settings' | 'user-profile';
  setActiveView: (view: 'dashboard' | 'create-request' | 'review-sign' | 'requests' | 'workflow-settings' | 'user-profile') => void;
  requestsFilter: 'pending' | 'my' | 'all' | 'approved';
  setRequestsFilter: (filter: 'pending' | 'my' | 'all' | 'approved') => void;
  selectedRequestId: string | null;
  openReviewRequest: (requestId: string) => void;
  selectedRequestFormType: string;
  setSelectedRequestFormType: (formType: string) => void;
  
  // Draft persistence via repository
  draftFormData: Partial<AdminWorkFormData> | null;
  saveDraft: (data: Partial<AdminWorkFormData>) => void;
  clearDraft: () => void;
  
  // Workflow actions
  submitNewRequest: (
    formData: AdminWorkFormData,
    attachments?: AttachmentItem[],
    comment?: string,
    signatureDataUrl?: string
  ) => { success: boolean; newId?: string; error?: string };
  approveRequest: (
    requestId: string,
    comment?: string,
    signatureDataUrl?: string
  ) => { success: boolean; error?: string };
  returnRequest: (
    requestId: string,
    reason: string
  ) => { success: boolean; error?: string };
  resubmitRequest: (
    requestId: string,
    formData: AdminWorkFormData,
    changeNote?: string,
    signatureDataUrl?: string
  ) => { success: boolean; error?: string };
  rejectRequestAction: (
    requestId: string,
    reason: string
  ) => { success: boolean; error?: string };
  directorOverrideAction: (
    requestId: string,
    reason: string
  ) => { success: boolean; error?: string };
  
  // Reset
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<CompanyId>('PEW');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserIdState] = useState<string>('user-afzal');
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [draftFormData, setDraftFormData] = useState<Partial<AdminWorkFormData> | null>(null);

  const [activeView, setActiveView] = useState<
    'dashboard' | 'create-request' | 'review-sign' | 'requests' | 'workflow-settings' | 'user-profile'
  >('dashboard');
  const [requestsFilter, setRequestsFilter] = useState<'pending' | 'my' | 'all' | 'approved'>('pending');

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>('PEW-AW-2026-0018');
  const [selectedRequestFormType, setSelectedRequestFormType] = useState<string>('Admin Work Request');

  // Load initial data through repository abstraction
  useEffect(() => {
    let mounted = true;
    async function loadInitialData() {
      const [allCompanies, allUsers, allWorkflows, allRequests, session] = await Promise.all([
        dataService.getCompanies(),
        dataService.getUsers(),
        dataService.getWorkflows(),
        dataService.getRequests(),
        dataService.getDemoSession(),
      ]);

      if (!mounted) return;
      setCompanies(allCompanies);
      setUsers(allUsers);
      setWorkflows(allWorkflows);
      setRequests(allRequests);
      setSelectedCompanyIdState(session.companyId);
      setCurrentUserIdState(session.userId);

      const draft = await dataService.getDraft(session.companyId, session.userId, 'Admin Work Request');
      if (mounted) {
        setDraftFormData(draft);
      }
    }
    loadInitialData();
    return () => {
      mounted = false;
    };
  }, []);

  const setSelectedCompanyId = (id: CompanyId) => {
    setSelectedCompanyIdState(id);
    dataService.saveDemoSession(id, currentUserId);
    // Load company draft scoped to current user
    dataService.getDraft(id, currentUserId, 'Admin Work Request').then((draft) => setDraftFormData(draft));
  };

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    dataService.saveDemoSession(selectedCompanyId, id);
    // Load draft scoped to newly selected persona
    dataService.getDraft(selectedCompanyId, id, 'Admin Work Request').then((draft) => setDraftFormData(draft));
  };

  const updateUserSignature = async (
    userId: string,
    signatureDataUrl?: string,
    signatureStyleText?: string
  ) => {
    const updated = await dataService.updateUserSignature(userId, signatureDataUrl, signatureStyleText);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
  };

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || {
    id: 'user-afzal',
    name: 'Afzal Kazi',
    email: 'afzal.kazi@precision-eg.com',
    role: 'Director' as const,
    department: 'Executive',
    initials: 'AK',
    avatarColor: '#6366f1',
    companyId: 'PEW' as CompanyId,
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0] || {
    id: 'PEW' as CompanyId,
    code: 'PEW',
    name: 'Precision Engineering Works',
    fullName: 'PEW - Precision Engineering Works',
    groupName: 'PRECISION ENGINEERING GROUP',
  };

  // Filter requests strictly by selected company to maintain isolation
  const companyRequests = requests.filter((r) => r.companyId === selectedCompanyId);

  // Active workflow for Admin Work Request in current company
  const currentWorkflow =
    workflows.find((w) => w.companyId === selectedCompanyId && w.formType === 'Admin Work Request') ||
    workflows[0] || {
      id: 'wf-pew-admin-work',
      formType: 'Admin Work Request',
      companyId: selectedCompanyId,
      version: 1,
      stages: [],
      preventSelfApproval: true,
      allowDirectorOverride: true,
      reminderDays: 2,
      escalationDays: 5,
      rejectionBehavior: 'archive' as const,
      returnBehavior: 'restart_workflow' as const,
    };

  const saveWorkflow = async (updated: WorkflowConfig) => {
    await dataService.saveWorkflow(updated);
    setWorkflows((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const saveDraft = (data: Partial<AdminWorkFormData>) => {
    setDraftFormData(data);
    dataService.saveDraft(selectedCompanyId, currentUser.id, 'Admin Work Request', data);
  };

  const clearDraft = () => {
    setDraftFormData(null);
    dataService.clearDraft(selectedCompanyId, currentUser.id, 'Admin Work Request');
  };

  const openReviewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setActiveView('review-sign');
  };

  // Submit new request with collision-resistant unique identifier
  const submitNewRequest = (
    formData: AdminWorkFormData,
    attachments: AttachmentItem[] = [],
    comment?: string,
    signatureDataUrl?: string
  ) => {
    const year = new Date().getFullYear();
    const count = requests.filter((r) => r.companyId === selectedCompanyId).length + 1;
    const padded = String(count).padStart(4, '0');
    // Collision-resistant suffix prevents ID conflicts in concurrent sessions
    const entropy = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newId = `${selectedCompanyId}-AW-${year}-${padded}-${entropy}`;

    const newRecord = createNewRequestRecord({
      id: newId,
      formType: 'Admin Work Request',
      formData: {
        ...formData,
        companyId: selectedCompanyId,
        companyName: selectedCompany.fullName,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
      },
      requester: currentUser,
      workflowConfig: currentWorkflow,
      users,
      attachments,
      comment,
      signatureDataUrl: signatureDataUrl || currentUser.signatureDataUrl,
    });

    dataService.createRequest(newRecord);
    setRequests((prev) => [newRecord, ...prev]);
    clearDraft();
    return { success: true, newId };
  };

  // Approve current request
  const approveRequest = (requestId: string, comment?: string, signatureDataUrl?: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return { success: false, error: 'Request not found' };

    const result = approveRequestStage({
      request: target,
      actingUser: currentUser,
      comment,
      signatureDataUrl: signatureDataUrl || currentUser.signatureDataUrl,
    });

    if (result.success && result.updatedRequest) {
      dataService.updateRequest(result.updatedRequest);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? result.updatedRequest! : r)));
      return { success: true };
    }
    return { success: false, error: result.error || 'Approval failed' };
  };

  // Return request for correction
  const returnRequest = (requestId: string, reason: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return { success: false, error: 'Request not found' };

    const result = returnRequestForCorrection({
      request: target,
      actingUser: currentUser,
      reason,
    });

    if (result.success && result.updatedRequest) {
      dataService.updateRequest(result.updatedRequest);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? result.updatedRequest! : r)));
      return { success: true };
    }
    return { success: false, error: result.error || 'Return failed' };
  };

  // Resubmit corrected request
  const resubmitRequest = (
    requestId: string,
    formData: AdminWorkFormData,
    changeNote?: string,
    signatureDataUrl?: string
  ) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return { success: false, error: 'Request not found' };

    const result = resubmitCorrectedRequest({
      request: target,
      actingUser: currentUser,
      updatedFormData: formData,
      changeNote,
      signatureDataUrl: signatureDataUrl || currentUser.signatureDataUrl,
    });

    if (result.success && result.updatedRequest) {
      dataService.updateRequest(result.updatedRequest);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? result.updatedRequest! : r)));
      return { success: true };
    }
    return { success: false, error: result.error || 'Resubmission failed' };
  };

  // Reject request
  const rejectRequestAction = (requestId: string, reason: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return { success: false, error: 'Request not found' };

    const result = rejectRequest({
      request: target,
      actingUser: currentUser,
      reason,
    });

    if (result.success && result.updatedRequest) {
      dataService.updateRequest(result.updatedRequest);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? result.updatedRequest! : r)));
      return { success: true };
    }
    return { success: false, error: result.error || 'Rejection failed' };
  };

  // Director override
  const directorOverrideAction = (requestId: string, reason: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return { success: false, error: 'Request not found' };

    const result = directorOverrideApprove({
      request: target,
      directorUser: currentUser,
      reason,
    });

    if (result.success && result.updatedRequest) {
      dataService.updateRequest(result.updatedRequest);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? result.updatedRequest! : r)));
      return { success: true };
    }
    return { success: false, error: result.error || 'Director override failed' };
  };

  const resetDemoData = async () => {
    await dataService.resetToSeedData();
    const [allCompanies, allUsers, allWorkflows, allRequests] = await Promise.all([
      dataService.getCompanies(),
      dataService.getUsers(),
      dataService.getWorkflows(),
      dataService.getRequests(),
    ]);
    setRequests(allRequests);
    setWorkflows(allWorkflows);
    setUsers(allUsers);
    setCompanies(allCompanies);
    setSelectedCompanyIdState('PEW');
    setCurrentUserIdState('user-afzal');
    setDraftFormData(null);
  };

  return (
    <AppContext.Provider
      value={{
        companies,
        selectedCompanyId,
        selectedCompany,
        setSelectedCompanyId,
        users,
        currentUser,
        setCurrentUserId,
        updateUserSignature,
        requests,
        companyRequests,
        workflows,
        currentWorkflow,
        saveWorkflow,
        activeView,
        setActiveView,
        requestsFilter,
        setRequestsFilter,
        selectedRequestId,
        openReviewRequest,
        selectedRequestFormType,
        setSelectedRequestFormType,
        draftFormData,
        saveDraft,
        clearDraft,
        submitNewRequest,
        approveRequest,
        returnRequest,
        resubmitRequest,
        rejectRequestAction,
        directorOverrideAction,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
