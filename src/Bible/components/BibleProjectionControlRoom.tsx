// import React, { useState, useEffect, useCallback } from "react";
// import { useAppDispatch, useAppSelector } from "@/store";
// import {
//   setProjectionFontSize,
//   setProjectionFontFamily,
//   setProjectionBackgroundColor,
//   setProjectionGradientColors,
//   setProjectionBackgroundImage,
//   setProjectionTextColor,
//   setCurrentTranslation,
//   setStandaloneFontMultiplier,
//   setImageBackgroundMode,
//   setFullScreen,
//   setSelectedBackground,
//   setVerseByVerseMode,
//   setVerseByVerseTextColor,
//   setVerseByVerseAutoSize,
//   setHighlightJesusWords,
//   setShowScriptureReference,
//   setScriptureReferenceColor,
// } from "@/store/slices/bibleSlice";
// import { setBibleBgs } from "@/store/slices/appSlice";
// import { useTheme } from "@/Provider/Theme";
// import { logBibleProjection } from "@/utils/ClientSecretLogger";
// import {
//   Settings,
//   Type,
//   Palette,
//   Image,
//   Monitor,
//   Globe,
//   X,
//   ChevronDown,
//   ChevronUp,
//   Save,
//   RotateCcw,
//   Eye,
//   EyeOff,
//   Plus,
//   Minus,
//   Maximize,
//   FolderUp,
//   ArrowBigLeft,
// } from "lucide-react";
// import { PlusCircleTwoTone } from "@ant-design/icons";
// import {
//   InfoAndPreset,
//   DisplaySettings,
//   AppearanceSettings,
//   BackgroundSettings,
//   TypographySettings,
//   TranslationSettings,
//   PresetsSettings,
// } from "./ControlRoom";

// interface BibleProjectionControlRoomProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const BibleProjectionControlRoom: React.FC<
//   BibleProjectionControlRoomProps
// > = ({ isOpen, onClose }) => {
//   const { isDarkMode } = useTheme();
//   const dispatch = useAppDispatch();

//   const {
//     projectionFontSize,
//     projectionFontFamily,
//     projectionBackgroundColor,
//     projectionGradientColors,
//     projectionBackgroundImage,
//     projectionTextColor,
//     currentTranslation,
//     currentBook,
//     currentChapter,
//     standaloneFontMultiplier,
//     imageBackgroundMode,
//     isFullScreen,
//     selectedBackground,
//     verseByVerseMode,
//     verseByVerseTextColor,
//     verseByVerseAutoSize,
//     highlightJesusWords,
//     showScriptureReference,
//     scriptureReferenceColor,
//   } = useAppSelector((state) => state.bible);
//   const bibleBgs = useAppSelector((state) => state.app.bibleBgs);
//   const bibleData = useAppSelector((state) => state.bible.bibleData);

//   // State - Load last visited tab from localStorage
//   const [activeSection, setActiveSection] = useState<string>(
//     () => localStorage.getItem("bibleControlRoomActiveTab") || "general"
//   );
//   const [previewMode, setPreviewMode] = useState(false);
//   const [isLoadingImages, setIsLoadingImages] = useState(false);
//   const [imageLoadingStates, setImageLoadingStates] = useState<{
//     [key: string]: boolean;
//   }>({});
//   const [imagePreloadCache, setImagePreloadCache] = useState<Set<string>>(
//     new Set()
//   );
//   const [customImagesPath, setCustomImagesPath] = useState(
//     localStorage.getItem("bibleCustomImagesPath") || ""
//   );
//   const [searchTerm, setSearchTerm] = useState("");
//   const [projectionLineHeight, setProjectionLineHeight] = useState(1.5);

//   // Available translations and data
//   const translations = [
//     { id: "KJV", name: "King James Version", language: "English" },
//     { id: "TWI", name: "Twi Bible", language: "Twi" },
//     { id: "EWE", name: "Ewe Bible", language: "Ewe" },
//     { id: "FRENCH", name: "French Bible", language: "French" },
//   ];

//   const availableTranslations = ["KJV", "TWI", "EWE", "FRENCH"];

