/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
const { getInput, setFailed, info, debug } = require('@actions/core');
const { getOctokit } = require('@actions/github');

async function run() {
  try {
    // Get inputs
    const token = getInput('token', { required: true });
    const repoOwner = getInput('repo-owner');
    const repositories = getInput('repositories');
    const dryRun = getInput('dry-run').toLowerCase() === 'true';

    const octokit = getOctokit(token);

    // Get repositories to process
    let repos = [];
    if (repositories) {
      repos = repositories.split(',').map(repo => repo.trim());
      info(`Processing specific repositories: ${repos.join(', ')}`);
    } else {
      info(`Fetching all repositories for ${repoOwner}...`);
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
      info(`Found ${repos.length} repositories`);
    }

    // Process each repository
    for (const repo of repos) {
      info(`Checking ${repoOwner}/${repo}...`);

      // Get open PRs by Dependabot
      const { data: prs } = await octokit.rest.pulls.list({
        owner: repoOwner,
        repo: repo,
        state: 'open'
      });

      const dependabotPRs = prs.filter(pr => pr.user.login === 'dependabot[bot]');
      info(`Found ${dependabotPRs.length} open Dependabot PRs in ${repoOwner}/${repo}`);

      // Comment on each PR
      for (const pr of dependabotPRs) {
        info(`→ PR #${pr.number}: ${pr.title}`);

        if (!dryRun) {
          await octokit.rest.issues.createComment({
            owner: repoOwner,
            repo: repo,
            issue_number: pr.number,
            body: '@dependabot merge'
          });
          info(`  ✓ Commented on PR #${pr.number}`);
        } else {
          info(`  ✓ [DRY RUN] Would comment on PR #${pr.number}`);
        }
      }
    }

  } catch (error) {
    setFailed(error.message);
  }
}

run();

