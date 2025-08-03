#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function showVersion() {
    const packageJson = require('./package.json');
    console.log(`notebook-convert-mcp v${packageJson.version}`);
}

function showHelp() {
    console.log('notebook-convert-mcp - Jupyter Notebook ↔ Markdown Converter');
    console.log('');
    console.log('Usage:');
    console.log('  notebook-convert-mcp install    Install MCP server configuration');
    console.log('  notebook-convert-mcp --version  Show version');
    console.log('  notebook-convert-mcp --help     Show this help');
    console.log('');
    console.log('Note: This is an installer tool. The actual MCP server runs via Python.');
}

async function runInstallation() {
    console.log('🚀 Installing Notebook Convert MCP Server...\n');

    // Get installation paths
    const installDir = __dirname;
    const homeDir = os.homedir();

    // Platform-specific paths for Claude Code CLI
    const isWindows = process.platform === 'win32';
    const configPath = path.join(homeDir, '.claude.json');

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

    // Ensure mcpServers object exists for Claude Code CLI
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    // Add notebook-convert-mcp configuration (use updated filename)
    const serverConfig = {
      type: "stdio",
      command: pythonCmd,
      args: [path.join(installDir, 'mcp_server.py')],
      env: {
        PYTHONPATH: installDir,
        PYTHONIOENCODING: 'utf-8'
      }
    };

    config.mcpServers['notebook-convert-mcp'] = serverConfig;

    // Write config back
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('✅ MCP configuration updated');
    } catch (error) {
      console.error('❌ Failed to write config:', error.message);
      console.log('\n📝 Manual configuration required:');
      console.log('Run this command manually:');
      console.log(`claude mcp add --scope user notebook-convert-mcp -- ${pythonCmd} ${path.join(installDir, 'mcp_server.py')}`);
      process.exit(1);
    }

    console.log('\n🎉 Installation complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart Claude Code CLI completely');
    console.log('2. Look for: 🟢 notebook-convert-mcp - Connected (2 tools cached)');
    console.log('3. Use convert_notebook and convert_markdown tools');
    console.log('\n💡 Usage examples:');
    console.log('• Convert notebook to markdown: "Use convert_notebook to convert my .ipynb files"');
    console.log('• Convert markdown to notebook: "Use convert_markdown to convert .md to .ipynb"');
    console.log('\n📚 Documentation: https://github.com/hyunjae-labs/notebook-convert-mcp');
    console.log('🐛 Issues: https://github.com/hyunjae-labs/notebook-convert-mcp/issues');
}

async function main() {
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
            console.error('❌ Installation failed:', error.message);
            process.exit(1);
        }
    } else {
        console.error(`Unknown command: ${args.join(' ')}`);
        showHelp();
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
});