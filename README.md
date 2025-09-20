# Jupyter Markdown MCP Server

> **🎉 Now in TypeScript!** Version 1.3.0 is a complete TypeScript rewrite. No Python required!
> **📢 Migration Notice**: This package was previously named `notebook-convert-mcp`. If you have the old package installed, please uninstall it and install `jupyter-markdown-mcp` instead.

Native TypeScript MCP server for seamless Jupyter Notebook ↔ Markdown conversion with perfect cell preservation.

## Features

| Feature | Description | Support |
|---------|-------------|---------|
| **Notebook → Markdown** | `.ipynb` → `.md` (clean, metadata-free) | ✅ All Platforms |
| **Markdown → Notebook** | `.md` → `.ipynb` (executable) | ✅ All Platforms |

## Why This Tool?

**Problem**: Jupyter Notebooks contain massive metadata that overwhelms AI analysis:
- Code execution results (often hundreds of lines)
- Base64 encoded images 
- Kernel information, cell IDs, output metadata
- AI models struggle to focus on actual content

**Solution**: Clean conversion for AI-friendly analysis:
- **Notebook → Markdown**: Strip all metadata, keep only code and markdown content
- **Markdown → Notebook**: Convert back to executable notebooks when needed

## Installation

### Quick Install (Recommended)

```bash
# Install globally
npm install -g jupyter-markdown-mcp

# Run the installer
jupyter-markdown-mcp install
```

**That's it!** No Python required - pure TypeScript implementation.

### Claude Code CLI Installation

#### Option 1: Using NPX (No installation needed)
```bash
claude mcp add --scope user jupyter-markdown-mcp -- npx jupyter-markdown-mcp@latest
```

#### Option 2: Using NPM Global Install
```bash
# Install globally first
npm install -g jupyter-markdown-mcp

# Then add to Claude Code CLI
claude mcp add --scope user jupyter-markdown-mcp -- jupyter-markdown-mcp
```

### Manual Installation

#### 1. Install Dependencies

```bash
cd "{YOUR_PROJECT_PATH}/jupyter-markdown-mcp"
npm install
npm run build
```

**No Python dependencies required!** Built with TypeScript and Node.js.

### 2. AI CLI Configuration

#### Claude Code CLI

##### macOS
`~/.config/claude-code/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "jupyter-markdown": {
      "command": "node",
      "args": [
        "/{YOUR_PROJECT_PATH}/jupyter-markdown-mcp/dist/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

##### Windows
`%APPDATA%\\Claude\\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "jupyter-markdown": {
      "command": "node",
      "args": [
        "C:\\\\{YOUR_PROJECT_PATH}\\\\jupyter-markdown-mcp\\\\dist\\\\index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 3. Restart AI CLI

**Success confirmation:**
```
🟢 jupyter-markdown - Connected (2 tools cached)
  convert_notebook, convert_markdown
```

## Verify Installation

```bash
# Check installed version
npm list -g jupyter-markdown-mcp

# Verify MCP connection
claude mcp list
# Should show: jupyter-markdown-mcp - ✓ Connected
```

## Usage Examples

### Notebook → Markdown (AI Analysis)
```
Convert all notebooks in the project folder to markdown for AI analysis.
Use convert_notebook to convert .ipynb files to clean markdown format.
```

**What happens:**
- Removes all execution outputs and metadata
- Converts code cells to ```python blocks
- Preserves markdown cells as-is
- Result: Clean, AI-friendly markdown files

### Markdown → Notebook (Development)
```
Convert markdown document back to executable notebook.
Use convert_markdown to convert tutorial.md into a working notebook.
```

**What happens:**
- Detects ```python code blocks automatically
- Converts code blocks to executable code cells
- Converts other content to markdown cells
- Result: Fully functional Jupyter Notebook

## Practical Workflow

### For Machine Learning Projects
```bash
# 1. Convert notebooks to markdown for AI analysis
convert_notebook(
  source_path="/{YOUR_PROJECT_PATH}/analysis_notebook.ipynb",
  output_dir="/{YOUR_PROJECT_PATH}/markdown_docs/"
)

# 2. AI analyzes clean markdown (no metadata noise)
# 3. Modify/improve content with AI help

# 4. Convert back to executable notebook
convert_markdown(
  source_path="/{YOUR_PROJECT_PATH}/markdown_docs/improved_analysis.md", 
  output_dir="/{YOUR_PROJECT_PATH}/notebooks/"
)
```

### Benefits
- **Clean AI Analysis**: No metadata interference
- **Bidirectional**: Seamless conversion both ways  
- **Preserves Content**: Code and markdown integrity maintained
- **Universal**: Works on all platforms (macOS, Windows, Linux)

## Troubleshooting

### Node.js Version
```bash
# Check Node.js version (requires v14 or higher)
node --version

# Verify installation
node -e "console.log('Node.js OK')"
```

### Build Issues
```bash
# Rebuild if needed
npm run build

# Check build output
ls dist/
```

## Path Configuration

Replace `{YOUR_PROJECT_PATH}` with your actual path:

### macOS/Linux Examples
- `/Users/YourName/Projects/mcp-servers`
- `/home/username/development/mcp-servers`

### Windows Examples  
- `C:\\Users\\YourName\\Projects\\mcp-servers`
- `D:\\Development\\mcp-servers`

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### Latest: Version 1.3.0 (2025-01-20)
- **Complete TypeScript rewrite** - No Python required!
- **Native performance** - Faster execution with Node.js
- **Type safety** - Full TypeScript type definitions
- **Added**: Cell boundary markers (`<!-- NOTEBOOK_CELL_BOUNDARY -->`) to maintain cell structure
- **Improved**: Enhanced markdown-to-notebook parsing to respect cell boundaries
- **Result**: Perfect round-trip conversion with no cell merging

### Version 1.1.2
- Initial stable release with basic conversion functionality

---

**Focus**: Simple, reliable Jupyter Notebook ↔ Markdown conversion for AI-enhanced development workflows.