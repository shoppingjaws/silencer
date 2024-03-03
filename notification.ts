import $ from 'https://deno.land/x/dax@0.39.2/mod.ts';
import { Reason, Type } from './config.ts';
import { Logger } from "./logger.ts";

type Notification = {
  subject: { title: string; type: Type; url: string };
  reason: Reason;
  repository: {full_name:string},
  url: string;
};

export const lsitNotifications = async (param?: string) => {
  const queryParam = param ? '?' + param : '';
  const notifications = JSON.parse(
    await $`gh api notifications${queryParam}`.text()
  ) as Notification[];
  return notifications
};

