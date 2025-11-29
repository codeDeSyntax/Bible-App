// import React, { useState } from "react";
// import { usePresets } from "../hooks/usePresets";
// import { Preset } from "../store/slices/appSlice";
// import { v4 as uuidv4 } from "uuid";

// /**
//  * Preset Manager Component
//  * Manages creating, editing, deleting, and importing/exporting presets
//  */
// export const PresetManager: React.FC = () => {
//   const {
//     presets,
//     savePreset,
//     deletePreset,
//     exportPresets,
//     importPresets,
//     getStorageStats,
//   } = usePresets();

//   const [storageStats, setStorageStats] = useState<{
//     totalPresets: number;
//     totalSize: number;
//     presetsByType: Record<string, number>;
//   } | null>(null);

//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [newPresetName, setNewPresetName] = useState("");
//   const [newPresetType, setNewPresetType] = useState<Preset["type"]>("text");

//   // Load storage stats
//   const loadStats = async () => {
//     const stats = await getStorageStats();
//     if (stats) {
//       setStorageStats(stats);
//     }
//   };

//   // Create a new preset
//   const handleCreatePreset = async () => {
//     if (!newPresetName.trim()) {
//       alert("Please enter a preset name");
//       return;
//     }

//     const newPreset: Preset = {
//       id: uuidv4(),
//       type: newPresetType,
//       name: newPresetName,
//       data: {
//         // Default data based on type
//         ...(newPresetType === "text" && {
//           text: "New Text",
//           fontSize: 48,
//           fontFamily: "Arial",
//           textAlign: "center" as const,
//           textColor: "#ffffff",
//           backgroundColor: "#000000",
//         }),
//         ...(newPresetType === "scripture" && {
//           book: "Genesis",
//           chapter: 1,
//           verse: 1,
//           fontSize: 36,
//           textColor: "#ffffff",
//         }),
//         ...(newPresetType === "image" && {
//           url: "",
//           images: [],
//         }),
//       },
//       createdAt: Date.now(),
//     };

//     const success = await savePreset(newPreset);
//     if (success) {
//       setNewPresetName("");
//       setShowCreateForm(false);
//       loadStats();
//     }
//   };

//   // Delete a preset
//   const handleDeletePreset = async (id: string) => {
//     if (id.startsWith("default-")) {
//       alert("Cannot delete default presets");
//       return;
//     }

//     if (confirm("Are you sure you want to delete this preset?")) {
//       const success = await deletePreset(id);
//       if (success) {
//         loadStats();
//       }
//     }
//   };

//   // Export presets
//   const handleExport = async () => {
//     await exportPresets();
//   };

//   // Import presets
//   const handleImport = async () => {
//     await importPresets();
//     loadStats();
//   };

//   // Format file size
//   const formatSize = (bytes: number) => {
//     if (bytes < 1024) return bytes + " B";
//     if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
//     return (bytes / (1024 * 1024)).toFixed(2) + " MB";
//   };

//   return (
//     <div className="preset-manager p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//           Preset Manager
//         </h2>
//         <div className="flex gap-2">
//           <button
//             onClick={loadStats}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Refresh Stats
//           </button>
//           <button
//             onClick={() => setShowCreateForm(!showCreateForm)}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//           >
//             {showCreateForm ? "Cancel" : "Create New"}
//           </button>
//           <button
//             onClick={handleImport}
//             className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
//           >
//             Import
//           </button>
//           <button
//             onClick={handleExport}
//             className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
//           >
//             Export
//           </button>
//         </div>
//       </div>

//       {/* Storage Stats */}
//       {storageStats && (
//         <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
//           <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
//             Storage Statistics
//           </h3>
//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <p className="text-base text-gray-600 dark:text-gray-300">
//                 Total Presets
//               </p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                 {storageStats.totalPresets}
//               </p>
//             </div>
//             <div>
//               <p className="text-base text-gray-600 dark:text-gray-300">
//                 Total Size
//               </p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                 {formatSize(storageStats.totalSize)}
//               </p>
//             </div>
//             <div>
//               <p className="text-base text-gray-600 dark:text-gray-300">
//                 By Type
//               </p>
//               <div className="text-base text-gray-900 dark:text-white">
//                 {Object.entries(storageStats.presetsByType).map(
//                   ([type, count]) => (
//                     <div key={type}>
//                       {type}: {count}
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Form */}
//       {showCreateForm && (
//         <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
//           <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
//             Create New Preset
//           </h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Preset Name
//               </label>
//               <input
//                 type="text"
//                 value={newPresetName}
//                 onChange={(e) => setNewPresetName(e.target.value)}
//                 className="w-full px-3 py-2 border rounded dark:bg-gray-600 dark:text-white"
//                 placeholder="Enter preset name"
//               />
//             </div>
//             <div>
//               <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Preset Type
//               </label>
//               <select
//                 value={newPresetType}
//                 onChange={(e) =>
//                   setNewPresetType(e.target.value as Preset["type"])
//                 }
//                 className="w-full px-3 py-2 border rounded dark:bg-gray-600 dark:text-white"
//               >
//                 <option value="text">Text</option>
//                 <option value="scripture">Scripture</option>
//                 <option value="image">Image</option>
//                 <option value="sermon">Sermon</option>
//                 <option value="promise">Promise</option>
//               </select>
//             </div>
//           </div>
//           <button
//             onClick={handleCreatePreset}
//             className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//           >
//             Create Preset
//           </button>
//         </div>
//       )}

//       {/* Presets List */}
//       <div className="space-y-2">
//         <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
//           All Presets ({presets.length})
//         </h3>
//         <div className="max-h-96 overflow-y-auto">
//           {presets.map((preset) => (
//             <div
//               key={preset.id}
//               className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded mb-2"
//             >
//               <div className="flex-1">
//                 <h4 className="font-semibold text-gray-900 dark:text-white">
//                   {preset.name}
//                   {preset.id.startsWith("default-") && (
//                     <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded">
//                       Default
//                     </span>
//                   )}
//                 </h4>
//                 <p className="text-base text-gray-600 dark:text-gray-300">
//                   Type: {preset.type} | Created:{" "}
//                   {new Date(preset.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//               <div className="flex gap-2">
//                 {!preset.id.startsWith("default-") && (
//                   <button
//                     onClick={() => handleDeletePreset(preset.id)}
//                     className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-base"
//                   >
//                     Delete
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };
