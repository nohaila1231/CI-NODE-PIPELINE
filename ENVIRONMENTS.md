# Multi-Environment Deployment Guide

This guide explains how to set up and use the multi-environment deployment feature of the Node.js CI/CD template for dev, staging, and production environments.

## Overview

The template supports deploying to multiple environments with:

- Environment-specific configuration
- Separate credentials per environment
- Manual approval gates for production
- Different deployment strategies per environment
- Environment-specific variables and secrets

## Environment Types

The template supports three standard environments:

### Development (dev)
- **Purpose**: Rapid iteration and testing
- **Approval**: None required
- **Triggers**: On every successful test
- **Data**: Non-production, can be reset
- **Updates**: Continuous deployment

### Staging (staging)
- **Purpose**: Pre-production testing
- **Approval**: Optional (recommended)
- **Triggers**: On demand or after release
- **Data**: Mirrors production, sensitive
- **Updates**: Gated, scheduled

### Production (prod)
- **Purpose**: Live environment
- **Approval**: Required (manual review)
- **Triggers**: On demand, rarely automatic
- **Data**: Real user data, critical
- **Updates**: Careful, coordinated

## Setting Up Environments

### Step 1: Create GitHub Environments

Go to your repository **Settings** > **Environments**:

#### Development Environment
1. Click **New environment**
2. Name: `dev`
3. Skip protection rules (development is open)
4. Add environment variables and secrets

#### Staging Environment
1. Click **New environment**
2. Name: `staging`
3. Protection rules (optional):
   - Deployment branches: `refs/heads/main`
   - Required reviewers: 1 (optional)
4. Add environment secrets

#### Production Environment
1. Click **New environment**
2. Name: `prod`
3. Protection rules (highly recommended):
   - Deployment branches: `refs/heads/main`
   - Required reviewers: 2+ (recommend for critical apps)
   - Timeout: 1-7 days for approval decision
4. Add environment secrets
5. Add team or users as required reviewers

### Step 2: Add Environment Secrets

For each environment, add deployment-specific secrets:

**Development**:
```
DEV_API_KEY=dev_key_xxx
DEV_DATABASE_URL=postgresql://dev.internal/db
DEV_LOG_LEVEL=debug
```

**Staging**:
```
STAGING_API_KEY=staging_key_xxx
STAGING_DATABASE_URL=postgresql://staging.internal/db
STAGING_LOG_LEVEL=info
STAGING_WEBHOOK_URL=https://staging.example.com/webhooks
```

**Production**:
```
PROD_API_KEY=prod_key_xxx
PROD_DATABASE_URL=postgresql://prod.aws.internal/db
PROD_LOG_LEVEL=warn
PROD_WEBHOOK_URL=https://api.example.com/webhooks
DATADOG_API_KEY=xxx
```

### Step 3: Configure Workflow

Enable deployment in your workflow:

```yaml
- name: Run Node.js Template
  uses: your-org/node-ci-template/.github/workflows/node-template.yml@main
  with:
    enable-deployment: 'true'
    target-environment: 'dev'
    deployment-command: 'npm run deploy:dev'
```

## Deployment Commands

Define deployment scripts in `package.json`:

```json
{
  "scripts": {
    "deploy:dev": "node scripts/deploy.js --env=dev",
    "deploy:staging": "node scripts/deploy.js --env=staging",
    "deploy:prod": "node scripts/deploy.js --env=prod"
  }
}
```

Example `scripts/deploy.js`:

```javascript
#!/usr/bin/env node

const environment = process.argv[2].split('=')[1];
const config = {
  dev: {
    target: 'dev.example.com',
    apiKey: process.env.DEV_API_KEY,
    databaseUrl: process.env.DEV_DATABASE_URL,
  },
  staging: {
    target: 'staging.example.com',
    apiKey: process.env.STAGING_API_KEY,
    databaseUrl: process.env.STAGING_DATABASE_URL,
  },
  prod: {
    target: 'api.example.com',
    apiKey: process.env.PROD_API_KEY,
    databaseUrl: process.env.PROD_DATABASE_URL,
  },
};

const env = config[environment];
console.log(`Deploying to ${environment}...`);
console.log(`Target: ${env.target}`);

// Your deployment logic here
// - Build application
// - Run migrations
// - Deploy to target environment
// - Run smoke tests
// - Notify team
```

## Deployment Workflow

### Development Deployment

Automatic deployment on every test pass:

```
Push to branch
    ↓
Tests pass
    ↓
Deploy to dev automatically
    ↓
Smoke tests run
    ↓
Notification sent
```

### Staging Deployment

Manual or gated deployment:

```
Merge to main
    ↓
Create release
    ↓
Request staging deployment
    ↓
Tests pass (rerun)
    ↓
Reviewer approves (1-2 people)
    ↓
Deploy to staging
    ↓
Integration tests run
    ↓
Notify stakeholders
```

### Production Deployment

Highly controlled with approval gates:

