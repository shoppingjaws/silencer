import $ from "https://deno.land/x/dax@0.39.2/mod.ts";
import {  Type } from "./config.ts";

export type Notification = {
  subject: { title: string; type: Type; url: string };
  reason: string;
  repository: { full_name: string };
  url: string;
  id: string;
};

export const listNotifications = async (param?: string) => {
  const queryParam = param ? "?" + param : "";
  const notifications = JSON.parse(
    await $`gh api notifications${queryParam}`.text(),
  ) as Notification[];
  return notifications;
};
