import { parseArgs } from 'https://deno.land/std@0.207.0/cli/parse_args.ts';
import { run } from './main.ts';
const flags = parseArgs(Deno.args, {
  boolean: ['dry-run'],
  default: { 'dry-run': false },
  string: ['init', 'run'],
});

export const DRY_RUN = flags['dry-run'];

if (flags.init!==undefined) {
  Deno.mkdirSync(`${Deno.env.get('HOME')}/.config/silencer`,{recursive:true});
  Deno.copyFileSync(
    './config/config.json',
    `${Deno.env.get('HOME')}/.config/silencer/`
  );
  Deno.exit(0)
} else {
  await run();
  Deno.exit(0)
}
