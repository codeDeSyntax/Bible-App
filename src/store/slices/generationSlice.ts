import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Tracks background AI image generation when the flyer modal
 * is closed mid-generation.  Allows a fallback tracker to pick
 * up the result and offer "Save / Remove".
 */

export type GenerationStatus = "idle" | "generating" | "completed" | "failed";

export interface GenerationPayload {
  name: string;
  reference?: string;
}

export interface GenerationState {
  status: GenerationStatus;
  /** Metadata captured when generation was started */
  payload: GenerationPayload | null;
  /** local-image:// URL of the generated image saved on disk */
  imageUrl: string | null;
  /** Error message if generation failed */
  error: string | null;
  /** Timestamp (ms) when background tracking started */
  startedAt: number | null;
}

const initialState: GenerationState = {
  status: "idle",
  payload: null,
  imageUrl: null,
  error: null,
  startedAt: null,
};

const generationSlice = createSlice({
  name: "generation",
  initialState,
  reducers: {
    /** Modal was closed while the API call was still in flight. */
    startBackgroundGeneration(state, action: PayloadAction<GenerationPayload>) {
      state.status = "generating";
      state.payload = action.payload;
      state.imageUrl = null;
      state.error = null;
      state.startedAt = Date.now();
    },

    /** API call resolved successfully while modal was closed. */
    backgroundGenerationCompleted(
      state,
      action: PayloadAction<string>, // local-image:// URL
    ) {
      state.status = "completed";
      state.imageUrl = action.payload;
      state.error = null;
    },

    /** API call failed while modal was closed. */
    backgroundGenerationFailed(
      state,
      action: PayloadAction<string>, // error message
    ) {
      state.status = "failed";
      state.error = action.payload;
      state.imageUrl = null;
    },

    /** User chose Save / Remove, or auto-save happened — reset. */
    clearBackgroundGeneration(state) {
      state.status = "idle";
      state.payload = null;
      state.imageUrl = null;
      state.error = null;
      state.startedAt = null;
    },
  },
});

export const {
  startBackgroundGeneration,
  backgroundGenerationCompleted,
  backgroundGenerationFailed,
  clearBackgroundGeneration,
} = generationSlice.actions;

export default generationSlice.reducer;
