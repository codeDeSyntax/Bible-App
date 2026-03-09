import React from "react";

// Paper / Linen texture using theme variables only
const MeshGradient: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        {/* diagonal linen weave pattern */}
        <pattern
          id="linen"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
          patternTransform="rotate(20)"
        >
          <rect width="8" height="8" fill="transparent" />
          <rect
            width="1"
            height="8"
            fill="var(--select-border)"
            opacity="0.045"
          />
        </pattern>

        {/* soft grain for paper feel */}
        <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
          <feComponentTransfer in="mono" result="alpha">
            <feFuncA type="table" tableValues="0 0.06" />
          </feComponentTransfer>
          <feGaussianBlur stdDeviation="0.3" />
        </filter>

        {/* gentle radial depth using theme alt color */}
        <radialGradient id="depth" cx="50%" cy="35%" r="80%">
          <stop offset="0%" stopColor="var(--card-bg)" stopOpacity="0" />
          <stop
            offset="100%"
            stopColor="var(--card-bg-alt)"
            stopOpacity="0.06"
          />
        </radialGradient>
      </defs>

      {/* base paper color from theme */}
      <rect x="0" y="0" width="100" height="100" fill="var(--card-bg)" />

      {/* linen weave */}
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill="url(#linen)"
        style={{ mixBlendMode: "overlay" }}
      />

      {/* soft grain tint using theme border color */}
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill="var(--select-border)"
        opacity="0.035"
        filter="url(#grain)"
      />

      {/* gentle depth vignette */}
      <rect x="0" y="0" width="100" height="100" fill="url(#depth)" />
    </svg>
  );
};

export default MeshGradient;
