import React from 'react';
import { X, Keyboard, Navigation2, Book, Settings, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveFeature } from '@/store/slices/bibleSlice';

const ShortcutsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);

  if (activeFeature !== 'shortcuts') return null;

  const shortcuts = {
    navigation: [
      { key: '←', description: 'Previous chapter' },
      { key: '→', description: 'Next chapter' },
      { key: '↑', description: 'Previous verse' },
      { key: '↓', description: 'Next verse' },
      { key: 'Home', description: 'Go to first verse' },
      { key: 'End', description: 'Go to last verse' },
    ],
    features: [
      { key: 'L', description: 'Open library' },
      { key: 'B', description: 'Open bookmarks' },
      { key: 'H', description: 'Open history' },
      { key: 'S', description: 'Open settings' },
      { key: '/', description: 'Focus search' },
      { key: 'Esc', description: 'Close active panel' },
    ]
  };

  const renderShortcutTable = (shortcuts: { key: string; description: string }[], title: string, icon: React.ReactNode) => (
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gray-100 dark:bg-black/20 rounded-xl">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      </div>
      <div className="overflow-hidden rounded-xl bg-white dark:bg-black/20">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-black/40">
              <th className="text-left py-3 pl-4 pr-2 text-sm font-medium text-gray-500 dark:text-gray-400">Shortcut</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((shortcut, index) => (
              <tr
                key={shortcut.key}
                className={`transition-all duration-200 ${
                  index % 2 === 0
                    ? "bg-white dark:bg-transparent"
                    : "bg-gray-50 dark:bg-black/10"
                }`}
              >
                <td className="py-3 pl-4 pr-2">
                  <kbd className="px-3 py-1 bg-gray-100 dark:bg-black/40 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-mono">
                    {shortcut.key}
                  </kbd>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/10 dark:bg-black/40 backdrop-blur-sm" 
        onClick={() => dispatch(setActiveFeature(null))}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-3xl w-[900px] max-h-[85vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-black/20 rounded-xl">
              <Keyboard size={24} className="text-primary dark:text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Master the Bible app with these shortcuts</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setActiveFeature(null))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-black/20 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 5rem)' }}>
          <div className="flex gap-6">
            {renderShortcutTable(shortcuts.navigation, "Navigation Shortcuts", <Navigation2 size={20} className="text-primary dark:text-primary" />)}
            {renderShortcutTable(shortcuts.features, "Feature Shortcuts", <Settings size={20} className="text-primary dark:text-primary" />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal; 