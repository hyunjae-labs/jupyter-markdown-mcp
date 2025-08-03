# -*- coding: utf-8 -*-
"""
Notebook Convert MCP Server
A Model Context Protocol server for Jupyter Notebook ↔ Markdown conversion.
"""
import asyncio
import json
import sys
from typing import List

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Content, TextContent, Tool

# Import module containing actual conversion logic
import converter_logic

# Create MCP server instance
server = Server("notebook-convert-mcp")

@server.list_tools()
async def list_tools() -> List[Tool]:
    """Provides Jupyter Notebook and Markdown conversion tools."""
    return [
        Tool(
            name="convert_notebook",
            description="Convert Jupyter Notebook (.ipynb) files to clean Markdown (.md). Code execution results are excluded.",
            inputSchema={
                "type": "object",
                "properties": {
                    "source_path": {
                        "type": "string",
                        "description": "Full path to the .ipynb file to convert (e.g., 'C:\\Users\\Test\\notebook.ipynb')"
                    },
                    "output_dir": {
                        "type": "string",
                        "description": "Folder path to save the converted .md file (e.g., 'C:\\Users\\Test\\output')"
                    }
                },
                "required": ["source_path", "output_dir"]
            }
        ),
        Tool(
            name="convert_markdown",
            description="Convert Markdown (.md) files to Jupyter Notebook (.ipynb). Code blocks are converted to code cells, everything else to markdown cells.",
            inputSchema={
                "type": "object",
                "properties": {
                    "source_path": {
                        "type": "string",
                        "description": "Full path to the .md file to convert (e.g., 'C:\\Users\\Test\\document.md')"
                    },
                    "output_dir": {
                        "type": "string",
                        "description": "Folder path to save the converted .ipynb file (e.g., 'C:\\Users\\Test\\notebooks')"
                    }
                },
                "required": ["source_path", "output_dir"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> List[Content]:
    """Handle tool call requests from agents."""
    try:
        source_path = arguments.get("source_path")
        output_dir = arguments.get("output_dir")

        if not source_path or not output_dir:
            raise ValueError("source_path and output_dir are required arguments.")

        if name == "convert_notebook":
            result = converter_logic.convert_ipynb_to_md(source_path, output_dir)
        elif name == "convert_markdown":
            result = converter_logic.convert_md_to_ipynb(source_path, output_dir)
        else:
            raise ValueError(f"Unknown tool name: {name}")

        # Return result as JSON formatted text
        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    except Exception as e:
        error_result = {"status": "error", "message": f"Error occurred during tool execution: {str(e)}"}
        return [TextContent(type="text", text=json.dumps(error_result, indent=2))]

async def main():
    """Start the MCP server."""
    print("Starting Notebook Convert MCP Server...", file=sys.stderr, flush=True)
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())