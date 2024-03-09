import { isIssueMatched, isPrMatched } from 'src/silencer.ts';
import { Rule } from 'src/config.ts';
import { assert } from 'https://deno.land/std@0.106.0/testing/asserts.ts';
import { GhIssue, GhPullrequest } from 'src/github.ts';

const pr: GhPullrequest = {
  title: 'issue title',
  labels: [{ name: 'good first issue' }, {name: "dev:web"}],
  state: 'open',
  draft: true,
};
Deno.test('Pr should be hit', () => {
  const r = {
    type: 'PullRequest',
    condition: {
      label: [],
      state: 'open',
      title: '*',
    },
  } as unknown as Rule;
  assert(isPrMatched(r, pr) === true);
});
Deno.test('Pr should not be hit', () => {
  const r = {
    type: 'PullRequest',
    condition: {
      label: [],
      state: 'open',
      title: '[WIP]*',
    },
  } as unknown as Rule;
  assert(isPrMatched(r, pr) === false);
});
Deno.test('Pr should be hit', () => {
  const r = {
    type: 'PullRequest',
    condition: {
      label: ["dev:*"],
      state: '*',
      title: '*',
    },
  } as unknown as Rule;
  assert(isPrMatched(r, pr) === true);
});

const issue: GhIssue = {
  title: 'issue title',
  labels: [{ name: 'good first issue' }, { name: 'dev:web' }],
  state: 'open',
};
Deno.test('Issue should not be hit', () => {
  const r = {
    type: 'Issue',
    condition: {
      label: ["good"],
      state: '*',
      title: '*',
    },
  } as unknown as Rule;
  assert(isIssueMatched(r, issue) === false);
});