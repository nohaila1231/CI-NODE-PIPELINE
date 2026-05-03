#!/usr/bin/env node

/**
 * Changelog Generator
 * 
 * Generates CHANGELOG.md from git commit history
 * Supports conventional commit format
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ChangelogGenerator {
  constructor(options = {}) {
    this.changelogPath = options.changelogPath || 'CHANGELOG.md';
    this.repoUrl = options.repoUrl || this.getRepoUrl();
  }

  /**
   * Extract repository URL from git config
   */
  getRepoUrl() {
    try {
      return execSync('git config --get remote.origin.url')
        .toString()
        .trim()
        .replace(/\.git$/, '')
        .replace(/^git@github\.com:/, 'https://github.com/');
    } catch {
      return '';
    }
  }

  /**
   * Get commits since last tag
   */
  getCommitsSinceTag(tag = null) {
    try {
      const lastTag = tag || execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""')
        .toString()
        .trim();

      let command = 'git log --pretty=format:"%h|%s|%b|%ae|%ad" --date=short';
      if (lastTag) {
        command += ` ${lastTag}..HEAD`;
      } else {
        command += ' --all';
      }

      const output = execSync(command, { encoding: 'utf-8' });
      return output.split('\n').filter(line => line.trim()).map(line => {
        const [hash, subject, body, author, date] = line.split('|');
        return { hash, subject, body, author, date };
      });
    } catch {
      return [];
    }
  }

  /**
   * Parse conventional commit
   */
  parseCommit(commit) {
    const patterns = {
      breaking: /^(feat|fix|refactor)(\(.+\))?!: (.+)/,
      feature: /^feat(\((.+?)\))?: (.+)/,
      bugfix: /^fix(\((.+?)\))?: (.+)/,
      chore: /^chore(\((.+?)\))?: (.+)/,
      other: /^(.+)/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = commit.subject.match(pattern);
      if (match) {
        return {
          type,
          scope: match[2] || null,
          message: match[3] || match[1],
          hash: commit.hash,
          fullCommit: commit,
        };
      }
    }

    return {
      type: 'other',
      scope: null,
      message: commit.subject,
      hash: commit.hash,
      fullCommit: commit,
    };
  }

  /**
   * Generate changelog entry for version
   */
  generateVersionEntry(version, commits, date) {
    const grouped = this.groupCommits(commits);
    let entry = `## [${version}] - ${date}\n\n`;

    if (grouped.breaking.length > 0) {
      entry += '### ⚠️ Breaking Changes\n\n';
      grouped.breaking.forEach(commit => {
        entry += `- **${commit.scope || 'core'}**: ${commit.message} ([${commit.hash}](${this.repoUrl}/commit/${commit.hash}))\n`;
      });
      entry += '\n';
    }

    if (grouped.feature.length > 0) {
      entry += '### 🎉 Features\n\n';
      grouped.feature.forEach(commit => {
        entry += `- **${commit.scope || 'feature'}**: ${commit.message} ([${commit.hash}](${this.repoUrl}/commit/${commit.hash}))\n`;
      });
      entry += '\n';
    }

    if (grouped.bugfix.length > 0) {
      entry += '### 🐛 Bug Fixes\n\n';
      grouped.bugfix.forEach(commit => {
        entry += `- **${commit.scope || 'fix'}**: ${commit.message} ([${commit.hash}](${this.repoUrl}/commit/${commit.hash}))\n`;
      });
      entry += '\n';
    }

    if (grouped.chore.length > 0) {
      entry += '### 📦 Chores\n\n';
      grouped.chore.forEach(commit => {
        entry += `- **${commit.scope || 'chore'}**: ${commit.message} ([${commit.hash}](${this.repoUrl}/commit/${commit.hash}))\n`;
      });
      entry += '\n';
    }

    if (grouped.other.length > 0) {
      entry += '### Other Changes\n\n';
      grouped.other.forEach(commit => {
        entry += `- ${commit.message} ([${commit.hash}](${this.repoUrl}/commit/${commit.hash}))\n`;
      });
      entry += '\n';
    }

    return entry;
  }

  /**
   * Group commits by type
   */
  groupCommits(commits) {
    const grouped = {
      breaking: [],
      feature: [],
      bugfix: [],
      chore: [],
      other: [],
    };

    commits.forEach(commit => {
      const parsed = this.parseCommit(commit);
      if (grouped[parsed.type]) {
        grouped[parsed.type].push(parsed);
      }
    });

    return grouped;
  }

  /**
   * Load existing changelog
   */
  loadExistingChangelog() {
    if (fs.existsSync(this.changelogPath)) {
      return fs.readFileSync(this.changelogPath, 'utf-8');
    }
    return '';
  }

  /**
   * Generate full changelog
   */
  generateChangelog(version, date) {
    console.log(`Generating changelog for version ${version}...`);

    const commits = this.getCommitsSinceTag();
    if (commits.length === 0) {
      console.log('No commits found since last tag');
      return null;
    }

    const versionEntry = this.generateVersionEntry(version, commits, date);
    const existing = this.loadExistingChangelog();

    const header = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
    const newChangelog = header + versionEntry + existing.replace(/^# Changelog.*?\n\n/s, '');

    return newChangelog;
  }

  /**
   * Write changelog to file
   */
  writeChangelog(content) {
    if (!content) return false;

    fs.writeFileSync(this.changelogPath, content);
    console.log(`✓ Changelog written to ${this.changelogPath}`);
    return true;
  }

  /**
   * Run the generator
   */
  run(version, date = null) {
    const actualDate = date || new Date().toISOString().split('T')[0];
    const changelog = this.generateChangelog(version, actualDate);
    return this.writeChangelog(changelog);
  }
}

// Get version from command line or environment
const version = process.argv[2] || process.env.VERSION;
if (!version) {
  console.error('Usage: node changelog-generator.js <version> [date]');
  console.error('Or set VERSION environment variable');
  process.exit(1);
}

const date = process.argv[3];

try {
  const generator = new ChangelogGenerator();
  const success = generator.run(version, date);
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error('Error generating changelog:', error.message);
  process.exit(1);
}
