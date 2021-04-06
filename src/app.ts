import express from "express";
import fs from "fs";
import { Nodehun } from "nodehun";
import path from "path";
import compression from "compression";
import Logger from "./lib/logger";
import morganMiddleware from './config/morganMiddleware'

var base = path.dirname(require.resolve("dictionary-es"));

require('dotenv').config()

const nodehun = new Nodehun(
  fs.readFileSync(path.join(base, "index.aff")),
  fs.readFileSync(path.join(base, "index.dic"))
);

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

const Api = express();
const PORT = 3000;

Api.use(morganMiddleware)
Api.use(compression({ filter: shouldCompress }));

function shouldCompress(req: express.Request, res: express.Response) {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

Api.get("/:words", async (req, res) => {
  try {
    let words = req.params.words.split(" ").map((item) => item);

    let orderedWords = obtainListOfWords(words);

    let response = await obtainResponse(orderedWords);

    res.send(response);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    Logger.error(err.stack);
    res.end("An exception occurred");
  }
});

async function obtainResponse(orderedWords: OrderedWord[]) {
  let response = new Array<AnalizedItem>();

  await Promise.all(
    orderedWords.map(async (item) => {
      let result = await analyze(item.word);
      response.push(new AnalizedItem(item, result));
    })
  );

  response.sort((a, b) => a.orderedWord.id - b.orderedWord.id);
  return response;
}

function obtainListOfWords(words: string[]) {
  let orderedWords = new Array<OrderedWord>();

  Object.entries(words).forEach(([key, val]) =>
    orderedWords.push(new OrderedWord(parseInt(key), val))
  );

  return orderedWords;
}

async function analyze(word: string) {
  return await nodehun.analyze(word).then((result) => result);
}

export const ApiServer = Api.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
