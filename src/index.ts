#!/usr/bin/env node

/**
 * Jupyter Markdown MCP Server
 * A Model Context Protocol server for Jupyter Notebook <-> Markdown conversion
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { convertIpynbToMd, convertMdToIpynb } from './converter-logic.js';
import { ConvertNotebookArgs, ConvertMarkdownArgs } from './types.js';

// Create MCP server instance
const server = new Server(
  {
    name: 'jupyter-markdown-mcp',
    version: '2.0.0', // Version 2.0.0 for TypeScript rewrite
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list_tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'convert_notebook',
        description: 'Convert Jupyter Notebook (.ipynb) files to clean Markdown (.md). Code execution results are excluded.',
        inputSchema: {
          type: 'object',
          properties: {
            source_path: {
              type: 'string',
              description: "Full path to the .ipynb file to convert (e.g., 'C:\\Users\\Test\\notebook.ipynb')"
            },
            output_dir: {
              type: 'string',
              description: "Folder path to save the converted .md file (e.g., 'C:\\Users\\Test\\output')"
            }
          },
          required: ['source_path', 'output_dir']
        }
      },
      {
        name: 'convert_markdown',
        description: 'Convert Markdown (.md) files to Jupyter Notebook (.ipynb). Code blocks are converted to code cells, everything else to markdown cells.',
        inputSchema: {
          type: 'object',
          properties: {
            source_path: {
              type: 'string',
              description: "Full path to the .md file to convert (e.g., 'C:\\Users\\Test\\document.md')"
            },
            output_dir: {
              type: 'string',
              description: "Folder path to save the converted .ipynb file (e.g., 'C:\\Users\\Test\\notebooks')"
            }
          },
          required: ['source_path', 'output_dir']
        }
      }
    ]
  };
});

// Handle call_tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args) {
      throw new Error('No arguments provided');
    }

    const { source_path, output_dir } = args as any;

    if (!source_path || !output_dir) {
      throw new Error('source_path and output_dir are required arguments');
    }

    let result;
    switch (name) {
      case 'convert_notebook':
        result = convertIpynbToMd(source_path, output_dir);
        break;
      case 'convert_markdown':
        result = convertMdToIpynb(source_path, output_dir);
        break;
      default:
        throw new Error(`Unknown tool name: ${name}`);
    }

    // Return result as formatted text
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    const errorResult = {
      status: 'error',
      message: `Error occurred during tool execution: ${error instanceof Error ? error.message : String(error)}`
    };
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(errorResult, null, 2)
        }
      ]
    };
  }
});

async function main() {
  console.error('Starting Jupyter Markdown MCP Server...');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Jupyter Markdown MCP Server running on stdio');
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the server
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error in main:', error);
    process.exit(1);
  });
}