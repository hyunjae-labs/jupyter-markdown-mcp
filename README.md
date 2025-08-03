# Notebook Convert MCP Server

Simple and focused MCP server for Jupyter Notebook ↔ Markdown conversion.

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

### 1. Install Dependencies

```bash
cd "{YOUR_PROJECT_PATH}/notebook-convert-mcp"
pip install -r requirements.txt
```

**Required package:**
- `nbformat` - For Jupyter Notebook processing

### 2. AI CLI Configuration

#### Claude Code CLI

##### macOS
`~/.config/claude-code/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "notebook-convert": {
      "command": "python3",
      "args": [
        "/{YOUR_PROJECT_PATH}/notebook-convert-mcp/mcp-server.py"
      ],
      "env": {
        "PYTHONPATH": "/{YOUR_PROJECT_PATH}/notebook-convert-mcp",
        "PYTHONIOENCODING": "utf-8"
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
    "notebook-convert": {
      "command": "python",
      "args": [
        "C:\\\\{YOUR_PROJECT_PATH}\\\\notebook-convert-mcp\\\\mcp-server.py"
      ],
      "env": {
        "PYTHONPATH": "C:\\\\{YOUR_PROJECT_PATH}\\\\notebook-convert-mcp",
        "PYTHONIOENCODING": "utf-8"
      }
    }
  }
}
```

### 3. Restart AI CLI

**Success confirmation:**
```
🟢 notebook-convert - Connected (2 tools cached)
  convert_notebook, convert_markdown
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

### Python Path Issues
```bash
# Check Python version
python3 --version  # macOS/Linux
python --version   # Windows

# Verify nbformat installation
python3 -c "import nbformat; print('nbformat OK')"  # macOS/Linux
python -c "import nbformat; print('nbformat OK')"   # Windows
```

### Permission Issues (macOS/Linux)
```bash
chmod +x /{YOUR_PROJECT_PATH}/notebook-convert-mcp/mcp-server.py
```

## Path Configuration

Replace `{YOUR_PROJECT_PATH}` with your actual path:

### macOS/Linux Examples
- `/Users/YourName/Projects/mcp-servers`
- `/home/username/development/mcp-servers`

### Windows Examples  
- `C:\\Users\\YourName\\Projects\\mcp-servers`
- `D:\\Development\\mcp-servers`

---

**Focus**: Simple, reliable Jupyter Notebook ↔ Markdown conversion for AI-enhanced development workflows.