//   const colorPresets = [
//     "#ffffff",
//     "#000000",
//     "#fcd8c0",
//     "#ff6b6b",
//     "#4ecdc4",
//     "#45b7d1",
//     "#96ceb4",
//     "#feca57",
//     "#ff9ff3",
//     "#54a0ff",
//     "#5f27cd",
//     "#00d2d3",
//     "#ff9f43",
//     "#10ac84",
//     "#ee5a24",
//   ];


//   // Predefined gradient combinations (legacy)
//   const gradientPresets = [
//     { name: "Deep Plum", colors: ["#2e003e", "#6b0f9c"] },
//     { name: "Burgundy", colors: ["#3b0b0b", "#8b1e3f"] },
//     { name: "Royal Indigo", colors: ["#0b1020", "#1e3a8a"] },
//     { name: "Midnight", colors: ["#071029", "#0b2545"] },
//     { name: "Deep Teal", colors: ["#06374a", "#016d6f"] },
//     { name: "Forest", colors: ["#0b3d2e", "#0fa06a"] },
//     { name: "Amber Glow", colors: ["#4b2e05", "#b36b00"] },
//     { name: "Burnt Sienna", colors: ["#7a2e0a", "#d35400"] },
//     { name: "Slate Blue", colors: ["#1f2a44", "#344b7b"] },
//     { name: "Wine", colors: ["#2e0b28", "#6b0a4a"] },
//     { name: "Deep Ocean", colors: ["#01273e", "#025877"] },
//     { name: "Charcoal Gold", colors: ["#0f1720", "#a77b2c"] },
//   ];

//   // Load background images on mount
//   useEffect(() => {
//     loadBackgroundImages();
//   }, [bibleBgs.length]);

//   // Debug fullscreen state changes
//   useEffect(() => {
//     console.log("🔍 isFullScreen state changed to:", isFullScreen);
//     console.log("🔍 Component re-rendered with isFullScreen:", isFullScreen);
//   }, [isFullScreen]);

//   // Persist active tab to localStorage
//   useEffect(() => {
//     localStorage.setItem("bibleControlRoomActiveTab", activeSection);
//   }, [activeSection]);

//   // Keyboard handler - Send to projection on Enter key
//   useEffect(() => {
//     if (!isOpen) return;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
//         e.preventDefault();
//         handleSendToProjection();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [isOpen, currentBook, currentChapter, currentTranslation, bibleData]);

//   // Auto-switch text color based on theme and background mode
//   useEffect(() => {
//     console.log("🎨 ControlRoom auto-switch triggered:", {
//       verseByVerseMode,
//       imageBackgroundMode,
//       isDarkMode,
//       projectionTextColor,
//       verseByVerseTextColor,
//     });

//     // Only apply auto-switching in verse-by-verse mode
//     if (verseByVerseMode) {
//       if (imageBackgroundMode) {
//         // For verse-by-verse with background image: always white
//         if (projectionTextColor !== "#ffffff") {
//           dispatch(setProjectionTextColor("#ffffff"));
//           localStorage.setItem("bibleProjectionTextColor", "#ffffff");
//           logBibleProjection(
//             "Auto-switched projection text color to white for background mode",
//             {
//               mode: "verse-by-verse-with-background",
//               textColor: "#ffffff",
//             }
//           );
//         }
//         if (verseByVerseTextColor !== "#ffffff") {
//           dispatch(setVerseByVerseTextColor("#ffffff"));
//           localStorage.setItem("bibleVerseByVerseTextColor", "#ffffff");
//           logBibleProjection(
//             "Auto-switched verse-by-verse text color to white for background mode",
//             {
//               mode: "verse-by-verse-with-background",
//               textColor: "#ffffff",
//             }
//           );
//         }
//       } else {
//         // For verse-by-verse without background image: theme-based colors
//         const targetColor = isDarkMode ? "#fcd8c0" : "#000000";
//         if (projectionTextColor !== targetColor) {
//           dispatch(setProjectionTextColor(targetColor));
//           localStorage.setItem("bibleProjectionTextColor", targetColor);
//           logBibleProjection(
//             "Auto-switched projection text color based on theme",
//             {
//               mode: "verse-by-verse-no-background",
//               isDarkMode,
//               textColor: targetColor,
//             }
//           );

