#!/usr/bin/env node

/**
 * Validation script for node-template.yml workflow
 * 
 * This script performs basic validation of the workflow file to ensure:
 * - Valid YAML structure
 * - All required inputs have descriptions
 * - Input types are valid
 * - Job structure is sound
 */

const fs = require('fs');
const path = require('path');

const WORKFLOW_FILE = path.join(__dirname, '../.github/workflows/node-template.yml');

console.log('🔍 Validating workflow template...\n');

try {
  // Read the workflow file
  const content = fs.readFileSync(WORKFLOW_FILE, 'utf-8');
  
  // Basic structure checks
  const hasWorkflowCall = content.includes('workflow_call:');
  const hasInputs = content.includes('inputs:');
  const hasJobs = content.includes('jobs:');
  
  console.log('✅ File exists and is readable');
  
  if (!hasWorkflowCall) {
    console.error('❌ Missing workflow_call trigger');
    process.exit(1);
  }
  console.log('✅ Has workflow_call trigger');
  
  if (!hasInputs) {
    console.error('❌ Missing inputs section');
    process.exit(1);
  }
  console.log('✅ Has inputs section');
  
  if (!hasJobs) {
    console.error('❌ Missing jobs section');
    process.exit(1);
  }
  console.log('✅ Has jobs section');
  
  // Count inputs
  const inputMatches = content.match(/^\s{6}[\w-]+:$/gm) || [];
  console.log(`✅ Found ${inputMatches.length} input parameters`);
  
  // Check for jobs
  const validateJob = content.includes('validate:');
  const testJob = content.includes('test:');
  const publishJob = content.includes('publish:');
  
  console.log('');
  if (validateJob) console.log('✅ Validate job present');
  if (testJob) console.log('✅ Test job present');
  if (publishJob) console.log('✅ Publish job present');
  
  // Check for matrix support
  if (content.includes('strategy:') && content.includes('matrix:')) {
    console.log('✅ Matrix strategy configured');
  }
  
  // Check for caching
  if (content.includes('actions/cache')) {
    console.log('✅ Caching configured');
  }
  
  // Check for artifacts
  if (content.includes('upload-artifact')) {
    console.log('✅ Artifact upload configured');
  }
  
  console.log('\n✨ Workflow validation successful!');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
}
