import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface CustomSelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  isDarkMode: boolean;
  width?: number;
  showSearch?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Custom Select Component - Sleek antd-style dropdown
 * Matches antd design with proper dark/light mode theming
 */
export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = "Select...",
  isDarkMode,
  width = 120,
  showSearch = false,
  icon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, showSearch]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative" style={{ width }}>
      {/* Select Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-1.5 bg-s rounded-md flex items-center justify-between gap-2 text-sm transition-all duration-200 border bg-select-bg-alt border-select-border hover:border-select-border-hover text-text-primary ${className} ${
          isOpen ? "shadow-sm border-select-border-hover" : ""
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 text-text-secondary ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg border overflow-hidden z-[9999] bg-select-bg border-select-border"
          style={{
            maxHeight: "300px",
            boxShadow: "0 6px 16px 0 rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Search Input */}
          {showSearch && (
            <div className="px-2 py-1.5 border-b border-select-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-2 py-1 text-xs rounded outline-none border bg-select-bg-alt border-select-border text-text-primary placeholder-text-secondary focus:border-focus-border"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto py-1" style={{ maxHeight: "250px" }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full cursor-pointer px-3 py-1.5 text-left text-sm transition-colors duration-100 ${
                    option.value === value
                      ? "bg-select-hover text-text-primary font-medium"
                      : "text-text-primary hover:bg-select-hover"
                  }`}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-text-secondary">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
