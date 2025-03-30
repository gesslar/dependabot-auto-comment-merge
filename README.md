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
          # GitHub token with permissions to comment on PRs
          # For organization-wide access, use a personal access token
          token: ${{ secrets.GITHUB_TOKEN }}

          # Owner of the repositories (username or organization)
          # Default: current repository owner
          repo-owner: ${{ github.repository_owner }}

          # Comma-separated list of repositories to check for Dependabot PRs
          # If not set, all repositories of the owner will be processed
          # Example: "repo1,repo2,repo3"
          repositories: ${{ vars.DEPENDABOT_AUTO_COMMENT_REPOS }}

          # Comma-separated list of repositories to ignore
          # Useful when processing all repos but wanting to exclude specific ones
          # Example: "ignore-repo1,ignore-repo2"
          ignore-repositories: ${{ vars.DEPENDABOT_AUTO_COMMENT_IGNORE_REPOS }}

          # Dry run mode - if true, will only log actions without posting comments
          # Default: false
          dry-run: ${{ vars.DEPENDABOT_DRY_RUN }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `token` | GitHub token with permissions to comment on PRs. For accessing repositories across an organization, use a personal access token with appropriate permissions. | Yes | N/A |
| `repo-owner` | Repository owner (can be a username or organization name). Used to determine which repositories to scan for Dependabot PRs. | No | `${{ github.repository_owner }}` |
| `repositories` | Comma-separated list of repositories to check for Dependabot PRs. If not provided, all repositories of the owner will be checked. | No | All repos of owner |
| `ignore-repositories` | Comma-separated list of repositories to ignore. Useful when checking all repos but wanting to exclude a few. | No | None |
| `dry-run` | If set to "true", the action will log what it would do without actually posting comments. Useful for testing. | No | `false` |

## License

Unlicensed. Feel free to use this code in any way you like.
