/**
 * Alert Template System
 * Defines the available visual presentation templates for broadcast alerts.
 */

export type AlertTemplateId =
  | "marquee-classic"
  | "chevron-lower-third"
  | "scripture-badge"
  | "headline-card"
  | "topic-pill"
  | "broadcast-ticker";

export interface AlertTemplateInfo {
  id: AlertTemplateId;
  label: string;
  description: string;
  /** CSS-compatible accent color for preview chips */
  accentColor: string;
  /** Best suited content types */
  bestFor: string[];
}

/** Registry of all available templates */
export const ALERT_TEMPLATES: AlertTemplateInfo[] = [
  {
    id: "marquee-classic",
    label: "Marquee",
    description: "Full-width smooth scrolling text ribbon for church announcements.",
    accentColor: "#4c1d95",
    bestFor: ["scriptures", "announcements", "events"],
  },
  {
    id: "chevron-lower-third",
    label: "Chevron",
    description: "Broadcast-style angled accent bar with sermon theme and key scripture.",
    accentColor: "#1d4ed8",
    bestFor: ["sermons", "themes", "speakers"],
  },
  {
    id: "scripture-badge",
    label: "Badge",
    description: "Sacred circular 3D medallion with angled lower-third bar for Bible verses.",
    accentColor: "#7c3aed",
    bestFor: ["scriptures", "verses", "bible readings"],
  },
  {
    id: "headline-card",
    label: "Headline",
    description: "Multi-tier beveled broadcast lower-third for sermon themes and key points.",
    accentColor: "#be123c",
    bestFor: ["sermon themes", "the word", "key points"],
  },
  {
    id: "topic-pill",
    label: "Pill",
    description: "Compact floating pill badge for sermon categories and short scriptures.",
    accentColor: "#b45309",
    bestFor: ["topics", "scripture references", "short messages"],
  },
  {
    id: "broadcast-ticker",
    label: "Ticker",
    description: "Two-tone church message badge on left with smooth scrolling text on right.",
    accentColor: "#0f766e",
    bestFor: ["scriptures", "church announcements", "ministry events"],
  },
];

export const DEFAULT_TEMPLATE_ID: AlertTemplateId = "marquee-classic";

/** Structured alert payload shared across IPC and components */
export interface AlertPayload {
  id: string;
  text: string;
  speed?: number;
  backgroundColor?: string;
  position?: "top" | "bottom";
  templateId?: AlertTemplateId;
}
