import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkflowConfig, WorkflowStageConfig, UserRole, CompanyId } from '../../types/index';
import {
  Layers,
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Save,
  RotateCcw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const WorkflowSettingsView: React.FC = () => {
  const {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    workflows,
    saveWorkflow,
    users,
    currentUser,
  } = useApp();

  const [searchForm, setSearchForm] = useState('');
  const [selectedFormName, setSelectedFormName] = useState<string>('Admin Work Request');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'Admin';

  // Active workflow for selected form and company
  const activeWf =
    workflows.find((w) => w.companyId === selectedCompanyId && w.formType === selectedFormName) ||
    workflows[0];

  // Local editing state for current workflow
  const [wfConfig, setWfConfig] = useState<WorkflowConfig>(activeWf);

  // Synchronize workflow state when changing company, form, or repository workflows
  useEffect(() => {
    const found = workflows.find(
      (w) => w.companyId === selectedCompanyId && w.formType === selectedFormName
    );
    if (found) {
      setWfConfig(found);
    } else {
      setWfConfig({
        id: `wf-${selectedCompanyId.toLowerCase()}-${selectedFormName.toLowerCase().replace(/\s+/g, '-')}`,
        formType: selectedFormName,
        companyId: selectedCompanyId,
        version: 1,
        stages: [
          {
            id: `stg-${Date.now()}-1`,
            stageNumber: 1,
            name: 'Initial Review',
            assignedRole: 'General Manager',
            isFinalApproval: false,
            canReject: true,
            canReturnForCorrection: true,
            mapsToDocumentSignature: false,
          },
          {
            id: `stg-${Date.now()}-2`,
            stageNumber: 2,
            name: 'Executive Sign-off',
            assignedRole: 'Director',
            isFinalApproval: true,
            canReject: true,
            canReturnForCorrection: true,
            mapsToDocumentSignature: true,
          },
        ],
        preventSelfApproval: true,
        allowDirectorOverride: true,
        reminderDays: 2,
        escalationDays: 5,
        rejectionBehavior: 'archive',
        returnBehavior: 'restart_workflow',
      });
    }
  }, [selectedCompanyId, selectedFormName, workflows]);

  const handleSelectForm = (formType: string) => {
    setSelectedFormName(formType);
    setValidationError(null);
  };

  const formsList = [
    { name: 'Admin Work Request', active: true, formatCode: 'PR#21-001FA' },
    { name: 'Payment Request', active: true, formatCode: 'PR#21-002FP' },
    { name: 'IT Request', active: true, formatCode: 'PR#21-003IT' },
    { name: 'IT Asset Allocation', active: true, formatCode: 'PR#21-004AA' },
    { name: 'Undertaking Guarantee', active: true, formatCode: 'PR#21-005UG' },
  ];

  const filteredForms = formsList.filter((f) =>
    f.name.toLowerCase().includes(searchForm.toLowerCase())
  );

  // Stage manipulation
  const handleAddStage = () => {
    const newStageNumber = wfConfig.stages.length + 1;
    const newStage: WorkflowStageConfig = {
      id: `stage-${Date.now()}`,
      stageNumber: newStageNumber,
      name: `Stage ${newStageNumber} Approval`,
      assignedRole: 'General Manager',
      isFinalApproval: false,
      canReject: true,
      canReturnForCorrection: true,
      mapsToDocumentSignature: false,
    };
    setWfConfig((prev) => ({
      ...prev,
      stages: [...prev.stages, newStage],
    }));
  };

  const handleRemoveStage = (id: string) => {
    if (wfConfig.stages.length <= 1) {
      alert('A workflow must have at least one approval stage.');
      return;
    }
    setWfConfig((prev) => ({
      ...prev,
      stages: prev.stages
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, stageNumber: idx + 1 })),
    }));
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...wfConfig.stages];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newStages.length) return;
    const temp = newStages[index];
    newStages[index] = newStages[targetIdx];
    newStages[targetIdx] = temp;
    setWfConfig((prev) => ({
      ...prev,
      stages: newStages.map((s, idx) => ({ ...s, stageNumber: idx + 1 })),
    }));
  };

  const handleStageChange = (id: string, updates: Partial<WorkflowStageConfig>) => {
    setWfConfig((prev) => ({
      ...prev,
      stages: prev.stages.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          // If mapping to signature, unset other stages
          if (updates.mapsToDocumentSignature) {
            // Keep
          }
          return updated;
        }
        if (updates.mapsToDocumentSignature) {
          return { ...s, mapsToDocumentSignature: false };
        }
        return s;
      }),
    }));
  };

  const handleSaveAndActivate = () => {
    setValidationError(null);
    if (!isAdmin) {
      setValidationError('Permission denied: Only administrators (Anzar) can save or activate workflows.');
      return;
    }

    if (!wfConfig.stages || wfConfig.stages.length < 1) {
      setValidationError('Validation error: Workflow must include at least one approval stage.');
      return;
    }

    const emptyStageName = wfConfig.stages.find((s) => !s.name || !s.name.trim());
    if (emptyStageName) {
      setValidationError('Validation error: Every approval stage must have a non-empty name.');
      return;
    }

    const finalStages = wfConfig.stages.filter((s) => s.isFinalApproval);
    if (finalStages.length !== 1) {
      setValidationError(
        `Validation error: Exactly one stage must be designated as 'Final Required Approval' (found ${finalStages.length}).`
      );
      return;
    }

    const signatureMappedStages = wfConfig.stages.filter((s) => s.mapsToDocumentSignature);
    if (signatureMappedStages.length !== 1) {
      setValidationError(
        `Validation error: Exactly one stage must be designated as 'Maps to Document Sig' for legal document execution (found ${signatureMappedStages.length}).`
      );
      return;
    }

    const updated = {
      ...wfConfig,
      version: wfConfig.version + 1,
    };
    saveWorkflow(updated);
    setWfConfig(updated);
    setSaveFeedback(
      `Workflow Version ${updated.version} activated for ${selectedCompanyId} — ${selectedFormName}.`
    );
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  const rolesList: UserRole[] = [
    'General Manager',
    'Director',
    'Admin',
    'Finance',
    'HR',
    'IT',
    'Purchase',
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">
            Administration
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Forms &amp; Workflow Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure sequential approval routes, signature authority mapping, and escalation rules per company.
          </p>
        </div>

        <button
          onClick={handleSaveAndActivate}
          disabled={!isAdmin}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
            isAdmin
              ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          title={!isAdmin ? 'Admin permission required to save' : 'Save and activate new workflow version'}
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save &amp; Activate Workflow</span>
        </button>
      </div>

      {/* Role Notice */}
      {!isAdmin && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
              Read-Only
            </span>
            <span>
              You are logged in as <strong>{currentUser.name}</strong> ({currentUser.role}). Only administrators (e.g. Anzar) can edit and activate workflow configurations. Switch to Anzar using the top-right persona selector to modify settings.
            </span>
          </div>
        </div>
      )}

      {/* Validation Error Notice */}
      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
          <span>{validationError}</span>
          <button onClick={() => setValidationError(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {saveFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* 3 Sections Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SECTION 1 (LEFT, 3 cols): Company and Form Selector */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Select Company:
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value as CompanyId)}
              className="w-full p-2 text-xs border border-slate-200 rounded-lg font-semibold text-slate-800 bg-slate-50 truncate"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Company Forms</span>
              <span className="text-[10px] text-slate-400 font-semibold">{filteredForms.length} forms</span>
            </div>

            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search forms..."
                value={searchForm}
                onChange={(e) => setSearchForm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              {filteredForms.map((form) => {
                const isSelected = form.name === selectedFormName;
                return (
                  <button
                    key={form.name}
                    onClick={() => handleSelectForm(form.name)}
                    className={`w-full text-left p-3 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div>
                      <div className="truncate font-semibold">{form.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {form.formatCode}
                      </div>
                    </div>
                    {isSelected && <span className="text-purple-600 text-xs">●</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2 (CENTER, 5 cols): Approval Flow Builder */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Approval Flow Sequence
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sequential routing stages for {selectedFormName}
              </p>
            </div>
            <button
              onClick={handleAddStage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stage</span>
            </button>
          </div>

          {/* Submission Event */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Submission: Requester</div>
                <div className="text-[10px] text-slate-500">
                  Initial submission event with confirmed requester signature
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Start</span>
          </div>

          <div className="flex justify-center -my-2">
            <div className="w-[2px] h-4 bg-slate-300" />
          </div>

          {/* Stages List */}
          <div className="space-y-3">
            {wfConfig.stages.map((stage, index) => {
              const isFirst = index === 0;
              const isLast = index === wfConfig.stages.length - 1;

              return (
                <div
                  key={stage.id}
                  className="p-3.5 bg-white rounded-lg border border-slate-200 hover:border-purple-300 transition-colors shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                        {stage.stageNumber}
                      </span>
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => handleStageChange(stage.id, { name: e.target.value })}
                        className="text-xs font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-purple-600 focus:outline-none px-1"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        disabled={isFirst}
                        onClick={() => handleMoveStage(index, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isLast}
                        onClick={() => handleMoveStage(index, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveStage(stage.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">
                        Assigned Role:
                      </label>
                      <select
                        value={stage.assignedRole}
                        onChange={(e) =>
                          handleStageChange(stage.id, { assignedRole: e.target.value as UserRole })
                        }
                        className="w-full p-1.5 text-xs border border-slate-200 rounded bg-slate-50 font-medium"
                      >
                        {rolesList.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">
                        Specific User:
                      </label>
                      <select
                        value={stage.assignedUserId || ''}
                        onChange={(e) =>
                          handleStageChange(stage.id, { assignedUserId: e.target.value || undefined })
                        }
                        className="w-full p-1.5 text-xs border border-slate-200 rounded bg-slate-50 font-medium"
                      >
                        <option value="">Any user in role</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stage.isFinalApproval}
                        onChange={(e) =>
                          handleStageChange(stage.id, { isFinalApproval: e.target.checked })
                        }
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Final Required Approval</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stage.mapsToDocumentSignature}
                        onChange={(e) =>
                          handleStageChange(stage.id, { mapsToDocumentSignature: e.target.checked })
                        }
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-semibold text-purple-700">Maps to Document Sig</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center -my-2">
            <div className="w-[2px] h-4 bg-slate-300" />
          </div>

          {/* End Outcome */}
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-800">Final Outcome:</span>
              <span className="font-semibold text-slate-700">
                Marked Approved &amp; Document E-Signed
              </span>
            </div>
            <Check className="w-4 h-4 text-purple-700" />
          </div>
        </div>

        {/* SECTION 3 (RIGHT, 4 cols): Rules & Governance */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Governance &amp; Rules
            </h2>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              v{wfConfig.version}
            </span>
          </div>

          {/* Rule: Prevent Self-Approval */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer">
              <span>Prevent Self-Approval</span>
              <input
                type="checkbox"
                checked={wfConfig.preventSelfApproval}
                onChange={(e) =>
                  setWfConfig((prev) => ({ ...prev, preventSelfApproval: e.target.checked }))
                }
                className="rounded text-purple-600 focus:ring-purple-500"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              Requesters cannot approve their own requests even if they belong to the approver role.
            </p>
          </div>

          {/* Rule: Director Override */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer">
              <span>Allow Director Override</span>
              <input
                type="checkbox"
                checked={wfConfig.allowDirectorOverride}
                onChange={(e) =>
                  setWfConfig((prev) => ({ ...prev, allowDirectorOverride: e.target.checked }))
                }
                className="rounded text-purple-600 focus:ring-purple-500"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              Authorizes Director to expedite approval, logging bypassed stages and mandatory justification.
            </p>
          </div>

          {/* Return for Correction Behavior */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-800">
              Return for Correction Behavior:
            </label>
            <select
              value={wfConfig.returnBehavior}
              onChange={(e) =>
                setWfConfig((prev) => ({
                  ...prev,
                  returnBehavior: e.target.value as 'restart_workflow' | 'resume_at_current_stage',
                }))
              }
              className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
            >
              <option value="restart_workflow">Restart workflow from stage 1 (Default)</option>
              <option value="resume_at_current_stage">Resume at returning stage</option>
            </select>
          </div>

          {/* Rejection Behavior */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-800">
              Rejection Behavior:
            </label>
            <select
              value={wfConfig.rejectionBehavior}
              onChange={(e) =>
                setWfConfig((prev) => ({
                  ...prev,
                  rejectionBehavior: e.target.value as 'archive' | 'notify_requester',
                }))
              }
              className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
            >
              <option value="archive">Archive &amp; close request (Default)</option>
              <option value="notify_requester">Notify requester only</option>
            </select>
          </div>

          {/* SLA Reminder & Escalation Settings */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Reminder (Days):
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={wfConfig.reminderDays}
                onChange={(e) =>
                  setWfConfig((prev) => ({ ...prev, reminderDays: Number(e.target.value) }))
                }
                className="w-full p-1.5 text-xs border border-slate-200 rounded bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Escalation (Days):
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={wfConfig.escalationDays}
                onChange={(e) =>
                  setWfConfig((prev) => ({ ...prev, escalationDays: Number(e.target.value) }))
                }
                className="w-full p-1.5 text-xs border border-slate-200 rounded bg-slate-50"
              />
            </div>
          </div>

          {/* Version Note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 leading-relaxed">
            <strong>Versioning Policy:</strong> Activating changes increments the workflow version for newly submitted requests. Existing in-flight requests retain their initial workflow structure.
          </div>
        </div>
      </div>
    </div>
  );
};
