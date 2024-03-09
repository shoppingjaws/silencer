import { listNotifications } from 'src/notification.ts';
import getConfig, { Action } from 'src/config.ts';
import { Logger } from 'src/logger.ts';
import { checkStaticRules } from 'src/silencer.ts';
import { checkSubjectRules } from 'src/silencer.ts';
import { getConfigPath } from 'src/config.ts';
import { updateNotification } from 'src/github.ts';

export type RunOption = {
  dryRun?: boolean;
  param?: string;
};

const run = async (option: RunOption) => {
  const config = await getConfig();
  const notifications = await listNotifications(option.param);
  Logger.debug(`Config is loaded: from ${getConfigPath()}`);
  Logger.info(`Notificaitons : length = ${notifications.length}`);
  const staticCheckResultArray = notifications.map((n) =>
    checkStaticRules(n, config.rules)
  );
  const executionPlan: { id: string; action: Action }[] = [];
  for (const scr of staticCheckResultArray) {
    if (scr.matchedRules.length + scr.staticMatchedRules.length > 0)
      Logger.debug(
        `Notification[${scr.notification.id}}] got static evaluation: static=${
          scr.staticMatchedRules.length
        }, matched=${scr.matchedRules.length}, type=${
          scr.notification.subject.type
        }, reason=${
          scr.notification.reason
        }, title=${scr.notification.subject.title.slice(0, 15)}...`
      );
    const subjectCheckResult = await checkSubjectRules(
      scr.notification,
      scr.staticMatchedRules
    );
    for (const mr of scr.matchedRules) {
      Logger.debug(
        `\t└─ matched : description=${mr.description}, action=${mr.action}, priority=${mr.priority}`
      );
    }
    for (const sbcr of subjectCheckResult) {
      Logger.debug(
        `\t└─ subject : description=${sbcr.description}, action=${sbcr.action}, priority=${sbcr.priority}`
      );
    }
    const result = scr.matchedRules
      .concat(subjectCheckResult)
      .sort((a, b) => b.priority - a.priority);
    if (result.length > 0) {
      Logger.debug(
        `\t\t └─ result[${scr.notification.id}] : priority=${result[0].priority}, description=${result[0].description}, action=${result[0].action}`
      );
      executionPlan.push({ id: scr.notification.id, action: result[0].action });
    }
  }
  executionPlan.map((p) =>
    Logger.info(`Execution plan : id=${p.id}, action=${p.action}`)
  );
  if (option.dryRun) {
    Logger.info(`Silencer is closing: DryRun = ${option.dryRun}`);
    Deno.exit(0);
  }
  const updateTasks = executionPlan.map(
    async (p) => await updateNotification(p.id, p.action)
  );
  const result = await Promise.allSettled(updateTasks);
  const success = result.filter((r) => r.status === 'fulfilled');
  const failed = result.filter((r) => r.status === 'rejected');
  Logger.info(`${success.length} notificatioins are silenced!`);
  if (failed.length > 0)
    Logger.error(`${failed.length} notificatioins are failed to silence!`);
};

export default run;
