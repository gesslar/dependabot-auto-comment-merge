# Dependabot Auto Comment Merge

A GitHub Action that automatically comments `@dependabot merge` on open Dependabot PRs to trigger auto-merging.

## Usage

```yaml
name: Auto-merge Dependabot PRs

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:       # Manual trigger

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    steps:
      - name: Auto Comment Dependabot PRs
        uses: gesslar/dependabot-auto-comment-merge@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          # Optional parameters:
          # repo-owner: "alternative-owner"
          # repositories: "repo1,repo2,repo3"
          # dry-run: "true"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `token` | GitHub token with permissions to comment on PRs | Yes | N/A |
| `repo-owner` | Repository owner (can be an organization) | No | `${{ github.repository_owner }}` |
| `repositories` | Comma-separated list of repositories to check | No | All repos of owner |
| `dry-run` | If true, will not actually post comments | No | `false` |

## License

ISC
