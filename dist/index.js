const { execFile } = __nccwpck_require__(5317)
const util = __nccwpck_require__(9023)

const execFileAsync = util.promisify(execFile)
const mergeFlags = {
  merge: '--merge',
  rebase: '--rebase',
  squash: '--squash'
          const args = [
            'pr',
            'merge',
            pr.number.toString(),
            '--repo',
            `${repoOwner}/${repo}`,
            mergeFlags[mergeType],
            '--auto'
          ]

          const { stdout, stderr } = await execFileAsync('gh', args, {
            env: {
              ...process.env,
              GH_TOKEN: token,
              GITHUB_TOKEN: token
            }

          if(stdout) {
            core.info(stdout.trim())
          }
          if(stderr) {
            core.info(stderr.trim())
          }

          core.info(`  ✓ Triggered auto-merge on PR #${pr.number} with ${mergeType}`)
          core.info(`  ✓ [DRY RUN] Would run: gh pr merge ${pr.number} --repo ${repoOwner}/${repo} ${mergeFlags[mergeType]} --auto`)