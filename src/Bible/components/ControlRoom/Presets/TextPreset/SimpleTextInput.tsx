import React from "react";

interface SimpleTextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SimpleTextInput: React.FC<SimpleTextInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
        Custom Text
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter any text to display..."
        rows={3}
        className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#3a3a3a] resize-none transition-colors"
      />
    </div>
  );
};
