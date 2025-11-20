import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

interface SermonPresentationProps {
  title: string;
  subtitle?: string;
  preacher: string;
  date: string;
  scriptures?: string[];
  quotes?: string[];
}

export const SermonPresentation: React.FC<SermonPresentationProps> = ({
  title,
  subtitle,
  preacher,
  date,
  scriptures = [],
  quotes = [],
}) => {
  const [currentSection, setCurrentSection] = useState(0);

  // Define sections based on available content
  const sections: number[] = [];
  sections.push(0); // Title always available
  sections.push(1); // Preacher/Date always available
  if (scriptures.length > 0) sections.push(2); // Scriptures
  if (quotes.length > 0) sections.push(3); // Quotes

  // Auto-rotate through sections every 8 seconds
  useEffect(() => {
    if (sections.length <= 1) return; // Don't rotate if only one section

    const interval = setInterval(() => {
      setCurrentSection((prev) => {
        const currentIndex = sections.indexOf(prev);
        const nextIndex = (currentIndex + 1) % sections.length;
        return sections[nextIndex];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [scriptures.length, quotes.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        // Title & Subtitle
        return (
          <div className="max-w-2xl text-left space-y-6">
            <h1
              className={`font-semibold leading-tight ${
                subtitle ? "text-7xl" : "text-9xl"
              }`}
              style={{
                fontFamily: "Cinzel, Georgia, serif",
                letterSpacing: "0.05em",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-5xl font-normal opacity-80"
                style={{ fontFamily: "Cinzel, Georgia, serif" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        );

      case 1:
        // Preacher & Date
        return (
          <div className="text-left space-y-8 max-w-2xl">
            <div>
              <p
                className="text-2xl font-medium mb-3 opacity-60 uppercase tracking-wider"
                style={{ fontFamily: "Cinzel, Georgia, serif" }}
              >
                Speaker
              </p>
              <p
                className="text-6xl font-semibold"
                style={{
                  fontFamily: "Cinzel, Georgia, serif",
                  letterSpacing: "0.02em",
                }}
              >
                {preacher}
              </p>
            </div>
            <div className="w-40 h-px bg-current opacity-20"></div>
            <div>
              <p
                className="text-2xl font-medium mb-3 opacity-60 uppercase tracking-wider"
                style={{ fontFamily: "Cinzel, Georgia, serif" }}
              >
                Date
              </p>
              <p
                className="text-4xl font-normal"
                style={{ fontFamily: "Cinzel, Georgia, serif" }}
              >
                {formatDate(date)}
              </p>
            </div>
          </div>
        );

      case 2:
        // Scriptures
        return (
          <div className="max-w-2xl space-y-6">
            <h3
              className="text-4xl font-semibold uppercase tracking-widest opacity-80 text-left"
              style={{ fontFamily: "Cinzel, Georgia, serif" }}
            >
              Key Scriptures
            </h3>
            <div className="flex flex-wrap gap-3 justify-start">
              {scriptures.map((scripture, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-[#34251e]/10 rounded-full border border-[#34251e]/20"
                >
                  <span
                    className="text-3xl font-medium"
                    style={{ fontFamily: "Cinzel, Georgia, serif" }}
                  >
                    {scripture}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        // Quotes
        return (
          <div className="max-w-2xl space-y-6">
            <h3
              className="text-4xl font-semibold uppercase tracking-widest opacity-80 text-left"
              style={{ fontFamily: "Cinzel, Georgia, serif" }}
            >
              Key Quotes
            </h3>
            <div className="space-y-6">
              {quotes.slice(0, 2).map((quote, index) => (
                <div key={index} className="relative pl-8">
                  <div
                    className="absolute left-0 top-0 text-5xl opacity-20 leading-none"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    "
                  </div>
                  <p
                    className="text-2xl italic font-normal leading-relaxed"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {quote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen bg-[#ffe8c9] relative overflow-hidden flex">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,#34251e,#34251e_10px,transparent_10px,transparent_20px)]"></div>
      </div>

      {/* Left Side - Rotating Sections */}
      <div className="relative z-10 w-1/2 flex items-center justify-center p-16 border-r-2 border-[#34251e]/10 bg-[#ffe8c9] text-[#34251e]">
        {/* Church Logo/Branding - Top Left */}
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div
            className="text-3xl font-light"
            style={{
              fontFamily: "Cinzel, Georgia, serif",
              letterSpacing: "0.1em",
            }}
          >
            ✝ CHURCH
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-start pl-8">
          <div
            key={currentSection}
            className="animate-fadeIn"
            style={{
              animation: "fadeIn 0.7s ease-in-out",
            }}
          >
            {renderCurrentSection()}
          </div>
        </div>
      </div>

      {/* Right Side - Static Image and Text */}
      <div className="relative z-10 w-1/2 flex flex-col items-center justify-center p-16 bg-[#ffe8c9] text-[#34251e]">
        {/* Decorative curved arch lines */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <svg
            className="absolute -top-20 -right-20 w-full h-full"
            viewBox="0 0 500 800"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Outer curved line */}
            <path
              d="M 500 0 Q 400 200, 350 400 T 300 700 L 500 800 L 500 0 Z"
              stroke="#34251e"
              strokeWidth="2"
              fill="none"
              opacity="0.15"
            />
            {/* Inner curved line */}
            <path
              d="M 500 100 Q 420 250, 380 450 T 350 750 L 500 800"
              stroke="#34251e"
              strokeWidth="2"
              fill="none"
              opacity="0.1"
            />
          </svg>
        </div>

        {/* Bible Image with Rounded Top Container */}
        <div className="relative mb-10 z-10">
          {/* Rounded container matching the image design */}
          <div className="relative w-[340px] h-[420px]">
            {/* Rounded top border frame */}
            <div className="absolute inset-0 border-solid rounded-t-[170px] border-[6px] border-[#34251e]/15"></div>

            {/* Image container with rounded top */}
            <div className="absolute inset-[6px] border-solid rounded-t-[164px] overflow-hidden bg-[#34251e]  shadow-xl">
              <img
                src="./handpointingbible.jpg"
                alt="Hand pointing at Bible"
                className="w-full h-full object-cover"
                // onError={(e) => {
                //   // Fallback if image doesn't load
                //   const target = e.currentTarget as HTMLImageElement;
                //   console.error("Failed to load image: /handpointingbible.jpg");
                //   target.style.display = "none";
                //   const parent = target.parentElement;
                //   if (parent) {
                //     parent.innerHTML =
                //       '<div class="w-full h-full flex items-center justify-center bg-[#34251e]/5"><svg class="w-32 h-32 text-[#34251e]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>';
                //   }
                // }}
              />
            </div>
          </div>
        </div>

        {/* Static Text */}
        <div className="text-center space-y-4 z-10">
          <p
            className="text-4xl font-light uppercase tracking-widest"
            style={{
              fontFamily: "Cinzel, Georgia, serif",
              letterSpacing: "0.15em",
            }}
          >
            BEAUTIFUL WORDS
          </p>
          <div className="w-32 h-px bg-[#34251e]/20 mx-auto"></div>
          <p
            className="text-xl font-light opacity-60 uppercase tracking-wider"
            style={{ fontFamily: "Cinzel, Georgia, serif" }}
          >
            OF LIFE
          </p>
        </div>
      </div>

      {/* Animated Section Indicator - Moved to left side */}
      {sections.length > 1 && (
        <div className="absolute bottom-8 left-1/4 transform -translate-x-1/2 flex gap-2 z-20">
          {sections.map((section) => (
            <div
              key={section}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                currentSection === section
                  ? "bg-[#34251e] scale-125"
                  : "bg-[#34251e]/30"
              }`}
            />
          ))}
        </div>
      )}

      {/* Google Fonts Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
