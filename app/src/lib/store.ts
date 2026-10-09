import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import type { Case, CaseWithDetails, DisputeType, Evidence, TimelineEvent } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const CASES_DIR = path.join(DATA_DIR, "cases");

function caseDir(caseId: string) {
  return path.join(CASES_DIR, caseId);
}

function filesDir(caseId: string) {
  return path.join(caseDir(caseId), "files");
}

function caseFile(caseId: string) {
  return path.join(caseDir(caseId), "case.json");
}

interface CaseRecord {
  case: Case;
  evidence: Evidence[];
  timeline: TimelineEvent[];
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function readCaseRecord(caseId: string): Promise<CaseRecord | null> {
  try {
    const raw = await fs.readFile(caseFile(caseId), "utf-8");
    return JSON.parse(raw) as CaseRecord;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function writeCaseRecord(record: CaseRecord) {
  await ensureDir(caseDir(record.case.id));
  const target = caseFile(record.case.id);
  const tmp = `${target}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(record, null, 2), "utf-8");
  await fs.rename(tmp, target);
}

// Concurrent requests (e.g. two caption edits saved back-to-back) can otherwise
// interleave their read-modify-write cycles and corrupt case.json. This serializes
// all mutations for a given case so each one sees the previous one's result.
const caseLocks = new Map<string, Promise<void>>();

function withCaseLock<T>(caseId: string, fn: () => Promise<T>): Promise<T> {
  const previous = caseLocks.get(caseId) ?? Promise.resolve();
  const result = previous.then(fn, fn);
  caseLocks.set(
    caseId,
    result.then(
      () => undefined,
      () => undefined
    )
  );
  return result;
}

/** Spreadsheet-style label: 0 -> A, 25 -> Z, 26 -> AA, ... */
export function exhibitLabelForIndex(index: number): string {
  let n = index;
  let label = "";
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

export async function listCases(): Promise<Case[]> {
  await ensureDir(CASES_DIR);
  const ids = await fs.readdir(CASES_DIR).catch(() => []);
  const cases: Case[] = [];
  for (const id of ids) {
    const record = await readCaseRecord(id);
    if (record) cases.push(record.case);
  }
  cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return cases;
}

export async function createCase(input: {
  type: DisputeType;
  title: string;
  currency: string;
  transactionAmount: number | null;
}): Promise<Case> {
  const now = new Date().toISOString();
  const newCase: Case = {
    id: randomUUID(),
    type: input.type,
    title: input.title.trim() || "Untitled case",
    status: "draft",
    currency: input.currency || "USD",
    transactionAmount: input.transactionAmount,
    createdAt: now,
    updatedAt: now,
  };
  await writeCaseRecord({ case: newCase, evidence: [], timeline: [] });
  return newCase;
}

export async function getCaseWithDetails(caseId: string): Promise<CaseWithDetails | null> {
  const record = await readCaseRecord(caseId);
  if (!record) return null;
  return {
    case: record.case,
    evidence: [...record.evidence].sort((a, b) => a.sortOrder - b.sortOrder),
    timeline: [...record.timeline].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export async function updateCase(
  caseId: string,
  patch: Partial<Pick<Case, "title" | "type" | "currency" | "transactionAmount" | "status">>
): Promise<Case | null> {
  return withCaseLock(caseId, async () => {
    const record = await readCaseRecord(caseId);
    if (!record) return null;
    record.case = { ...record.case, ...patch, updatedAt: new Date().toISOString() };
    await writeCaseRecord(record);
    return record.case;
  });
}

export async function addEvidence(
  caseId: string,
  input: { fileName: string; originalName: string; fileType: string; buffer: Buffer }
): Promise<Evidence | null> {
  return withCaseLock(caseId, async () => {
    const record = await readCaseRecord(caseId);
    if (!record) return null;

    await ensureDir(filesDir(caseId));
    await fs.writeFile(path.join(filesDir(caseId), input.fileName), input.buffer);

    const nextIndex = record.evidence.length;
    const evidence: Evidence = {
      id: randomUUID(),
      caseId,
      fileName: input.fileName,
      originalName: input.originalName,
      fileType: input.fileType,
      exhibitLabel: exhibitLabelForIndex(nextIndex),
      caption: "",
      sortOrder: nextIndex,
      include: true,
      createdAt: new Date().toISOString(),
    };
    record.evidence.push(evidence);
    record.case.updatedAt = new Date().toISOString();
    await writeCaseRecord(record);
    return evidence;
  });
}

export async function updateEvidence(
  caseId: string,
  evidenceId: string,
  patch: Partial<Pick<Evidence, "exhibitLabel" | "caption" | "sortOrder" | "include">>
): Promise<Evidence | null> {
  return withCaseLock(caseId, async () => {
    const record = await readCaseRecord(caseId);
    if (!record) return null;
    const idx = record.evidence.findIndex((e) => e.id === evidenceId);
    if (idx === -1) return null;
    record.evidence[idx] = { ...record.evidence[idx], ...patch };
    record.case.updatedAt = new Date().toISOString();
    await writeCaseRecord(record);
    return record.evidence[idx];
  });
}

export async function reorderEvidence(caseId: string, orderedIds: string[]): Promise<boolean> {
  return withCaseLock(caseId, async () => {
    const record = await readCaseRecord(caseId);
    if (!record) return false;
    orderedIds.forEach((id, index) => {
      const item = record.evidence.find((e) => e.id === id);
      if (item) item.sortOrder = index;
    });
    record.case.updatedAt = new Date().toISOString();
    await writeCaseRecord(record);
    return true;
  });
}

export async function deleteEvidence(caseId: string, evidenceId: string): Promise<boolean> {
  return withCaseLock(caseId, async () => {
    const record = await readCaseRecord(caseId);
    if (!record) return false;
    const idx = record.evidence.findIndex((e) => e.id === evidenceId);
    if (idx === -1) return false;
    const [removed] = record.evidence.splice(idx, 1);
    await fs.rm(path.join(filesDir(caseId), removed.fileName), { force: true });
    record.case.updatedAt = new Date().toISOString();
    await writeCaseRecord(record);
    return true;
  });
}

export async function getEvidenceFile(
  caseId: string,
  evidenceId: string
): Promise<{ evidence: Evidence; buffer: Buffer } | null> {
  const record = await readCaseRecord(caseId);
  if (!record) return null;
  const evidence = record.evidence.find((e) => e.id === evidenceId);
  if (!evidence) return null;
  const buffer = await fs.readFile(path.join(filesDir(caseId), evidence.fileName));
  return { evidence, buffer };
}

export async function addTimelineEvent(
  caseId: string,
  input: { date: string; title: string; description: string; evidenceIds: string[] }
): Promise<TimelineEvent | null> {
  return withCaseLock(caseId, async () => {
    const record = await readCaseRecord(caseId);
    if (!record) return null;
    const event: TimelineEvent = {
      id: randomUUID(),
      caseId,
      date: input.date,
      title: input.title.trim(),
      description: input.description.trim(),
      evidenceIds: input.evidenceIds,
      sortOrder: record.timeline.length,
    };
    record.timeline.push(event);
    record.case.updatedAt = new Date().toISOString();
    await writeCaseRecord(record);
    return event;
  });
}

export async function updateTimelineEvent(
  caseId: string,
  eventId: string,
  patch: Partial<Pick<TimelineEvent, "date" | "title" | "description" | "evidenceIds" | "sortOrder">>
): Promise<TimelineEvent | null> {
  return withCaseLock(caseId, async () => {
    const record = await readCaseRecord(caseId);
    if (!record) return null;
    const idx = record.timeline.findIndex((e) => e.id === eventId);
    if (idx === -1) return null;
    record.timeline[idx] = { ...record.timeline[idx], ...patch };
    record.case.updatedAt = new Date().toISOString();
    await writeCaseRecord(record);
    return record.timeline[idx];
  });
}

export async function deleteTimelineEvent(caseId: string, eventId: string): Promise<boolean> {
  return withCaseLock(caseId, async () => {
    const record = await readCaseRecord(caseId);
    if (!record) return false;
    const idx = record.timeline.findIndex((e) => e.id === eventId);
    if (idx === -1) return false;
    record.timeline.splice(idx, 1);
    record.case.updatedAt = new Date().toISOString();
    await writeCaseRecord(record);
    return true;
  });
}