//           // Send IPC update
//           if (typeof window !== "undefined" && window.ipcRenderer) {
//             window.ipcRenderer.send("bible-presentation-update", {
//               type: "updateStyle",
//               data: { textColor: targetColor },
//             });
//           }
//         }
//         if (verseByVerseTextColor !== targetColor) {
//           dispatch(setVerseByVerseTextColor(targetColor));
//           localStorage.setItem("bibleVerseByVerseTextColor", targetColor);
//           logBibleProjection(
//             "Auto-switched verse-by-verse text color based on theme",
//             {
//               mode: "verse-by-verse-no-background",
//               isDarkMode,
//               textColor: targetColor,
//             }
//           );
//         }
//       }
//     }
//   }, [
//     isDarkMode,
//     verseByVerseMode,
//     imageBackgroundMode,
//     dispatch,
//     projectionTextColor,
//     verseByVerseTextColor,
//   ]);

//   // Additional effect to handle background mode changes in verse-by-verse
//   useEffect(() => {
//     if (verseByVerseMode && imageBackgroundMode) {
//       // When background mode is enabled in verse-by-verse, force white text
//       if (projectionTextColor !== "#ffffff") {
//         dispatch(setProjectionTextColor("#ffffff"));
//         localStorage.setItem("bibleProjectionTextColor", "#ffffff");
//         logBibleProjection(
//           "Auto-switched projection to white text for background mode",
//           {
//             mode: "verse-by-verse-background-enabled",
//             textColor: "#ffffff",
//           }
//         );

//         // Send IPC update
//         if (typeof window !== "undefined" && window.ipcRenderer) {
//           window.ipcRenderer.send("bible-presentation-update", {
//             type: "updateStyle",
//             data: { textColor: "#ffffff" },
//           });
//         }
//       }
//       if (verseByVerseTextColor !== "#ffffff") {
//         dispatch(setVerseByVerseTextColor("#ffffff"));
//         localStorage.setItem("bibleVerseByVerseTextColor", "#ffffff");
//         logBibleProjection(
//           "Auto-switched verse-by-verse to white text for background mode",
//           {
//             mode: "verse-by-verse-background-enabled",
//             textColor: "#ffffff",
//           }
//         );
//       }
//     }
//   }, [
//     verseByVerseMode,
//     imageBackgroundMode,
//     dispatch,
//     projectionTextColor,
//     verseByVerseTextColor,
//   ]);

//   const loadBackgroundImages = async (forceReload = false) => {
//     setIsLoadingImages(true);
//     try {
//       // Load if we don't have images yet OR if forcing a reload
//       if (bibleBgs.length === 0 || forceReload) {
//         const customImagesPath = localStorage.getItem("bibleCustomImagesPath");
//         let images: string[] = [];

//         try {
//           if (customImagesPath && typeof window !== "undefined" && window.api) {
//             console.log(
//               "BibleProjectionControlRoom: Loading custom images from:",
//               customImagesPath
//             );
//             images = await window.api.getImages(customImagesPath);
//             console.log(
//               "BibleProjectionControlRoom: Loaded",
//               images.length,
//               "custom images"
//             );
//           } else {
//             // Load default backgrounds if no custom path
//             console.log(
//               "BibleProjectionControlRoom: Loading default backgrounds"
//             );
//             images = ["./wood2.jpg", "./wood6.jpg", "./wood10.jpg"];
//           }

//           dispatch(setBibleBgs(images));
//           logBibleProjection("Background images loaded from control room", {
//             imageCount: images.length,
//             customImagesPath,
//           });
//         } catch (error) {
//           console.error("Error loading background images:", error);
//           // Fall back to default backgrounds
//           const defaultBackgrounds = [
//             "./wood2.jpg",
//             "./snow2.jpg",
//             "./wood6.jpg",
//             "./wood7.png",
//             "./wood10.jpg",
//             "./wood11.jpg",
//             "./wood9.png",
//           ];
//           dispatch(setBibleBgs(defaultBackgrounds));
//         }
//       }
//     } catch (error) {
//       console.error("Error in loadBackgroundImages:", error);
//     } finally {
//       setIsLoadingImages(false);
//     }
//   };

//   // Reset handler function for reset to defaults
//   const resetToDefaults = () => {
//     handleFontSizeChange(48);
//     handleBackgroundColorChange("#000000");
//     handleGradientChange(["#667eea", "#764ba2"]);
//     handleBackgroundImageChange("");
//     handleTextColorChange("#ffffff");
//     handleFontMultiplierChange(1.0);
//     handleBackgroundImageModeChange(false);
//     dispatch(setFullScreen(false));
//     logBibleProjection("Settings reset to defaults from control room");
//   };

