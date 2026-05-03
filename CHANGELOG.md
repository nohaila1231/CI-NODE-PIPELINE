# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Conditional step execution based on file changes (e.g., skip tests if only docs changed)
- Integration with Slack notifications for workflow status
- Automatic dependency update detection
- Security scanning integration (Snyk, OWASP)

## [1.0.0] - 2024-01-15

### Added

- Initial release of Node.js CI/CD reusable workflow template
- Multi-version Node.js testing with configurable versions
- Support for npm, yarn, pnpm, and bun package managers
- Intelligent dependency caching for all package managers
- Code quality checks: linting and TypeScript type checking
- Code coverage reporting with Codecov integration
- Build artifact upload and management
- Pre/post hooks for install and build phases
- Input validation for JSON arrays and coverage thresholds
- Configurable test and build commands
- NPM registry publishing with authentication
- Comprehensive documentation with usage examples
- Matrix strategy for testing multiple Node versions
- Continue-on-error and fail-fast configuration options
- Support for private npm packages with npm-token secret

### Features in v1.0.0

#### Core Configuration
- `node-versions`: Multi-version testing support
- `working-directory`: Support for monorepo structures
- `package-manager`: Universal package manager support

#### Build & Test
- Customizable install, build, and test commands
- Pre-build and post-build hooks
- Type checking integration for TypeScript projects

#### Quality Assurance
- Integrated linting with configurable commands
- Code coverage with threshold validation
- Fail-on-warnings option for strict quality gates

#### Artifacts & Caching
- Build artifact uploading with retention policies
- Intelligent caching for npm, yarn, pnpm, and bun
- Configurable cache key prefixes

#### Publishing
- Automated NPM registry publishing
- Support for private npm registries
- Token-based authentication

#### Job Structure
- Validate job: Comprehensive input validation
- Test job: Matrix strategy for multiple Node versions
- Publish job: Conditional NPM publishing

### Security

- Support for npm authentication tokens via secrets
- Secure handling of npm registry tokens
- Environment variable protection for sensitive data

### Documentation

- Comprehensive README with quick start guide
- Detailed parameter tables with descriptions
- Real-world usage examples (basic, advanced, monorepo, publishing, bun)
- Troubleshooting section
- Migration guide from hardcoded workflows
- Best practices documentation

---

## Version History

### v1.0.0 Release Timeline

- **2024-01-15**: Initial production release
- **Testing**: Tested against real Node.js projects with npm, yarn, pnpm, and bun
- **Stability**: Ready for production use

---

## Upgrade Guide

### From v0.x to v1.0.0

v1.0.0 is the initial release, so no upgrades needed.

---

## Known Issues

None at this time. Please report issues via GitHub Issues.

---

## Future Roadmap

### v1.1.0 (Planned)

- [ ] Conditional step execution based on file changes
- [ ] GitHub comment integration for test results
- [ ] Automatic changelog generation from commits
- [ ] Performance benchmarking support

### v1.2.0 (Planned)

- [ ] Security scanning integration (Snyk, GitHub Advanced Security)
- [ ] Dependency update notifications
- [ ] Docker image building and pushing
- [ ] Release automation

### v2.0.0 (Future)

- [ ] Composite actions for sub-workflows
- [ ] Database integration support
- [ ] E2E testing framework integration
- [ ] Performance metrics collection

---

## Contributors

- v0 Template Generator (Initial release)

## How to Contribute

This is a reusable workflow template. To contribute:

1. Test with your own Node.js projects
2. Report issues or feature requests
3. Submit pull requests with improvements
4. Help improve documentation with real-world examples

---

## License

MIT - See LICENSE file for details
