from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.mcp.tools import execute_tool, list_tools
from app.core.deps import get_current_active_user
from app.models.user import User as UserModel

router = APIRouter()


@router.get("/tools", response_model=List[Dict[str, str]])
async def list_mcp_tools(current_user: UserModel = Depends(get_current_active_user)):
    """List all available MCP tools."""
    return list_tools()


@router.post("/execute", response_model=Dict[str, Any])
async def execute_mcp_tool(
    tool_name: str,
    kwargs: Dict[str, Any] = None,
    current_user: UserModel = Depends(get_current_active_user)
):
    """Execute an MCP tool."""
    if kwargs is None:
        kwargs = {}
    
    result = execute_tool(tool_name, **kwargs)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result