//   // Handle font size change
//   // Handle sending current scripture to projection
//   const handleSendToProjection = async () => {
//     if (!currentBook || !currentChapter || !currentTranslation) {
//       console.warn(
//         "Cannot send to projection: missing book, chapter, or translation"
//       );
//       return;
//     }

//     const translationData = bibleData[currentTranslation];

//     if (!translationData || !translationData.books) {
//       console.error("Translation data not available");
//       return;
//     }

//     const bookData = translationData.books.find(
//       (book: any) => book.name === currentBook
//     );

//     if (!bookData) {
//       console.error("Book data not found");
//       return;
//     }

//     const chapterData = bookData.chapters?.find(
//       (ch: any) => ch.chapter === currentChapter
//     );

//     if (!chapterData?.verses) {
//       console.error("Chapter verses not found");
//       return;
//     }

//     const presentationData = {
//       book: currentBook,
//       chapter: currentChapter,
//       verses: chapterData.verses,
//       translation: currentTranslation,
//       selectedVerse: undefined,
//     };

//     const settings = {
//       versesPerSlide: 1,
//       fontSize: projectionFontSize,
//       textColor: projectionTextColor,
//       backgroundColor: projectionBackgroundColor,
//     };

//     // Send to projection window
//     if (typeof window !== "undefined" && window.api) {
//       try {
//         await window.api.createBiblePresentationWindow({
//           presentationData,
//           settings,
//         });
//         console.log("📺 Sent to projection:", currentBook, currentChapter);
//       } catch (error) {
//         console.error("Failed to send to projection:", error);
//       }
//     }
//   };

//   const handleFontSizeChange = (size: number) => {
//     dispatch(setProjectionFontSize(size));
//     localStorage.setItem("bibleProjectionFontSize", size.toString());
//     logBibleProjection("Projection font size updated from control room", {
//       fontSize: size,
//     });

//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "updateStyle",
//         data: { fontSize: size },
//       });
//     }
//   };

//   // Handle auto-size toggle
//   const handleAutoSizeChange = (enabled: boolean) => {
//     dispatch(setVerseByVerseAutoSize(enabled));
//     localStorage.setItem("bibleVerseByVerseAutoSize", enabled.toString());
//     logBibleProjection("Auto-size toggle updated from control room", {
//       autoSize: enabled,
//     });

//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "updateAutoSize",
//         data: { autoSize: enabled },
//       });
//     }
//   };

//   // Handle font family change
//   const handleProjectionFontFamilyChange = (fontFamily: string) => {
//     console.log("🎨 Control Room: Changing font family to:", fontFamily);
//     console.log("🔍 Stack trace:", new Error().stack);
//     dispatch(setProjectionFontFamily(fontFamily));
//     localStorage.setItem("bibleProjectionFontFamily", fontFamily);
//     logBibleProjection("Projection font family updated from control room", {
//       fontFamily,
//     });

//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       console.log(
//         "📡 Control Room: Sending font family IPC update:",
//         fontFamily
//       );
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "updateStyle",
//         data: { fontFamily },
//       });
//     }
//   };

//   // Handle background color change
//   const handleBackgroundColorChange = (color: string) => {
//     dispatch(setProjectionBackgroundColor(color));
//     localStorage.setItem("bibleProjectionBackgroundColor", color);
//     logBibleProjection(
//       "Projection background color updated from control room",
//       {
//         backgroundColor: color,
//       }
//     );

//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "updateStyle",
//         data: { backgroundColor: color },
//       });
//     }
//   };

//   // Handle background image change
//   const handleBackgroundImageChange = async (imagePath: string) => {
//     dispatch(setProjectionBackgroundImage(imagePath));
//     localStorage.setItem("bibleProjectionBackgroundImage", imagePath);

//     // Clear gradient colors when setting background image
//     dispatch(setProjectionGradientColors([]));
//     localStorage.setItem("bibleProjectionGradientColors", JSON.stringify([]));

//     logBibleProjection(
//       "Projection background image updated from control room",
//       {
//         backgroundImage: imagePath,
//       }
//     );

//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "updateStyle",
//         data: { backgroundImage: imagePath, gradientColors: [] },
//       });
//     }
//   };

