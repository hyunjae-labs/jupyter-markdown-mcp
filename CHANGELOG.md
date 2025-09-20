# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-01-20

### Added
- Complete TypeScript rewrite - no Python dependencies required!
- Native JSON handling for Jupyter notebook format
- Improved build system with TypeScript compilation
- Type safety with full TypeScript type definitions
- Better error handling and logging

### Changed
- Migrated from Python to TypeScript
- Changed runtime from Python to Node.js
- Updated all configuration examples to use Node.js
- Improved performance with native JavaScript execution
- Updated MCP server name consistency to `jupyter-markdown-mcp`

### Removed
- Python dependencies (nbformat)
- Python runtime requirement
- requirements.txt file
- Legacy Python scripts

### Fixed
- Package name consistency across all files
- MCP server registration name matches npm package name