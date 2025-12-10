export interface Voice {
  displayName: string;
  supportedLanguages: string[];
}

export const DEFAULT_VOICE_ID = "cgSgspJ2msm6clMCkdW9";

export const voices: { [key: string]: Voice } = {
  bIHbv24MWmeRgasZH58o: {
    displayName: "Will",
    supportedLanguages: [
      "English",
      "French",
      "German",
      "Portuguese",
      "Chinese",
      "Czech",
      "Filipino",
      "Slovak",
      "Spanish",
      "Swedish",
    ],
  },
  cgSgspJ2msm6clMCkdW9: {
    displayName: "Jessica",
    supportedLanguages: [
      "English",
      "French",
      "Arabic",
      "Japanese",
      "Chinese",
      "German",
      "Czech",
      "Hindi",
    ],
  },
  cjVigY5qzO86Huf0OWal: {
    displayName: "Eric",
    supportedLanguages: [
      "English",
      "French",
      "Portuguese",
      "German",
      "Slovak",
      "Spanish",
    ],
  },
  iP95p4xoKVk53GoZ742B: {
    displayName: "Chris",
    supportedLanguages: [
      "English",
      "French",
      "Arabic",
      "Portuguese",
      "Swedish",
      "Hindi",
    ],
  },
  Xb7hH8MSUJpSbSDYk0k2: {
    displayName: "Alice",
    supportedLanguages: [
      "English",
      "Italian",
      "French",
      "Arabic",
      "Japanese",
      "Polish",
      "Hindi",
    ],
  },
};
