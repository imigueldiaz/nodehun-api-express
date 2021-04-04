import express from "express";
import fs from "fs";
import path from "path";
import { Nodehun } from "nodehun";

var base = path.dirname(require.resolve("dictionary-es"));

const nodehun = new Nodehun(
  fs.readFileSync(path.join(base, "index.aff")),
  fs.readFileSync(path.join(base, "index.dic"))
);

export class OrderedWord {
  id: number;
  word: string;

  constructor(theId: number, theWord: string) {
    this.id = theId;
    this.word = theWord
      .trim()
      .replace(/[^A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff]/gi, "");
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

// rest of the code remains same
export const Api = express();
const PORT = 3000;
Api.get("/:words", async (req, res) => {
  try {
    //console.log(`Received from browser: ${req.params.words}`);
    let words = req.params.words.split(" ").map((item) => item);

    let orderedWords = new Array<OrderedWord>();
    let indexWord = 0;

    for (const word of words) {
      orderedWords.push(new OrderedWord(indexWord, word));
      indexWord++;
    }

    let response = new Array<AnalizedItem>();

    await Promise.all(
      orderedWords.map(async (item) => {
        let result = await analyze(item.word);
        response.push(new AnalizedItem(item, result));
      })
    );

    response.sort((a, b) => a.orderedWord.id - b.orderedWord.id);

    console.table(response);
    res.send(response);
  } catch (e) {
    res.send(e);
  }
});

async function analyze(word: string) {
  return await nodehun.analyze(word).then((result) => result);
}

Api.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
