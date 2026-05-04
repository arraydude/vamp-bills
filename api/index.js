import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handlerModule = require("../.vercel-build/api/index.cjs");

export default handlerModule.default ?? handlerModule;