//   // Handle text color change
//   const handleTextColorChange = (color: string) => {
//     console.log("🎨 Control Room: Updating text color to:", color);

//     // Update both projection and verse-by-verse text colors when manually changed
//     dispatch(setProjectionTextColor(color));
//     dispatch(setVerseByVerseTextColor(color));
//     localStorage.setItem("bibleProjectionTextColor", color);
//     localStorage.setItem("bibleVerseByVerseTextColor", color);

//     logBibleProjection("Text colors updated from control room", {
//       projectionTextColor: color,
//       verseByVerseTextColor: color,
//     });

//     // Send multiple IPC updates to ensure synchronization
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       // Primary style update
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "updateStyle",
//         data: { textColor: color },
//       });

//       // Secondary projection style update
//       window.ipcRenderer.send("bible-projection-style-update", {
//         textColor: color,
//         timestamp: Date.now(),
//       });

//       // Force refresh of projection display
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "forceRefresh",
//         data: { textColor: color },
//       });
//     }

//     // Force immediate re-render by dispatching again after a small delay
//     setTimeout(() => {
//       dispatch(setProjectionTextColor(color));
//       dispatch(setVerseByVerseTextColor(color));
//       console.log("🎨 Control Room: Secondary color dispatch completed");
//     }, 50);
//   };

//   // Handle translation change
//   const handleTranslationChange = (translation: string) => {
//     dispatch(setCurrentTranslation(translation));
//     logBibleProjection("Projection translation updated from control room", {
//       translation,
//     });

//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "update-data",
//         data: {
//           translation: translation,
//           book: currentBook,
//           chapter: currentChapter,
//         },
//       });
//     }
//   };

//   // Handle standalone font size multiplier change
//   const handleFontMultiplierChange = (multiplier: number) => {
//     dispatch(setStandaloneFontMultiplier(multiplier));
//     logBibleProjection("Standalone font multiplier updated from control room", {
//       multiplier,
//     });

//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "update-settings",
//         data: { fontMultiplier: multiplier },
//       });
//     }
//   };

//   // Handle background image mode toggle
//   const handleBackgroundImageModeChange = (enabled: boolean) => {
//     dispatch(setImageBackgroundMode(enabled));
//     if (!enabled) {
//       dispatch(setSelectedBackground(null));
//     }
//     logBibleProjection("Background image mode toggled from control room", {
//       enabled,
//     });
//   };

//   const handleBackgroundImageSelect = (imagePath: string) => {
//     handleBackgroundImageChange(imagePath);
//   };

//   const handleGradientSelect = (gradient: string) => {
//     dispatch(setSelectedBackground(gradient));
//   };

//   const handleJesusWordsToggle = () => {
//     const newValue = !highlightJesusWords;
//     dispatch(setHighlightJesusWords(newValue));

//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "updateStyle",
//         data: { highlightJesusWords: newValue },
//       });
//     }
//   };

//   const handleScriptureReferenceToggle = () => {
//     const newValue = !showScriptureReference;
//     dispatch(setShowScriptureReference(newValue));

//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "updateStyle",
//         data: { showScriptureReference: newValue },
//       });
//     }
//   };

//   const handleScriptureReferenceColorChange = (color: string) => {
//     dispatch(setScriptureReferenceColor(color));

//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "updateStyle",
//         data: { scriptureReferenceColor: color },
//       });
//     }
//   };

//   // Handle custom images directory selection
//   const handleSelectImagesDirectory = async () => {
//     try {
//       if (typeof window !== "undefined" && window.ipcRenderer) {
//         const result = await window.ipcRenderer.invoke("select-directory");
//         if (result) {
//           setCustomImagesPath(result);
//           localStorage.setItem("bibleCustomImagesPath", result);
//           logBibleProjection("Custom images directory selected", {
//             path: result,
//           });

//           // Force reload images from the new directory
//           await loadBackgroundImages(true);
//         }
//       }
//     } catch (error) {
//       console.error("Error selecting images directory:", error);
//       setIsLoadingImages(false);
//     }
//   };

