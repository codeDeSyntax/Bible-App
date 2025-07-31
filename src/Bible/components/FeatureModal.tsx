import React from 'react';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveFeature } from '@/store/slices/bibleSlice';
import { BookmarkPanel } from '../BookmarkPanel';
import HistoryPanel from '../HistoryPanel';
import SearchPanel from '../SearchPanel';
import LibraryPanel from '../LibraryPanel';
import ShortcutsModal from './ShortcutsModal';

const FeatureModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);

  if (!activeFeature) return null;

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'bookmarks':
        return <BookmarkPanel />;
      case 'history':
        return <HistoryPanel />;
      case 'search':
        return <SearchPanel />;
      case 'library':
        return <LibraryPanel />;
      case 'shortcuts':
        return <ShortcutsModal />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white dark:bg-ltgray rounded-3xl w-1/2 h-[60vh] overflow-hidden pointer-events-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {activeFeature.charAt(0).toUpperCase() + activeFeature.slice(1)}
          </h2>
          <button
            onClick={() => dispatch(setActiveFeature(null))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(60vh - 4rem)' }}>
          {renderFeatureContent()}
        </div>
      </div>
    </div>
  );
};

export default FeatureModal; 