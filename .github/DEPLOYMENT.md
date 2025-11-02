# GitHub Pages Deployment Configuration

This repository is configured to automatically deploy to GitHub Pages using GitHub Actions.

## Initial Setup

To enable automatic deployment, you need to configure GitHub Pages in your repository settings:

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (in the repository menu)
3. Scroll down to the **Pages** section in the left sidebar
4. Click on **Pages**

### Step 2: Configure Source

Under **Build and deployment**:
1. Set **Source** to: **GitHub Actions**
   - This allows the workflow to deploy automatically

### Step 3: Deployment Branch (Optional)

If you're using an environment named `github-pages`:
1. Go to **Settings** → **Environments** 
2. Click on the `github-pages` environment
3. Under **Deployment branches**, ensure that `main` branch is allowed to deploy

## How It Works

The `.github/workflows/deploy.yml` workflow will:
- Trigger automatically when changes are pushed to the `main` branch
- Can also be triggered manually from the Actions tab
- Deploy the entire repository content to GitHub Pages

## Manual Deployment

To manually trigger a deployment:
1. Go to the **Actions** tab
2. Select the "Deploy to GitHub Pages" workflow
3. Click **Run workflow**
4. Select the `main` branch
5. Click **Run workflow**

## Troubleshooting

### Deployment Fails

If deployment fails with a message about configuration not allowing it:
- Ensure GitHub Pages is enabled in Settings → Pages
- Verify that the source is set to "GitHub Actions"
- Check that the workflow has the correct permissions (already configured)

### Environment Protection Rules

If you have an environment named `github-pages` with protection rules:
- Go to Settings → Environments → github-pages
- Check deployment branch policies to ensure `main` is allowed
- Or remove the environment reference from the workflow file

## Verification

After successful deployment, your site will be available at:
```
https://dot-gabriel-ferrer.github.io/Fire/
```

Check the Actions tab to see the deployment status and logs.
