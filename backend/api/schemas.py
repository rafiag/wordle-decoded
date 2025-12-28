from pydantic import BaseModel
from typing import Dict, Any

class APIResponse(BaseModel):
    status: str
    data: Dict[str, Any]
    meta: Dict[str, str]
