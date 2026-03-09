// import React, { useState } from "react";
// import { BentoCard } from "./BentoCard";
// import { StudioButton } from "./StudioButton";
// import { Languages, Search } from "lucide-react";

// interface TranslationsCardProps {
//   currentTranslation: string;
//   availableTranslations: string[];
//   onTranslationSelect: (translation: string) => void;
//   isDarkMode: boolean;
// }

// /**
//  * Card 4: Bible Translations
//  * Switch between different Bible versions
//  */
// export const TranslationsCard: React.FC<TranslationsCardProps> = ({
//   currentTranslation,
//   availableTranslations,
//   onTranslationSelect,
//   isDarkMode,
// }) => {
//   const [searchQuery, setSearchQuery] = useState("");

//   const filteredTranslations = availableTranslations.filter((translation) =>
//     translation.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <BentoCard
//       title="Translations"
//       isDarkMode={isDarkMode}
//       icon={<Languages className="w-4 h-4 text-white" />}
//       className="col-span-1 row-span-3 "
//     >
//       <div className="flex flex-col h-full gap-2">
//         {/* Search Input */}
//         <div className="relative group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex-shrink-0">
//           <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
//             <Search size={14} className="text-text-secondary" />
//           </div>
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search translations..."
//             className="w-full py-2 pl-9 pr-3 bg-select-bg hover:bg-select-hover focus:bg-select-hover text-text-primary placeholder-text-secondary outline-none text-[0.9rem] transition-colors duration-200 border-none"
//           />
//         </div>

//         {/* Translations List */}
//         <div
//           className="grid grid-cols-2 gap-2 overflow-y-auto no-scrollbar flex-1"
//           style={{ minHeight: 0, gridAutoRows: "minmax(0, max-content)" }}
//         >
//           {filteredTranslations.map((translation) => (
//             <StudioButton
//               key={translation}
//               isActive={currentTranslation === translation}
//               isDarkMode={isDarkMode}
//               onClick={() => onTranslationSelect(translation)}
//               className="w-full justify-center px-2 py-2"
//             >
//               <span className="text-center text-[0.9rem]">{translation}</span>
//             </StudioButton>
//           ))}

//           {filteredTranslations.length === 0 && (
//             <div className="text-center py-8 text-text-secondary text-[0.9rem]">
//               No translations found
//             </div>
//           )}
//         </div>
//       </div>
//     </BentoCard>
//   );
// };
