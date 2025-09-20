/**
 * Type definitions for Jupyter Markdown MCP Server
 */

export interface NotebookCell {
  cell_type: 'markdown' | 'code' | 'raw';
  source: string | string[];
  metadata?: Record<string, any>;
  outputs?: any[];
  execution_count?: number | null;
}

export interface NotebookMetadata {
  kernelspec?: {
    display_name: string;
    language: string;
    name: string;
  };
  language_info?: {
    name: string;
    version?: string;
    mimetype?: string;
    file_extension?: string;
  };
  [key: string]: any;
}

export interface JupyterNotebook {
  nbformat: number;
  nbformat_minor: number;
  metadata: NotebookMetadata;
  cells: NotebookCell[];
}

export interface ConversionResult {
  status: 'success' | 'error';
  output_path?: string;
  cells_processed?: Record<string, number>;
  cells_created?: Record<string, number>;
  total_cells?: number;
  message?: string;
}

export interface ConvertNotebookArgs {
  source_path: string;
  output_dir: string;
}

export interface ConvertMarkdownArgs {
  source_path: string;
  output_dir: string;
}

export interface McpServerConfig {
  type: 'stdio';
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface ClaudeConfig {
  mcpServers?: Record<string, McpServerConfig>;
}