import React from "react";
import {
  Megaphone,
  ScrollText,
  ChevronsRight,
  BookOpen,
  LayoutTemplate,
  Pill,
  Radio,
} from "lucide-react";
import {
  AlertTemplateId,
  AlertType,
} from "@/Bible/components/AlertTemplates/alertTemplateTypes";

/** Official Lucide-style PencilSparkles Icon */
export const PencilSparkles: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = "w-3.5 h-3.5",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m14 7 3 3" />
    <path d="M17.5 3.5 19 2l3 3-1.5 1.5" />
    <path d="M16 5 4.5 16.5a2 2 0 0 0-.5.83l-.8 2.8a.5.5 0 0 0 .62.62l2.8-.8a2 2 0 0 0 .83-.5L19 8" />
    <path d="M20 18v3" />
    <path d="M18.5 19.5h3" />
    <path d="M4 4v3" />
    <path d="M2.5 5.5h3" />
  </svg>
);

/** Custom Church Cross Icon */
export const CrossIcon: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = "w-3 h-3", style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M12 2v20M5 8h14" />
  </svg>
);

export const TEMPLATE_ICON_MAP: Record<
  AlertTemplateId,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  "marquee-classic": ScrollText,
  "chevron-lower-third": ChevronsRight,
  "scripture-badge": BookOpen,
  "headline-card": LayoutTemplate,
  "topic-pill": Pill,
  "broadcast-ticker": Radio,
};

export const TYPE_ICON_MAP: Record<
  AlertType,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  sermon: CrossIcon,
  news: Megaphone,
  scripture: BookOpen,
  general: Radio,
};