//   // Handle gradient change - COPY EXACTLY how background image works
//   const handleGradientChange = (colors: string[]) => {
//     // Update gradient colors (apply curated presets)
//     dispatch(setProjectionGradientColors(colors));
//     localStorage.setItem(
//       "bibleProjectionGradientColors",
//       JSON.stringify(colors)
//     );
//     dispatch(setProjectionBackgroundImage(""));
//     localStorage.setItem("bibleProjectionBackgroundImage", "");
//     logBibleProjection("Projection gradient colors updated from control room", {
//       gradientColors: colors,
//     });
//     // Send IPC update
//     if (typeof window !== "undefined" && window.ipcRenderer) {
//       window.ipcRenderer.send("bible-presentation-update", {
//         type: "updateStyle",
//         data: { gradientColors: colors, backgroundImage: "" },
//       });
//     }
//   };

//   if (!isOpen) return null;

//   // Navigation sections
//   const sections = [
//     {
//       id: "general",
//       label: "General",
//       icon: Settings,
//       desc: "Overview & Settings",
//     },
//     {
//       id: "display",
//       label: "Display",
//       icon: Monitor,
//       desc: "Screen & Mode Settings",
//     },
//     {
//       id: "appearance",
//       label: "Appearance",
//       icon: Palette,
//       desc: "Colors & Themes",
//     },
//     {
//       id: "background",
//       label: "Background",
//       icon: Image,
//       desc: "Images & Gradients",
//     },
//     {
//       id: "typography",
//       label: "Typography",
//       icon: Type,
//       desc: "Fonts & Sizing",
//     },
//     {
//       id: "translation",
//       label: "Translation",
//       icon: Globe,
//       desc: "Bible Versions",
//     },
//     {
//       id: "presets",
//       label: "Presets",
//       icon: PlusCircleTwoTone,
//       desc: "Manage Presets",
//     },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 bg-gradient-to-br from-studio-bg to-studio-bg"
//       style={{ fontFamily: "garamond" }}
//     >
//       <div className="h-screen w-screen flex justify-center items-center">
//         <div className="w-full m-auto h-full flex bg-card-bg shadow-2xl backdrop-blur-xl border border-card-bg-alt overflow-hidden">
//           {/* Left Sidebar - Settings Navigation */}
//           <div className="w-80 bg-card-bg-alt">
//             <div className="p-8 border-b border-card-bg">
//               <div className="flex items-center gap-4 mb-2">
//                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-lg">
//                   <img src="./bibleicon.png" className="w-8 h-8" />
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-bold text-text-primary">
//                     Projection Control
//                   </h1>
//                   <p className="text-sm text-text-secondary">
//                     Bible Display Settings
//                   </p>
//                 </div>
//               </div>
//               <div
//                 onClick={onClose}
//                 className="absolute z-10 top-3 left-3 w-8 h-8 rounded-xl bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-all duration-200 flex items-center justify-center cursor-pointer shadow-lg"
//               >
//                 <ArrowBigLeft className="w-4 h-4" />
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto p-4">
//               <nav className="space-y-2">
//                 {sections.map(({ id, label, icon: Icon, desc }) => (
//                   <div
//                     key={id}
//                     onClick={() => setActiveSection(id)}
//                     className={`w-[90%] m-auto group relative overflow-hidden rounded-2xl px-5 py-2 text-left transition-all duration-300 cursor-pointer ${
//                       activeSection === id
//                         ? "bg-btn-active-from text-white shadow-lg transform scale-105"
//                         : "text-text-secondary hover:bg-select-hover hover:text-text-primary hover:shadow-md"
//                     }`}
//                   >
//                     <div className="flex items-center gap-4 relative z-10">
//                       <Icon
//                         className={`w-5 h-5 ${
//                           activeSection === id
//                             ? "text-white"
//                             : "text-text-primary"
//                         }`}
//                       />
//                       <div className="flex-1">
//                         <div className="font-semibold text-sm">{label}</div>
//                         <div
//                           className={`text-sm mt-1 ${
//                             activeSection === id
//                               ? "text-white/90"
//                               : "text-text-secondary"
//                           }`}
//                         >
//                           {desc}
//                         </div>
//                       </div>
//                     </div>
//                     {activeSection === id && (
//                       <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                         <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse"></div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </nav>
//             </div>
//           </div>

