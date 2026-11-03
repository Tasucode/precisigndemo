import React from 'react';
import { AdminWorkFormData } from '../../types/index';

interface DocumentProps {
  data: AdminWorkFormData;
  isPrintMode?: boolean;
}

export const AdminWorkRequestDocument: React.FC<DocumentProps> = ({
  data,
  isPrintMode = false,
}) => {
  return (
    <div
      className={`admin-work-document bg-white text-black font-sans box-border mx-auto transition-all ${
        isPrintMode
          ? 'w-[210mm] min-h-[297mm] p-[10mm] shadow-none border-none'
          : 'w-full max-w-[780px] p-8 border border-neutral-300 shadow-sm'
      }`}
      style={{
        fontFamily: "'Cairo', 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Outer Border wrapping the official document */}
      <div className="border-[2px] border-black p-3.5 flex flex-col justify-between min-h-[960px]">
        <div>
          {/* Header: Logo + Company Title */}
          <div className="flex items-start justify-between border-b-[2px] border-black pb-3">
            {/* Precision P Logo */}
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-14 h-14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Stylized industrial P lettermark */}
                <path
                  d="M18 12 H56 C74 12 86 24 86 42 C86 60 74 72 56 72 H38 V92 H18 Z"
                  fill="black"
                />
                <circle cx="54" cy="42" r="14" fill="white" />
                <path
                  d="M18 42 H38 V72 H18 Z"
                  fill="white"
                />
                <circle cx="28" cy="74" r="8" fill="black" />
              </svg>
            </div>

            {/* Central Bilingual Titles */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-xl font-extrabold tracking-wide text-black uppercase">
                PRECISION ENGINEERING GROUP
              </h1>
              <div className="flex items-center justify-center gap-2 mt-1 text-sm font-bold text-black">
                <span>Admin Work Request Form</span>
                <span>|</span>
                <span dir="rtl" className="font-bold">استمارة العمل الإداري</span>
              </div>
            </div>

            {/* Placeholder for header symmetry */}
            <div className="w-16 h-16 flex-shrink-0" />
          </div>

          {/* Table 1: Date & Company, Requester & Department */}
          <div className="border-b-[2px] border-black text-xs">
            <div className="grid grid-cols-2 border-b border-black">
              {/* Date of Request */}
              <div className="p-2 border-r border-black">
                <div className="flex justify-between items-baseline font-bold">
                  <span>Date of Request:</span>
                  <span dir="rtl">تاريخ الطلب</span>
                </div>
                <div className="mt-1 font-semibold text-sm min-h-[20px] text-neutral-900">
                  {data.dateOfRequest || '—'}
                </div>
              </div>

              {/* Company */}
              <div className="p-2">
                <div className="font-bold">Company:</div>
                <div className="mt-1 font-semibold text-sm min-h-[20px] text-neutral-900">
                  {data.companyName || 'PEW - Precision Engineering Works'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2">
              {/* Name of Requester */}
              <div className="p-2 border-r border-black">
                <div className="flex justify-between items-baseline font-bold">
                  <span>Name of the Requester:</span>
                  <span dir="rtl">اسم صاحب الطلب</span>
                </div>
                <div className="mt-1 font-semibold text-sm min-h-[20px] text-neutral-900">
                  {data.requesterName || data.requesterSignatureName || '—'}
                </div>
              </div>

              {/* Department */}
              <div className="p-2">
                <div className="font-bold">Department:</div>
                <div className="mt-1 font-semibold text-sm min-h-[20px] text-neutral-900">
                  {data.department || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Priority Section */}
          <div className="border-b-[2px] border-black p-2 text-xs">
            <div className="flex items-baseline justify-between font-bold mb-1.5">
              <span>Priority:</span>
              <span dir="rtl">:أولوية</span>
            </div>
            <div className="flex items-center gap-6 mt-1 text-xs">
              <label className="flex items-center gap-1.5 cursor-default">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${data.priority === 'Urgent' ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.priority === 'Urgent' && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
                <span className="font-semibold">Urgent</span>
                <span>|</span>
                <span dir="rtl">عاجل</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-default">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${data.priority === 'Medium' ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.priority === 'Medium' && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
                <span className="font-semibold">Medium</span>
                <span>|</span>
                <span dir="rtl">متوسط</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-default">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${data.priority === 'Low' ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.priority === 'Low' && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
                <span className="font-semibold">Low</span>
                <span>|</span>
                <span dir="rtl">منخفض</span>
              </label>
            </div>
          </div>

          {/* Work Description Section */}
          <div className="border-b-[2px] border-black p-2 min-h-[100px] text-xs">
            <div className="flex items-baseline justify-between font-bold mb-1">
              <span>Work Description:</span>
              <span dir="rtl">:المسمى الوظيفي</span>
            </div>
            <div className="whitespace-pre-wrap font-medium text-xs leading-relaxed text-neutral-900 pl-1 pt-1 min-h-[60px]">
              {data.workDescription || '—'}
            </div>
          </div>

          {/* Documents Checklist Section */}
          <div className="border-b-[2px] border-black p-2 text-xs">
            <div className="font-bold text-xs mb-1.5">Documents:</div>
            <div className="space-y-1 pl-2">
              {/* Item 1 */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-4">1.</span>
                  <span className="font-medium">Online Document Chamber</span>
                  <span className="text-neutral-400">|</span>
                  <span dir="rtl" className="text-neutral-800">غرفة التوثيق عبر الإنترنت</span>
                </div>
                <div className={`w-4 h-4 border border-black flex items-center justify-center mr-2 ${data.documents?.onlineDocumentChamber ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.documents?.onlineDocumentChamber && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-4">2.</span>
                  <span className="font-medium">Physical Document Chamber</span>
                  <span className="text-neutral-400">|</span>
                  <span dir="rtl" className="text-neutral-800">غرفة الوثائق المادية</span>
                </div>
                <div className={`w-4 h-4 border border-black flex items-center justify-center mr-2 ${data.documents?.physicalDocumentChamber ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.documents?.physicalDocumentChamber && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-4">3.</span>
                  <span className="font-medium">Company document Ajeer</span>
                  <span className="text-neutral-400">|</span>
                  <span dir="rtl" className="text-neutral-800">وثيقة شركة أجير</span>
                </div>
                <div className={`w-4 h-4 border border-black flex items-center justify-center mr-2 ${data.documents?.companyDocumentAjeer ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.documents?.companyDocumentAjeer && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-4">4.</span>
                  <span className="font-medium">Employee Salary Certificate</span>
                  <span className="text-neutral-400">|</span>
                  <span dir="rtl" className="text-neutral-800">شهادة راتب الموظف</span>
                </div>
                <div className={`w-4 h-4 border border-black flex items-center justify-center mr-2 ${data.documents?.employeeSalaryCertificate ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.documents?.employeeSalaryCertificate && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
              </div>

              {/* Item 5 */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-4">5.</span>
                  <span className="font-medium">Permanent Employment Visa</span>
                  <span className="text-neutral-400">|</span>
                  <span dir="rtl" className="text-neutral-800">تأشيرة عمل دائمة</span>
                </div>
                <div className={`w-4 h-4 border border-black flex items-center justify-center mr-2 ${data.documents?.permanentEmploymentVisa ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.documents?.permanentEmploymentVisa && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
              </div>

              {/* Item 6 */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-4">6.</span>
                  <span className="font-medium">Work Visit Visa</span>
                  <span className="text-neutral-400">|</span>
                  <span dir="rtl" className="text-neutral-800">تأشيرة زيارة عمل</span>
                </div>
                <div className={`w-4 h-4 border border-black flex items-center justify-center mr-2 ${data.documents?.workVisitVisa ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.documents?.workVisitVisa && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
              </div>

              {/* Item 7 */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-4">7.</span>
                  <span className="font-medium">Business Visit Visa</span>
                  <span className="text-neutral-400">|</span>
                  <span dir="rtl" className="text-neutral-800">تأشيرة زيارة عمل</span>
                </div>
                <div className={`w-4 h-4 border border-black flex items-center justify-center mr-2 ${data.documents?.businessVisitVisa ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.documents?.businessVisitVisa && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
              </div>

              {/* Item 8 */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-4">8.</span>
                  <span className="font-medium">Agency Wakala</span>
                  <span className="text-neutral-400">|</span>
                  <span dir="rtl" className="text-neutral-800">الوكالة</span>
                </div>
                <div className={`w-4 h-4 border border-black flex items-center justify-center mr-2 ${data.documents?.agencyWakala ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.documents?.agencyWakala && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
              </div>

              {/* Item 9 Others */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-4">9.</span>
                  <span className="font-medium">Others:</span>
                  <span className="border-b border-black flex-1 ml-2 text-xs font-medium px-1">
                    {data.documents?.othersDescription || (data.documents?.others ? 'Specified' : '')}
                  </span>
                </div>
                <div className={`w-4 h-4 border border-black flex items-center justify-center mr-2 ${data.documents?.others ? 'bg-purple-900 text-white' : 'bg-white'}`}>
                  {data.documents?.others && <span className="text-xs font-bold leading-none">✓</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Signatures Area */}
          <div className="border-b-[2px] border-black text-xs">
            <div className="grid grid-cols-2">
              {/* Requester Signature Box */}
              <div className="p-2 border-r border-black min-h-[90px] flex flex-col justify-between">
                <div className="flex justify-between items-baseline font-bold">
                  <span>Requester Signature</span>
                  <span dir="rtl">:طلب التوقيع</span>
                </div>

                {/* Signature presentation */}
                <div className="my-2 h-10 flex items-center justify-start pl-4">
                  {data.requesterSignatureDataUrl ? (
                    <img
                      src={data.requesterSignatureDataUrl}
                      alt="Requester Signature"
                      className="max-h-10 max-w-[140px] object-contain"
                    />
                  ) : data.requesterSignatureName ? (
                    <div
                      className="text-blue-700 text-2xl font-bold tracking-wider italic select-none"
                      style={{ fontFamily: "'Caveat', cursive" }}
                    >
                      {data.requesterSignatureName}
                    </div>
                  ) : (
                    <div className="text-neutral-400 text-xs italic">Awaiting Submission</div>
                  )}
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-bold">Name:</span>
                  <span className="border-b border-neutral-400 flex-1 font-semibold pl-1">
                    {data.requesterSignatureName || data.requesterName || ''}
                  </span>
                </div>
              </div>

              {/* Approval Authority Signature Box */}
              <div className="p-2 min-h-[90px] flex flex-col justify-between">
                <div className="flex justify-between items-baseline font-bold">
                  <span>Approval Authority Signature</span>
                  <span dir="rtl">سلطة الموافقة للتوقيع</span>
                </div>

                {/* Signature presentation */}
                <div className="my-2 h-10 flex items-center justify-start pl-4">
                  {data.approvalAuthoritySignatureDataUrl ? (
                    <img
                      src={data.approvalAuthoritySignatureDataUrl}
                      alt="Approval Authority Signature"
                      className="max-h-10 max-w-[140px] object-contain"
                    />
                  ) : data.approvalAuthoritySignatureName && data.approvalAuthoritySignatureDate ? (
                    <div
                      className="text-blue-800 text-2xl font-bold tracking-wider italic select-none"
                      style={{ fontFamily: "'Caveat', cursive" }}
                    >
                      {data.approvalAuthoritySignatureName}
                    </div>
                  ) : (
                    <div className="text-neutral-400 text-xs italic">Pending Final Authority Approval</div>
                  )}
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-bold">Name:</span>
                  <span className="border-b border-neutral-400 flex-1 font-semibold pl-1">
                    {data.approvalAuthoritySignatureName || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="border-b-[2px] border-black p-2 text-[10px] leading-tight">
            <div className="font-bold text-xs mb-1">Notes:</div>
            <ol className="space-y-1.5 pl-2">
              <li className="flex flex-col">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">1. Urgent Priority Document/Work will be process in same hour/immediately</span>
                  <span className="text-neutral-400 mx-1">|</span>
                  <span dir="rtl" className="text-neutral-800">ستتم معالجة وثيقة الأولوية العاجلة /</span>
                </div>
                <div dir="rtl" className="text-neutral-800 font-normal pr-4">
                  العمل في نفس الساعة / على الفور
                </div>
              </li>

              <li className="flex items-baseline justify-between">
                <span className="font-medium">2. Medium Priority Document/Work will process with 3 days</span>
                <span className="text-neutral-400 mx-1">|</span>
                <span dir="rtl" className="text-neutral-800">ستتم معالجة المستند / العمل ذي الأولوية المتوسطة في غضون 3 أيام</span>
              </li>

              <li className="flex items-baseline justify-between">
                <span className="font-medium">3. Low Priority Document/Work will process within 7 days</span>
                <span className="text-neutral-400 mx-1">|</span>
                <span dir="rtl" className="text-neutral-800">ستتم معالجة المستند / العمل ذو الأولوية المنخفضة في غضون 7 أيام</span>
              </li>
            </ol>
          </div>

          {/* Admin Team Use Only Section */}
          <div className="p-2 text-[11px] leading-snug">
            <div className="text-center font-bold text-[10px] tracking-wider mb-2 text-neutral-800">
              --------------------------- ADMIN TEAM USE ONLY | استخدام فريق المشرف فقط ---------------------------
            </div>

            <div className="space-y-1.5 pl-1">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  <span>• Work Completion Status</span>
                  <span>|</span>
                  <span dir="rtl">حالة إنجاز العمل :</span>
                </div>
                <div className="flex items-center gap-4 mr-2">
                  <label className="flex items-center gap-1">
                    <span>Completed</span>
                    <div className={`w-3.5 h-3.5 border border-black flex items-center justify-center ${data.adminUseOnly?.status === 'Completed' ? 'bg-black text-white' : ''}`}>
                      {data.adminUseOnly?.status === 'Completed' && '✓'}
                    </div>
                  </label>
                  <label className="flex items-center gap-1">
                    <span>Pending</span>
                    <div className={`w-3.5 h-3.5 border border-black flex items-center justify-center ${data.adminUseOnly?.status === 'Pending' ? 'bg-black text-white' : ''}`}>
                      {data.adminUseOnly?.status === 'Pending' && '✓'}
                    </div>
                  </label>
                </div>
              </div>

              {/* Completion Date */}
              <div className="flex items-center">
                <span className="font-bold">• Work Completion Date</span>
                <span className="mx-1">|</span>
                <span dir="rtl" className="font-bold">تاريخ إتمام العمل :</span>
                <span className="border-b border-black flex-1 ml-2 font-medium px-2">
                  {data.adminUseOnly?.completionDate || ''}
                </span>
              </div>

              {/* Completed By Name */}
              <div className="flex items-center">
                <span className="font-bold">• Work Completed By Name</span>
                <span className="mx-1">|</span>
                <span dir="rtl" className="font-bold">اكتمل العمل بالاسم :</span>
                <span className="border-b border-black flex-1 ml-2 font-medium px-2">
                  {data.adminUseOnly?.completedByName || ''}
                </span>
              </div>

              {/* Portal info */}
              <div className="flex items-center">
                <span className="font-bold">• Portal - Labour Office, Muqueem, Qiwa, Gosi</span>
                <span className="mx-1">|</span>
                <span dir="rtl" className="font-bold">البوابة - العمل ، مقيم ، قوى ، التأميني :</span>
                <span className="border-b border-black flex-1 ml-2 font-medium px-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Format Code Footer */}
        <div className="text-right text-[10px] font-bold tracking-tight text-neutral-800 pt-1 border-t border-neutral-300">
          Format Code# PR#21-001FA
        </div>
      </div>
    </div>
  );
};
