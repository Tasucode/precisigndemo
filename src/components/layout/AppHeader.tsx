import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyId } from '../../types/index';
import {
  Building2,
  ChevronDown,
  Search,
  Bell,
  HelpCircle,
  Users,
} from 'lucide-react';

export const AppHeader: React.FC = () => {
  const {
    companies,
    selectedCompanyId,
    selectedCompany,
    setSelectedCompanyId,
    currentUser,
    users,
    setCurrentUserId,
    companyRequests,
  } = useApp();

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [userSwitcherOpen, setUserSwitcherOpen] = useState(false);

  const activeCompany =
    selectedCompany ||
    companies.find((c) => c.id === selectedCompanyId) ||
    companies[0] || {
      id: 'PEW' as CompanyId,
      code: 'PEW',
      name: 'Precision Engineering Works',
      fullName: 'PEW - Precision Engineering Works',
      groupName: 'PRECISION ENGINEERING GROUP',
    };

  // Number of requests requiring current user's approval
  const pendingApprovalsCount = companyRequests.filter(
    (r) => r.status === 'Pending Approval' && r.currentApproverId === currentUser.id
  ).length;

  return (
    <header className="app-header h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      {/* Left: Company Selector (Explicit Demo Tenant Selector) */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-800"
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            <span className="truncate max-w-[260px]">{activeCompany.fullName}</span>
            <span className="text-[9px] font-bold tracking-wider text-purple-700 bg-purple-100/80 px-1.5 py-0.2 rounded uppercase">
              Demo Tenant
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {companyDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 mb-2 text-[10px] text-amber-800 leading-tight">
                <strong>Demo Feature:</strong> In production, company context is determined by organization membership and SSO tenant domain.
              </div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Demo Company:
              </div>
              <div className="space-y-1">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setSelectedCompanyId(company.id as CompanyId);
                      setCompanyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      company.id === selectedCompanyId
                        ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{company.name}</div>
                      <div className="text-[10px] text-slate-400">{company.groupName}</div>
                    </div>
                    {company.id === selectedCompanyId && (
                      <span className="text-purple-600 text-xs">●</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requests, forms, or documents... (Ctrl + K)"
            className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder-slate-400"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Demo User Switcher + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Explicit Demo User Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setUserSwitcherOpen(!userSwitcherOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100 transition-colors text-xs font-semibold shadow-xs"
            title="Demo Feature: Switch persona to test roles and permissions"
          >
            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded">
              Demo Persona
            </span>
            <span className="font-bold">
              {currentUser.name} ({currentUser.role})
            </span>
            <ChevronDown className="w-3 h-3 text-purple-700" />
          </button>

          {userSwitcherOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50">
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 mb-2 text-[11px] text-amber-800 leading-snug">
                <strong>Demo Feature Notice:</strong> User switching is provided solely for local testing of multi-role approvals. In production, identity is authenticated via corporate SSO/SAML.
              </div>
              <div className="px-3 py-1 border-b border-slate-100 text-xs font-bold text-slate-900">
                Select Persona to Test:
              </div>
              <div className="p-1 space-y-1 max-h-72 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUserId(u.id);
                      setUserSwitcherOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left ${
                      u.id === currentUser.id
                        ? 'bg-purple-600 text-white font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.initials}
                      </div>
                      <div>
                        <div className="font-semibold leading-tight">{u.name}</div>
                        <div
                          className={`text-[10px] ${
                            u.id === currentUser.id ? 'text-purple-200' : 'text-slate-400'
                          }`}
                        >
                          {u.role} · {u.department}
                        </div>
                      </div>
                    </div>
                    {u.id === currentUser.id && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title={`${pendingApprovalsCount} pending approvals`}
        >
          <Bell className="w-4 h-4" />
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {/* Help */}
        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="PreciSign Help & Guidelines"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs cursor-pointer ring-2 ring-purple-100"
          style={{ backgroundColor: currentUser.avatarColor }}
          title={`${currentUser.name} (${currentUser.role})`}
        >
          {currentUser.initials}
        </div>
      </div>
    </header>
  );
};
