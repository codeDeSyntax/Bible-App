export type TextPresetType =
  | "simple"
  | "list"
  | "quote"
  | "title"
  | "announcement";

export interface TextPresetData {
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  textColor: string;
  backgroundColor: string;
  backgroundImage?: string;
  enableConfetti?: boolean;
  presetType?: TextPresetType;
  // For list type
  listItems?: string[];
  // For quote type
  author?: string;
  // For title type
  subtitle?: string;
  // For announcement type
  announcementTitle?: string;
}
