import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { DISPUTE_TYPES } from "@/lib/types";
import type { Case, Evidence, TimelineEvent } from "@/lib/types";

// Matches the app's brand-900/brand-700/brand-50 tokens (see globals.css) so
// the exported PDF - the document people actually submit - carries the same
// trust-blue identity as the product, rather than a plain black/gray.
const NAVY = "#122040";
const NAVY_SOFT = "#3c5a8f";
const BORDER = "#dbe6f4";

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  brand: {
    fontSize: 11,
    color: NAVY_SOFT,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  coverTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginTop: 220,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 13,
    color: NAVY_SOFT,
    marginBottom: 40,
  },
  coverMetaRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
    marginTop: 8,
  },
  coverMetaLabel: {
    width: 150,
    color: NAVY_SOFT,
  },
  coverMetaValue: {
    flex: 1,
    color: "#0f172a",
    fontFamily: "Helvetica-Bold",
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    paddingBottom: 8,
  },
  paragraph: {
    marginBottom: 10,
    lineHeight: 1.5,
    color: "#1e293b",
  },
  noticeBox: {
    marginTop: 18,
    padding: 12,
    backgroundColor: "#eef3fa",
    borderRadius: 4,
    color: NAVY_SOFT,
    lineHeight: 1.5,
  },
  tableRowHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    paddingVertical: 7,
  },
  thDate: { width: 70, fontFamily: "Helvetica-Bold", color: NAVY },
  thEvent: { flex: 1, fontFamily: "Helvetica-Bold", color: NAVY, paddingRight: 8 },
  thExhibits: { width: 90, fontFamily: "Helvetica-Bold", color: NAVY },
  tdDate: { width: 70, color: "#334155" },
  tdEvent: { flex: 1, paddingRight: 8 },
  tdEventTitle: { fontFamily: "Helvetica-Bold", color: "#0f172a", marginBottom: 2 },
  tdEventDesc: { color: "#475569" },
  tdExhibits: { width: 90, color: "#334155" },
  thExhibit: { width: 60, fontFamily: "Helvetica-Bold", color: NAVY },
  thFile: { flex: 1, fontFamily: "Helvetica-Bold", color: NAVY, paddingRight: 8 },
  thCaption: { flex: 1, fontFamily: "Helvetica-Bold", color: NAVY },
  tdExhibit: { width: 60, color: "#334155", fontFamily: "Helvetica-Bold" },
  tdFile: { flex: 1, paddingRight: 8, color: "#334155" },
  tdCaption: { flex: 1, color: "#475569" },
  emptyNote: { color: "#94a3b8", fontStyle: "italic" },
});

function disputeLabel(type: Case["type"]) {
  return DISPUTE_TYPES.find((d) => d.value === type)?.label ?? type;
}

function formatAmount(currency: string, amount: number | null) {
  if (amount === null) return "Not specified";
  return `${currency} ${amount.toFixed(2)}`;
}

