import * as log from 'https://deno.land/std@0.212.0/log/mod.ts';
import getConfig from "./config.ts";
import { getConfigPath } from "./config.ts";

// 出力ファイル名
const filename = `${getConfigPath()}/silencer.log`;

const logConfig = (await getConfig()).log

// 出力フォーマット
const dateTime = new Date().toLocaleString('en-US', {
  dateStyle: 'short',
  timeStyle: 'medium',
});
const formatter = `${dateTime} {levelName} {msg}`;

await log.setup({
    handlers: {
      // console出力形式の定義
      console: new log.ConsoleHandler(logConfig.console, {
        formatter,
      }),
      // file出力形式の定義
      file: new log.FileHandler(logConfig.file, {
        filename,
        formatter,
      }),
    },

    loggers: {
      default: {
        level: 'DEBUG',
        handlers: ['console', 'file'],
      },
    },
  });


const Logger = log.getLogger();

export { Logger };
