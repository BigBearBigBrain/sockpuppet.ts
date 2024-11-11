import { SockpuppetPlus } from "./server/Plus.ts";
import { serveDir } from "@std/http/file-server";
import { Sockpuppet } from "./server/Sockpuppet.ts";

// import * as esbuild from "esbuild";
// import {denoPlugins} from "@luca/esbuild-deno-loader"

// await esbuild.build({
//   entryPoints: ["./testClient.ts"],
//   outfile: "./public/client.js",
//   bundle: true,
//   format: "esm",
//   loader: {
//     ".ts": "ts",
//     ".js": "js",
//   },
//   plugins: [
//     ...denoPlugins()
//   ],
// });

using sockpuppet = new Sockpuppet();

// sockpuppet.addHandler((req) => {
//   return serveDir(req, { fsRoot: "./public" });
// });
