export type Type = "Issue" | "PullRequest";

export type Action = "done" | "read";

export type Reason =
  | "approval_requested"
  | "assign"
  | "author"
  | "comment"
  | "ci_activity"
  | "invitation"
  | "manual"
  | "member_feature_requested"
  | "mention"
  | "review_requested"
  | "security_alert"
  | "security_advisory_credit"
  | "state_change"
  | "subscribed"
  | "team_mention";

export type State = "closed" | "open";

export type Config = {
  rules: {
    repository: string;
    reason: Reason;
    state: State;
    type: Type;
    action: Action;
  }[];
  log: {
    file: "DEBUG" | "INFO";
    console: "DEBUG" | "INFO";
  };
};

export const config = JSON.parse(
  await Deno.readTextFile(`${Deno.env.get("HOME")}/.config/silencer/config.json`),
) as Config;
