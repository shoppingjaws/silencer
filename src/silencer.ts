import { globToRegExp } from 'https://deno.land/std@0.213.0/path/glob_to_regexp.ts';
import { Rule } from 'src/config.ts';
import { Notification } from 'src/notification.ts';
import { fetchGhIssue, GhIssue } from 'src/github.ts';
import { fetchGhPullrequest } from 'src/github.ts';
import { GhPullrequest } from 'src/github.ts';

export const checkStaticRules = (
  notification: Notification,
  rules: Rule[]
): {
  notification: Notification;
  staticMatchedRules: Rule[];
  matchedRules: Rule[];
} => {
  // static condition check
  return {
    notification: notification,
    staticMatchedRules: rules.filter(
      // TODO: Combine matched and possible processing
      (r) => ['POSSIBLE'].includes(getStaticRuleMatchState(r, notification))
    ),
    matchedRules: rules.filter((r) =>
      ['TRUE'].includes(getStaticRuleMatchState(r, notification))
    ),
  };
};

// SubjectMatch : Is to be Rule matched notification to decided by notifications info and .[].subject redirected info
export const checkSubjectRules = async (
  notification: Notification,
  staticMatchedRules: Rule[]
) => {
  const res: Rule[] = [];
  for (const r of staticMatchedRules) {
    // should not be called in subject rule check
    if (r.condition === undefined) {
      res.push(r);
      break;
    }
    const isMatched = await isRuleMatched(r, notification);
    if (isMatched === true) {
      res.push(r);
      break;
    }
    break;
  }
  return res;
};

// StaticMatch : Is or is likely to be Rule matched notification decided by only notifications info
// Determine from Notification List and Rules values
// At this point, depending on the rule, it may not be possible to determine whether it is a target for Silencer.
const getStaticRuleMatchState = (
  rule: Rule,
  notification: Notification
): StaticRuleMatchState => {
  // static condition check
  const matched =
    globToRegExp(rule.repository).test(notification.repository.full_name) &&
    globToRegExp(rule.reason).test(notification.reason) &&
    globToRegExp(rule.type).test(notification.subject.type);
  if (rule.condition !== undefined && matched) return 'POSSIBLE';
  if (rule.condition === undefined && matched) return 'TRUE';
  return 'FALSE';
};

type StaticRuleMatchState = 'POSSIBLE' | 'FALSE' | 'TRUE';

const isRuleMatched = async (r: Rule, n: Notification): Promise<boolean> => {
  // .subject condition check
  switch (n.subject.type) {
    case 'Issue':
      return isIssueMatched(r, await fetchGhIssue(n.subject.url));

    case 'PullRequest':
      return isPrMatched(r, await fetchGhPullrequest(n.url));

    default:
      return false;
  }
};

export const isPrMatched = (r: Rule, pr: GhPullrequest): boolean => {
  return (
    globToRegExp(r.condition?.state ?? '').test(pr.state) &&
    globToRegExp(r.condition?.title ?? '').test(pr.title) &&
    (r.condition?.label ?? []).every((l) =>
      pr.labels.some((pl) => globToRegExp(l).test(pl.name))
    )
  );
};
export const isIssueMatched = (r: Rule, issue: GhIssue): boolean => {
  return (
    globToRegExp(r.condition?.state ?? '').test(issue.state) &&
    globToRegExp(r.condition?.title ?? '').test(issue.title) &&
    (r.condition?.label ?? []).every((l) =>
      issue.labels.some((il) => globToRegExp(l).test(il.name))
    )
  );
};
