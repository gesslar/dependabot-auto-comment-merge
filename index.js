const core = require('@actions/core')
const github = require('@actions/github')

const commands = {
  merge: ["@dependabot merge"],
  rebase: ["@dependabot rebase", "@dependabot merge"],
  squash: ["@dependabot squash and merge"]
}

;(async() => {

  try {
    // Get inputs
    const token = core.getInput('token', { required: true })
    const repoOwner = core.getInput('repo-owner')
    const repositories = core.getInput('repositories')
    const ignoreRepositories = core.getInput('ignore-repositories')
    const dryRun = core.getInput('dry-run').toLowerCase() === 'true'
    const mergeType = core.getInput('merge-type') || 'merge'

    // Validate merge type
    const validMergeTypes = ['merge', 'rebase', 'squash']
    if(!validMergeTypes.includes(mergeType)) {
      throw new Error(`Invalid merge-type: ${mergeType}. Must be one of: ${validMergeTypes.join(', ')}`)
    }

    const octokit = github.getOctokit(token)

    // Parse repositories to ignore
    const ignoreRepos = ignoreRepositories
      ? ignoreRepositories.split(',').map(repo => repo.trim())
      : []

    if(ignoreRepos.length > 0) {
      core.info(`Ignoring repositories: ${ignoreRepos.join(', ')}`)
    }

    // Get repositories to process
    let repos = []
    if(repositories) {
      repos = repositories.split(',').map(repo => repo.trim())
      core.info(`Processing specific repositories: ${repos.join(', ')}`)
    } else {
      core.info(`Fetching all repositories for ${repoOwner}...`)
      const response = await octokit.rest.repos.listForUser({
        username: repoOwner,
        per_page: 100
      }).catch(async() => {
        // If user request fails, try as organization
        return await octokit.rest.repos.listForOrg({
          org: repoOwner,
          per_page: 100
        })
      })

      repos = response.data.map(repo => repo.name)
      core.info(`Found ${repos.length} repositories`)
    }

    // Filter out ignored repositories
    repos = repos.filter(repo => !ignoreRepos.includes(repo))
    core.info(`After filtering ignored repos, processing ${repos.length} repositories`)

    // Process each repository
    for(const repo of repos) {
      core.info(`Checking ${repoOwner}/${repo}...`)

      // Get open PRs by Dependabot
      const { data: prs } = await octokit.rest.pulls.list({
        owner: repoOwner,
        repo: repo,
        state: 'open'
      })

      const dependabotPRs = prs.filter(pr => pr.user.login === 'dependabot[bot]')
      core.info(`Found ${dependabotPRs.length} open Dependabot PRs in ${repoOwner}/${repo}`)

      // Comment on each PR
      for(const pr of dependabotPRs) {
        core.info(`→ PR #${pr.number}: ${pr.title}`)

        if(!dryRun) {
          await octokit.rest.issues.createComment({
            owner: repoOwner,
            repo: repo,
            issue_number: pr.number,
            body: commands[mergeType].join("\n")
          })
          core.info(`  ✓ Commented on PR #${pr.number} with ${commands[mergeType].join(", ")}`)
        } else {
          core.info(`  ✓ [DRY RUN] Would comment on PR #${pr.number} with "${commands[mergeType].join(", ")}"`)
        }
      }
    }

  } catch(error) {
    core.setFailed(error.message)
  }
})()
