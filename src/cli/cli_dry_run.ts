import run from 'cli/cli_run.ts';
import {RunOption} from "cli/cli_run.ts"

const dry_run = async (option:RunOption) => {
  await run(option);
};

export default dry_run