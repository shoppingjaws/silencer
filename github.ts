import $ from "https://deno.land/x/dax@0.39.2/mod.ts";
import { State } from "./config.ts";

const cache = new Array<{ url: string; body: string }>();

export const ghApi = async (url: string) => {
  const hit = cache.find((f) => f.url === url);
  if (!hit) {
    console.log("unhit");
    const res = await $`gh api ${url}`.text();
    cache.push({ url: url, body: res });
    return { url: url, body: res };
  } else {
    return hit;
  }
};

type IssueOrPr = {
  state: State;
};

export const fetchGhIssueOrPr = async (url: string) => {
  const res = await ghApi(url);
  return JSON.parse(res.body) as IssueOrPr;
};
export const markAsRead = async (url: string) => {
  await $`gh api --method PATCH ${url}`;
};

export const markAsDone = async (url: string) => {
  await $`gh api --method DELETE ${url}`;
};
