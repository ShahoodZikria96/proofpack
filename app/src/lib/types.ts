export const DISPUTE_TYPES = [
  { value: "non-delivery", label: "Item never arrived (non-delivery)" },
  { value: "wrong-item", label: "Wrong item received" },
  { value: "damaged-item", label: "Item arrived damaged" },
  { value: "refund-failure", label: "Refund promised but not received" },
  { value: "unauthorized-charge", label: "Unauthorized / incorrect charge" },
  { value: "other", label: "Other purchase or payment issue" },
] as const;

export type DisputeType = (typeof DISPUTE_TYPES)[number]["value"];

export type CaseStatus = "draft" | "exported";

export interface Case {
  id: string;
  type: DisputeType;
  title: string;
  status: CaseStatus;
  currency: string;
  transactionAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  fileName: string; // name on disk
  originalName: string;
  fileType: string; // mime type
  exhibitLabel: string; // "A", "B", "C", ...
  caption: string;
  sortOrder: number;
  include: boolean;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  date: string; // ISO date, user-entered
  title: string;
  description: string;
  evidenceIds: string[];
  sortOrder: number;
}

export interface CaseWithDetails {
  case: Case;
  evidence: Evidence[];
  timeline: TimelineEvent[];
}
