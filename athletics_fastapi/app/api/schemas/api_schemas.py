from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any, Generic, TypeVar
from uuid import UUID
from datetime import datetime
from fastapi.responses import JSONResponse

T = TypeVar('T')


class APIResponse(BaseModel, Generic[T]):
    """Standard API response schema with generic type support."""
    success: bool = Field(..., description="Indicates if the request was successful")
    message: Optional[str] = Field(
        None, 
        description="Optional message providing additional information"
    )
    data: Optional[T] = Field(
        None, 
        description="Payload containing the response data"
    )
    errors: Optional[List[Dict[str, Any]]] = Field(
        None, 
        description="List of error details, if any"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "message": "Operation completed successfully",
                "data": {},
                "errors": None
            }
        }
    )

class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int = Field(..., description="Current page number", ge=1)
    page_size: int = Field(..., description="Items per page", ge=1, le=100)
    total_items: int = Field(..., description="Total number of items", ge=0)
    total_pages: int = Field(..., description="Total number of pages", ge=0)
    has_next: bool = Field(..., description="Whether there is a next page")
    has_prev: bool = Field(..., description="Whether there is a previous page")


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated API response."""
    success: bool = Field(True, description="Indicates if the request was successful")
    message: Optional[str] = None
    data: List[T] = Field(..., description="List of items")
    pagination: PaginationMeta = Field(..., description="Pagination metadata")
    errors: Optional[List[Dict[str, Any]]] = None


class ErrorDetail(BaseModel):
    """Detailed error information."""
    field: Optional[str] = Field(None, description="Field that caused the error")
    message: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")


class StreamInfo(BaseModel):
    """Information about a streaming resource."""
    file_id: UUID
    filename: str
    content_type: str
    size_bytes: int
    duration_ms: Optional[int] = None
    supports_range: bool = True
    stream_url: str