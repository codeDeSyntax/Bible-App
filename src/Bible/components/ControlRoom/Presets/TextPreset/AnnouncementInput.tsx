import React from "react";

interface AnnouncementInputProps {
  title: string;
  message: string;
  onTitleChange: (value: string) => void;
  onMessageChange: (value: string) => void;
}

export const AnnouncementInput: React.FC<AnnouncementInputProps> = ({
  title,
  message,
  onTitleChange,
  onMessageChange,
}) => {
  return (
    <>
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
          Announcement Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., IMPORTANT, NOTICE, UPCOMING EVENT..."
          className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#1a1410] transition-colors"
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
          Announcement Message
        </label>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Enter the announcement details..."
          rows={3}
          className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#1a1410] resize-none transition-colors"
        />
      </div>
    </>
  );
};
