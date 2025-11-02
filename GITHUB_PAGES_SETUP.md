# GitHub Pages Setup Guide

This repository is configured to automatically deploy to GitHub Pages using GitHub Actions.

## Enabling GitHub Pages

To enable GitHub Pages for this repository, follow these steps:

1. **Go to Repository Settings**
   - Navigate to your repository on GitHub: `https://github.com/dot-gabriel-ferrer/Fire`
   - Click on **Settings** tab

2. **Configure GitHub Pages**
   - In the left sidebar, click on **Pages** (under "Code and automation")
   - Under **Source**, select **GitHub Actions**
   - The workflow is already configured in `.github/workflows/deploy-pages.yml`

3. **Merge this Pull Request**
   - Merge this PR to the `main` branch
   - The GitHub Actions workflow will automatically deploy the site

4. **Access Your Site**
   - After the workflow completes, your site will be available at:
   - `https://dot-gabriel-ferrer.github.io/Fire/`

## Automatic Deployment

The workflow is configured to automatically deploy:
- **On push to main branch**: Automatically deploys when changes are pushed to `main`
- **Manual trigger**: Can be triggered manually from the Actions tab using "workflow_dispatch"

## Workflow Configuration

The deployment workflow (`.github/workflows/deploy-pages.yml`) performs the following:
1. Checks out the repository code
2. Configures GitHub Pages settings
3. Uploads all files as a Pages artifact
4. Deploys the artifact to GitHub Pages

## What Gets Deployed

All files in the repository root are deployed, including:
- `index.html` - Main application page
- `main.js` - Application logic
- `shaders.js` - WebGL shader code
- `particles.js` - Particle system
- `recorder.js` - Export functionality
- `styles.css` - Styling
- `demos/` - Demo GIFs and assets
- All documentation files

## Verifying Deployment

After merging to `main`, you can:
1. Go to the **Actions** tab in your repository
2. Click on the latest **Deploy to GitHub Pages** workflow run
3. Wait for all steps to complete (should show green checkmarks)
4. Click on the deployment URL shown in the workflow summary

## Local Testing

To test the site locally before deployment:
1. Open `index.html` directly in a modern web browser, or
2. Use a local web server:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js (if you have npx installed)
   npx serve
   ```
3. Navigate to `http://localhost:8000` in your browser

## Troubleshooting

### Pages Not Enabled
- Ensure GitHub Pages is enabled in Settings → Pages
- Ensure source is set to "GitHub Actions"

### Workflow Fails
- Check the Actions tab for error details
- Verify permissions are set correctly in repository settings

### Site Not Updating
- Ensure changes are pushed to the `main` branch
- Check that the workflow completed successfully
- GitHub Pages can take a few minutes to update

## Additional Notes

- The site is completely static and requires no build step
- WebGL support is required in the browser to view the fire simulation
- All assets are served directly from the repository

For more information about GitHub Pages, visit: https://docs.github.com/pages
