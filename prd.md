PortalKit — Full Product DocumentPART 1: PRD1.1 Product OverviewProduct Name: PortalKit
Type: Niche SaaS — Freelancer Client Portal
Tagline: "Everything your client needs. Nothing they don't."Problem: Freelancers juggle 4–6 tools to manage clients — email for files, Stripe for invoices, Notion for updates, Slack for approvals. There's no single, purpose-built portal for the full client-facing workflow.Solution: A lightweight, beautiful client portal where freelancers manage files, invoices, project status, and approvals. Clients get a clean branded link — no account required.1.2 Target UsersPrimary: Solo freelancers — designers, developers, copywriters, consultants
Secondary: Small agencies (2–5 people)
Client side: Non-technical clients receiving the portal linkPersonaPainMaya, UX FreelancerFiles on WeTransfer, invoices on Wave, updates by email — scatteredJames, Dev ConsultantAnswers "where are we?" emails weeklySofia, Brand StrategistApprovals buried in email threads1.3 Core Features (MVP)F1 — Client Portal
Unique URL per project. No client login required (token-based). Optional email verification. Freelancer-branded.F2 — File Sharing
Upload up to 500MB/file, 5GB total on free tier. Folder organization, image/PDF/video preview, one-click download, version history.F3 — Invoicing
Create with line items, tax, discount. Send directly via portal. Track: Draft → Sent → Viewed → Paid → Overdue. PDF export. Stripe in v2.F4 — Project Status / Milestones
Milestone-based progress tracker. Freelancer updates; client sees real-time. Drag-to-reorder. % complete auto-calculated.F5 — Approval Workflows
Freelancer submits item for approval. Client sees Approve / Request Changes. Comment thread per item. Email notification to client.F6 — Freelancer Dashboard
Overview of all projects, stats, notifications, quick actions.F7 — Branding & Themes
Logo upload, accent color, 3 themes, dark mode included.1.4 Feature ScopeFeatureMVPV2Client Portal URL✅File Sharing✅Manual Invoicing✅Project Status✅Approvals✅3 Themes + Dark Mode✅Stripe Payments✅Client Login✅Team/Agency Mode✅Contract Signing✅Time Tracking✅PART 2: TECHNICAL SPECIFICATION2.1 Tech StackLayerTechnologyWhyFrontendNext.js 14 (App Router, TypeScript)SSR, RSC, performanceStylingTailwind CSS + custom CSS varsUtility-first themingUI Componentsshadcn/ui + Radix UIAccessible unstyled primitivesAnimationsFramer MotionLiquid glass transitionsDatabaseMongoDB AtlasFlexible documents, great for nested dataODMMongooseSchema validation, middlewareAuthNextAuth.js (freelancer) + JWT tokens (client)Dual-access modelFile StorageCloudflare R2 (recommended over S3 — cheaper, no egress fees)Scalable object storageFile UploadsPresigned R2/S3 URLsDirect upload, no server bottleneckEmailResend + React EmailBeautiful transactional emailsPDF@react-pdf/rendererServer-side invoice PDFsStateZustandLightweightData FetchingTanStack QueryCaching, background refetchFormsReact Hook Form + ZodValidation, type safetyDrag & Drop@dnd-kit/coreMilestone reorderingDeploymentVercelZero-config2.2 MongoDB Schema Designjavascript// Users (Freelancers)
{
  _id: ObjectId,
  email: String,
  name: String,
  avatar: String,
  logo: String,
  accentColor: String,
  theme: { type: String, enum: ['frost', 'obsidian', 'aurora'], default: 'frost' },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  storageUsed: Number,
  lastInvoiceNumber: { type: Number, default: 0 },
  emailPreferences: {
    invoiceViewed: { type: Boolean, default: true },
    approvalResponded: { type: Boolean, default: true },
    portalVisited: { type: Boolean, default: false },
    overdueReminders: { type: Boolean, default: true }
  },
  createdAt: Date, updatedAt: Date
}

