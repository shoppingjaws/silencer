import $ from 'https://deno.land/x/dax@0.39.2/mod.ts';
import { Notification } from 'src/notification.ts';
import { Logger } from 'src/logger.ts';
import { Action } from 'src/config.ts';
const cache = new Array<{ url: string; body: string }>();

export const fetchNotificationObject = async (s: Notification['subject']) => {
  switch (s.type) {
    case 'Issue':
      return await fetchGhIssue(s.url);
    case 'PullRequest':
      return fetchGhPullrequest(s.url);
    default:
      return undefined;
  }
};

export type GhIssue = {
  title: string;
  labels: { name: string }[];
  state: string;
};

export const fetchGhIssue = async (url: string) => {
  const res = (await ghCachedApi(url)) as unknown as GhIssue;
  return res;
};

export type GhPullrequest = {
  title: string;
  labels: { name: string }[];
  state: string;
  draft: boolean;
};

export const fetchGhPullrequest = async (url: string) => {
  const res = (await ghCachedApi(url)) as unknown as GhPullrequest;
  return res;
};

export const ghCachedApi = async (url: string, useCache = true) => {
  const hit = cache.find((f) => f.url === url);
  if (!hit && useCache) {
    Logger.debug(`API call: ${url}`);
    const res = await $`gh api ${url}`.text();
    cache.push({ url: url, body: res });
    return { url: url, body: res };
  } else {
    Logger.debug(`Cached API call: ${url}`);
    return hit;
  }
};

export const updateNotification = async (id: string, act: Action) => {
  if (act === 'done')
    await $`gh api --method DELETE https://api.github.com/notifications/threads/${id}`;
  else if (act === 'read')
    await $`gh api --method PATCH https://api.github.com/notifications/threads/${id}`;
};
