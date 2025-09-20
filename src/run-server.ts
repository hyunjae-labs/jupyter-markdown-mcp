#!/usr/bin/env node

/**
 * MCP Server Launcher for jupyter-markdown-mcp
 * This script launches the TypeScript MCP server properly when called via npx
 */

import { spawn } from 'child_process';
import * as path from 'path';

// Get the directory where this script is located
const scriptDir = __dirname;
const serverScript = path.join(scriptDir, 'index.js');

// Set up environment variables
const env = {
  ...process.env,
  NODE_ENV: 'production'
};

// Spawn the Node process
const serverProcess = spawn('node', [serverScript], {
  stdio: 'inherit',
  env: env
});

// Handle exit
serverProcess.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle errors
serverProcess.on('error', (err) => {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
});

// Handle termination signals
process.on('SIGINT', () => {
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
});