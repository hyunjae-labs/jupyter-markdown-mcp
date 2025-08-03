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
        
        # Validate input file exists
        if not source_file.exists():
            raise FileNotFoundError(f"Source file not found: {source_path}")
        
        if not source_file.suffix.lower() == '.ipynb':
            raise ValueError(f"Source file must be a .ipynb file, got: {source_file.suffix}")
        
        output_path.mkdir(parents=True, exist_ok=True)
        output_file = output_path / f"{source_file.stem}.md"

        logging.info(f"Starting conversion of '{source_file.name}' to Markdown...")

        with open(source_file, 'r', encoding='utf-8') as f:
            notebook = nbformat.read(f, as_version=4)

        markdown_content = []
        cell_count = {"markdown": 0, "code": 0, "raw": 0}
        
        for cell in notebook.cells:
            if cell.cell_type == 'markdown':
                if cell.source.strip():  # Skip empty cells
                    markdown_content.append(cell.source)
                    markdown_content.append('')
                cell_count["markdown"] += 1
            elif cell.cell_type == 'code':
                if cell.source.strip():  # Skip empty code cells
                    markdown_content.append('```python')
                    markdown_content.append(cell.source)
                    markdown_content.append('```')
                    markdown_content.append('')
                cell_count["code"] += 1
            elif cell.cell_type == 'raw':
                if cell.source.strip():  # Include raw cells as text
                    markdown_content.append(cell.source)
                    markdown_content.append('')
                cell_count["raw"] += 1
        
        # Remove trailing empty lines
        while markdown_content and not markdown_content[-1].strip():
            markdown_content.pop()
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(markdown_content))

        logging.info(f"Conversion successful. Processed {sum(cell_count.values())} cells. File: {output_file}")
        return {
            "status": "success", 
            "output_path": str(output_file),
            "cells_processed": cell_count,
            "total_cells": sum(cell_count.values())
        }

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
        
        # Validate input file exists
        if not source_file.exists():
            raise FileNotFoundError(f"Source file not found: {source_path}")
        
        if not source_file.suffix.lower() in ['.md', '.markdown']:
            raise ValueError(f"Source file must be a .md or .markdown file, got: {source_file.suffix}")
        
        output_path.mkdir(parents=True, exist_ok=True)
        output_file = output_path / f"{source_file.stem}.ipynb"

        logging.info(f"Starting conversion of '{source_file.name}' to Jupyter Notebook...")

        # Read Markdown file
        with open(source_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Create new notebook
        nb = nbformat.v4.new_notebook()
        
        # Enhanced code block pattern (supports various languages)
        code_block_pattern = r'```(?:(\w+))?\s*\n(.*?)\n```'
        
        # Separate content into cells
        last_end = 0
        cells = []
        cell_count = {"markdown": 0, "code": 0}
        
        for match in re.finditer(code_block_pattern, content, re.DOTALL):
            start, end = match.span()
            language = match.group(1) or 'python'  # Default to python
            code = match.group(2).strip()
            
            # Convert text before code block to markdown cell
            if start > last_end:
                text = content[last_end:start].strip()
                if text:
                    cells.append(nbformat.v4.new_markdown_cell(text))
                    cell_count["markdown"] += 1
            
            # Convert code block to code cell
            if code:
                # Add language comment for non-python code
                if language.lower() != 'python':
                    code = f"# Language: {language}\n{code}"
                cells.append(nbformat.v4.new_code_cell(code))
                cell_count["code"] += 1
            
            last_end = end
        
        # Process remaining text at the end
        if last_end < len(content):
            text = content[last_end:].strip()
            if text:
                cells.append(nbformat.v4.new_markdown_cell(text))
                cell_count["markdown"] += 1
        
        # If no cells created, convert entire content to single markdown cell
        if not cells:
            if content.strip():
                cells.append(nbformat.v4.new_markdown_cell(content.strip()))
                cell_count["markdown"] = 1
            else:
                # Create empty notebook with one empty code cell
                cells.append(nbformat.v4.new_code_cell(""))
                cell_count["code"] = 1
        
        nb.cells = cells
        
        # Save notebook
        with open(output_file, 'w', encoding='utf-8') as f:
            nbformat.write(nb, f)

        logging.info(f"Conversion successful. Created {sum(cell_count.values())} cells. File: {output_file}")
        return {
            "status": "success", 
            "output_path": str(output_file),
            "cells_created": cell_count,
            "total_cells": sum(cell_count.values())
        }

    except Exception as e:
        logging.error(f"Markdown conversion failed: {e}")
        return {"status": "error", "message": str(e)}