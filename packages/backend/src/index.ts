import { createApp } from "./app.ts";
import { env } from "./env.ts";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`backend listening on http://localhost:${env.PORT}`);
});
