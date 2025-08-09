export type Scripture = {
  text: string;
  reference?: string;
  book?: string;
  chapter?: number;
  verse?: string;
};

export type MessagePoint = {
  text: string;
};

export type Presentation = {
  title: string;
  type?: string;
  preacher?: string;
  createdAt?: string | number;
  scriptures?: any[];
  quotes?: any[];
  mainMessagePoints?: any[];
  mainMessage?: string;
};
