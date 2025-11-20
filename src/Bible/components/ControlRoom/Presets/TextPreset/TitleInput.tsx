import React from "react";

interface TitleInputProps {
  title: string;
  subtitle: string;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
}

export const TitleInput: React.FC<TitleInputProps> = ({
  title,
  subtitle,
  onTitleChange,
  onSubtitleChange,
}) => {
  return (
    <>
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Main title..."
          className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#3a3a3a] transition-colors"
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
          Subtitle
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          placeholder="Subtitle or description..."
          className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#3a3a3a] transition-colors"
        />
      </div>
    </>
  );
};
