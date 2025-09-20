/**
 * Converter logic for Jupyter Notebook <-> Markdown conversion
 */

import * as fs from 'fs';
import * as path from 'path';
import { JupyterNotebook, NotebookCell, ConversionResult } from './types';

// Cell boundary marker for preserving cell structure
const CELL_BOUNDARY = '<!-- NOTEBOOK_CELL_BOUNDARY -->';

/**
 * Convert Jupyter Notebook (.ipynb) file to Markdown (.md)
 * Code cell execution results (outputs) are excluded
 * Preserves cell boundaries using special markers
 */
export function convertIpynbToMd(sourcePath: string, outputDir: string): ConversionResult {
  try {
    const sourceFile = path.resolve(sourcePath);
    const outputPath = path.resolve(outputDir);

    // Validate input file exists
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }

    const ext = path.extname(sourceFile).toLowerCase();
    if (ext !== '.ipynb') {
      throw new Error(`Source file must be a .ipynb file, got: ${ext}`);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const outputFile = path.join(outputPath, `${path.basename(sourceFile, '.ipynb')}.md`);

    console.log(`Starting conversion of '${path.basename(sourceFile)}' to Markdown...`);

    // Read and parse notebook
    const notebookContent = fs.readFileSync(sourceFile, 'utf-8');
    const notebook: JupyterNotebook = JSON.parse(notebookContent);

    const markdownContent: string[] = [];
    const cellCount: Record<string, number> = { markdown: 0, code: 0, raw: 0 };

    // Process each cell
    notebook.cells.forEach((cell, i) => {
      const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

      if (cell.cell_type === 'markdown') {
        if (source.trim()) {
          markdownContent.push(source);
          // Add cell boundary marker between consecutive markdown cells
          if (i < notebook.cells.length - 1 && notebook.cells[i + 1].cell_type === 'markdown') {
            markdownContent.push('');
            markdownContent.push(CELL_BOUNDARY);
          }
          markdownContent.push('');
        }
        cellCount.markdown++;
      } else if (cell.cell_type === 'code') {
        if (source.trim()) {
          markdownContent.push('```python');
          markdownContent.push(source);
          markdownContent.push('```');
          markdownContent.push('');
        }
        cellCount.code++;
      } else if (cell.cell_type === 'raw') {
        if (source.trim()) {
          markdownContent.push(source);
          // Add cell boundary marker after raw cells if next is markdown/raw
          if (i < notebook.cells.length - 1 &&
              ['markdown', 'raw'].includes(notebook.cells[i + 1].cell_type)) {
            markdownContent.push('');
            markdownContent.push(CELL_BOUNDARY);
          }
          markdownContent.push('');
        }
        cellCount.raw++;
      }
    });

    // Remove trailing empty lines
    while (markdownContent.length > 0 && !markdownContent[markdownContent.length - 1].trim()) {
      markdownContent.pop();
    }

    // Write output file
    fs.writeFileSync(outputFile, markdownContent.join('\n'), 'utf-8');

    const totalCells = Object.values(cellCount).reduce((a, b) => a + b, 0);
    console.log(`Conversion successful. Processed ${totalCells} cells. File: ${outputFile}`);

    return {
      status: 'success',
      output_path: outputFile,
      cells_processed: cellCount,
      total_cells: totalCells
    };
  } catch (error) {
    console.error(`ipynb conversion failed: ${error}`);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Convert Markdown (.md) files to Jupyter Notebook (.ipynb)
 * Code blocks are converted to code cells, everything else to markdown cells
 * Respects cell boundary markers to preserve original cell structure
 */
export function convertMdToIpynb(sourcePath: string, outputDir: string): ConversionResult {
  try {
    const sourceFile = path.resolve(sourcePath);
    const outputPath = path.resolve(outputDir);

    // Validate input file exists
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }

    const ext = path.extname(sourceFile).toLowerCase();
    if (!['.md', '.markdown'].includes(ext)) {
      throw new Error(`Source file must be a .md or .markdown file, got: ${ext}`);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const outputFile = path.join(outputPath, `${path.basename(sourceFile, ext)}.ipynb`);

    console.log(`Starting conversion of '${path.basename(sourceFile)}' to Jupyter Notebook...`);

    // Read Markdown file
    const content = fs.readFileSync(sourceFile, 'utf-8');

    // Create new notebook structure
    const notebook: JupyterNotebook = {
      nbformat: 4,
      nbformat_minor: 5,
      metadata: {
        kernelspec: {
          display_name: 'Python 3',
          language: 'python',
          name: 'python3'
        },
        language_info: {
          name: 'python',
          version: '3.9.0',
          mimetype: 'text/x-python',
          file_extension: '.py'
        }
      },
      cells: []
    };

    // Enhanced code block pattern (supports various languages)
    const codeBlockPattern = /```(?:(\w+))?\s*\n(.*?)\n```/gs;

    // Split content by cell boundaries to preserve structure
    const contentSections = content.split(CELL_BOUNDARY);

    const cellCount: Record<string, number> = { markdown: 0, code: 0 };

    for (const section of contentSections) {
      const sectionTrimmed = section.trim();
      if (!sectionTrimmed) continue;

      // Process each section for code blocks
      let lastEnd = 0;
      const sectionCells: NotebookCell[] = [];

      const matches = Array.from(sectionTrimmed.matchAll(codeBlockPattern));

      for (const match of matches) {
        const start = match.index!;
        const end = start + match[0].length;
        const language = match[1] || 'python';
        const code = match[2].trim();

        // Add markdown text before code block
        if (start > lastEnd) {
          const text = sectionTrimmed.slice(lastEnd, start).trim();
          if (text) {
            sectionCells.push({
              cell_type: 'markdown',
              source: text,
              metadata: {}
            });
            cellCount.markdown++;
          }
        }

        // Add code cell
        if (code) {
          let cellSource = code;
          // Add language comment for non-python code
          if (language.toLowerCase() !== 'python') {
            cellSource = `# Language: ${language}\n${code}`;
          }
          sectionCells.push({
            cell_type: 'code',
            source: cellSource,
            metadata: {},
            outputs: [],
            execution_count: null
          });
          cellCount.code++;
        }

        lastEnd = end;
      }

      // Process remaining text after last code block
      if (lastEnd < sectionTrimmed.length) {
        const text = sectionTrimmed.slice(lastEnd).trim();
        if (text) {
          sectionCells.push({
            cell_type: 'markdown',
            source: text,
            metadata: {}
          });
          cellCount.markdown++;
        }
      }

      // If no code blocks found, treat entire section as markdown
      if (sectionCells.length === 0 && sectionTrimmed) {
        sectionCells.push({
          cell_type: 'markdown',
          source: sectionTrimmed,
          metadata: {}
        });
        cellCount.markdown++;
      }

      notebook.cells.push(...sectionCells);
    }

    // If no cells created, add one empty code cell
    if (notebook.cells.length === 0) {
      notebook.cells.push({
        cell_type: 'code',
        source: '',
        metadata: {},
        outputs: [],
        execution_count: null
      });
      cellCount.code = 1;
    }

    // Write notebook file
    fs.writeFileSync(outputFile, JSON.stringify(notebook, null, 2), 'utf-8');

    const totalCells = Object.values(cellCount).reduce((a, b) => a + b, 0);
    console.log(`Conversion successful. Created ${totalCells} cells. File: ${outputFile}`);

    return {
      status: 'success',
      output_path: outputFile,
      cells_created: cellCount,
      total_cells: totalCells
    };
  } catch (error) {
    console.error(`Markdown conversion failed: ${error}`);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}