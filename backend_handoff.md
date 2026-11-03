# PreciSign — Backend & Infrastructure Handoff Specification

## 1. Executive Summary & Architecture Overview

**PreciSign** is an enterprise document approval, bilingual workflow routing, and e-signing platform built specifically for **Precision Engineering Group (Saudi Arabia)** and its operating subsidiaries:
- **PEW** — Precision Engineering Works
- **ICCL**
- **Flexi Seal Gasket (FSG)**

### Architectural Decoupling
The frontend client has been engineered with strict layer separation:
1. **Domain Interfaces (`/src/types/index.ts`)**: Complete typing for tenants, personas, workflow stages, version histories, and the official bilingual **Admin Work Request Form (PR#21-001FA)**.
2. **Pure Workflow Engine (`/src/utils/workflowEngine.ts`)**: Pure, decoupled state machine covering submission, sequential multi-stage approvals, return for correction, resubmission version increments (V1 -> V2), director overrides, and rejections.
3. **Repository Abstraction (`/src/services/repository.ts`)**: High-level interface `IPreciSignRepository`. The current prototype uses `LocalStoragePreciSignRepository` solely behind this abstraction. Replacing local storage with a real REST/GraphQL API requires zero modifications to React components or UI views.
4. **Single Source of Truth Document Renderer (`/src/components/document/AdminWorkRequestDocument.tsx`)**: Reusable component serving interactive creation preview, approver review, printable layout, and archived audit records.

---

## 2. API Contract Specification (`IPreciSignRepository`)

The backend service should implement the following RESTful or GraphQL endpoints matching `IPreciSignRepository`:

### 2.1 Companies & Tenants
- `GET /api/v1/companies`
  - **Response**: `200 OK` — `Company[]`
- `GET /api/v1/companies/:companyId`
  - **Response**: `200 OK` — `Company`

### 2.2 User Profiles & Demo Personas
- `GET /api/v1/users`
  - **Query Params**: `companyId?: string`
  - **Response**: `200 OK` — `UserProfile[]`
- `GET /api/v1/users/:userId`
  - **Response**: `200 OK` — `UserProfile`
- `PATCH /api/v1/users/:userId/signature`
  - **Request Body**: `{ signatureDataUrl?: string, signatureStyleText?: string }`
  - **Response**: `200 OK` — Updated `UserProfile`

### 2.3 Workflows & Governance
- `GET /api/v1/workflows`
  - **Query Params**: `companyId: string`, `formType?: string`
  - **Response**: `200 OK` — `WorkflowConfig[]`
- `PUT /api/v1/workflows/:workflowId`
  - **Request Body**: `WorkflowConfig`
  - **Response**: `200 OK` — `WorkflowConfig`

### 2.4 Request Records & Approvals
- `GET /api/v1/requests`
  - **Query Params**: `companyId: string`, `status?: RequestStatus`, `requesterId?: string`, `approverId?: string`
  - **Response**: `200 OK` — `RequestRecord[]`
- `GET /api/v1/requests/:requestId`
  - **Response**: `200 OK` — `RequestRecord`
- `POST /api/v1/requests`
  - **Request Body**: `RequestRecord` (or initial submission payload)
  - **Response**: `201 Created` — `RequestRecord`
- `PUT /api/v1/requests/:requestId`
  - **Request Body**: `RequestRecord` (updated approval state, history, and version snapshots)
  - **Response**: `200 OK` — `RequestRecord`
- `DELETE /api/v1/requests/:requestId`
  - **Response**: `204 No Content`

### 2.5 Draft Management
- `GET /api/v1/drafts?companyId=...&formType=...`
  - **Response**: `200 OK` — `Partial<AdminWorkFormData> | null`
- `PUT /api/v1/drafts`
  - **Request Body**: `{ companyId: string, formType: string, formData: Partial<AdminWorkFormData> }`
  - **Response**: `200 OK`
- `DELETE /api/v1/drafts?companyId=...&formType=...`
  - **Response**: `204 No Content`

### 2.6 File Attachments
- `POST /api/v1/attachments/upload`
  - **Multipart Form Data**: `file: File`, `requestId: string`
  - **Response**: `201 Created` — `AttachmentItem`

---

## 3. Enterprise Authentication & SSO Architecture

In the production deployment across Precision Engineering Group facilities (Riyadh, Dammam, Jubail, Jeddah), authentication must integrate with corporate identity providers.

### 3.1 Recommended Identity Providers
1. **Microsoft Entra ID (Azure AD)**:
   - Primary enterprise IdP for Precision Engineering Group.
   - Use OAuth 2.0 / OpenID Connect (OIDC) PKCE authorization code flow.
   - Map Active Directory Security Groups to PreciSign roles:
     - `SG_PRECISIGN_ADMIN` -> `Admin`
     - `SG_PRECISIGN_GM` -> `General Manager`
     - `SG_PRECISIGN_DIRECTORS` -> `Director`
     - `SG_PRECISIGN_FINANCE` -> `Finance`
     - `SG_PRECISIGN_PURCHASE` -> `Purchase`
     - `SG_PRECISIGN_HR` -> `HR`
     - `SG_PRECISIGN_IT` -> `IT`
2. **Saudi National Single Sign-On (Nafath) & GOSI / Qiwa API Integration**:
   - For statutory HR actions, Saudi citizen/resident verification, and Iqama validation.

### 3.2 Session & Token Security
- **JWT (JSON Web Tokens)**:
  - Short-lived Access Tokens (15 minutes).
  - HttpOnly, Secure, SameSite=Strict Refresh Tokens (7 days with rotation).
  - Claims must include: `sub`, `email`, `name`, `role`, `companyId`, `permissions[]`.

---

## 4. Server-Side Authorization & Anti-Tampering Rules

The browser prototype performs optimistic client-side workflow validation. In production, **the backend must be the absolute authority** and strictly enforce the following security invariants:

1. **Anti-Tampering Guard (Self-Approval Prohibition)**:
   - If `workflowConfig.preventSelfApproval === true`, reject any approval request where `actingUserId === request.requesterId` with `403 Forbidden`.
2. **Strict Assigned Approver Validation**:
   - Verify that `actingUserId === request.currentApproverId` for the current stage.
   - Reject attempts by unauthorized employees to approve requests.
3. **Director Override Audit Guard**:
   - Only users with role `Director` may trigger the override action.
   - The backend must enforce that `reason` is non-empty and log an immutable entry into `approvalHistory` and system security audit logs.
4. **Tenant Isolation**:
   - All database queries must enforce tenant scoping (`WHERE company_id = :sessionCompanyId`).
   - Prevent cross-tenant access between PEW, ICCL, and FSG.
5. **Immutable History & Version Snapshots**:
   - Once written, records in `approval_history` and `version_snapshots` cannot be updated or deleted by any user or administrator.

---

## 5. Audit Integrity & Cryptographic Electronic Signing (Saudi Compliance)

Under Saudi Arabia's **Electronic Transactions Law (Royal Decree No. M/18)** and regulations issued by the **Digital Government Authority (DGA)** and **Communications, Space & Technology Commission (CSTC)**, corporate approval documents require cryptographic non-repudiation.

### 5.1 Document Cryptographic Hashing
Upon each submission, approval, or completion:
1. Generate canonical JSON representation of the document fields.
2. Calculate SHA-256 digest of the canonical document + all uploaded attachments:
   $$\text{DocumentHash} = \text{SHA-256}(\text{CanonicalJSON} \parallel \text{AttachmentHashes})$$
3. Store `DocumentHash` in the immutable audit log table.

### 5.2 Digital Signature & PKI Architecture
1. **Hardware Security Module (HSM) / Cloud KMS**:
   - Corporate signing keys stored in FIPS 140-2 Level 3 HSM (e.g. AWS CloudHSM, Azure Key Vault Managed HSM, or Google Cloud KMS).
   - Use X.509 digital certificates issued by a trusted Saudi Root CA.
2. **PAdES (PDF Advanced Electronic Signatures)**:
   - When generating the final approved PDF, embed a PAdES-compliant digital signature.
   - Include RFC 3161 compliant cryptographic Timestamp Authority (TSA) proof.
   - Any modification to the PDF post-signing invalidates the cryptographic signature in Adobe Acrobat / PDF readers.
3. **Verification QR Code**:
   - Render a secure QR code on the footer of the generated PDF linking to:
     `https://precisign.precision-eg.com/verify?id={requestId}&hash={hashPrefix}`
   - The public verification page displays:
     - Document Format: `PR#21-001FA (Admin Work Request)`
     - Company: `PEW - Precision Engineering Works`
     - Requester & Submission Timestamp
     - Full Chronological Approver Signatures & Certificates
     - Cryptographic Validity Status: `VALID / UNTAMPERED`

---

## 6. Server-Side PDF Generation Pipeline

While the frontend supports standard browser printing via CSS `@media print`, enterprise archive and external regulatory submission require automated, certified PDF generation:

1. **Rendering Engine**:
   - Headless Chromium (Playwright / Puppeteer in serverless container) or WeasyPrint.
   - Dimensions: Standard ISO A4 ($210\text{ mm} \times 297\text{ mm}$), zero browser margins.
2. **Asset Embedding**:
   - Embed web fonts directly into the PDF:
     - Arabic: `Cairo (Regular, SemiBold, Bold)`
     - English: `Plus Jakarta Sans`
     - Handwritten E-Sign: `Caveat`
   - High-resolution SVG Precision Engineering Group logo.
3. **Archival Storage**:
   - Save generated PDFs to S3-compatible Object Storage (e.g., MinIO or AWS S3 with Object Lock enabled for WORM / Write Once Read Many compliance).
   - Filename convention: `{COMPANY}_{FORM_CODE}_{REQUEST_ID}_V{VERSION}.pdf`.

---

## 7. Real-Time Notifications & Integration Webhooks

Configure the event broker (Kafka, RabbitMQ, or AWS SNS/SQS) with the following triggers:

| Event Type | Recipient | Channels | Content |
|---|---|---|---|
| `REQUEST_SUBMITTED` | Stage 1 Approver | Email, MS Teams | New request pending your review. |
| `STAGE_APPROVED` | Next Stage Approver | Email, MS Teams | Prior stage approved; your review is now required. |
| `STAGE_APPROVED` | Requester | In-App, Email | Step approved by [Approver Name]. |
| `RETURNED_FOR_CORRECTION` | Requester | Email, MS Teams, SMS | Request returned with notes. Edit and resubmit. |
| `REQUEST_REJECTED` | Requester & Approvers | Email, In-App | Request has been rejected with justification. |
| `REQUEST_COMPLETED` | Admin Operations Team | Email, Webhook | Final approval completed. Execute government portal actions (Qiwa, Muqeem, Gosi). |

---

## 8. Transition Guide: Switching from LocalStorage to API Repository

To replace the prototype mock store with the production REST/GraphQL client:

### Step 1: Create `src/services/apiRepository.ts`
```typescript
import { IPreciSignRepository } from './repository';
import { Company, UserProfile, WorkflowConfig, RequestRecord, AdminWorkFormData, CompanyId } from '../types';

export class ApiPreciSignRepository implements IPreciSignRepository {
  private baseUrl = import.meta.env.VITE_API_URL || '/api/v1';

  private async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const token = localStorage.getItem('precisign_auth_token');
    const res = await fetch(`${this.baseUrl}${url}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async getCompanies(): Promise<Company[]> {
    return this.fetchJson<Company[]>('/companies');
  }

  async getUsers(companyId?: CompanyId): Promise<UserProfile[]> {
    const q = companyId ? `?companyId=${companyId}` : '';
    return this.fetchJson<UserProfile[]>(`/users${q}`);
  }

  async updateUserSignature(userId: string, signatureDataUrl?: string, signatureStyleText?: string): Promise<UserProfile> {
    return this.fetchJson<UserProfile>(`/users/${userId}/signature`, {
      method: 'PATCH',
      body: JSON.stringify({ signatureDataUrl, signatureStyleText }),
    });
  }

  async getWorkflows(companyId?: CompanyId): Promise<WorkflowConfig[]> {
    const q = companyId ? `?companyId=${companyId}` : '';
    return this.fetchJson<WorkflowConfig[]>(`/workflows${q}`);
  }

  async saveWorkflow(config: WorkflowConfig): Promise<WorkflowConfig> {
    return this.fetchJson<WorkflowConfig>(`/workflows/${config.id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async getRequests(companyId?: CompanyId): Promise<RequestRecord[]> {
    const q = companyId ? `?companyId=${companyId}` : '';
    return this.fetchJson<RequestRecord[]>(`/requests${q}`);
  }

  async getRequestById(id: string): Promise<RequestRecord | null> {
    try {
      return await this.fetchJson<RequestRecord>(`/requests/${id}`);
    } catch {
      return null;
    }
  }

  async createRequest(record: RequestRecord): Promise<RequestRecord> {
    return this.fetchJson<RequestRecord>('/requests', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  async updateRequest(record: RequestRecord): Promise<RequestRecord> {
    return this.fetchJson<RequestRecord>(`/requests/${record.id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
  }

  async getDraft(companyId: CompanyId, formType: string): Promise<Partial<AdminWorkFormData> | null> {
    return this.fetchJson<Partial<AdminWorkFormData> | null>(`/drafts?companyId=${companyId}&formType=${encodeURIComponent(formType)}`);
  }

  async saveDraft(companyId: CompanyId, formType: string, data: Partial<AdminWorkFormData>): Promise<void> {
    await this.fetchJson('/drafts', {
      method: 'PUT',
      body: JSON.stringify({ companyId, formType, formData: data }),
    });
  }

  async clearDraft(companyId: CompanyId, formType: string): Promise<void> {
    await this.fetchJson(`/drafts?companyId=${companyId}&formType=${encodeURIComponent(formType)}`, {
      method: 'DELETE',
    });
  }

  async getDemoSession() {
    return { companyId: 'PEW' as CompanyId, userId: 'user-afzal' };
  }

  async saveDemoSession() {}

  async resetToSeedData(): Promise<void> {
    await this.fetchJson('/admin/reset-demo-data', { method: 'POST' });
  }
}
```

### Step 2: Swap the Instance in `src/services/repository.ts`
Change line 166:
```typescript
// Replace:
export const dataService: IPreciSignRepository = new LocalStoragePreciSignRepository();

// With:
export const dataService: IPreciSignRepository = new ApiPreciSignRepository();
```

Because all React Context operations, forms, and approval hooks strictly consume `dataService`, **no UI files require refactoring**.
