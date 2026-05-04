#!/usr/bin/env node

/**
 * Semantic Versioning Calculator
 * 
 * Automatically calculates the next version based on:
 * - Conventional commits (feat:, fix:, breaking:)
 * - Current git tag
 * - User-specified versioning strategy
 * 
 * Output: Sets GitHub Actions outputs for workflow use
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COMMIT_PATTERNS = {
  BREAKING: /^(feat|fix|refactor)(\(.+\))?!:/,
  FEATURE: /^feat(\(.+\))?:/,
  BUGFIX: /^fix(\(.+\))?:/,
  CHORE: /^chore(\(.+\))?:/,
};

class SemanticVersionCalculator {
  constructor() {
    this.currentVersion = this.getCurrentVersion();
    this.commits = this.getCommitsSinceLastTag();
    this.versionBump = this.analyzeCommits();
  }

  /**
   * Get current version from git tags
   */
  getCurrentVersion() {
    try {
      const tag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0"')
        .toString()
        .trim();
      return tag.replace(/^v/, '');
    } catch {
      return '0.0.0';
    }
  }

  /**
   * Get all commits since last tag
   */
  getCommitsSinceLastTag() {
    try {
      const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""')
        .toString()
        .trim();
      
      let command = 'git log --oneline --pretty=format:"%s"';
      if (lastTag) {
        command += ` ${lastTag}..HEAD`;
      }
      
      const output = execSync(command, { encoding: 'utf-8' });
      return output.split('\n').filter(line => line.trim());
    } catch {
      return [];
    }
  }

  /**
   * Analyze commits to determine version bump
   */
  analyzeCommits() {
    const hasBreaking = this.commits.some(msg => 
      COMMIT_PATTERNS.BREAKING.test(msg)
    );
    const hasFeature = this.commits.some(msg => 
      COMMIT_PATTERNS.FEATURE.test(msg)
    );
    const hasBugfix = this.commits.some(msg => 
      COMMIT_PATTERNS.BUGFIX.test(msg)
    );

    if (hasBreaking) return 'major';
    if (hasFeature) return 'minor';
    if (hasBugfix) return 'patch';
    return 'none';
  }

  /**
   * Calculate next version
   */
  calculateNextVersion() {
    if (this.versionBump === 'none') {
      return this.currentVersion;
    }

    const [major, minor, patch] = this.currentVersion.split('.').map(Number);

    switch (this.versionBump) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        return this.currentVersion;
    }
  }

  /**
   * Get short commit SHA
   */
  getCommitSha() {
    try {
      return execSync('git rev-parse --short HEAD').toString().trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Generate outputs for GitHub Actions
   */
  generateOutputs() {
    const nextVersion = this.calculateNextVersion();
    const commitSha = this.getCommitSha();
    const shouldRelease = this.versionBump !== 'none';

    return {
      'current-version': this.currentVersion,
      'next-version': nextVersion,
      'version-bump': this.versionBump,
      'commit-sha': commitSha,
      'short-sha': commitSha.substring(0, 7),
      'should-release': shouldRelease ? 'true' : 'false',
      'git-tag': `v${nextVersion}`,
      'timestamp': new Date().toISOString(),
    };
  }

  /**
   * Write outputs to GitHub Actions format
   */
  writeGitHubOutputs(outputs) {
    const outputFile = process.env.GITHUB_OUTPUT;
    if (!outputFile) {
      // Fallback for local testing
      console.log('GitHub outputs (local test):');
      Object.entries(outputs).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      return;
    }

    Object.entries(outputs).forEach(([key, value]) => {
      const line = `${key}=${value}\n`;
      fs.appendFileSync(outputFile, line);
    });
  }

  /**
   * Run the calculator
   */
  run() {
    console.log('Analyzing commits for semantic versioning...');
    console.log(`  Current version: ${this.currentVersion}`);
    console.log(`  Version bump: ${this.versionBump}`);
    console.log(`  Commits since tag: ${this.commits.length}`);

    const outputs = this.generateOutputs();
    console.log('Generated outputs:');
    Object.entries(outputs).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    this.writeGitHubOutputs(outputs);
  }
}

// Run the calculator
try {
  const calculator = new SemanticVersionCalculator();
  calculator.run();
} catch (error) {
  console.error('Error calculating semantic version:', error.message);
  process.exit(1);
}
