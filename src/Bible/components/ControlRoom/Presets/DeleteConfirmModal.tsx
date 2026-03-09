import React from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  presetName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  presetName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className=" px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Delete Preset</span>
            <span className="text-sm text-white/80 ml-2">
              This action cannot be undone
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              "{presetName}"
            </span>
            ? This preset will be permanently removed and cannot be recovered.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4  flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black/30 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-sm"
          >
            Delete Preset
          </button>
        </div>
      </div>
    </div>
  );
};
