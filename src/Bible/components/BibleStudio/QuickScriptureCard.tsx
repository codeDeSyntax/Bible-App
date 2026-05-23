import React from "react";
import { X } from "lucide-react";
import { DepthButton, DepthSurface } from "@/shared/DepthElement";

interface QuickScriptureCardProps {
  id: string;
  reference: string;
  text: string;
  backgroundImage?: string;
  onNavigate: () => void;
  onRemove: () => void;
  isDarkMode: boolean;
}

export const QuickScriptureCard: React.FC<QuickScriptureCardProps> = ({
  reference,
  text,
  backgroundImage,
  onNavigate,
  onRemove,
  isDarkMode,
}) => {
  const truncatedText = text.length > 90 ? text.substring(0, 90) + "…" : text;
  const effectiveHasImage = Boolean(
    backgroundImage &&
    typeof backgroundImage === "string" &&
    backgroundImage.trim() !== "" &&
    backgroundImage !== "null" &&
    backgroundImage !== "undefined",
  );

  const [imageLoadState, setImageLoadState] = React.useState<
    "unknown" | "loaded" | "error"
  >("unknown");

  React.useEffect(() => {
    console.debug("[QuickScriptureCard] backgroundImage change:", {
      backgroundImage,
      isDarkMode,
      effectiveHasImage,
    });

    if (!effectiveHasImage) {
      setImageLoadState("unknown");
      return;
    }

    let src = backgroundImage as string;
    // support values like `url(path)` and plain paths
    const m = src.match(/^url\((?:"|')?(.*?)(?:"|')?\)$/i);
    if (m && m[1]) src = m[1];

    let mounted = true;
    const img = new Image();
    const onLoad = () => {
      if (!mounted) return;
      console.debug("[QuickScriptureCard] image loaded:", src);
      setImageLoadState("loaded");
    };
    const onError = () => {
      if (!mounted) return;
      console.warn("[QuickScriptureCard] image failed to load:", src);
      setImageLoadState("error");
    };
    img.onload = onLoad;
    img.onerror = onError;
    img.src = src;

    const timeout = setTimeout(() => {
      if (!mounted) return;
      if (imageLoadState === "unknown") {
        console.warn("[QuickScriptureCard] image load timed out:", src);
        setImageLoadState("error");
      }
    }, 1500);

    return () => {
      mounted = false;
      img.onload = null;
      img.onerror = null;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImage, effectiveHasImage]);

  const imageVisible = effectiveHasImage && imageLoadState === "loaded";

  return (
    <div className="relative group rounded-xl overflow-hidden h-[4.5rem]">
      <div
        onClick={onNavigate}
        className="absolute inset-0 transition-all duration-200 hover:cursor-pointer hover:scale-[1.01] border-none bg-card-bg-alt"
        // surfaceClassName={
        //   hasImage
        //     ? "bg-transparent border border-select-border"
        //     : " border border-select-border"
        // }
      >
        {/* Content */}
        <div className="relative z-10 p-2.5 flex flex-col h-full justify-between">
          {/* Reference + remove */}
          <div className="flex items-start justify-between gap-1">
            <span
              className={`text-[0.73rem] font-bold leading-tight text-text-primary   `}
            >
              {reference}
            </span>
            <DepthButton
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              sizeClassName="w-5 h-5 rounded-md"
              inactiveClassName={
                effectiveHasImage
                  ? "text-white/80 border-white/40 hover:text-white"
                  : "text-text-secondary border-select-border hover:text-red-500"
              }
              activeClassName="text-text-primary border-btn-active-from"
              className={`flex-shrink-0 transition-opacity ${
                effectiveHasImage
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-70"
              }`}
              title="Remove"
            >
              <X className="w-3 h-3 text-red-500" />
            </DepthButton>
          </div>

          {/* Text preview */}
          <span
            className={`text-[0.67rem] line-clamp-2 leading-snug text-text-primary`}
          >
            {truncatedText}
          </span>
        </div>
      </div>
    </div>
  );
};
