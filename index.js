const express = require("express");
const app = express();
const port = 3000;

const fs = require("fs");
const path = require("path");
const Nodehun = require("nodehun");

var base = path.dirname(require.resolve("dictionary-es"));

const nodehun = new Nodehun(
    fs.readFileSync(path.join(base, "index.aff")),
    fs.readFileSync(path.join(base, "index.dic"))
);

app.get("/:words", async(req, res) => {
    try {
        //console.log(`Received from browser: ${req.params.words}`);
        let words = req.params.words
            .split(" ")
            .map((item) =>
                item
                .trim()
                .replace(/[^A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff]/gi, "")
            );

        let orderedWords = [];
        let indexWord = 0;

        for (const word of words) {
            orderedWords.push({
                id: indexWord,
                word: word,
            });
            indexWord++;
        }

        let response = [];

        await Promise.all(
            orderedWords.map(async(item) => {
                let result = await analyze(item.word);
                response.push({ id: item.id, word: item.word, analyze: result });
            })
        );

        response.sort((a, b) => a.id - b.id);

        console.table(response);
        res.send(response);
    } catch (e) {
        res.send(e);
    }
});

async function analyze(word) {
    return await nodehun.analyze(word).then((result) => result);
}

app.listen(port, () => {
    console.log(`Nodehun REST API listening at http://localhost:${port}`);
});