#!/usr/bin/env python3
"""
Journi MCP Server
A minimal Model Context Protocol server for the Journi project.
Provides tools for file operations and documentation search.
"""

import json
import sys
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse, urljoin
import asyncio

import requests
from bs4 import BeautifulSoup, Comment


class JourniMCPServer:
    """MCP server for Journi project with file operations and doc search."""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.frontend_dir = self.project_root / "frontend"
        self.backend_dir = self.project_root / "backend"
        
        # Sensitive files to protect
        self.protected_patterns = [
            r'\.env.*',
            r'\..*key.*',
            r'.*secret.*',
            r'.*password.*',
            r'config\.json',
            r'\.git/.*'
        ]
    
    def is_protected_file(self, filepath: str) -> bool:
        """Check if a file path matches protected patterns."""
        for pattern in self.protected_patterns:
            if re.match(pattern, str(filepath).lower()):
                return True
        return False
    
    def is_valid_project_path(self, path: Path) -> bool:
        """Check if path is within allowed project directories."""
        try:
            resolved_path = path.resolve()
            frontend_resolved = self.frontend_dir.resolve()
            backend_resolved = self.backend_dir.resolve()
            
            return (
                str(resolved_path).startswith(str(frontend_resolved)) or
                str(resolved_path).startswith(str(backend_resolved))
            )
        except (OSError, ValueError):
            return False

    async def read_file(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Read a file from the project directories."""
        filepath = args.get("path", "")
        
        if not filepath:
            return {"error": "File path is required"}
        
        path = Path(filepath)
        if not path.is_absolute():
            path = self.project_root / path
        
        if self.is_protected_file(str(path)):
            return {"error": f"Access denied: {filepath} is a protected file"}
        
        if not self.is_valid_project_path(path):
            return {"error": f"Access denied: {filepath} is outside allowed directories"}
        
        try:
            if not path.exists():
                return {"error": f"File not found: {filepath}"}
            
            if path.is_dir():
                # List directory contents
                contents = []
                for item in sorted(path.iterdir()):
                    if not self.is_protected_file(str(item.name)):
                        contents.append({
                            "name": item.name,
                            "type": "directory" if item.is_dir() else "file",
                            "path": str(item.relative_to(self.project_root))
                        })
                return {"type": "directory", "contents": contents}
            
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return {
                "type": "file",
                "path": str(path.relative_to(self.project_root)),
                "content": content,
                "size": len(content)
            }
        
        except UnicodeDecodeError:
            return {"error": f"Cannot read binary file: {filepath}"}
        except Exception as e:
            return {"error": f"Error reading {filepath}: {str(e)}"}

    async def write_file(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Write content to a file in project directories."""
        filepath = args.get("path", "")
        content = args.get("content", "")
        
        if not filepath:
            return {"error": "File path is required"}
        
        path = Path(filepath)
        if not path.is_absolute():
            path = self.project_root / path
        
        if self.is_protected_file(str(path)):
            return {"error": f"Access denied: {filepath} is a protected file"}
        
        if not self.is_valid_project_path(path):
            return {"error": f"Access denied: {filepath} is outside allowed directories"}
        
        try:
            # Ensure parent directory exists
            path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return {
                "success": True,
                "path": str(path.relative_to(self.project_root)),
                "size": len(content)
            }
        
        except Exception as e:
            return {"error": f"Error writing to {filepath}: {str(e)}"}

    async def search_docs(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Search external documentation and extract relevant sections."""
        url = args.get("url", "")
        search_terms = args.get("search_terms", [])
        
        if not url:
            return {"error": "URL is required"}
        
        if not search_terms:
            return {"error": "Search terms are required"}
        
        try:
            # Validate URL
            parsed_url = urlparse(url)
            if not parsed_url.scheme in ['http', 'https']:
                return {"error": "Only HTTP/HTTPS URLs are allowed"}
            
            # Fetch the page
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove unwanted elements
            for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                element.decompose()
            
            # Remove comments
            for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
                comment.extract()
            
            # Find relevant sections
            relevant_sections = []
            
            # Search in headings and their following content
            for term in search_terms:
                term_lower = term.lower()
                
                # Find headings containing the search term
                headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], 
                                       string=re.compile(term, re.IGNORECASE))
                
                for heading in headings:
                    section_content = [heading.get_text().strip()]
                    
                    # Get content after the heading until next heading of same or higher level
                    current = heading.next_sibling
                    heading_level = int(heading.name[1])
                    
                    while current:
                        if hasattr(current, 'name'):
                            if (current.name and current.name.startswith('h') and 
                                len(current.name) == 2 and current.name[1].isdigit()):
                                current_level = int(current.name[1])
                                if current_level <= heading_level:
                                    break
                            
                            text = current.get_text().strip()
                            if text and len(text) > 10:  # Skip very short content
                                section_content.append(text)
                        
                        current = current.next_sibling
                    
                    if len(section_content) > 1:  # Has content beyond just heading
                        relevant_sections.append({
                            "term": term,
                            "heading": section_content[0],
                            "content": '\n'.join(section_content[1:])[:2000]  # Limit content length
                        })
            
            # If no specific sections found, search for paragraphs containing terms
            if not relevant_sections:
                paragraphs = soup.find_all(['p', 'div', 'li'], 
                                         string=re.compile('|'.join(search_terms), re.IGNORECASE))
                
                for para in paragraphs[:5]:  # Limit to 5 paragraphs
                    text = para.get_text().strip()
                    if len(text) > 50:  # Only meaningful content
                        relevant_sections.append({
                            "term": "general",
                            "heading": "Relevant Content",
                            "content": text[:1000]  # Limit length
                        })
            
            return {
                "url": url,
                "title": soup.title.string if soup.title else "Unknown",
                "search_terms": search_terms,
                "sections": relevant_sections,
                "total_sections": len(relevant_sections)
            }
        
        except requests.RequestException as e:
            return {"error": f"Error fetching URL: {str(e)}"}
        except Exception as e:
            return {"error": f"Error processing documentation: {str(e)}"}

    async def list_project_files(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """List files in frontend and backend directories."""
        directory = args.get("directory", "both")  # "frontend", "backend", or "both"
        
        def scan_directory(dir_path: Path) -> List[Dict[str, Any]]:
            files = []
            if not dir_path.exists():
                return files
            
            for item in dir_path.rglob("*"):
                if item.is_file() and not self.is_protected_file(str(item.name)):
                    try:
                        relative_path = item.relative_to(self.project_root)
                        files.append({
                            "name": item.name,
                            "path": str(relative_path),
                            "extension": item.suffix,
                            "size": item.stat().st_size
                        })
                    except (OSError, ValueError):
                        continue
            
            return files
        
        result = {"files": []}
        
        if directory in ["frontend", "both"]:
            frontend_files = scan_directory(self.frontend_dir)
            result["files"].extend(frontend_files)
        
        if directory in ["backend", "both"]:
            backend_files = scan_directory(self.backend_dir)
            result["files"].extend(backend_files)
        
        return result

    def get_capabilities(self) -> Dict[str, Any]:
        """Return server capabilities."""
        return {
            "tools": [
                {
                    "name": "read_file",
                    "description": "Read a file from frontend/ or backend/ directories",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "path": {
                                "type": "string",
                                "description": "Path to the file (relative to project root or absolute)"
                            }
                        },
                        "required": ["path"]
                    }
                },
                {
                    "name": "write_file", 
                    "description": "Write content to a file in frontend/ or backend/ directories",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "path": {
                                "type": "string",
                                "description": "Path to the file (relative to project root or absolute)"
                            },
                            "content": {
                                "type": "string",
                                "description": "Content to write to the file"
                            }
                        },
                        "required": ["path", "content"]
                    }
                },
                {
                    "name": "search_docs",
                    "description": "Search external documentation pages for specific terms and extract relevant sections",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "url": {
                                "type": "string",
                                "description": "URL of the documentation page to search"
                            },
                            "search_terms": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Terms to search for in the documentation"
                            }
                        },
                        "required": ["url", "search_terms"]
                    }
                },
                {
                    "name": "list_project_files",
                    "description": "List files in the project directories",
                    "inputSchema": {
                        "type": "object", 
                        "properties": {
                            "directory": {
                                "type": "string",
                                "enum": ["frontend", "backend", "both"],
                                "description": "Which directory to list (default: both)"
                            }
                        }
                    }
                }
            ]
        }

    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming MCP requests."""
        method = request.get("method", "")
        params = request.get("params", {})
        
        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "result": {
                    "protocolVersion": "1.0.0",
                    "capabilities": self.get_capabilities(),
                    "serverInfo": {
                        "name": "journi-server",
                        "version": "1.0.0"
                    }
                }
            }
        
        elif method == "tools/call":
            tool_name = params.get("name", "")
            args = params.get("arguments", {})
            
            if tool_name == "read_file":
                result = await self.read_file(args)
            elif tool_name == "write_file":
                result = await self.write_file(args)
            elif tool_name == "search_docs":
                result = await self.search_docs(args)
            elif tool_name == "list_project_files":
                result = await self.list_project_files(args)
            else:
                result = {"error": f"Unknown tool: {tool_name}"}
            
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": json.dumps(result, indent=2)
                        }
                    ]
                }
            }
        
        else:
            return {
                "jsonrpc": "2.0",
                "id": request.get("id"),
                "error": {
                    "code": -32601,
                    "message": f"Method not found: {method}"
                }
            }

    async def run(self):
        """Run the MCP server over stdio."""
        while True:
            try:
                line = sys.stdin.readline()
                if not line:
                    break
                
                request = json.loads(line.strip())
                response = await self.handle_request(request)
                
                if response:
                    print(json.dumps(response), flush=True)
            
            except json.JSONDecodeError:
                continue
            except KeyboardInterrupt:
                break
            except Exception as e:
                error_response = {
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -32603,
                        "message": f"Internal error: {str(e)}"
                    }
                }
                print(json.dumps(error_response), flush=True)


async def main():
    """Main entry point."""
    # Get project root from command line or detect from script location
    if len(sys.argv) > 1:
        project_root = sys.argv[1]
    else:
        # Assume script is in backend/ directory
        script_path = Path(__file__).resolve()
        project_root = script_path.parent.parent
    
    server = JourniMCPServer(str(project_root))
    await server.run()


if __name__ == "__main__":
    asyncio.run(main())
