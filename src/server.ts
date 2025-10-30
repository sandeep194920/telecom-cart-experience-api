import app from "./app";
import config from "./config";

const port = config.server.port;

app.listen(port, () => {
  console.log(
    `Server running at http://localhost:${port}/${config.api.basePath}`
  );
});
