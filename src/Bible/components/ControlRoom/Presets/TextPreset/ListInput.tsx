import React from "react";
import { X } from "lucide-react";

interface ListInputProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export const ListInput: React.FC<ListInputProps> = ({ items, onChange }) => {
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    onChange([...items, ""]);
  };

  return (
    <div>
      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
        List Items
      </label>
      {items.map((item, index) => (
        <div key={index} className="flex gap-1 mb-1">
          <input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder={`Item ${index + 1}`}
            className="flex-1 px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#1a1410] transition-colors"
          />
          {items.length > 1 && (
            <button
              onClick={() => handleRemoveItem(index)}
              className="px-2 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={handleAddItem}
        className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-[#0f0c0a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#1a1410] transition-colors"
      >
        + Add Item
      </button>
    </div>
  );
};
