export interface Voice {
  displayName: string;
  supportedLanguages: string[];
}

export const voices: { [key: string]: Voice } = {
  WAhoMTNdLdMoq1j3wf3I: {
    displayName: "Hope",
    supportedLanguages: [
      "English",
      "Portuguese",
      "Spanish",
      "Czech",
      "Italian",
      "Turkish",
      "Russian",
      "Hindi",
      "Malay",
      "Finnish",
      "Slovak",
      "Romanian",
      "Dutch",
      "Croatian",
      "Swedish",
      "French",
      "Danish",
    ],
  },
  LWFgMHXb8m0uANBUpzlq: {
    displayName: "Saavi",
    supportedLanguages: [
      "Hindi",
      "Turkish",
      "Slovak",
      "Portuguese",
      "Ukrainian",
      "Malay",
      "Indonesian",
      "Romanian",
      "Spanish",
    ],
  },
  "9IzcwKmvwJcw58h3KnlH": {
    displayName: "Julian",
    supportedLanguages: ["English"],
  },
  LruHrtVF6PSyGItzMNHS: {
    displayName: "Benjamin",
    supportedLanguages: [
      "English",
      "Hindi",
      "Greek",
      "Spanish",
      "French",
      "Arabic",
      "Indonesian",
      "Romanian",
      "Filipino",
      "Russian",
      "Korean",
      "Finnish",
      "Czech",
      "Tamil",
      "Swedish",
      "Italian",
      "Norwegian",
    ],
  },
};
