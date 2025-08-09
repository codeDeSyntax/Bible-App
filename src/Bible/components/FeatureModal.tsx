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
    <div className="fixed inset-0  flex items-center justify-center z-50 pointer-events-none">
      <div className=" rounded-3xl w-1/2 h-[60vh] overflow-hidden pointer-events-auto">
       
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(60vh - 4rem)' }}>
          {renderFeatureContent()}
        </div>
      </div>
    </div>
  );
};

export default FeatureModal; 