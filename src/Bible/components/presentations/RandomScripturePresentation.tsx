import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

interface RandomScripturePresentationProps {
  preset: any;
}

const RandomScripturePresentation: React.FC<
  RandomScripturePresentationProps
> = ({ preset }) => {
  const [randomScripture, setRandomScripture] = useState({
    text: "",
    reference: "",
  });
  const [isGrayscale, setIsGrayscale] = useState<boolean>(false);

  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const { initializeBibleData } = useBibleOperations();

  // Initialize Bible data if needed
  useEffect(() => {
    if (!bibleData || Object.keys(bibleData).length === 0) {
      console.log("RandomScripture: Initializing Bible data...");
      initializeBibleData();
    }
  }, [bibleData, initializeBibleData]);

  // Listen for grayscale toggle events
  useEffect(() => {
    const grayscaleHandler = (_ev: any, data: any) => {
      if (typeof data.enabled === "boolean") {
        console.log(
          "🎨 RandomScripturePresentation: Grayscale filter toggled:",
          data.enabled
        );
        setIsGrayscale(data.enabled);
      }
    };

    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.on("projection-grayscale-toggle", grayscaleHandler);
    }

    return () => {
      if (typeof window !== "undefined" && window.ipcRenderer) {
        try {
          window.ipcRenderer.removeListener(
            "projection-grayscale-toggle",
            grayscaleHandler
          );
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Get random scripture on mount and change every 30 seconds
  useEffect(() => {
    const getRandomScripture = () => {
      try {
        console.log("RandomScripture: Getting random scripture...");
        console.log("RandomScripture: Bible data available?", !!bibleData);
        console.log(
          "RandomScripture: Current translation:",
          currentTranslation
        );

        // Check if bibleData exists and has the structure we expect
        if (!bibleData || typeof bibleData !== "object") {
          console.error("RandomScripture: Bible data is not available");
          return;
        }

        // Try to get translation data
        let translationData = bibleData[currentTranslation];

        // If current translation doesn't exist, try to use any available translation
        if (!translationData) {
          const availableTranslations = Object.keys(bibleData);
          console.log(
            "RandomScripture: Available translations:",
            availableTranslations
          );
          if (availableTranslations.length > 0) {
            translationData = bibleData[availableTranslations[0]];
            console.log(
              "RandomScripture: Using translation:",
              availableTranslations[0]
            );
          }
        }

        if (
          !translationData ||
          !translationData.books ||
          translationData.books.length === 0
        ) {
          console.error("RandomScripture: No books found in translation data");
          return;
        }

        const books = translationData.books;
        console.log(`RandomScripture: Found ${books.length} books`);
        const randomBook = books[Math.floor(Math.random() * books.length)];
        console.log("RandomScripture: Selected book:", randomBook.name);

        if (!randomBook.chapters || randomBook.chapters.length === 0) {
          console.error("RandomScripture: No chapters found in book");
          return;
        }

        const randomChapter =
          randomBook.chapters[
            Math.floor(Math.random() * randomBook.chapters.length)
          ];
        console.log(
          "RandomScripture: Selected chapter:",
          randomChapter.chapter
        );

        if (!randomChapter.verses || randomChapter.verses.length === 0) {
          console.error("RandomScripture: No verses found in chapter");
          return;
        }

        const randomVerse =
          randomChapter.verses[
            Math.floor(Math.random() * randomChapter.verses.length)
          ];
        console.log("RandomScripture: Selected verse:", randomVerse);

        const scripture = {
          text: randomVerse.text,
          reference: `${randomBook.name} ${randomChapter.chapter}:${randomVerse.verse}`,
        };

        console.log("RandomScripture: Setting scripture:", scripture);
        setRandomScripture(scripture);
      } catch (error) {
        console.error(
          "RandomScripture: Error getting random scripture:",
          error
        );
      }
    };

    // Only start interval if bibleData is available
    if (bibleData && typeof bibleData === "object") {
      console.log("RandomScripture: Bible data available, starting...");
      // Get initial scripture
      getRandomScripture();

      // Change scripture every 30 seconds
      const interval = setInterval(getRandomScripture, 30000);

      return () => clearInterval(interval);
    } else {
      console.log("RandomScripture: Waiting for Bible data...");
    }
  }, [bibleData, currentTranslation]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: isGrayscale
            ? "grayscale(100%) brightness(0.7)"
            : "brightness(0.7)",
        }}
      >
        <source src="./waterglass.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-10   py-8">
        {randomScripture.text ? (
          <div
            className="text-center max-w-7xl"
            style={{
              animation: "fadeInUp 1s ease-out forwards",
              opacity: 0,
            }}
          >
            {/* Scripture Text */}
            <p
              className="text-white font-bold font-oswald leading-relaxed mb-8"
              style={{
                fontSize: "clamp(4rem, 3vw, 4rem)",
                textShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.9), 0 2px 10px rgba(0, 0, 0, 0.7)",
                lineHeight: "1.3",
              }}
            >
              {randomScripture.text}
            </p>

            {/* Reference with decorative lines */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div
                className="h-px flex-1 max-w-[154px]  bg-gradient-to-r from-transparent via-white/60 to-white/60"
                style={{
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.4)",
                }}
              />
              <p
                className="text-orange-200 font-bold uppercase tracking-wider"
                style={{
                  fontSize: "clamp(2rem, 2vw, 2rem)",
                  textShadow:
                    "0 2px 10px rgba(0, 0, 0, 0.8), 0 1px 5px rgba(0, 0, 0, 0.6)",
                }}
              >
                {randomScripture.reference}
              </p>
              <div
                className="h-px flex-1 max-w-[150px] bg-gradient-to-l from-transparent via-white/60 to-white/60"
                style={{
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.4)",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-white text-2xl">Loading scripture...</div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
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

export default RandomScripturePresentation;
