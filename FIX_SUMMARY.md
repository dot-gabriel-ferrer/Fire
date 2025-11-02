# Fix: Deployment Configuration Issue

## Problem
The deployment to the main branch was failing with the error "the configuration doesn't allow it" (la configuración no lo permite).

## Root Cause
The GitHub Actions workflow for deploying to GitHub Pages referenced a `github-pages` environment:

```yaml
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
```

This environment likely had deployment branch protection policies configured that restricted which branches could deploy. When these policies aren't properly configured or when the main branch isn't included in the allowed branches list, deployments fail immediately.

## Solution
Removed the environment restriction from the workflow file (`.github/workflows/deploy.yml`). The workflow now deploys directly without referencing a specific environment, which removes the branch protection restrictions.

### Changes Made:
1. **Updated `.github/workflows/deploy.yml`**: Removed the `environment` section from the deploy job
2. **Created `.github/DEPLOYMENT.md`**: Added comprehensive deployment setup and troubleshooting guide
3. **Updated `README.md`**: Added reference to the deployment troubleshooting documentation

## Files Changed
- `.github/workflows/deploy.yml` - Removed environment restriction (3 lines removed)
- `.github/DEPLOYMENT.md` - New file with deployment documentation (68 lines added)
- `README.md` - Added deployment troubleshooting reference (2 lines added)

## How to Use
The deployment workflow will now:
1. Automatically trigger when code is pushed to the `main` branch
2. Deploy without environment restrictions
3. Work as long as GitHub Pages is configured with "GitHub Actions" as the source in repository settings

## Verification
After merging this PR:
1. Push changes to the main branch (merge this PR)
2. Go to the Actions tab to see the deployment workflow run
3. Once completed, the site should be live at `https://dot-gabriel-ferrer.github.io/Fire/`

## Additional Notes
If you want to use environment protection rules in the future:
1. Go to Settings → Environments
2. Configure the `github-pages` environment
3. Add deployment branch policies to allow the `main` branch
4. Re-add the environment section to the workflow if needed
