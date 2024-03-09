export const compatibleObjects = ['Issue', 'PullRequest'] as const;
export type Type = (typeof compatibleObjects)[number];

export type Action = 'done' | 'read';

export type Rule = Config['rules'][number];
export type Config = {
  rules: ({
    priority: number;
    description: string;
    repository: string;
    reason: string;
    action: Action;
    type: Type;
  } & (
    | {
        type: 'PullRequest';
        condition?: {
          state?: string;
          title?: string;
          label?: string[];
        };
      }
    | {
        type: 'Issue';
        condition?: {
          state?: string;
          title?: string;
          label?: string[];
        };
      }
  ))[];
  log: {
    console: 'DEBUG' | 'INFO';
    file: 'DEBUG' | 'INFO';
  };
};

export const getConfigPath = ()=>{
  const SILENCER_HOME = Deno.env.get("SILENCER_HOME")
  return SILENCER_HOME ==="" || SILENCER_HOME===undefined ? `${Deno.env.get('HOME')}/.config/silencer` : `${SILENCER_HOME}`
}


export const getConfig = async () => {
  const config = JSON.parse(await Deno.readTextFile(`${getConfigPath()}/config.json`)) as Config;
  return config;
};

export default getConfig;
