import { TextPresetType } from "./types";

export const isFormValid = (
  presetType: TextPresetType,
  randomText: string,
  listItems: string[],
  quoteText: string,
  titleText: string,
  announcementTitle: string,
  announcementText: string
): boolean => {
  switch (presetType) {
    case "simple":
      return !!randomText;
    case "list":
      return listItems.filter((item) => item.trim()).length > 0;
    case "quote":
      return !!quoteText;
    case "title":
      return !!titleText;
    case "announcement":
      return !!announcementTitle && !!announcementText;
    default:
      return false;
  }
};

export const prepareTextData = (
  presetType: TextPresetType,
  randomText: string,
  listItems: string[],
  quoteText: string,
  author: string,
  titleText: string,
  subtitle: string,
  announcementTitle: string,
  announcementText: string
): { text: string; extraData: any } => {
  let text = randomText;
  const extraData: any = {
    presetType,
  };

  switch (presetType) {
    case "list":
      text = listItems.filter((item) => item.trim()).join("\n");
      extraData.listItems = listItems.filter((item) => item.trim());
      break;
    case "quote":
      text = quoteText;
      extraData.author = author;
      break;
    case "title":
      text = titleText;
      extraData.subtitle = subtitle;
      break;
    case "announcement":
      text = announcementText;
      extraData.announcementTitle = announcementTitle;
      break;
  }

  return { text, extraData };
};
