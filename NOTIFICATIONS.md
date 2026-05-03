# Notifications Setup Guide

This guide explains how to configure workflow notifications to alert your team of build status, deployments, and security issues.

## Overview

The notification system supports:

- **Success notifications** - Builds completed successfully
- **Failure notifications** - Tests failed, security issues found
- **Deployment notifications** - Code deployed to environments
- **Security alerts** - Vulnerabilities discovered
- **Custom notifications** - Using the Slack notifier script

## Supported Channels

### Slack (Recommended)

Most comprehensive support with rich formatting and interaction.

**Advantages**:
- Rich formatting with colors and attachments
- Easy integration with Slack workflows
- Low-cost, widely used in teams

### Microsoft Teams

Can send notifications via Teams webhooks.

**Advantages**:
- Works with Office 365
- Desktop and mobile apps
- Integration with Teams workflows

### Email

GitHub-native email notifications (requires GitHub account).

**Advantages**:
- No external service needed
- Works with any email
- Built into GitHub

## Setting Up Slack Notifications

### Step 1: Create Slack Webhook

1. Go to your Slack workspace
2. Open Slack App Directory
3. Search for "Incoming Webhooks"
4. Click **Add to Slack**
5. Select channel to receive notifications
6. Click **Add Incoming Webhooks Integration**


### Step 2: Add Webhook as Repository Secret

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Click **New repository secret**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Paste the webhook URL
5. Click **Add secret**

### Step 3: Enable Notifications in Workflow

```yaml
- name: Run Node.js Template
  uses: your-org/node-ci-template/.github/workflows/node-template.yml@main
  with:
    enable-notifications: 'true'
    notify-on-success: 'false'  # Optional
    notify-on-failure: 'true'
    slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Slack Notification Examples

**Success Notification**:
```
✅ Workflow Completed
━━━━━━━━━━━━━━━━━━━━━━
Workflow: build-and-test
Job: Test
Branch: main
Duration: 5m 32s
Author: @john-doe
```

**Failure Notification**:
```
❌ Workflow Failed
━━━━━━━━━━━━━━━━━━━━━━
Workflow: build-and-test
Branch: feature/login
Commit: abc123d
Author: @jane-smith
```

**Deployment Notification**:
```
🚀 Deployment Successful
━━━━━━━━━━━━━━━━━━━━━━
Environment: production
Version: v1.2.3
Duration: 3m 12s
```

## Setting Up Microsoft Teams

### Step 1: Create Teams Webhook

1. Open Microsoft Teams
2. Go to desired channel
3. Click **...** (More options) > **Connectors**
4. Search for "Incoming Webhook"
5. Click **Configure**
6. Name: "GitHub Actions"
7. Copy the **webhook URL**

### Step 2: Add Webhook as Secret

1. Go to repository **Settings** > **Secrets**
2. Add secret: `TEAMS_WEBHOOK_URL`
3. Paste the webhook URL

### Step 3: Create Custom Notification Step

Add a notification step to your workflow:

```yaml
- name: Notify Teams
  if: always()
  uses: jdcargile/ms-teams-notification@v1.3
  with:
    github-token: ${{ github.token }}
    ms-teams-webhook-uri: ${{ secrets.TEAMS_WEBHOOK_URL }}
    notification-color: ${{ job.status == 'success' && '28a745' || 'dc3545' }}
    failure-text: "Build failed in ${{ github.repository }}"
    success-text: "Build succeeded in ${{ github.repository }}"
```

## Email Notifications (GitHub Native)

### Configure Email Notifications

1. Go to **Settings** > **Notifications** (personal)
2. Set email address for notifications
3. Enable "Workflows" notifications

### Watch Repository for Notifications

1. Go to repository main page
2. Click **Watch**
3. Select **Custom** 
4. Check **Actions**
5. Ensure notifications are enabled in personal settings

## Using the Slack Notifier Script

The template includes a `slack-notifier.js` script for custom notifications.

### Syntax

```bash
node scripts/slack-notifier.js <event-type> [options-json]
```

### Event Types

- `success` - Build/deploy succeeded
- `failure` - Build/deploy failed
- `deployment` - Deployment completed
- `security` - Security alert

### Examples

**Success Notification**:
```bash
node scripts/slack-notifier.js success \
  '{"workflowName":"Build","runNumber":"123","branch":"main","author":"John Doe"}'
```

**Failure Notification**:
```bash
node scripts/slack-notifier.js failure \
  '{"workflowName":"Build","runNumber":"123","branch":"main","author":"Jane Smith"}'
```

**Deployment Notification**:
```bash
node scripts/slack-notifier.js deployment \
  '{"deploymentEnv":"production","workflowName":"Deploy","runNumber":"456"}'
