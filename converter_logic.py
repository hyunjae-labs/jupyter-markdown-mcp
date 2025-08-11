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
    Preserves cell boundaries using special markers.
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
        
        # Cell boundary marker for preserving cell structure
        CELL_BOUNDARY = "<!-- NOTEBOOK_CELL_BOUNDARY -->"
        
        for i, cell in enumerate(notebook.cells):
            if cell.cell_type == 'markdown':
                if cell.source.strip():  # Skip empty cells
                    markdown_content.append(cell.source)
                    # Add cell boundary marker after each markdown cell
                    if i < len(notebook.cells) - 1 and notebook.cells[i + 1].cell_type == 'markdown':
                        markdown_content.append('')
                        markdown_content.append(CELL_BOUNDARY)
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
                    # Add cell boundary marker after raw cells if next is markdown/raw
                    if i < len(notebook.cells) - 1 and notebook.cells[i + 1].cell_type in ['markdown', 'raw']:
                        markdown_content.append('')
                        markdown_content.append(CELL_BOUNDARY)
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
    Respects cell boundary markers to preserve original cell structure.
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
        
        # Cell boundary marker pattern
        CELL_BOUNDARY = "<!-- NOTEBOOK_CELL_BOUNDARY -->"
        
        # Enhanced code block pattern (supports various languages)
        code_block_pattern = r'```(?:(\w+))?\s*\n(.*?)\n```'
        
        # First, split content by cell boundaries to preserve cell structure
        content_sections = content.split(CELL_BOUNDARY)
        
        cells = []
        cell_count = {"markdown": 0, "code": 0}
        
        for section in content_sections:
            section = section.strip()
            if not section:
                continue
                
            # Process each section for code blocks
            last_end = 0
            section_cells = []
            
            for match in re.finditer(code_block_pattern, section, re.DOTALL):
                start, end = match.span()
                language = match.group(1) or 'python'  # Default to python
                code = match.group(2).strip()
                
                # Convert text before code block to markdown cell
                if start > last_end:
                    text = section[last_end:start].strip()
                    if text:
                        section_cells.append(('markdown', text))
                
                # Convert code block to code cell
                if code:
                    # Add language comment for non-python code
                    if language.lower() != 'python':
                        code = f"# Language: {language}\n{code}"
                    section_cells.append(('code', code))
                
                last_end = end
            
            # Process remaining text at the end of section
            if last_end < len(section):
                text = section[last_end:].strip()
                if text:
                    section_cells.append(('markdown', text))
            
            # If no code blocks found in section, treat entire section as markdown
            if not section_cells and section:
                section_cells.append(('markdown', section))
            
            # Create cells from section_cells
            for cell_type, content_text in section_cells:
                if cell_type == 'markdown':
                    cells.append(nbformat.v4.new_markdown_cell(content_text))
                    cell_count["markdown"] += 1
                elif cell_type == 'code':
                    cells.append(nbformat.v4.new_code_cell(content_text))
                    cell_count["code"] += 1
        
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