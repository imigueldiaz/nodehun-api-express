import fs from "fs";
import { Nodehun } from "nodehun";
import path from "path";
import { AnalizedItem, OrderedWord } from "./business";

var base = path.dirname(require.resolve("dictionary-es"));

const nodehun = new Nodehun(
  fs.readFileSync(path.join(base, "index.aff")),
  fs.readFileSync(path.join(base, "index.dic"))
);

export class HunspellAnalizer {
  orderedWords: Array<OrderedWord>;
  analizedItems: Array<AnalizedItem>;
  text: Buffer;

  constructor(myText: Buffer) {
    this.orderedWords = new Array<OrderedWord>();
    this.analizedItems = new Array<AnalizedItem>();
    this.text = myText;
  }

  public async hunspellize(): Promise<AnalizedItem[]> {
    let body = this.text.toString("utf-8");
    let words = body.split(" ").map((item: string) => item);

    let orderedWords = this.obtainListOfWords(words);

    return await this.obtainResponse(orderedWords);
  }

  private async obtainResponse(orderedWords: OrderedWord[]) {
    let response = new Array<AnalizedItem>();

    await Promise.all(
      orderedWords.map(async (item) => {
        let result = await this.analyzeWord(item.word);
        response.push(new AnalizedItem(item, result));
      })
    );

    response.sort((a, b) => a.orderedWord.id - b.orderedWord.id);
    return response;
  }

  private obtainListOfWords(words: string[]): OrderedWord[] {
    let orderedWords = new Array<OrderedWord>();

    Object.entries(words).forEach(([key, val]) =>
      orderedWords.push(new OrderedWord(parseInt(key), val))
    );

    return orderedWords;
  }

  private async analyzeWord(word: string): Promise<string[]> {
    return await nodehun.analyze(word).then((result) => result);
  }
}
