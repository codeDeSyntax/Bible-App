import { useEffect, useState } from "react";

export const useBibleProjectionState = () => {
  const [isProjectionActive, setIsProjectionActive] = useState<boolean>(false);

  useEffect(() => {
    // Check initial projection state
    const checkInitialState = async () => {
      try {
        const isActive = await window.api.isProjectionActive();
        setIsProjectionActive(isActive);
      } catch (error) {
        console.error("Failed to check initial Bible projection state:", error);
      }
    };

    checkInitialState();

    // Listen for Bible projection state changes
    const cleanup = window.api.onProjectionStateChanged((isActive: boolean) => {
      setIsProjectionActive(isActive);
    });

    return cleanup;
  }, []);

  const closeProjection = async () => {
    try {
      const success = await window.api.closeProjectionWindow();
      if (success) {
        setIsProjectionActive(false);
      }
      return success;
    } catch (error) {
      console.error("Failed to close Bible projection window:", error);
      return false;
    }
  };

  return {
    isProjectionActive,
    closeProjection,
  };
};
