# -*- coding: utf-8 -*-
from pathlib import Path
import nbformat
import logging
import re

# Logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def convert_ipynb_to_md(source_path: str, output_dir: str) -> dict:
    """
    Convert Jupyter Notebook (.ipynb) file to Markdown (.md).
    Code cell execution results (outputs) are excluded.
    """
    try:
        source_file = Path(source_path)
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        output_file = output_path / f"{source_file.stem}.md"

        logging.info(f"Starting conversion of '{source_file.name}' to Markdown...")

        with open(source_file, 'r', encoding='utf-8') as f:
            notebook = nbformat.read(f, as_version=4)

        markdown_content = []
        for cell in notebook.cells:
            if cell.cell_type == 'markdown':
                markdown_content.append(cell.source)
                markdown_content.append('\n')
            elif cell.cell_type == 'code':
                markdown_content.append('```python')
                markdown_content.append(cell.source)
                markdown_content.append('```\n')
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(markdown_content))

        logging.info(f"Conversion successful. File location: {output_file}")
        return {"status": "success", "output_path": str(output_file)}

    except Exception as e:
        logging.error(f"ipynb conversion failed: {e}")
        return {"status": "error", "message": str(e)}

def convert_md_to_ipynb(source_path: str, output_dir: str) -> dict:
    """
    Convert Markdown (.md) files to Jupyter Notebook (.ipynb).
    Code blocks are converted to code cells, everything else to markdown cells.
    """
    try:
        source_file = Path(source_path)
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        output_file = output_path / f"{source_file.stem}.ipynb"

        logging.info(f"Starting conversion of '{source_file.name}' to Jupyter Notebook...")

        # Read Markdown file
        with open(source_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Create new notebook
        nb = nbformat.v4.new_notebook()
        
        # Code block pattern (```python or ``` format)
        code_block_pattern = r'```(?:python)?\s*\n(.*?)\n```'
        
        # Separate content into cells
        last_end = 0
        cells = []
        
        for match in re.finditer(code_block_pattern, content, re.DOTALL):
            start, end = match.span()
            
            # Convert text before code block to markdown cell
            if start > last_end:
                text = content[last_end:start].strip()
                if text:
                    cells.append(nbformat.v4.new_markdown_cell(text))
            
            # Convert code block to code cell
            code = match.group(1).strip()
            if code:
                cells.append(nbformat.v4.new_code_cell(code))
            
            last_end = end
        
        # Process remaining text at the end
        if last_end < len(content):
            text = content[last_end:].strip()
            if text:
                cells.append(nbformat.v4.new_markdown_cell(text))
        
        # If no cells, convert entire content to single markdown cell
        if not cells:
            cells.append(nbformat.v4.new_markdown_cell(content))
        
        nb.cells = cells
        
        # Save notebook
        with open(output_file, 'w', encoding='utf-8') as f:
            nbformat.write(nb, f)

        logging.info(f"Conversion successful. File location: {output_file}")
        return {"status": "success", "output_path": str(output_file)}

    except Exception as e:
        logging.error(f"Markdown conversion failed: {e}")
        return {"status": "error", "message": str(e)}