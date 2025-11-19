import React from "react";

interface ListPresentationProps {
  items: string[];
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  textColor: string;
  backgroundColor: string;
  backgroundImage?: string;
}

export const ListPresentation: React.FC<ListPresentationProps> = ({
  items,
  fontSize,
  fontFamily,
  textAlign,
  textColor,
  backgroundColor,
  backgroundImage,
}) => {
  // Last item is the subtitle, rest are list items
  const filteredItems = items.filter((item) => item.trim() !== "");
  const subtitle = filteredItems[filteredItems.length - 1];
  const listItems = filteredItems

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center relative overflow-hidden py-20"
      style={{
        backgroundColor: backgroundImage ? "transparent" : backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Bokeh overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />

      {/* List container - stacked black bars w5th purple separators */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col gap-1">
        {listItems.map((item, index) => (
          <React.Fragment key={index}>
            {/* List item bar */}
            <div
              className="bg-black backdrop-blur-sm px-16 py-3  shadow-2xl"
              style={{
                textAlign,
              }}
            >
              <span
                className="font-bold uppercase tracking-wide"
                style={{
                  fontSize: `${Math.round(fontSize * 0.6)}px`,
                  fontFamily,
                  color: "white",
                  lineHeight: "1.2",
                }}
              >
                {item}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

     
    </div>
  );
};
