import { HunspellAnalizer } from "./lib/analyzer";
import express from "express";

import compression from "compression";
import Logger from "./lib/logger";
import morganMiddleware from "./config/morganMiddleware";

const Api = express();
const PORT = 3000;

Api.use(morganMiddleware);
Api.use(compression({ filter: shouldCompress }));
Api.use(express.raw({ inflate: true, limit: "100kb", type: "text/plain" }));

function shouldCompress(req: express.Request, res: express.Response) {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

Api.post("/analyze", async (req, res) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(204).end();
    return;
  }

  const analyzer = new HunspellAnalizer(req.body);

  const response = await analyzer.hunspellize();

  try {
    res.send(response);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    Logger.error(err.stack);
    res.end("An exception occurred");
  }
});

export const ApiServer = Api.listen(PORT, () => {
  Logger.info(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
