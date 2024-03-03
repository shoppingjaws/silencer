import { listNotifications } from './notification.ts';
import { markAsDone } from './github.ts';
import { Logger } from './logger.ts';
import { fetchGhIssueOrPr } from './github.ts';
import { globToRegExp } from 'https://deno.land/std@0.213.0/path/glob_to_regexp.ts';
import { markAsRead } from './github.ts';
import { config } from './config.ts';
import { DRY_RUN } from './cli.ts';

export const run = async () => {
  const rules = config.rules;

  const notifications = await listNotifications();

  Logger.debug(`notifications are found ${notifications.length}`);

  const tasks = notifications.map(async (n) => {
    const issuePrs = await fetchGhIssueOrPr(n.subject.url);
    return { n: n, fetched: issuePrs };
  });

  const data = await Promise.all(tasks);

  const readRule = rules.filter((r) => r.action === 'read');
  const doneRule = rules.filter((r) => r.action === 'done');

  const readTarget = data.filter((d) => {
    const matched = readRule.filter((r) => {
      return (
        globToRegExp(r.reason).test(d.n.reason) &&
        globToRegExp(r.repository).test(d.n.repository.full_name) &&
        globToRegExp(r.state).test(d.fetched.state) &&
        globToRegExp(r.type).test(d.n.subject.type)
      );
    });
    console.log(matched);
    if (matched.length > 0) return true;
    else return false;
  });
  const doneTarget = data.filter((d) =>
    doneRule.filter(
      (r) =>
        globToRegExp(r.reason).test(d.n.reason) &&
        globToRegExp(r.repository).test(d.n.repository.full_name) &&
        globToRegExp(r.state).test(d.n.repository.full_name) &&
        globToRegExp(r.type).test(d.n.subject.type)
    )
  );

  Logger.debug(
    `These notification will be done ${doneTarget.map((d) => d.n.url)}`
  );
  Logger.debug(
    `These notification will be read ${readTarget.map((r) => r.n.url)}`
  );

  if (DRY_RUN) Deno.exit(0);

  const readTasks = readTarget.map(async (r) => {
    await markAsRead(r.n.url);
  });

  const doneTasks = doneTarget.map(async (d) => {
    await markAsDone(d.n.url);
  });
  await Promise.all([...readTasks, ...doneTasks]);
};
