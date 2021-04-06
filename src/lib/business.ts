export class OrderedWord {
  id: number;
  word: string;

  constructor(theId: number, theWord: string) {
    this.id = theId;
    this.word = theWord.replace(
      /[^A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff]/gi,
      ""
    );
  }
}

export class AnalizedItem {
  orderedWord: OrderedWord;
  analysis: string[];

  constructor(theOrderedWord: OrderedWord, theAnalysis: string[]) {
    this.orderedWord = theOrderedWord;
    this.analysis = theAnalysis;
  }
}