// Projects
{
  _id: ObjectId,
  freelancerId: ObjectId,
  clientName: String,
  clientEmail: String,
  title: String,
  description: String,
  status: { type: String, enum: ['active', 'completed', 'archived'] },
  portalTokenHash: String,      // bcrypt hash
  portalTokenPrefix: String,    // first 8 chars (for lookup optimization)
  portalEnabled: { type: Boolean, default: true },
  requireEmailVerification: Boolean,
  milestones: [{
    _id: ObjectId, title: String,
    status: { type: String, enum: ['not_started','in_progress','in_review','complete'] },
    dueDate: Date, order: Number
  }],
  createdAt: Date, updatedAt: Date
}

// Files
{
  _id: ObjectId,
  projectId: ObjectId, freelancerId: ObjectId,
  name: String, originalName: String,
  r2Key: String, r2Bucket: String,
  mimeType: String, size: Number, folder: String,
  status: { type: String, enum: ['pending', 'active'], default: 'pending' },
  versions: [{ r2Key: String, uploadedAt: Date, size: Number }],
  createdAt: Date
}

// Invoices
{
  _id: ObjectId, projectId: ObjectId, freelancerId: ObjectId,
  invoiceNumber: String,
  status: { type: String, enum: ['draft','sent','viewed','paid','overdue'] },
  lineItems: [{ description: String, quantity: Number, rate: Number, amount: Number }],
  subtotal: Number, tax: Number, taxRate: Number, discount: Number, total: Number,
  currency: { type: String, default: 'USD' },
  dueDate: Date, paidAt: Date, notes: String,
  sentAt: Date, viewedAt: Date, overdueNotified: Boolean,
  createdAt: Date
}

// Approvals
{
  _id: ObjectId, projectId: ObjectId, freelancerId: ObjectId,
  title: String, description: String,
  type: { type: String, enum: ['file','milestone','design','copy','other'] },
  fileId: ObjectId,
  status: { type: String, enum: ['pending','approved','changes_requested'] },
  comments: [{
    _id: ObjectId,
    author: { type: String, enum: ['freelancer','client'] },
    text: String, createdAt: Date
  }],
  createdAt: Date, updatedAt: Date
}

// Notifications
{
  _id: ObjectId, freelancerId: ObjectId,
  type: String, projectId: ObjectId,
  read: { type: Boolean, default: false },
  metadata: Object, createdAt: Date
}DB Indexes to create:

Project: { freelancerId: 1 }, { portalTokenPrefix: 1 }
File: { projectId: 1 }, Invoice: { projectId: 1 }
Approval: { projectId: 1 }, Notification: { freelancerId: 1, read: 1 }
2.3 API Routes/api/auth/[...nextauth]               — Freelancer auth
/api/auth/client/verify               — Client email verification

/api/projects                         — GET list, POST create
/api/projects/[id]                    — GET, PATCH, DELETE
/api/uploads/presign                  — POST: generate presigned upload URL

/api/projects/[id]/files              — GET list, POST confirm upload
/api/projects/[id]/files/[fid]/download  — GET presigned download URL
/api/projects/[id]/files/[fid]        — DELETE, PATCH (rename/folder)

/api/projects/[id]/invoices           — GET, POST
/api/projects/[id]/invoices/[iid]     — GET, PATCH, DELETE
/api/projects/[id]/invoices/[iid]/pdf    — GET PDF
/api/projects/[id]/invoices/[iid]/send   — POST send to client
/api/projects/[id]/invoices/[iid]/mark-paid — POST

/api/projects/[id]/approvals          — GET, POST
/api/projects/[id]/approvals/[aid]/respond — POST (client)
/api/projects/[id]/approvals/[aid]/comment — POST

/api/projects/[id]/milestones         — GET, POST, PATCH [mid], DELETE [mid]
/api/projects/[id]/milestones/reorder — POST

/api/portal/[token]                   — GET portal data (token auth)
/api/portal/[token]/visit             — POST (track visit)
/api/portal/[token]/files/[fid]/download — GET
/api/portal/[token]/invoices/[iid]/view  — POST
/api/portal/[token]/approvals/[aid]/respond — POST