```
Release created
    ↓
Request prod deployment
    ↓
Multiple reviewers approve (2+)
    ↓
Scheduled time window
    ↓
Final automated checks
    ↓
Deploy to production
    ↓
Health checks
    ↓
Notify on-call engineer
```

## Approval Gates

### Setting Up Required Approval

1. Go to **Settings** > **Environments** > **prod**
2. Under "Deployment branches", enable protection
3. Under "Required reviewers", check the box
4. Enter number of required reviewers (recommend 2)
5. Add users or teams who must approve

### Approving a Deployment

1. Go to **Actions** tab
2. Find the workflow run
3. Scroll to "Review deployments"
4. Select environment
5. Add comment (optional)
6. Click **Approve and deploy**

### Auto-Approval (Not Recommended)

For dev environment only:

```yaml
Auto-approve: No (use manual for all environments)
```

## Using Environment Variables

### In Workflow

```yaml
- name: Deploy
  env:
    API_KEY: ${{ secrets.PROD_API_KEY }}
    LOG_LEVEL: ${{ vars.PROD_LOG_LEVEL }}
  run: npm run deploy:prod
```

### In Application Code

```javascript
const apiKey = process.env.PROD_API_KEY;
const target = process.env.PROD_DEPLOYMENT_TARGET;
const logLevel = process.env.LOG_LEVEL || 'info';

console.log(`Deploying to ${target} with log level ${logLevel}`);
```

## Conditional Deployments

Deploy only to specific environment based on branch:

```yaml
deploy-to-env:
  runs-on: ubuntu-latest
  steps:
    - name: Determine target environment
      id: env
      run: |
        if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
          echo "target=prod" >> $GITHUB_OUTPUT
        elif [[ "${{ github.ref }}" == "refs/heads/staging" ]]; then
          echo "target=staging" >> $GITHUB_OUTPUT
        else
          echo "target=dev" >> $GITHUB_OUTPUT
        fi

    - name: Deploy
      run: npm run deploy:${{ steps.env.outputs.target }}
```

## Monitoring Deployments

### Deployment History

1. Go to **Deployments** tab (in main repo page)
2. View all environment deployments
3. See deployment history and status
4. Rollback if needed

### View Logs

1. Go to **Actions** tab
2. Find workflow run
3. Check "Deploy to [environment]" job
4. View real-time logs

### Health Checks

Add post-deployment health checks:

```javascript
// After deployment
async function healthCheck(environment) {
  const config = {
    dev: 'https://dev.example.com/health',
    staging: 'https://staging.example.com/health',
    prod: 'https://api.example.com/health',
  };

  const response = await fetch(config[environment]);
  if (response.status === 200) {
    console.log(`✓ ${environment} is healthy`);
  } else {
    throw new Error(`${environment} health check failed`);
  }
}
```

## Rollback Procedures

### Manual Rollback

1. Go to **Deployments** tab
2. Select previous successful deployment
3. Click **Re-deploy**
4. Confirm

### Automated Rollback on Error

```yaml
- name: Run post-deployment tests
  run: npm run test:e2e:prod
  continue-on-error: false

- name: Rollback on failure
  if: failure()
  run: npm run rollback:prod
```

## Troubleshooting

### Deployment Won't Start

**Issue**: Deployment job never runs

**Solutions**:
1. Check `enable-deployment: 'true'` is set
2. Verify environment exists in GitHub Settings
3. Check that tests passed (deployment needs test success)
4. View workflow logs for errors

### Approval Not Triggering

**Issue**: Environment requires approval but button doesn't appear

**Solutions**:
1. Check that `target-environment` matches an actual GitHub Environment
2. Ensure at least one required reviewer is configured
3. Verify you have permission to trigger deployments
4. Try refreshing the page

### Environment Variables Not Available

**Issue**: Deployment script can't access environment variables

**Solutions**:
1. Verify secrets are added to the correct environment (not repo-level)
2. Check names match exactly (case-sensitive)
3. Ensure secret values are valid
4. Verify workflow has permission to access environment

### Wrong Environment Deployed

**Issue**: Deployment went to prod instead of staging

**Solutions**:
1. Check `target-environment` input in workflow
2. Verify conditional logic if using branch-based decisions
3. Review approval logs to see what was actually approved
4. Use environment-specific deployment commands to avoid confusion

## Best Practices

1. **Use separate environments** - Never mix dev/prod data or credentials
2. **Require approvals for production** - Always gate production deployments
3. **Automate lower environments** - Dev should deploy frequently
4. **Use descriptive secrets** - Include environment prefix (PROD_, STAGING_)
5. **Monitor deployments** - Always check health after deployment
6. **Have rollback procedure** - Know how to quickly revert bad deployments
7. **Document environment differences** - Keep README on what varies per env
8. **Rotate secrets regularly** - Update API keys and tokens periodically
9. **Restrict access** - Limit who can approve production deployments
10. **Log everything** - Enable comprehensive logging in all environments

## See Also

- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Deployment Status API](https://docs.github.com/en/rest/deployments)
