import React, { useState, useEffect } from "react";
import { BookOpen, Plus, X } from "lucide-react";

interface SermonPresetFormProps {
  onSave: (data: SermonPresetData) => void;
  initialValues?: {
    title?: string;
    subtitle?: string;
    preacher?: string;
    date?: string;
    scriptures?: string[];
    quotes?: string[];
  };
}

export interface SermonPresetData {
  title: string;
  subtitle?: string;
  preacher: string;
  date: string;
  scriptures: string[];
  quotes: string[];
}

export const SermonPresetForm: React.FC<SermonPresetFormProps> = ({
  onSave,
  initialValues,
}) => {
  const [title, setTitle] = useState<string>(initialValues?.title || "");
  const [subtitle, setSubtitle] = useState<string>(
    initialValues?.subtitle || ""
  );
  const [preacher, setPreacher] = useState<string>(
    initialValues?.preacher || ""
  );
  const [date, setDate] = useState<string>(
    initialValues?.date || new Date().toISOString().split("T")[0]
  );
  const [scriptures, setScriptures] = useState<string[]>(
    initialValues?.scriptures && initialValues.scriptures.length > 0
      ? initialValues.scriptures
      : [""]
  );
  const [quotes, setQuotes] = useState<string[]>(
    initialValues?.quotes && initialValues.quotes.length > 0
      ? initialValues.quotes
      : [""]
  );

  // Update state when initialValues changes (when editing different presets)
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || "");
      setSubtitle(initialValues.subtitle || "");
      setPreacher(initialValues.preacher || "");
      setDate(initialValues.date || new Date().toISOString().split("T")[0]);
      setScriptures(
        initialValues.scriptures && initialValues.scriptures.length > 0
          ? initialValues.scriptures
          : [""]
      );
      setQuotes(
        initialValues.quotes && initialValues.quotes.length > 0
          ? initialValues.quotes
          : [""]
      );
    }
  }, [initialValues]);

  const addScripture = () => {
    setScriptures([...scriptures, ""]);
  };

  const removeScripture = (index: number) => {
    setScriptures(scriptures.filter((_, i) => i !== index));
  };

  const updateScripture = (index: number, value: string) => {
    const newScriptures = [...scriptures];
    newScriptures[index] = value;
    setScriptures(newScriptures);
  };

  const addQuote = () => {
    setQuotes([...quotes, ""]);
  };

  const removeQuote = (index: number) => {
    setQuotes(quotes.filter((_, i) => i !== index));
  };

  const updateQuote = (index: number, value: string) => {
    const newQuotes = [...quotes];
    newQuotes[index] = value;
    setQuotes(newQuotes);
  };

  const isFormValid = () => {
    return title.trim() !== "" && preacher.trim() !== "" && date.trim() !== "";
  };

  const handleSave = () => {
    onSave({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      preacher: preacher.trim(),
      date: date.trim(),
      scriptures: scriptures.filter((s) => s.trim() !== ""),
      quotes: quotes.filter((q) => q.trim() !== ""),
    });
  };

  return (
    <div className="bg-stone-50 h-[25rem] overflow-y-auto no-scrollbar dark:bg-[#1c1c1c] rounded-lg p-4 border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] flex items-center justify-center shadow-md">
          <BookOpen className="w-3 h-3 text-white" />
        </div>
        <h4 className="text-sm font-bold text-[#313131] dark:text-[#f9fafb]">
          Sermon Details
        </h4>
      </div>

      <div className="space-y-2">
        {/* Title Input */}
        <div>
          <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">
            Sermon Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter sermon title..."
            className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:bg-stone-200 dark:focus:bg-[#3a3a3a] transition-colors"
          />
        </div>

        {/* Subtitle Input */}
        <div>
          <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">
            Subtitle (optional)
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Enter subtitle..."
            className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:bg-stone-200 dark:focus:bg-[#3a3a3a] transition-colors"
          />
        </div>

        {/* Preacher Input */}
        <div>
          <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">
            Preacher *
          </label>
          <input
            type="text"
            value={preacher}
            onChange={(e) => setPreacher(e.target.value)}
            placeholder="Enter preacher name..."
            className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:bg-stone-200 dark:focus:bg-[#3a3a3a] transition-colors"
          />
        </div>

        {/* Date Input */}
        <div>
          <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">
            Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white focus:outline-none focus:bg-stone-200 dark:focus:bg-[#3a3a3a] transition-colors"
          />
        </div>

        {/* Scriptures */}
        <div>
          <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 flex items-center justify-between">
            <span>Scriptures (optional)</span>
          </label>

          {/* Input for new scripture */}
          <div className="flex items-center gap-1 mb-2">
            <input
              type="text"
              placeholder="e.g., John 3:16"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  const newScripture = e.currentTarget.value.trim();
                  setScriptures([
                    ...scriptures.filter((s) => s.trim()),
                    newScripture,
                  ]);
                  e.currentTarget.value = "";
                }
              }}
              className="flex-1 px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:bg-stone-200 dark:focus:bg-[#3a3a3a] transition-colors"
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget
                  .previousElementSibling as HTMLInputElement;
                if (input && input.value.trim()) {
                  const newScripture = input.value.trim();
                  setScriptures([
                    ...scriptures.filter((s) => s.trim()),
                    newScripture,
                  ]);
                  input.value = "";
                }
              }}
              className="p-1.5 rounded bg-[#313131] dark:bg-[#b8835a] text-white hover:opacity-80 transition-opacity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Display scriptures as tags */}
          {scriptures.filter((s) => s.trim()).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {scriptures
                .filter((s) => s.trim())
                .map((scripture, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#313131]/10 dark:bg-[#b8835a]/20 rounded-full border border-[#313131]/20 dark:border-[#b8835a]/30"
                  >
                    <span className="text-xs text-[#313131] dark:text-[#b8835a] font-medium">
                      {scripture}
                    </span>
                    <button
                      onClick={() =>
                        removeScripture(scriptures.indexOf(scripture))
                      }
                      className="hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-2.5 h-2.5 text-red-500" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Quotes */}
        <div>
          <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 flex items-center justify-between">
            <span>Quotes (optional)</span>
            <button
              onClick={addQuote}
              className="text-[#313131] dark:text-[#b8835a] hover:opacity-70 transition-opacity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </label>
          <div className="space-y-1">
            {quotes.map((quote, index) => (
              <div key={index} className="flex items-center gap-1">
                <textarea
                  value={quote}
                  onChange={(e) => updateQuote(index, e.target.value)}
                  placeholder="Enter a memorable quote..."
                  rows={2}
                  className="flex-1 px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:bg-stone-200 dark:focus:bg-[#3a3a3a] resize-none transition-colors"
                />
                {quotes.length > 1 && (
                  <button
                    onClick={() => removeQuote(index)}
                    className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors self-start"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!isFormValid()}
          className="w-full mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#313131] to-[#303030] text-white hover:from-[#252525] hover:to-[#202020] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
        >
          Save & Project
        </button>
      </div>
    </div>
  );
};
