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

app.get("/:palabras", async(req, res) => {
    try {
        let palabras = req.params.palabras.split(" ").map((item) => item.trim());
        console.log(JSON.stringify(palabras));

        let response = [];

        await Promise.all(
            palabras.map(async(palabra) => {
                let result = await analyze(palabra);
                response.push(result);
            })
        );

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