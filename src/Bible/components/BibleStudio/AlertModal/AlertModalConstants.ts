import {
  AlertType,
  AlertStructuredData,
} from "@/Bible/components/AlertTemplates/alertTemplateTypes";

export * from "./AlertModalIcons";

// Color mapping
export const colorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#38bdf8",
  green: "#22c55e",
  yellow: "#facc15",
  gold: "#fbbf24",
  amber: "#f59e0b",
  purple: "#c084fc",
  violet: "#a78bfa",
  indigo: "#818cf8",
  orange: "#fb923c",
  pink: "#f472b6",
  rose: "#fb7185",
  cyan: "#22d3ee",
  teal: "#2dd4bf",
  white: "#ffffff",
  black: "#000000",
  lime: "#bef264",
  lemon: "#bef264",
  lemongreen: "#bef264",
  emerald: "#10b981",
};

export const colorTokenFromHex = (hexColor: string) => {
  const namedColor = Object.entries(colorMap).find(
    ([, hex]) => hex.toLowerCase() === hexColor.toLowerCase(),
  )?.[0];

  return namedColor || hexColor.replace("#", "");
};

export const SYMBOL_LIST = [
  "▲", "▼", "◄", "►", "●", "○", "•", "◆", "◇", "■", "□", "▪", "▫",
  "│", "║", "┃", "─", "═", "━", "▬", "┌", "┐", "└", "┘", "╔", "╗", "╚", "╝",
  "⬆", "⬇", "⬅", "➡", "★", "✝", "✦", "⚡", "🔔",
];

export const SAMPLE_TEST_DATA: Record<AlertType, AlertStructuredData[]> = {
  sermon: [
    {
      title: "Walking in Divine Dominion",
      scriptures: "Romans 8:28, Ephesians 1:3",
      speaker: "Pastor David",
      notes: "Faith over fear, Standing firm in God's promises",
    },
    {
      title: "The Power of Answered Prayer",
      scriptures: "James 5:16, Philippians 4:6-7",
      speaker: "Rev. Emmanuel",
      notes: "Pray without ceasing, Trust His perfect timing",
    },
    {
      title: "Grace Abounding in Every Season",
      scriptures: "2 Corinthians 12:9, Hebrews 4:16",
      speaker: "Pastor Sarah",
      notes: "His strength made perfect in weakness, Boldness in worship",
    },
  ],
  news: [
    {
      headline: "Night of Supernatural Worship & Praise",
      dateTime: "This Friday @ 6:00 PM",
      venue: "Main Auditorium",
      contact: "055-123-4567 / info@church.org",
      details: "Join us for an unforgettable evening of high praise and encounter with God!",
    },
    {
      headline: "Church Workers & Leaders Conference",
      dateTime: "Saturday @ 8:30 AM",
      venue: "Fellowship Hall",
      contact: "Admin Desk / Ext 104",
      details: "Empowerment & vision casting session for all ministry leads and volunteers.",
    },
    {
      headline: "Annual Youth & Teens Camp 2026",
      dateTime: "July 15-18",
      venue: "Mount Zion Retreat Center",
      contact: "Youth Hotline: 024-987-6543",
      details: "Registration is open! Secure your spot early at the info desk.",
    },
  ],
  scripture: [
    {
      reference: "Psalm 23:1-3, Romans 8:31",
      verseText: "The Lord is my shepherd, I shall not want. He makes me lie down in green pastures.",
      focus: "Divine Providence & Everlasting Peace",
    },
    {
      reference: "Isaiah 40:31",
      verseText: "Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles.",
      focus: "Renewed Strength & Patience in Faith",
    },
    {
      reference: "John 14:27",
      verseText: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you.",
      focus: "Unshakable Peace in Christ",
    },
  ],
  general: [
    {
      title: "Welcome to Sunday Celebration Service!",
      message: "We are overjoyed to worship with you. Kindly silence mobile devices during service.",
    },
    {
      title: "Community Outreach & Food Drive",
      message: "Partner with us this week to distribute food supplies to local families in need.",
    },
    {
      title: "Midweek Bible Study & Communion",
      message: "Deepen your understanding of God's Word every Wednesday at 6:30 PM in-person & online.",
    },
  ],
};
