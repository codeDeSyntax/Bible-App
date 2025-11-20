import React from "react";
import { Megaphone } from "lucide-react";

interface AnnouncementPresentationProps {
  title: string;
  message: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  textColor: string;
  backgroundColor: string;
  backgroundImage?: string;
}

export const AnnouncementPresentation: React.FC<
  AnnouncementPresentationProps
> = ({
  title,
  message,
  fontSize,
  fontFamily,
  textAlign,
  textColor,
  backgroundColor,
  backgroundImage,
}) => {
  return (
    <div
      className="w-screen h-screen flex items-center justify-center relative overflow-hidden px-20 py-16"
      style={{
        backgroundColor: "#ffe8c9",
      }}
    >
      {/* Decorative background patterns - covering entire screen */}
      {/* Top-left dots pattern */}
      <div className="absolute top-8 left-8 grid grid-cols-6 gap-1 opacity-20">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-[#34251e] rounded-full" />
        ))}
      </div>

      {/* Top-center dots pattern */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 grid grid-cols-4 gap-2 opacity-15">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-1 h-1 bg-[#34251e] rounded-full" />
        ))}
      </div>

      {/* Bottom-right dots pattern */}
      <div className="absolute bottom-12 right-12 grid grid-cols-6 gap-1 opacity-20">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-[#34251e] rounded-full" />
        ))}
      </div>

      {/* Bottom-left dots pattern */}
      <div className="absolute bottom-16 left-16 grid grid-cols-5 gap-1.5 opacity-15">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-1 h-1 bg-[#34251e] rounded-full" />
        ))}
      </div>

      {/* Top-right diagonal lines */}
      <div className="absolute top-4 right-4 opacity-10">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-40 h-0.5 bg-[#34251e] mb-2"
            style={{ transform: `rotate(45deg) translateX(${i * 4}px)` }}
          />
        ))}
      </div>

      {/* Bottom-left diagonal lines */}
      <div className="absolute bottom-4 left-4 opacity-8">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="w-32 h-0.5 bg-[#34251e] mb-2"
            style={{ transform: `rotate(-45deg) translateX(${i * 4}px)` }}
          />
        ))}
      </div>

      {/* Top-left diagonal lines */}
      <div className="absolute top-40 left-40 opacity-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-24 h-0.5 bg-[#34251e] mb-1.5"
            style={{ transform: `rotate(135deg) translateX(${i * 3}px)` }}
          />
        ))}
      </div>

      {/* Left vertical text decoration */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
        <p
          className="text-[#34251e]/15 font-bold tracking-[0.3em] text-sm"
          style={{ fontFamily: "Cinzel, Georgia, serif" }}
        >
          CHURCH ANNOUNCEMENT
        </p>
      </div>

      {/* Right vertical text decoration */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 origin-center">
        <p
          className="text-[#34251e]/15 font-bold tracking-[0.3em] text-sm"
          style={{ fontFamily: "Cinzel, Georgia, serif" }}
        >
          IMPORTANT MESSAGE
        </p>
      </div>

      {/* Circle decorations - multiple sizes and positions */}
      <div className="absolute top-32 right-32 w-8 h-8 border-4 border-[#34251e]/20 rounded-full" />
      <div className="absolute bottom-32 left-96 w-6 h-6 bg-[#34251e]/15 rounded-full" />
      <div className="absolute top-48 left-48 w-10 h-10 border-3 border-[#34251e]/20 rounded-full" />
      <div className="absolute bottom-48 right-48 w-4 h-4 bg-[#34251e]/10 rounded-full" />
      <div className="absolute top-1/3 right-20 w-5 h-5 border-2 border-[#34251e]/15 rounded-full" />
      <div className="absolute bottom-1/3 left-20 w-3 h-3 bg-[#34251e]/20 rounded-full" />

      {/* Triangle decorations - multiple positions */}
      <div className="absolute top-28 right-24">
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#34251e]/15" />
      </div>
      <div className="absolute bottom-28 left-24">
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#34251e]/10" />
      </div>
      <div className="absolute top-1/4 left-1/4">
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] border-b-[#34251e]/8" />
      </div>
      <div className="absolute bottom-1/4 right-1/4">
        <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[12px] border-b-[#34251e]/10" />
      </div>

      {/* Square decorations */}
      <div className="absolute top-64 right-64 w-6 h-6 border-2 border-[#34251e]/15 rotate-45" />
      <div className="absolute bottom-64 left-64 w-4 h-4 bg-[#34251e]/10 rotate-12" />
      <div className="absolute top-1/2 right-32 w-5 h-5 border-2 border-[#34251e]/12 -rotate-12" />

      {/* Plus/Cross decorations */}
      <div className="absolute top-56 left-56 text-[#34251e]/15 text-2xl font-thin">
        +
      </div>
      <div className="absolute bottom-56 right-56 text-[#34251e]/10 text-xl font-thin">
        +
      </div>
      <div className="absolute top-1/3 right-1/4 text-[#34251e]/15 text-lg font-thin">
        ×
      </div>
      <div className="absolute bottom-1/3 left-1/4 text-[#34251e]/10 text-lg font-thin">
        ×
      </div>

      {/* Wave patterns */}
      <div className="absolute top-0 left-1/4 w-64 opacity-10">
        <svg viewBox="0 0 100 20" className="w-full">
          <path
            d="M0 10 Q 25 0, 50 10 T 100 10"
            stroke="#34251e"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>
      <div className="absolute bottom-0 right-1/4 w-64 opacity-10">
        <svg viewBox="0 0 100 20" className="w-full">
          <path
            d="M0 10 Q 25 20, 50 10 T 100 10"
            stroke="#34251e"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Main announcement card with 3D depth effect */}
      <div className="relative z-10 w-[75vw] max-w-6xl overflow-visible">
        {/* 3D depth layers - creating that edge effect */}
        <div className="absolute inset-0 bg-[#34251e]/20 rounded-[3rem] translate-x-3 translate-y-3 blur-sm opacity-40" />
        <div className="absolute inset-0 bg-[#34251e]/15 rounded-[3rem] translate-x-2 translate-y-2 opacity-60" />
        <div className="absolute inset-0 bg-[#34251e]/10 rounded-[3rem] translate-x-1 translate-y-1 opacity-80" />

        {/* Microphone icon - positioned on bottom left corner of card */}

        {/* Main white card */}
        <div className="relative bg-gradient-to-br from-white via-[#fffbf5] to-[#fff5e6] rounded-[3rem] shadow-2xl p-8 border-8 border-white/80 min-h-[70vh] max-h-[80vh] overflow-visible">
          {/* <div className="absolute bottom-2 left-0 z-20"> */}

          {/* Announcement tag at top left corner */}
          <div className="absolute -top-20 left-8 z-30">
            <div className="bg-gradient-to-r from-[#34251e] to-[#4a3628] px-8 py-0 rounded-2xl shadow-lg transform -rotate12">
              <p
                className="text-[#ffe8c9] font-black uppercase tracking-wider text-4xl"
                style={{ fontFamily: "Cinzel, Georgia, serif" }}
              >
                Announcement
              </p>
            </div>
          </div>

          {/* mega phone image */}
          <img
            src="./mic.png"
            alt="Megaphone"
            className="size-80 absolute -bottom-32 -left-32 z-20 opacity-90"
          />

          {/* </div> */}

          {/* Title with decorative underline and icon */}
          <div className="text-center mb-10">
            <span
              className="font-black uppercase tracking-wide mb-2 relative inline-block"
              style={{
                fontSize: `4rem`,
                fontFamily: "Cinzel, Georgia, serif",
                color: "#34251e",
                lineHeight: "1.2",
              }}
            >
              {title}
            </span>
            {/* Hand-drawn style underline */}
            <div className="flex justify-center mt-2">
              <svg
                width="200"
                height="8"
                viewBox="0 0 200 8"
                className="opacity-70"
              >
                <path
                  d="M 0 4 Q 50 2, 100 4 T 200 4"
                  stroke="#34251e"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Message content */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <p
              className="font-medium leading-relaxed"
              style={{
                fontSize: `${Math.min(fontSize, 32)}px`,
                fontFamily: "Cinzel, Georgia, serif",
                textAlign: "center",
                color: "#34251e",
                lineHeight: "1.7",
              }}
            >
              {message}
            </p>

            {/* Decorative separator */}
            <div className="flex justify-center pt-6">
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#34251e]/40 to-transparent rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Google Fonts Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};
