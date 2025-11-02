# Contributing to Fire Simulation Tool

Thank you for your interest in contributing to the Fire Simulation Tool!

## Development Setup

1. Fork and clone the repository
2. Open `index.html` in a modern web browser with WebGL support
3. Make your changes
4. Test thoroughly in multiple browsers

## Making Changes

### Code Style

- Follow existing code formatting
- Use meaningful variable names
- Add comments for complex shader logic
- Keep functions focused and modular

### Testing

Before submitting changes:
- Test in Chrome, Firefox, and Safari
- Verify WebGL functionality works correctly
- Check all export features (PNG, GIF)
- Ensure responsive design works on different screen sizes
- Test with different parameter values

## Submitting Changes

1. Create a descriptive branch name (e.g., `feature/new-shader`, `fix/particle-bug`)
2. Make focused commits with clear messages
3. Test your changes thoroughly
4. Push to your fork
5. Open a Pull Request with:
   - Clear description of changes
   - Screenshots/GIFs demonstrating the changes
   - Test results from different browsers

## Adding New Features

### New Shader

1. Add shader code to `shaders.js`
2. Register in `initializeShaders()` method
3. Add UI controls in `index.html`
4. Update documentation in README.md

### New Export Format

1. Extend `FireRecorder` class in `recorder.js`
2. Add UI button in `index.html`
3. Update documentation

## Deployment

This repository uses GitHub Pages for deployment. Changes to the `main` branch automatically trigger deployment via GitHub Actions.

See [.github/DEPLOYMENT.md](.github/DEPLOYMENT.md) for detailed deployment configuration.

## Code Review Process

All submissions require review. We use GitHub Pull Requests for this purpose.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
