import { LanguageData } from "@/types/services/WordServiceTypes";

import englishWords from "@/static/languages/english.json";

class WordService {
  private words: string[];
  private languageData: LanguageData;
  private currentWordSet: string[] = [];

  constructor() {
    this.languageData = englishWords as LanguageData;
    this.words = this.languageData.words;
  }

  /**
   * Generates a random set of words with the specified count
   */
  generateWordSet(count: number): string {
    if (count <= 0) return "";

    let selectedWords: string[] = [];

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.words.length);
      selectedWords.push(this.words[randomIndex]);
    }

    // Remove repeated words
    selectedWords = selectedWords.filter(
      (word, index, self) => self.indexOf(word) === index
    );

    this.currentWordSet = selectedWords;

    return selectedWords.join(" ");
  }

  /**
   * Add more words to an existing word set
   */
  appendMoreWords(count: number = 20): string {
    if (count <= 0) return "";

    const additionalWords: string[] = [];

    // Get random words from the word list
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.words.length);
      additionalWords.push(this.words[randomIndex]);
    }

    // Add to the current word set
    this.currentWordSet = [...this.currentWordSet, ...additionalWords];

    return additionalWords.join(" ");
  }

  /**
   * Get the current word set as a string
   */
  getCurrentWordSet(): string {
    return this.currentWordSet.join(" ");
  }
}

export const wordService = new WordService();
export default wordService;
