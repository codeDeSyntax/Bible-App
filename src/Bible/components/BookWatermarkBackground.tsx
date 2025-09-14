import React from "react";

interface BookWatermarkBackgroundProps {
  isDarkMode: boolean;
}

const BookWatermarkBackground: React.FC<BookWatermarkBackgroundProps> = ({
  isDarkMode,
}) => {
  // Custom SVG Compound Leaf Component
  const Wheat = ({
    className,
    style,
  }: {
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <svg
      width="300"
      height="400"
      viewBox="0 0 300 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Main curved stem with natural flow - starts from bottom */}
      <path
        d="M150 400 Q145 350 152 300 Q160 250 148 200 Q140 150 155 100"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.8"
        fill="none"
      />

      {/* Wheat grain head at the top - for center stalk */}
      {/* Main wheat head cluster */}
      <ellipse
        cx="155"
        cy="105"
        rx="8"
        ry="15"
        fill="currentColor"
        opacity="0.7"
        transform="rotate(-5 155 105)"
      />

      {/* Individual wheat grains - left side */}
      <ellipse
        cx="148"
        cy="108"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
        transform="rotate(-10 148 108)"
      />
      <ellipse
        cx="149"
        cy="115"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
        transform="rotate(-8 149 115)"
      />
      <ellipse
        cx="147"
        cy="122"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
        transform="rotate(-12 147 122)"
      />
      <ellipse
        cx="150"
        cy="129"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
        transform="rotate(-6 150 129)"
      />

      {/* Individual wheat grains - right side */}
      <ellipse
        cx="162"
        cy="108"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
        transform="rotate(10 162 108)"
      />
      <ellipse
        cx="161"
        cy="115"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
        transform="rotate(8 161 115)"
      />
      <ellipse
        cx="163"
        cy="122"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
        transform="rotate(12 163 122)"
      />
      <ellipse
        cx="160"
        cy="129"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
        transform="rotate(6 160 129)"
      />

      {/* Individual wheat grains - center */}
      <ellipse
        cx="155"
        cy="110"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
      />
      <ellipse
        cx="155"
        cy="117"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
      />
      <ellipse
        cx="155"
        cy="124"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
      />
      <ellipse
        cx="155"
        cy="131"
        rx="2.5"
        ry="4"
        fill="currentColor"
        opacity="0.6"
      />

      {/* Wheat awns (the thin bristles) */}
      <path
        d="M148 105 L145 95"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <path
        d="M151 107 L148 97"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <path
        d="M155 108 L155 98"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <path
        d="M159 107 L162 97"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <path
        d="M162 105 L165 95"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
      />

      {/* Second wheat head cluster - slightly lower */}
      <ellipse
        cx="148"
        cy="140"
        rx="6"
        ry="12"
        fill="currentColor"
        opacity="0.6"
        transform="rotate(-15 148 140)"
      />

      {/* Second cluster grains */}
      <ellipse
        cx="143"
        cy="142"
        rx="2"
        ry="3"
        fill="currentColor"
        opacity="0.5"
        transform="rotate(-15 143 142)"
      />
      <ellipse
        cx="145"
        cy="148"
        rx="2"
        ry="3"
        fill="currentColor"
        opacity="0.5"
        transform="rotate(-12 145 148)"
      />
      <ellipse
        cx="147"
        cy="154"
        rx="2"
        ry="3"
        fill="currentColor"
        opacity="0.5"
        transform="rotate(-18 147 154)"
      />
      <ellipse
        cx="151"
        cy="145"
        rx="2"
        ry="3"
        fill="currentColor"
        opacity="0.5"
        transform="rotate(-8 151 145)"
      />
      <ellipse
        cx="149"
        cy="151"
        rx="2"
        ry="3"
        fill="currentColor"
        opacity="0.5"
        transform="rotate(-10 149 151)"
      />

      {/* Second cluster awns */}
      <path
        d="M143 138 L140 130"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.4"
      />
      <path
        d="M146 140 L143 132"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.4"
      />
      <path
        d="M149 142 L149 134"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.4"
      />
      <path
        d="M152 140 L155 132"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.4"
      />

      {/* Left side leaflets - vertically attached wheat leaves */}
      {/* Top left leaflet - elongated and pointed, vertically attached */}
      <path
        d="M150 115 Q125 90 115 70 Q110 65 105 70 Q110 75 120 90 Q140 110 150 115"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M150 115 Q130 90 115 70"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Second left leaflet - broader and vertically oriented */}
      <path
        d="M145 165 Q115 135 100 110 Q93 105 88 110 Q93 115 110 135 Q135 160 145 165"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M145 165 Q120 135 100 110"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Third left leaflet - longer and pointed */}
      <path
        d="M148 215 Q115 180 100 150 Q93 145 88 150 Q93 155 110 180 Q135 210 148 215"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M148 215 Q120 180 100 150"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Fourth left leaflet - vertically attached */}
      <path
        d="M150 265 Q120 225 105 195 Q98 190 93 195 Q98 200 115 225 Q140 260 150 265"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M150 265 Q125 225 105 195"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Fifth left leaflet - broad and pointed */}
      <path
        d="M152 315 Q120 275 105 245 Q98 240 93 245 Q98 250 115 275 Q140 310 152 315"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M152 315 Q125 275 105 245"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Right side leaflets - vertically attached wheat leaves */}
      {/* Top right leaflet - elongated and pointed, vertically attached */}
      <path
        d="M160 125 Q185 90 195 70 Q200 65 205 70 Q200 75 190 90 Q170 110 160 125"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M160 125 Q180 90 195 70"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Second right leaflet - broader and vertically oriented */}
      <path
        d="M165 175 Q195 135 210 110 Q217 105 222 110 Q217 115 200 135 Q175 170 165 175"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M165 175 Q190 135 210 110"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Third right leaflet - longer and pointed */}
      <path
        d="M162 225 Q195 180 210 150 Q217 145 222 150 Q217 155 200 180 Q175 220 162 225"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M162 225 Q190 180 210 150"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Fourth right leaflet - vertically attached */}
      <path
        d="M160 275 Q190 225 205 195 Q212 190 217 195 Q212 200 195 225 Q170 270 160 275"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M160 275 Q185 225 205 195"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Fifth right leaflet - broad and pointed */}
      <path
        d="M158 325 Q190 275 205 245 Q212 240 217 245 Q212 250 195 275 Q170 320 158 325"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M158 325 Q185 275 205 245"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Leaf veins for natural detail */}
      <path
        d="M115 125 Q125 127 130 130"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M105 175 Q120 180 125 185"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M185 135 Q175 137 170 140"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M195 185 Q180 190 175 195"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.4"
        fill="none"
      />
    </svg>
  );

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      {/* Left wheat stalk - diverging left from center base */}
      <Wheat
        className={`absolute ${
          isDarkMode ? "text-green-600" : "text-green-700"
        }`}
        style={{
          bottom: "-50px",
          left: "50%",
          transformOrigin: "bottom center",
          transform: "translateX(-50%) translateY(0%) rotate(-35deg)",
          opacity: 0.18,
          width: "600px",
          height: "850px",
        }}
      />

      {/* Center wheat stalk - growing straight up from base */}
      <Wheat
        className={`absolute ${
          isDarkMode ? "text-orange-500" : "text-orange-600"
        }`}
        style={{
          bottom: "-50px",
          left: "50%",
          transformOrigin: "bottom center",
          transform: "translateX(-50%) translateY(0%) rotate(0deg)",
          opacity: 0.15,
          width: "650px",
          height: "920px",
        }}
      />

      {/* Right wheat stalk - diverging right from center base */}
      <Wheat
        className={`absolute ${
          isDarkMode ? "text-green-600" : "text-green-700"
        }`}
        style={{
          bottom: "-50px",
          left: "50%",
          transformOrigin: "bottom center",
          transform: "translateX(-50%) translateY(0%) rotate(35deg)",
          opacity: 0.18,
          width: "600px",
          height: "850px",
        }}
      />
    </div>
  );
};

export default BookWatermarkBackground;
