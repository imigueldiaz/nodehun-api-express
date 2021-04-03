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

app.get("/:palabra", async(req, res) => {
    try {
        let palabra = req.params.palabra;
        const test = await nodehun.analyze(palabra);
        res.send(test);
    } catch (e) {
        res.send(e);
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});