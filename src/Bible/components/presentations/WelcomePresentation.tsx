import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

interface WelcomePresentationProps {
  preset: any;
}

const WelcomePresentation: React.FC<WelcomePresentationProps> = ({
  preset,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [randomScripture, setRandomScripture] = useState({
    text: "",
    reference: "",
  });

  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const { initializeBibleData } = useBibleOperations();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize Bible data if needed
  useEffect(() => {
    if (!bibleData || Object.keys(bibleData).length === 0) {
      console.log("WelcomePresentation: Initializing Bible data...");
      initializeBibleData();
    }
  }, [bibleData, initializeBibleData]);

  // Get random scripture on mount
  useEffect(() => {
    const getRandomScripture = () => {
      try {
        console.log("Getting random scripture...");
        console.log("Bible data:", bibleData);
        console.log("Current translation:", currentTranslation);

        // Check if bibleData exists and has the structure we expect
        if (!bibleData || typeof bibleData !== "object") {
          console.error("Bible data is not available or invalid");
          return;
        }

        // Try to get translation data
        let translationData = bibleData[currentTranslation];

        // If current translation doesn't exist, try to use any available translation
        if (!translationData) {
          const availableTranslations = Object.keys(bibleData);
          console.log("Available translations:", availableTranslations);
          if (availableTranslations.length > 0) {
            translationData = bibleData[availableTranslations[0]];
            console.log(
              "Using first available translation:",
              availableTranslations[0]
            );
          }
        }

        if (
          !translationData ||
          !translationData.books ||
          translationData.books.length === 0
        ) {
          console.error("No books found in translation data");
          return;
        }

        const books = translationData.books;
        console.log(`Found ${books.length} books`);

        const randomBook = books[Math.floor(Math.random() * books.length)];
        console.log("Selected book:", randomBook.name);

        if (!randomBook.chapters || randomBook.chapters.length === 0) {
          console.error("No chapters found in book");
          return;
        }

        const randomChapter =
          randomBook.chapters[
            Math.floor(Math.random() * randomBook.chapters.length)
          ];
        console.log("Selected chapter:", randomChapter.chapter);

        if (!randomChapter.verses || randomChapter.verses.length === 0) {
          console.error("No verses found in chapter");
          return;
        }

        const randomVerse =
          randomChapter.verses[
            Math.floor(Math.random() * randomChapter.verses.length)
          ];
        console.log("Selected verse:", randomVerse);

        const scripture = {
          text: randomVerse.text,
          reference: `${randomBook.name} ${randomChapter.chapter}:${randomVerse.verse}`,
        };

        console.log("Setting random scripture:", scripture);
        setRandomScripture(scripture);
      } catch (error) {
        console.error("Error getting random scripture:", error);
      }
    };

    getRandomScripture();
  }, [bibleData, currentTranslation]);

  // Format time as 3:38 (or current time)
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.7)" }}
      >
        <source src="./welcomevid.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for better text readability */}
      {/* <div className="absolute inset-0 bg-black/40" /> */}

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-between px-20 py-4">
        {/* Top Section - Welcome and Thank You */}
        <div
          className="flex items-center justify-center gap-6 animate-fade-in-up"
          style={{
            animation: "fadeInUp 1s ease-out forwards",
            opacity: 0,
          }}
        >
          {/* WELCOME text */}
          <h1
            className="text-white font-black uppercase font-teko tracking-wider"
            style={{
              fontSize: "clamp(7rem, 10vw, 8rem)",
              textShadow:
                "0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 10px rgba(0, 0, 0, 0.6)",
              letterSpacing: "0.15em",
              lineHeight: "1",
            }}
          >
            WELCOME
          </h1>

          {/* Vertical divider */}
          <div
            className="h-24 w-1 bg-gradient-to-b from-white/80 via-white/60 to-white/40"
            style={{
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.6)",
            }}
          />

          {/* THANK YOU text */}
          <div className="flex flex-col justify-center gap-1">
            <span
              className="text-orange-300 font-bold uppercase font-teko leading-tight"
              style={{
                fontSize: "clamp(3rem, 4vw, 4rem)",
                textShadow:
                  "0 2px 10px rgba(0, 0, 0, 0.8), 0 1px 5px rgba(0, 0, 0, 0.6)",
              }}
            >
              GOD BLESS YOU
            </span>
            <span
              className="text-orange-300 font-bold uppercase font-teko tracking-widest leading-tight"
              style={{
                fontSize: "clamp(1.5rem, 2.2vw, 1.75rem)",
                textShadow:
                  "0 2px 10px rgba(0, 0, 0, 0.8), 0 1px 5px rgba(0, 0, 0, 0.6)",
              }}
            >
              FOR COMING
            </span>
          </div>
        </div>

        {/* Middle Section - Current Time (Centered) */}
        <div
          className="flex items-center justify-center -mt-20"
          style={{
            animation: "fadeInUp 1s ease-out 0.3s forwards",
            opacity: 0,
          }}
        >
          <span
            className="text-white font-black font-teko"
            style={{
              fontSize: "clamp(6rem, 14vw, 10rem)",
              textShadow:
                "0 8px 40px rgba(0, 0, 0, 0.9), 0 4px 20px rgba(0, 0, 0, 0.7)",
              lineHeight: "1",
              letterSpacing: "0.05em",
            }}
          >
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Bottom Section - Scripture */}
        {randomScripture.text && (
          <div
            className="text-center px-8"
            style={{
              animation: "fadeInUp 1s ease-out 0.6s forwards",
              opacity: 0,
            }}
          >
            <div className="flex items-start justify-center gap-4 max-w-6xl mx-auto">
              <p
                className="text-white font-bold uppercase tracking-wide leading-relaxed flex-1 text-center"
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.5rem)",
                  textShadow:
                    "0 3px 15px rgba(0, 0, 0, 0.9), 0 2px 8px rgba(0, 0, 0, 0.7)",
                }}
              >
                {randomScripture.text.slice(0, 150)}
                <span
                  className="text-orange-200 font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 self-start"
                  style={{
                    fontSize: "clamp(0.85rem, 1.6vw, 1.2rem)",
                    textShadow:
                      "0 2px 10px rgba(0, 0, 0, 0.8), 0 1px 5px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  {randomScripture.reference}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomePresentation;
