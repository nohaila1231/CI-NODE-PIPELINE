#!/usr/bin/env node

/**
 * Slack Notification Helper
 * 
 * Sends workflow status notifications to Slack
 * Supports various event types: success, failure, deployment, etc.
 */

const https = require('https');
const path = require('path');

class SlackNotifier {
  constructor(webhookUrl) {
    if (!webhookUrl) {
      throw new Error('Slack webhook URL is required');
    }
    this.webhookUrl = webhookUrl;
  }

  /**
   * Format workflow status
   */
  getStatusEmoji(status) {
    const emojis = {
      success: '✅',
      failure: '❌',
      cancelled: '⏹️',
      deployment: '🚀',
      security: '🔒',
    };
    return emojis[status] || '📋';
  }

  /**
   * Get status color for Slack message
   */
  getStatusColor(status) {
    const colors = {
      success: '#36a64f',
      failure: '#ff0000',
      cancelled: '#ffaa00',
      deployment: '#0099ff',
      security: '#ff6600',
    };
    return colors[status] || '#808080';
  }

  /**
   * Build Slack message payload
   */
  buildPayload(options = {}) {
    const {
      status = 'success',
      title = 'GitHub Actions Workflow',
      workflowName = 'Workflow',
      jobName = 'Job',
      runNumber = '',
      runUrl = '',
      branch = '',
      commit = '',
      commitMessage = '',
      author = '',
      duration = '',
      artifactUrl = '',
      deploymentEnv = '',
      deploymentUrl = '',
      customFields = [],
    } = options;

    const fields = [
      {
        title: 'Workflow',
        value: workflowName,
        short: true,
      },
      {
        title: 'Job',
        value: jobName,
        short: true,
      },
    ];

    if (branch) {
      fields.push({
        title: 'Branch',
        value: `\`${branch}\``,
        short: true,
      });
    }

    if (commit) {
      fields.push({
        title: 'Commit',
        value: `\`${commit}\``,
        short: true,
      });
    }

    if (commitMessage) {
      fields.push({
        title: 'Message',
        value: commitMessage,
        short: false,
      });
    }

    if (author) {
      fields.push({
        title: 'Author',
        value: author,
        short: true,
      });
    }

    if (duration) {
      fields.push({
        title: 'Duration',
        value: duration,
        short: true,
      });
    }

    if (deploymentEnv) {
      fields.push({
        title: 'Environment',
        value: deploymentEnv,
        short: true,
      });
    }

    if (deploymentUrl) {
      fields.push({
        title: 'Deployment URL',
        value: deploymentUrl,
        short: false,
      });
    }

    // Add custom fields
    fields.push(...customFields);

    // Build message
    const message = {
      text: `${this.getStatusEmoji(status)} ${title}`,
      attachments: [
        {
          color: this.getStatusColor(status),
          title: `${status.charAt(0).toUpperCase() + status.slice(1)}${runNumber ? ` - Run #${runNumber}` : ''}`,
          title_link: runUrl || undefined,
          fields: fields,
          footer: 'GitHub Actions',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    return message;
  }

  /**
   * Send message to Slack
   */
  send(payload) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      };

      const req = https.request(this.webhookUrl, options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ success: true, body });
          } else {
            reject(new Error(`Slack API returned status ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Notify workflow success
   */
  notifySuccess(options) {
    const payload = this.buildPayload({
      ...options,
      status: 'success',
      title: options.title || '✅ Workflow Completed',
    });
    return this.send(payload);
  }

  /**
   * Notify workflow failure
   */
  notifyFailure(options) {
    const payload = this.buildPayload({
      ...options,
      status: 'failure',
      title: options.title || '❌ Workflow Failed',
    });
    return this.send(payload);
  }

  /**
   * Notify deployment
   */
  notifyDeployment(options) {
    const payload = this.buildPayload({
      ...options,
      status: 'deployment',
      title: options.title || '🚀 Deployment Successful',
    });
    return this.send(payload);
  }

  /**
   * Notify security alert
   */
  notifySecurityAlert(options) {
    const payload = this.buildPayload({
      ...options,
      status: 'security',
      title: options.title || '🔒 Security Alert',
    });
    return this.send(payload);
  }
}

// Parse command line arguments
const webhookUrl = process.env.SLACK_WEBHOOK_URL;
const eventType = process.argv[2];
const optionsJson = process.argv[3];

if (!webhookUrl) {
  console.error('Error: SLACK_WEBHOOK_URL environment variable is not set');
  process.exit(1);
}

if (!eventType) {
  console.error('Usage: node slack-notifier.js <event-type> [options-json]');
  console.error('Event types: success, failure, deployment, security');
  process.exit(1);
}

try {
  const options = optionsJson ? JSON.parse(optionsJson) : {};

  const notifier = new SlackNotifier(webhookUrl);
  const method = `notify${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`;

  if (typeof notifier[method] !== 'function') {
    console.error(`Unknown event type: ${eventType}`);
    process.exit(1);
  }

  notifier[method](options)
    .then(() => {
      console.log(`✓ Slack notification sent for ${eventType} event`);
    })
    .catch((error) => {
      console.error(`✗ Failed to send Slack notification: ${error.message}`);
      process.exit(1);
    });
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

module.exports = SlackNotifier;
