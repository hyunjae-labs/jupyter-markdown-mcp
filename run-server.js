#!/usr/bin/env node

/**
 * MCP Server Launcher for notebook-convert-mcp
 * This script launches the Python MCP server properly when called via npx
 */

const { spawn } = require('child_process');
const path = require('path');

// Get the directory where this script is located
const scriptDir = __dirname;
const pythonScript = path.join(scriptDir, 'mcp_server.py');

// Check if Python is available
const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

// Set up environment variables
const env = {
  ...process.env,
  PYTHONPATH: scriptDir,
  PYTHONIOENCODING: 'utf-8',
  PYTHONUNBUFFERED: '1'
};

// Spawn the Python process
const pythonProcess = spawn(pythonCommand, [pythonScript], {
  stdio: 'inherit',
  env: env
});

// Handle exit
pythonProcess.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle errors
pythonProcess.on('error', (err) => {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
});

// Handle termination signals
process.on('SIGINT', () => {
  pythonProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  pythonProcess.kill('SIGTERM');
});