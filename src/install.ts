#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ClaudeConfig, McpServerConfig } from './types';

function showVersion(): void {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  console.log(`jupyter-markdown-mcp v${packageJson.version}`);
}

function showHelp(): void {
  console.log('jupyter-markdown-mcp - Jupyter Notebook ↔ Markdown Converter');
  console.log('');
  console.log('Usage:');
  console.log('  jupyter-markdown-mcp install    Install MCP server configuration');
  console.log('  jupyter-markdown-mcp --version  Show version');
  console.log('  jupyter-markdown-mcp --help     Show this help');
  console.log('');
  console.log('Note: This is an installer tool. The actual MCP server runs via Node.js.');
}

async function runInstallation(): Promise<void> {
  console.log('🚀 Installing Jupyter Markdown MCP Server...\n');

  // Get installation paths
  const installDir = path.join(__dirname, '..');
  const homeDir = os.homedir();

  // Platform-specific paths for Claude Code CLI
  const configPath = path.join(homeDir, '.claude.json');

  console.log('📍 Installation directory:', installDir);
  console.log('🔧 Target config:', configPath);

  // Read or create config
  let config: ClaudeConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(configContent);
      console.log('✅ Existing config found');
    } catch (error) {
      console.log('⚠️  Invalid config found, creating new one');
      config = {};
    }
  } else {
    console.log('📄 Creating new config file');
    // Create directory if it doesn't exist
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  // Ensure mcpServers object exists for Claude Code CLI
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // Add jupyter-markdown-mcp configuration (use updated filename)
  const serverConfig: McpServerConfig = {
    type: 'stdio',
    command: 'node',
    args: [path.join(installDir, 'dist', 'index.js')],
    env: {
      NODE_ENV: 'production'
    }
  };

  config.mcpServers['jupyter-markdown-mcp'] = serverConfig;

  // Write config back
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ MCP configuration updated');
  } catch (error) {
    console.error('❌ Failed to write config:', (error as Error).message);
    console.log('\n📝 Manual configuration required:');
    console.log('Run this command manually:');
    console.log(`claude mcp add --scope user jupyter-markdown-mcp -- node ${path.join(installDir, 'dist', 'index.js')}`);
    process.exit(1);
  }

  console.log('\n🎉 Installation complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Restart Claude Code CLI completely');
  console.log('2. Look for: 🟢 jupyter-markdown-mcp - Connected (2 tools cached)');
  console.log('3. Use convert_notebook and convert_markdown tools');
  console.log('\n💡 Usage examples:');
  console.log('• Convert notebook to markdown: "Use convert_notebook to convert my .ipynb files"');
  console.log('• Convert markdown to notebook: "Use convert_markdown to convert .md to .ipynb"');
  console.log('\n📚 Documentation: https://github.com/hyunjae-labs/jupyter-markdown-mcp');
  console.log('🐛 Issues: https://github.com/hyunjae-labs/jupyter-markdown-mcp/issues');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle command line arguments
  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    return;
  }

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // Default behavior or explicit 'install' command
  if (args.length === 0 || args.includes('install')) {
    try {
      await runInstallation();
    } catch (error) {
      console.error('❌ Installation failed:', (error as Error).message);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${args.join(' ')}`);
    showHelp();
    process.exit(1);
  }
}

// Run the installer
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', (error as Error).message);
    process.exit(1);
  });
}