//           {/* Right Content Area */}
//           <div className="flex-1 flex flex-col bg-card-bg">
//             {/* Header */}
//             <div className="px-4 py-4 border-b border-card-bg-alt bg-studio-bg backdrop-blur-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-xl font-bold text-text-primary capitalize">
//                     {activeSection} Settings --{" "}
//                     <span className="text-sm text-text-secondary mt-1">
//                       Configure your projection display preferences
//                     </span>
//                   </h2>
//                   {/* <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                     Configure your projection display preferences
//                   </p> */}
//                 </div>
//               </div>
//             </div>

//             {/* Content Area */}
//             <div className="flex-1 p-3 pb-4 overflow-y-auto no-scrollbar bg-studio-bg flex">
//               {/* General Settings */}
//               {activeSection === "general" && (
//                 <InfoAndPreset
//                   projectionFontFamily={projectionFontFamily}
//                   projectionFontSize={projectionFontSize}
//                   projectionTextColor={projectionTextColor}
//                   projectionBackgroundImage={projectionBackgroundImage}
//                   projectionGradientColors={projectionGradientColors}
//                   projectionBackgroundColor={projectionBackgroundColor}
//                   imageBackgroundMode={imageBackgroundMode}
//                   selectedBackground={selectedBackground}
//                   currentTranslation={currentTranslation}
//                   currentBook={currentBook}
//                   currentChapter={currentChapter}
//                   isFullScreen={isFullScreen}
//                   verseByVerseMode={verseByVerseMode}
//                   bibleBgs={bibleBgs}
//                   isDarkMode={isDarkMode}
//                 />
//               )}

//               {/* Display Settings */}
//               {activeSection === "display" && (
//                 <DisplaySettings
//                   highlightJesusWords={highlightJesusWords}
//                   showScriptureReference={showScriptureReference}
//                   scriptureReferenceColor={scriptureReferenceColor}
//                   handleJesusWordsToggle={handleJesusWordsToggle}
//                   handleScriptureReferenceToggle={
//                     handleScriptureReferenceToggle
//                   }
//                   handleScriptureReferenceColorChange={
//                     handleScriptureReferenceColorChange
//                   }
//                 />
//               )}

//               {/* Appearance Settings */}
//               {activeSection === "appearance" && (
//                 <AppearanceSettings
//                   projectionTextColor={projectionTextColor}
//                   darkMode={isDarkMode}
//                   colorPresets={colorPresets}
//                   handleTextColorChange={handleTextColorChange}
//                 />
//               )}

//               {/* Background Settings */}
//               {activeSection === "background" && (
//                 <BackgroundSettings
//                   imageBackgroundMode={imageBackgroundMode}
//                   projectionBackgroundImage={projectionBackgroundImage}
//                   bibleBgs={bibleBgs}
//                   projectionGradientColors={projectionGradientColors}
//                   imagePreloadCache={imagePreloadCache}
//                   imageLoadingStates={imageLoadingStates}
//                   isLoadingImages={isLoadingImages}
//                   gradientPresets={gradientPresets}
//                   customImagesPath={customImagesPath}
//                   handleBackgroundImageSelect={handleBackgroundImageSelect}
//                   handleGradientChange={handleGradientChange}
//                   loadBackgroundImages={loadBackgroundImages}
//                   handleSelectImagesDirectory={handleSelectImagesDirectory}
//                   handleBackgroundImageModeChange={
//                     handleBackgroundImageModeChange
//                   }
//                 />
//               )}

//               {/* Typography Settings */}
//               {activeSection === "typography" && (
//                 <TypographySettings
//                   projectionFontFamily={projectionFontFamily}
//                   projectionFontSize={projectionFontSize}
//                   projectionTextColor={projectionTextColor}
//                   verseByVerseAutoSize={verseByVerseAutoSize}
//                   handleFontFamilyChange={handleProjectionFontFamilyChange}
//                   handleFontSizeChange={handleFontSizeChange}
//                   handleAutoSizeChange={handleAutoSizeChange}
//                 />
//               )}

//               {/* Translation Settings */}
//               {activeSection === "translation" && (
//                 <TranslationSettings
//                   availableTranslations={availableTranslations}
//                   selectedTranslation={currentTranslation}
//                   handleTranslationChange={handleTranslationChange}
//                 />
//               )}

//               {/* Presets Settings */}
//               {activeSection === "presets" && (
//                 <PresetsSettings bibleBgs={bibleBgs} />
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BibleProjectionControlRoom;
