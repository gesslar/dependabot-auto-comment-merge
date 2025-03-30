const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
  try {
    // Get inputs
    const token = core.getInput('token', { required: true });
    const repoOwner = core.getInput('repo-owner');
    const repositories = core.getInput('repositories');
    const dryRun = core.getInput('dry-run').toLowerCase() === 'true';

    const octokit = github.getOctokit(token);

    // Get repositories to process
    let repos = [];
    if (repositories) {
      repos = repositories.split(',').map(repo => repo.trim());
      core.info(`Processing specific repositories: ${repos.join(', ')}`);
    } else {
      core.info(`Fetching all repositories for ${repoOwner}...`);
      const response = await octokit.rest.repos.listForUser({
        username: repoOwner,
        per_page: 100
      }).catch(async () => {
        // If user request fails, try as organization
        return await octokit.rest.repos.listForOrg({
          org: repoOwner,
          per_page: 100
        });
      });

      repos = response.data.map(repo => repo.name);
      core.info(`Found ${repos.length} repositories`);
    }

    // Process each repository
    for (const repo of repos) {
      core.info(`Checking ${repoOwner}/${repo}...`);

      // Get open PRs by Dependabot
      const { data: prs } = await octokit.rest.pulls.list({
        owner: repoOwner,
        repo: repo,
        state: 'open'
      });

      const dependabotPRs = prs.filter(pr => pr.user.login === 'dependabot[bot]');
      core.info(`Found ${dependabotPRs.length} open Dependabot PRs in ${repoOwner}/${repo}`);

      // Comment on each PR
      for (const pr of dependabotPRs) {
        core.info(`→ PR #${pr.number}: ${pr.title}`);

        if (!dryRun) {
          await octokit.rest.issues.createComment({
            owner: repoOwner,
            repo: repo,
            issue_number: pr.number,
            body: '@dependabot merge'
          });
          core.info(`  ✓ Commented on PR #${pr.number}`);
        } else {
          core.info(`  ✓ [DRY RUN] Would comment on PR #${pr.number}`);
        }
      }
    }

  } catch (error) {
    core.setFailed(error.message);
  }
})();
