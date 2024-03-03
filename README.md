```json
{
  "rules": [
    {
      "repository": "*/*", // matches any repository
      "reason": "mentioned", // receiving notification because of the mention
      "state": "closed", // if the notification subject is closed
      "type": "*",
      "action": "done" // mark done
    },
    {
      "repository": "octcat/*", // apply action to the octcat all repositories
      "reason": "*",
      "state": "open",
      "type": "*",
      "action": "done"
    }
  ]
}
```

### Repository

`*/*` = all repositories `*/dotfiles` = all repositories that named dotfiles
`octcat/*` = all repositories that octcat owned

### State

state is obtained by `gh api notifications | jq '.[].subject.url'` by further
calling `gh api ${url} | jq '.state'`

### Reason

definition of _reason_ is
[here](https://docs.github.com/rest/activity/notifications?apiVersion=2022-11-28#about-notification-reasons)

### Type

currently support type are "Issue" and "PullRequest".

definition of type is `gh api notifications | jq '.[].subject.type'`
