import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCurrentTranslation } from '@/store/slices/bibleSlice';
import { useTheme } from '@/Provider/Theme';

interface LanguageTogglerProps {
  // No props needed
}

const LanguageToggler: React.FC<LanguageTogglerProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const currentTranslation = useAppSelector((state) => state.bible.currentTranslation);
  const { isDarkMode } = useTheme();
  const togglerRef = useRef<HTMLDivElement>(null);

  const languages = [
    { id: 'KJV', label: 'KJV' },
    { id: 'TWI', label: 'TWI' },
    { id: 'EWE', label: 'EWE' },
    { id: 'FRENCH', label: 'FRENCH' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (togglerRef.current && !togglerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.8
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="relative" ref={togglerRef}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-lg ${
          isDarkMode 
            ? 'bg-[#3d332a] text-stone-300 hover:bg-[#4a3e34]' 
            : 'bg-white text-stone-700 hover:bg-stone-50'
        } transition-colors duration-200`}
      >
        {currentTranslation}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
            className="absolute bottom-full right-0 mb-4 flex flex-col gap-3"
          >
            {languages.map((lang, index) => (
              <motion.button
                key={lang.id}
                custom={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  dispatch(setCurrentTranslation(lang.id));
                  setIsOpen(false);
                }}
                className={`p-3 rounded-full shadow-lg min-w-[80px] transition-colors duration-200 ${
                  currentTranslation === lang.id
                    ? isDarkMode
                      ? 'bg-primary text-stone-200'
                      : 'bg-primary text-white'
                    : isDarkMode
                    ? 'bg-[#3d332a] text-stone-400 hover:bg-[#4a3e34] hover:text-stone-200'
                    : 'bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                {lang.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageToggler;
