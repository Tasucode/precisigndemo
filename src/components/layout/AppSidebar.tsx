import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  FileSpreadsheet,
  Archive,
  BarChart2,
  Settings,
  ChevronDown,
  Layers,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    requestsFilter,
    setRequestsFilter,
    companyRequests,
    currentUser,
    users,
    setCurrentUserId,
    resetDemoData,
  } = useApp();

  const [adminOpen, setAdminOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Calculate pending count for current user
  const pendingCount = companyRequests.filter(
    (r) => r.status === 'Pending Approval' && r.currentApproverId === currentUser.id
  ).length;

  return (
    <aside className="app-sidebar w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 z-30 select-none">
      <div>
        {/* Brand header */}
        <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <svg viewBox="0 0 100 100" className="w-6 h-6 fill-white">
              <path d="M20 12 H58 C74 12 84 24 84 40 C84 56 74 68 58 68 H38 V88 H20 Z" />
            </svg>
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1">
              PreciSign
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Document Approval &amp; e-Sign</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 text-xs font-semibold">
          {/* Dashboard */}
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
              activeView === 'dashboard'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          {/* Create Request */}
          <button
            onClick={() => setActiveView('create-request')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
              activeView === 'create-request'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
            <span>New Request</span>
          </button>

          {/* My Requests */}
          <button
            onClick={() => {
              setRequestsFilter('my');
              setActiveView('requests');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
              activeView === 'requests' && requestsFilter === 'my'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>My Requests</span>
          </button>

          {/* Pending My Approval */}
          <button
            onClick={() => {
              setRequestsFilter('pending');
              setActiveView('requests');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors ${
              activeView === 'requests' && requestsFilter === 'pending'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>Pending My Approval</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {pendingCount}
              </span>
            )}
          </button>

          {/* All Requests */}
          <button
            onClick={() => {
              setRequestsFilter('all');
              setActiveView('requests');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
              activeView === 'requests' && requestsFilter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>All Requests</span>
          </button>

          {/* Forms Library */}
          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Forms Library</span>
          </button>

          {/* Documents & Archive */}
          <button
            onClick={() => {
              setRequestsFilter('approved');
              setActiveView('requests');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
              activeView === 'requests' && requestsFilter === 'approved'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Archive className="w-4 h-4 shrink-0" />
            <span>Documents &amp; Archive</span>
          </button>

          {/* Reports */}
          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span>Reports</span>
          </button>

          {/* Administration section */}
          <div className="pt-2">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-slate-400 hover:text-slate-200 uppercase tracking-wider text-[10px] font-bold"
            >
              <span>Administration</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${adminOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {adminOpen && (
              <div className="mt-1 space-y-0.5 pl-3 border-l border-slate-800 ml-3">
                <button
                  onClick={() => setActiveView('workflow-settings')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeView === 'workflow-settings'
                      ? 'bg-purple-600/30 text-purple-300 font-semibold border border-purple-500/40'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Forms &amp; Workflows</span>
                </button>

                <button
                  onClick={() => setActiveView('user-profile')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeView === 'user-profile'
                      ? 'bg-purple-600/30 text-purple-300 font-semibold border border-purple-500/40'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Signature &amp; Profile</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Footer User switcher & Reset */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080E21]">
        {/* Reset Demo State Action */}
        <button
          onClick={resetDemoData}
          className="w-full mb-3 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors border border-slate-800"
          title="Reset sample requests and workflows to original defaults"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo Data</span>
        </button>

        {/* Current user pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.initials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{currentUser.role}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Quick User Switcher popover */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#101935] border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Switch Demo User:
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 mt-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUserId(u.id);
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-purple-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold text-white shrink-0"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.initials}
                      </span>
                      <span className="truncate">{u.name}</span>
                    </div>
                    <span className="text-[10px] opacity-75 shrink-0 ml-1">({u.role})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
