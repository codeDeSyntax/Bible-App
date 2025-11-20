import React from "react";

interface QuoteInputProps {
  quoteText: string;
  author: string;
  onQuoteChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
}

export const QuoteInput: React.FC<QuoteInputProps> = ({
  quoteText,
  author,
  onQuoteChange,
  onAuthorChange,
}) => {
  return (
    <>
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
          Quote Text
        </label>
        <textarea
          value={quoteText}
          onChange={(e) => onQuoteChange(e.target.value)}
          placeholder="Enter the quote..."
          rows={3}
          className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#3a3a3a] resize-none transition-colors"
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
          Author
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => onAuthorChange(e.target.value)}
          placeholder="Author name..."
          className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#3a3a3a] transition-colors"
        />
      </div>
    </>
  );
};
