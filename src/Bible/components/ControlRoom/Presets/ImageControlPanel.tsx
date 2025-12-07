import React from "react";
import {
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  Maximize2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setPresentationControls,
  resetPresentationControls,
} from "@/store/slices/appSlice";

interface ImageControlPanelProps {
  isActive: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageControlPanel: React.FC<ImageControlPanelProps> = ({
  isActive,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const controls = useAppSelector((state) => state.app.presentationControls);

  const sendControl = (updates: any) => {
    console.log("🎮 ImageControlPanel: Sending controls:", updates);
    if (window.api?.sendToPresentationWindow) {
      window.api
        .sendToPresentationWindow({
          type: "controls",
          data: updates,
        })
        .then((result) => {
          console.log("📤 Control send result:", result);
        })
        .catch((error) => {
          console.error("❌ Failed to send controls:", error);
        });
    } else {
      console.warn("⚠️ sendToPresentationWindow API not available");
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(controls.zoom + 0.1, 3);
    const updates = { ...controls, zoom: newZoom };
    dispatch(setPresentationControls({ zoom: newZoom }));
    sendControl(updates);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(controls.zoom - 0.1, 0.5);
    const updates = { ...controls, zoom: newZoom };
    dispatch(setPresentationControls({ zoom: newZoom }));
    sendControl(updates);
  };

  const handlePan = (direction: "up" | "down" | "left" | "right") => {
    const step = 50;
    let newPanX = controls.panX;
    let newPanY = controls.panY;

    switch (direction) {
      case "up":
        newPanY = controls.panY - step;
        break;
      case "down":
        newPanY = controls.panY + step;
        break;
      case "left":
        newPanX = controls.panX - step;
        break;
      case "right":
        newPanX = controls.panX + step;
        break;
    }

    const updates = { ...controls, panX: newPanX, panY: newPanY };
    dispatch(setPresentationControls({ panX: newPanX, panY: newPanY }));
    sendControl(updates);
  };

  const handleRotate = () => {
    const newRotation = (controls.rotation + 90) % 360;
    const updates = { ...controls, rotation: newRotation };
    dispatch(setPresentationControls({ rotation: newRotation }));
    sendControl(updates);
  };

  const handleReset = () => {
    const resetValues = { zoom: 1, panX: 0, panY: 0, rotation: 0 };
    dispatch(resetPresentationControls());
    sendControl(resetValues);
  };

  if (!isActive || !isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 rounded-xl bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="relative bg-white dark:bg-[#1c1c1c] rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-2xl w-96 max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Subtle gaming gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-purple-500/[0.02] dark:from-blue-400/[0.03] dark:to-purple-400/[0.03] rounded-2xl pointer-events-none"></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#313131] to-[#303030] flex items-center justify-center shadow-md shadow-[#313131]/50">
                <Maximize2 className="w-4 h-4 text-white drop-shadow-sm" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Image Controls
                </h3>
                <p className="text-[0.9rem] text-gray-600 dark:text-gray-400">
                  Zoom: {(controls.zoom * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Zoom Controls */}
              <div className="flex flex-col gap-2">
                <div
                  onClick={handleZoomIn}
                  className="w-10 h-10 rounded-lg bg-gradient-to-b from-white/80 to-white/60 dark:from-[#1c1c1c] dark:to-[#1c1c1c] hover:from-white hover:to-white/90 dark:hover:from-black/40 dark:hover:to-black/30 border border-gray-200/50 dark:border-gray-700/50 shadow-[inset_0_1px_2px_rgba(37, 37, 37, 0.3),inset_0_-1px_2px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 flex items-center justify-center active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300 drop-shadow-sm" />
                </div>
                <div
                  onClick={handleZoomOut}
                  className="w-10 h-10 rounded-lg bg-gradient-to-b from-white/80 to-white/60 dark:from-[#1c1c1c] dark:to-[#1c1c1c] hover:from-white hover:to-white/90 dark:hover:from-black/40 dark:hover:to-black/30 border border-gray-200/50 dark:border-gray-700/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 flex items-center justify-center active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300 drop-shadow-sm" />
                </div>
              </div>

              {/* Steering Wheel */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  {/* Outer ring - steering wheel rim */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#313131] to-[#303030] shadow-2xl border-4 border-[#313131]/50 dark:border-[#303030]/50">
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-4px_8px_rgba(255,255,255,0.1)]"></div>

                    {/* Leather texture overlay */}
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                  </div>

                  {/* Grip segments on the wheel */}
                  <div className="absolute inset-0">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                      <div
                        key={angle}
                        className="absolute w-1 h-4 bg-[#6b4931] dark:bg-[#8b6446] rounded-full shadow-inner"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-52px)`,
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Direction buttons on the wheel rim */}
                  {/* Top - Up */}
                  <div
                    onClick={() => handlePan("up")}
                    className="cursor-pointer absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-b from-white/80 to-white/60 dark:from-[#1c1c1c] dark:to-[#1c1c1c] hover:from-white hover:to-white/90 dark:hover:from-black/40 dark:hover:to-black/30 border-2 border-white/50 dark:border-[#303030]/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.5)] active:scale-90 active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] transition-all duration-150 flex items-center justify-center group"
                    title="Pan Up"
                  >
                    <ChevronUp className="w-5 h-5 text-[#313131] dark:text-gray-300 drop-shadow-md group-active:translate-y-0.5" />
                  </div>

                  {/* Bottom - Down */}
                  <div
                    onClick={() => handlePan("down")}
                    className="cursor-pointer absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-b from-white/80 to-white/60 dark:from-[#1c1c1c] dark:to-[#1c1c1c] hover:from-white hover:to-white/90 dark:hover:from-black/40 dark:hover:to-black/30 border-2 border-white/50 dark:border-[#303030]/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.5)] active:scale-90 active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] transition-all duration-150 flex items-center justify-center group"
                    title="Pan Down"
                  >
                    <ChevronDown className="w-5 h-5 text-[#313131] dark:text-gray-300 drop-shadow-md group-active:translate-y-0.5" />
                  </div>

                  {/* Left */}
                  <div
                    onClick={() => handlePan("left")}
                    className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-b from-white/80 to-white/60 dark:from-[#1c1c1c] dark:to-[#1c1c1c] hover:from-white hover:to-white/90 dark:hover:from-black/40 dark:hover:to-black/30 border-2 border-white/50 dark:border-[#303030]/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.5)] active:scale-90 active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] transition-all duration-150 flex items-center justify-center group"
                    title="Pan Left"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#313131] dark:text-gray-300 drop-shadow-md group-active:translate-x-0.5" />
                  </div>

                  {/* Right */}
                  <div
                    onClick={() => handlePan("right")}
                    className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-b from-white/80 to-white/60 dark:from-[#1c1c1c] dark:to-[#1c1c1c] hover:from-white hover:to-white/90 dark:hover:from-black/40 dark:hover:to-black/30 border-2 border-white/50 dark:border-[#303030]/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.5)] active:scale-90 active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] transition-all duration-150 flex items-center justify-center group"
                    title="Pan Right"
                  >
                    <ChevronRight className="w-5 h-5 text-[#313131] dark:text-gray-300 drop-shadow-md group-active:translate-x-0.5" />
                  </div>

                  {/* Center hub with brand logo/icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-[#313131] to-[#303030] shadow-2xl border-4 border-[#313131]/50 dark:border-[#303030]/50">
                    {/* Metallic shine effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                    {/* Inner depth */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(255,255,255,0.1)]"></div>
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Move className="w-6 h-6 text-white/70 dark:text-white/50 drop-shadow-lg" />
                    </div>
                  </div>

                  {/* Spoke connections (3 spokes like a real steering wheel) */}
                  {[0, 120, 240].map((angle) => (
                    <div
                      key={`spoke-${angle}`}
                      className="absolute w-1 h-12 bg-gradient-to-t from-[#313131] to-[#303030] shadow-lg"
                      style={{
                        top: "50%",
                        left: "50%",
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-20px)`,
                        transformOrigin: "center",
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Action divs */}
              <div className="flex flex-col gap-2">
                <div
                  onClick={handleRotate}
                  className="w-10 h-10 rounded-lg bg-gradient-to-b from-white/80 to-white/60 dark:from-[#1c1c1c] dark:to-[#1c1c1c] hover:from-white hover:to-white/90 dark:hover:from-black/40 dark:hover:to-black/30 border border-gray-200/50 dark:border-gray-700/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.4)] transition-all duration-200 flex items-center justify-center group active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4 text-gray-700 dark:text-gray-300 drop-shadow-sm group-hover:rotate-90 transition-transform duration-300" />
                </div>
                <div
                  onClick={handleReset}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#313131] to-[#303030] hover:from-[#303030] hover:to-[#6b4931] border border-[#313131]/50 transition-all duration-200 flex items-center justify-center group active:scale-95 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_3px_rgba(0,0,0,0.3)] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]"
                  title="Reset"
                >
                  <Maximize2 className="w-4 h-4 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
