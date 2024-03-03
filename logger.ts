import * as log from "https://deno.land/std@0.212.0/log/mod.ts";
import { SILENCER_HOME } from "./config.ts";


// 出力ファイル名
const filename = `${SILENCER_HOME}/silencer.log`;

// 出力フォーマット
const formatter = "{datetime} {levelName} {msg}";
await log.setup({
  handlers: {
    // console出力形式の定義
    console: new log.ConsoleHandler("DEBUG", {
      formatter,
    }),

    // file出力形式の定義
    file: new log.FileHandler("DEBUG", {
      filename,
      formatter,
    }),
  },

  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
  },
});

const Logger = log.getLogger();

export { Logger };