export function FrontMatter({
  caseData,
  evidence,
  timeline,
}: {
  caseData: Case;
  evidence: Evidence[];
  timeline: TimelineEvent[];
}) {
  const included = evidence.filter((e) => e.include);
  const generatedOn = new Date().toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Document title={`ProofPack - ${caseData.title}`} author="ProofPack">
      {/* Cover page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>ProofPack Evidence Pack</Text>
        <Text style={styles.coverTitle}>{caseData.title}</Text>
        <Text style={styles.coverSubtitle}>{disputeLabel(caseData.type)}</Text>

        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>Company / merchant</Text>
          <Text style={styles.coverMetaValue}>{caseData.merchantName || "Not specified"}</Text>
        </View>
        {caseData.country ? (
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>Country / region</Text>
            <Text style={styles.coverMetaValue}>{caseData.country}</Text>
          </View>
        ) : null}
        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>Transaction amount</Text>
          <Text style={styles.coverMetaValue}>{formatAmount(caseData.currency, caseData.transactionAmount)}</Text>
        </View>
        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>Evidence items</Text>
          <Text style={styles.coverMetaValue}>{included.length}</Text>
        </View>
        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>Timeline events</Text>
          <Text style={styles.coverMetaValue}>{timeline.length}</Text>
        </View>
        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>Case reference</Text>
          <Text style={styles.coverMetaValue}>{caseData.id}</Text>
        </View>
        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>Generated on</Text>
          <Text style={styles.coverMetaValue}>{generatedOn}</Text>
        </View>
      </Page>

      {/* Case summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionHeading}>Case Summary</Text>
        <Text style={styles.paragraph}>
          This evidence pack documents a consumer purchase/payment dispute of type &quot;{disputeLabel(caseData.type)}
          &quot; with {caseData.merchantName || "the named merchant"}
          {caseData.country ? ` (${caseData.country})` : ""}, involving a transaction amount of{" "}
          {formatAmount(caseData.currency, caseData.transactionAmount)}.
        </Text>
        <Text style={styles.paragraph}>
          It contains {included.length} piece{included.length === 1 ? "" : "s"} of evidence, labeled Exhibit{" "}
          {included.length > 0 ? included[0].exhibitLabel : "A"}
          {included.length > 1 ? ` through Exhibit ${included[included.length - 1].exhibitLabel}` : ""}, and{" "}
          {timeline.length} recorded timeline event{timeline.length === 1 ? "" : "s"}.
        </Text>
        <Text style={styles.paragraph}>
          All facts in this document were entered or confirmed by the case owner. This pack was generated on{" "}
          {generatedOn}.
        </Text>
        <View style={styles.noticeBox}>
          <Text>
            This document is an organized record of evidence supplied by the case owner. It does not assert fault,
            claim fraud or illegality, provide legal advice, or guarantee any outcome. It is intended to support -
            not replace - the case owner&apos;s own submission to a merchant, bank, payment provider or platform.
          </Text>
        </View>
      </Page>

      {/* Timeline */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionHeading}>Chronological Timeline</Text>
        {timeline.length === 0 ? (
          <Text style={styles.emptyNote}>No timeline events were recorded for this case.</Text>
        ) : (
          <View>
            <View style={styles.tableRowHeader}>
              <Text style={styles.thDate}>Date</Text>
              <Text style={styles.thEvent}>Event</Text>
              <Text style={styles.thExhibits}>Exhibits</Text>
            </View>
            {timeline.map((event) => {
              const labels = event.evidenceIds
                .map((eid) => evidence.find((e) => e.id === eid)?.exhibitLabel)
                .filter((label): label is string => Boolean(label));
              return (
                <View style={styles.tableRow} key={event.id} wrap={false}>
                  <Text style={styles.tdDate}>{event.date}</Text>
                  <View style={styles.tdEvent}>
                    <Text style={styles.tdEventTitle}>{event.title}</Text>
                    {event.description ? <Text style={styles.tdEventDesc}>{event.description}</Text> : null}
                  </View>
                  <Text style={styles.tdExhibits}>{labels.length > 0 ? labels.join(", ") : "-"}</Text>
                </View>
              );
            })}
          </View>
        )}
      </Page>

      {/* Evidence index */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionHeading}>Evidence Index</Text>
        {included.length === 0 ? (
          <Text style={styles.emptyNote}>No evidence was included in this export.</Text>
        ) : (
          <View>
            <View style={styles.tableRowHeader}>
              <Text style={styles.thExhibit}>Exhibit</Text>
              <Text style={styles.thFile}>File</Text>
              <Text style={styles.thCaption}>Caption</Text>
            </View>
            {included.map((item) => (
              <View style={styles.tableRow} key={item.id} wrap={false}>
                <Text style={styles.tdExhibit}>{item.exhibitLabel}</Text>
                <Text style={styles.tdFile}>{item.originalName}</Text>
                <Text style={styles.tdCaption}>{item.caption || "-"}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
