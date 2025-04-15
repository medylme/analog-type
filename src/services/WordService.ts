import englishWords from '../static/languages/english.json';

interface LanguageData {
  name: string;
  orderedByFrequency: boolean;
  words: string[];
}

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
    if (count <= 0) return '';

    const selectedWords: string[] = [];

    // Get random words from the word list
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.words.length);
      selectedWords.push(this.words[randomIndex]);
    }

    // Save the current word set
    this.currentWordSet = selectedWords;

    return selectedWords.join(' ');
  }

  /**
   * Generates an infinite stream of words that can be used
   * for timed tests (returns enough words to guarantee the user
   * won't finish them all)
   */
  generateInfiniteWordSet(approximateWordCount: number = 200): string {
    // For timed tests, generate more words than they could possibly type
    const selectedWords: string[] = [];

    // Get random words from the word list
    for (let i = 0; i < approximateWordCount; i++) {
      const randomIndex = Math.floor(Math.random() * this.words.length);
      selectedWords.push(this.words[randomIndex]);
    }

    // Save the current word set
    this.currentWordSet = selectedWords;

    return selectedWords.join(' ');
  }

  /**
   * Add more words to the current word set, useful for
   * infinite typing tests to append as the user types
   */
  appendMoreWords(count: number = 20): string {
    if (count <= 0) return '';

    const additionalWords: string[] = [];

    // Get random words from the word list
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.words.length);
      additionalWords.push(this.words[randomIndex]);
    }

    // Add to the current word set
    this.currentWordSet = [...this.currentWordSet, ...additionalWords];

    return additionalWords.join(' ');
  }

  /**
   * Get the current word set as a string
   */
  getCurrentWordSet(): string {
    return this.currentWordSet.join(' ');
  }
}

export const wordService = new WordService();
export default wordService; 