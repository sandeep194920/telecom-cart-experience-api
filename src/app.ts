import express from "express";
import { json } from "express";

import router from "./routes";
import { errorHandler } from "./middleware/ErrorHandling";
import config from "./config";

const app = express();

app.use(json());

app.use(config.api.basePath, router);

app.use(errorHandler);

export default app;
