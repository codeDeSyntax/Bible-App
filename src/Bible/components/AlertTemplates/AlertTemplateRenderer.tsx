import React from "react";
import { AnimatePresence } from "framer-motion";
import { AlertPayload, AlertTemplateId } from "./alertTemplateTypes";
import { ClassicMarquee } from "./templates/ClassicMarquee";
import { ChevronLowerThird } from "./templates/ChevronLowerThird";
import { ScriptureBadge } from "./templates/ScriptureBadge";
import { HeadlineCard } from "./templates/HeadlineCard";
import { TopicPill } from "./templates/TopicPill";
import { BroadcastTicker } from "./templates/BroadcastTicker";

interface AlertTemplateRendererProps {
  alerts: AlertPayload[];
}

/**
 * Reads each alert's templateId and renders the correct template component.
 * Wraps each alert in AnimatePresence for enter/exit animations.
 */
export const AlertTemplateRenderer: React.FC<AlertTemplateRendererProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <AnimatePresence>
      {alerts.map((alert) => {
        const templateId: AlertTemplateId = (alert.templateId as AlertTemplateId) || "marquee-classic";

        switch (templateId) {
          case "chevron-lower-third":
            return <ChevronLowerThird key={alert.id} alert={alert} />;
          case "scripture-badge":
            return <ScriptureBadge key={alert.id} alert={alert} />;
          case "headline-card":
            return <HeadlineCard key={alert.id} alert={alert} />;
          case "topic-pill":
            return <TopicPill key={alert.id} alert={alert} />;
          case "broadcast-ticker":
            return <BroadcastTicker key={alert.id} alert={alert} />;
          case "marquee-classic":
          default:
            return <ClassicMarquee key={alert.id} alert={alert} />;
        }
      })}
    </AnimatePresence>
  );
};