```

**Security Alert**:
```bash
node scripts/slack-notifier.js security \
  '{"workflowName":"Security Scan","runNumber":"789","jobName":"Vulnerabilities Found"}'
```

## Advanced Notification Customization

### Custom Notification Fields

The Slack notifier supports these fields:

```javascript
{
  "status": "success|failure|deployment|security",
  "title": "Custom title",
  "workflowName": "Workflow name",
  "jobName": "Job name",
  "runNumber": "Run #123",
  "runUrl": "https://github.com/...",
  "branch": "main",
  "commit": "abc123d",
  "commitMessage": "feat: add new feature",
  "author": "john-doe",
  "duration": "5m 32s",
  "deploymentEnv": "production",
  "deploymentUrl": "https://api.example.com",
  "customFields": [
    {"title": "Custom", "value": "Data", "short": true}
  ]
}
```

### Creating Custom Notification Job

Add to workflow:

```yaml
notify-custom:
  name: Send Custom Notification
  runs-on: ubuntu-latest
  needs: [test, deploy]
  if: always()
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'

    - name: Send notification
      run: |
        node scripts/slack-notifier.js success \
          '{
            "workflowName": "${{ github.workflow }}",
            "runNumber": "${{ github.run_number }}",
            "runUrl": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}",
            "branch": "${{ github.ref_name }}",
            "commit": "${{ github.sha }}",
            "author": "${{ github.actor }}",
            "customFields": [
              {"title": "Deployed Version", "value": "v1.2.3", "short": true},
              {"title": "Build Time", "value": "5m 32s", "short": true}
            ]
          }'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Notification Conditions

Send notifications only under certain conditions:

```yaml
- name: Notify on main branch only
  if: github.ref == 'refs/heads/main'
  run: node scripts/slack-notifier.js success

- name: Notify on failure
  if: failure()
  run: node scripts/slack-notifier.js failure

- name: Notify on security findings
  if: contains(needs.security.outputs.findings, 'critical')
  run: node scripts/slack-notifier.js security
```

## Filtering Notifications

### Only Notify on Main Branch

```yaml
with:
  notify-on-success: 'false'  # Only for main
```

And in workflow:

```yaml
- name: Notify
  if: github.ref == 'refs/heads/main' && inputs.notify-on-success == 'true'
  run: node scripts/slack-notifier.js success
```

### Only Notify on Release

```yaml
- name: Notify release
  if: startsWith(github.ref, 'refs/tags/v')
  run: node scripts/slack-notifier.js success
```

### Only Notify on Failed Security Scans

```yaml
- name: Notify security issues
  if: needs.security.result == 'failure'
  run: node scripts/slack-notifier.js security
```

## Troubleshooting

### Notifications Not Arriving

**Issue**: Slack notification step runs but no message in Slack

**Solutions**:
1. Verify webhook URL is correct (copy from Slack settings again)
2. Check webhook is for the correct channel
3. Ensure `SLACK_WEBHOOK_URL` secret is set in repository settings
4. Look for HTTP errors in workflow logs (status code 500, etc.)
5. Verify webhook hasn't been revoked

### Notifications Are Delayed

**Issue**: Notifications arrive several minutes after workflow completes

**Solutions**:
1. This is normal for GitHub Actions - slight delay is expected
2. Check if you have many concurrent workflows running
3. Reduce notification payload size if very large
4. Verify Slack isn't rate-limiting webhooks

### Wrong Information in Notification

**Issue**: Notification shows incorrect branch, commit, or author

**Solutions**:
1. Verify GitHub context variables are correct
2. Check that you're not using cached values
3. Ensure conditional logic for notifications is correct
4. Look at actual values in workflow logs

### Cannot Create Slack Webhook

**Issue**: Incoming Webhook option not available in Slack

**Solutions**:
1. Verify you have admin rights in Slack workspace
2. Check that Incoming Webhook app hasn't been disabled
3. Use OAuth tokens as alternative (more complex)
4. Contact Slack workspace admin for help

## Best Practices

1. **Notify on failures always** - Set `notify-on-failure: 'true'`
2. **Optional success notifications** - Set `notify-on-success: 'false'` to reduce noise
3. **Include context** - Add branch, author, commit info
4. **Use threaded notifications** - Group related messages
5. **Mention on-call** - Tag relevant teams in production alerts
6. **Archive channels** - Keep a record of notifications for debugging
7. **Alert on security** - Always notify security findings immediately
8. **Customize per environment** - Different notifications for prod vs dev
9. **Limit rate** - Don't notify for every test, only final result
10. **Test notifications** - Do a test deployment to verify messages

## See Also

- [Slack Incoming Webhooks Documentation](https://api.slack.com/messaging/webhooks)
- [GitHub Actions Status Check API](https://docs.github.com/en/rest/checks/runs)
- [GitHub Notifications](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications)
