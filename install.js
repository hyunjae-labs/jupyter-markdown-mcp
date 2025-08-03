#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🚀 Installing Notebook Convert MCP Server...\n');

// Get installation paths
const installDir = __dirname;
const homeDir = os.homedir();

// Platform-specific paths
const isWindows = process.platform === 'win32';
const configPath = isWindows 
  ? path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json')
  : path.join(homeDir, '.config', 'claude-code', 'claude_desktop_config.json');

const pythonCmd = isWindows ? 'python' : 'python3';

console.log('📍 Installation directory:', installDir);
console.log('🔧 Target config:', configPath);

// Check Python
try {
  const pythonVersion = execSync(`${pythonCmd} --version`, { encoding: 'utf8' });
  console.log('✅ Python found:', pythonVersion.trim());
} catch (error) {
  console.error('❌ Python not found. Please install Python 3.8+ first.');
  process.exit(1);
}

// Install Python dependencies
console.log('\n📦 Installing Python dependencies...');
try {
  execSync(`${pythonCmd} -m pip install nbformat`, { 
    stdio: 'inherit',
    cwd: installDir
  });
  console.log('✅ Python dependencies installed');
} catch (error) {
  console.error('❌ Failed to install Python dependencies');
  process.exit(1);
}

// Read or create config
let config = {};
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

// Ensure mcpServers object exists
if (!config.mcpServers) {
  config.mcpServers = {};
}

// Add notebook-convert-mcp configuration
const serverConfig = {
  command: pythonCmd,
  args: [path.join(installDir, 'mcp-server.py')],
  env: {
    PYTHONPATH: installDir,
    PYTHONIOENCODING: 'utf-8'
  }
};

config.mcpServers['notebook-convert'] = serverConfig;

// Write config back
try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ MCP configuration updated');
} catch (error) {
  console.error('❌ Failed to write config:', error.message);
  console.log('\n📝 Manual configuration required:');
  console.log('Add this to your Claude config:');
  console.log(JSON.stringify({ mcpServers: { 'notebook-convert': serverConfig } }, null, 2));
  process.exit(1);
}

console.log('\n🎉 Installation complete!');
console.log('\n📋 Next steps:');
console.log('1. Restart Claude Code CLI completely');
console.log('2. Look for: 🟢 notebook-convert - Connected (2 tools cached)');
console.log('3. Use convert_notebook and convert_markdown tools');

console.log('\n💡 Usage examples:');
console.log('• Convert notebook to markdown: "Use convert_notebook to convert my .ipynb files"');
console.log('• Convert markdown to notebook: "Use convert_markdown to convert .md to .ipynb"');

console.log('\n📚 Documentation: https://github.com/hyunjae-labs/notebook-convert-mcp');
console.log('🐛 Issues: https://github.com/hyunjae-labs/notebook-convert-mcp/issues');