/api/notifications                    — GET, PATCH (mark read)
/api/user/settings                    — GET, PATCH
/api/cron/check-overdue               — GET (protected cron)2.4 UI Design System — Liquid GlassCSS Variables (all 3 themes)css:root[data-theme="frost"] {
  --bg-base: #eef2ff;
  --bg-glass: rgba(255,255,255,0.45);
  --bg-glass-hover: rgba(255,255,255,0.65);
  --border-glass: rgba(255,255,255,0.7);
  --border-subtle: rgba(99,102,241,0.12);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --accent: #6366f1;
  --accent-light: rgba(99,102,241,0.12);
  --shadow-glass: 0 8px 32px rgba(99,102,241,0.08), 0 2px 8px rgba(0,0,0,0.04);
  --glow: 0 0 24px rgba(99,102,241,0.15);
}

:root[data-theme="obsidian"] {           /* DARK MODE */
  --bg-base: #08080f;
  --bg-glass: rgba(255,255,255,0.05);
  --bg-glass-hover: rgba(255,255,255,0.08);
  --border-glass: rgba(255,255,255,0.08);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --accent: #818cf8;
  --shadow-glass: 0 8px 32px rgba(0,0,0,0.4);
  --glow: 0 0 32px rgba(129,140,248,0.2);
}

:root[data-theme="aurora"] {             /* DARK + GLOW */
  --bg-base: #0d0f1a;
  --bg-glass: rgba(99,102,241,0.08);
  --bg-glass-hover: rgba(99,102,241,0.14);
  --border-glass: rgba(139,92,246,0.2);
  --text-primary: #e2e8f0;
  --text-secondary: #a5b4fc;
  --accent: #a78bfa;
  --shadow-glass: 0 8px 32px rgba(99,102,241,0.15);
  --glow: 0 0 40px rgba(139,92,246,0.3);
}Theme SummaryThemeVibeBackgroundGlass EffectFrostClean, light, professionalCool off-whiteWhite frosted panelsObsidianDark, sharp, minimalNear-blackDark glass panelsAuroraDark + purple energyDeep navyIndigo-tinted glass with glowCore Glass Card Pattern
tsx<div className="
  rounded-2xl backdrop-blur-xl
  border border-[var(--border-glass)]
  bg-[var(--bg-glass)]
  shadow-[var(--shadow-glass)]
  p-6 transition-all duration-300
  hover:bg-[var(--bg-glass-hover)]
  hover:translate-y-[-2px]
  hover:shadow-[var(--shadow-hover)]
">2.5 Folder Structure/app
  /dashboard
    page.tsx                  — Overview stats + project grid
    /projects/[id]/page.tsx   — Project detail (tabs)
    /settings/page.tsx
  /portal/[token]/page.tsx    — Client-facing portal
  /auth/login|signup
  /api/...

/components
  /glass      — GlassCard, GlassModal, GlassNav, GlassButton, GlassInput
  /dashboard  — DashboardStats, ProjectCard, NotificationBell
  /portal     — PortalLayout, PortalFiles, PortalInvoices, PortalApprovals
  /invoices   — InvoiceEditor, InvoicePDF, InvoiceList, LineItems
  /approvals  — ApprovalCard, ApprovalForm, CommentThread
  /files      — FileUploader, FileGrid, FilePreview, FolderSidebar
  /milestones — MilestoneTracker
  /themes     — ThemeProvider, ThemeSwitcher

/lib
  /mongodb.ts, /models/, /auth.ts, /r2.ts, /email.ts, /utils.ts

/emails
  invoice-sent.tsx, approval-request.tsx, portal-access.tsx,
  overdue-reminder.tsx, approval-responded.tsxPART 3: BUILD PLANPhaseNameWeekOutput1Foundation & Auth1Scaffold, DB, login/signup working2Projects & Dashboard2CRUD projects, dashboard UI, stats3File Sharing3Upload, preview, download, folders4Invoicing4Create, send, PDF, status tracking5Approvals & Milestones5Workflow, comments, drag-to-reorder6Client Portal6Public portal URL, full client UX7Themes & Glass UI73 themes, liquid glass, dark mode8Notifications & Email8In-app bell, all email templates9QA & Launch9Security, perf, deploy to Vercel