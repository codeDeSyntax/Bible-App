import React from "react";
import {
  AlertType,
  AlertStructuredData,
} from "@/Bible/components/AlertTemplates/alertTemplateTypes";

interface AlertFormFieldsProps {
  alertType: AlertType;
  structuredData: AlertStructuredData;
  onFieldChange: (field: keyof AlertStructuredData, value: string) => void;
  activeInputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  isDarkMode: boolean;
}

export const AlertFormFields: React.FC<AlertFormFieldsProps> = ({
  alertType,
  structuredData,
  onFieldChange,
  activeInputRef,
  isDarkMode,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {/* SERMON TYPE INPUTS */}
      {alertType === "sermon" && (
        <>
          <input
            type="text"
            data-field="title"
            ref={(el) => {
              if (el && !activeInputRef.current) activeInputRef.current = el;
            }}
            onFocus={(e) => (activeInputRef.current = e.target)}
            value={structuredData.title || ""}
            onChange={(e) => onFieldChange("title", e.target.value)}
            placeholder="Sermon Title or Topic (e.g. Walking in Divine Dominion)..."
            className={`w-full outline-none font-sans text-[0.78rem] font-semibold leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-zinc-800/70 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800"
                : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-100/80"
            }`}
          />

          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              data-field="scriptures"
              onFocus={(e) => (activeInputRef.current = e.target)}
              value={structuredData.scriptures || ""}
              onChange={(e) => onFieldChange("scriptures", e.target.value)}
              placeholder="Scriptures (separate with commas, e.g. Romans 8:28, Eph 1:3)..."
              className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
              }`}
            />
            <input
              type="text"
              data-field="speaker"
              onFocus={(e) => (activeInputRef.current = e.target)}
              value={structuredData.speaker || ""}
              onChange={(e) => onFieldChange("speaker", e.target.value)}
              placeholder="Minister / Preacher (e.g. Pastor David)..."
              className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
              }`}
            />
          </div>

          <input
            type="text"
            data-field="notes"
            onFocus={(e) => (activeInputRef.current = e.target)}
            value={structuredData.notes || ""}
            onChange={(e) => onFieldChange("notes", e.target.value)}
            placeholder="Key Points / Takeaways (separate with commas, e.g. Faith over fear, Daily prayer)..."
            className={`w-full outline-none font-sans text-[0.75rem] font-normal leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
            }`}
          />
        </>
      )}

      {/* NEWS & EVENTS INPUTS */}
      {alertType === "news" && (
        <>
          <input
            type="text"
            data-field="headline"
            ref={(el) => {
              if (el && !activeInputRef.current) activeInputRef.current = el;
            }}
            onFocus={(e) => (activeInputRef.current = e.target)}
            value={structuredData.headline || ""}
            onChange={(e) => onFieldChange("headline", e.target.value)}
            placeholder="Event Name / Announcement Headline (e.g. Youth Mega Worship Night)..."
            className={`w-full outline-none font-sans text-[0.78rem] font-semibold leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-zinc-800/70 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800"
                : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-100/80"
            }`}
          />

          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="text"
              data-field="dateTime"
              onFocus={(e) => (activeInputRef.current = e.target)}
              value={structuredData.dateTime || ""}
              onChange={(e) => onFieldChange("dateTime", e.target.value)}
              placeholder="Date & Time (e.g. This Friday @ 6:00 PM)..."
              className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
              }`}
            />
            <input
              type="text"
              data-field="venue"
              onFocus={(e) => (activeInputRef.current = e.target)}
              value={structuredData.venue || ""}
              onChange={(e) => onFieldChange("venue", e.target.value)}
              placeholder="Venue / Location (e.g. Main Auditorium)..."
              className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
              }`}
            />
            <input
              type="text"
              data-field="contact"
              onFocus={(e) => (activeInputRef.current = e.target)}
              value={structuredData.contact || ""}
              onChange={(e) => onFieldChange("contact", e.target.value)}
              placeholder="Contact / Inquiries (e.g. 055-123-4567)..."
              className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
              }`}
            />
          </div>

          <textarea
            rows={2}
            data-field="details"
            onFocus={(e) => (activeInputRef.current = e.target)}
            value={structuredData.details || ""}
            onChange={(e) => onFieldChange("details", e.target.value)}
            placeholder="Event details or announcement message..."
            className={`w-full outline-none font-sans text-[0.75rem] font-normal leading-snug py-1.5 px-2.5 rounded-lg transition-colors resize-none no-scrollbar min-h-[38px] ${
              isDarkMode
                ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
            }`}
          />
        </>
      )}

      {/* SCRIPTURE READING INPUTS */}
      {alertType === "scripture" && (
        <>
          <input
            type="text"
            data-field="reference"
            ref={(el) => {
              if (el && !activeInputRef.current) activeInputRef.current = el;
            }}
            onFocus={(e) => (activeInputRef.current = e.target)}
            value={structuredData.reference || ""}
            onChange={(e) => onFieldChange("reference", e.target.value)}
            placeholder="Scriptures (separate multiple with commas, e.g. Psalm 23:1-3, 2 Cor 5:17)..."
            className={`w-full outline-none font-sans text-[0.78rem] font-semibold leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-zinc-800/70 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800"
                : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-100/80"
            }`}
          />

          <textarea
            rows={2}
            data-field="verseText"
            onFocus={(e) => (activeInputRef.current = e.target)}
            value={structuredData.verseText || ""}
            onChange={(e) => onFieldChange("verseText", e.target.value)}
            placeholder="Passage / Verse text (e.g. The Lord is my shepherd, I shall not want...)..."
            className={`w-full outline-none font-sans text-[0.75rem] font-normal leading-snug py-1.5 px-2.5 rounded-lg transition-colors resize-none no-scrollbar min-h-[38px] ${
              isDarkMode
                ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
            }`}
          />

          <input
            type="text"
            data-field="focus"
            onFocus={(e) => (activeInputRef.current = e.target)}
            value={structuredData.focus || ""}
            onChange={(e) => onFieldChange("focus", e.target.value)}
            placeholder="Theme / Devotional Focus (optional)..."
            className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
            }`}
          />
        </>
      )}

      {/* GENERAL / CUSTOM ALERT INPUTS */}
      {alertType === "general" && (
        <>
          <input
            type="text"
            data-field="title"
            ref={(el) => {
              if (el && !activeInputRef.current) activeInputRef.current = el;
            }}
            onFocus={(e) => (activeInputRef.current = e.target)}
            value={structuredData.title || ""}
            onChange={(e) => onFieldChange("title", e.target.value)}
            placeholder="Headline / Header (optional)..."
            className={`w-full outline-none font-sans text-[0.78rem] font-semibold leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-zinc-800/70 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800"
                : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-100/80"
            }`}
          />

          <textarea
            rows={2}
            data-field="message"
            onFocus={(e) => (activeInputRef.current = e.target)}
            value={structuredData.message || ""}
            onChange={(e) => onFieldChange("message", e.target.value)}
            placeholder="Type your alert message or church announcement here..."
            className={`w-full outline-none font-sans text-[0.78rem] font-normal leading-snug py-1.5 px-2.5 rounded-lg transition-colors resize-none no-scrollbar min-h-[40px] ${
              isDarkMode
                ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
            }`}
          />
        </>
      )}
    </div>
  );
};
