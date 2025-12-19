from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationItem(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    type: str # 'ANNOUNCEMENT', 'VIOLATION', 'SYSTEM'
    created_at: datetime
    read: bool = False # Always false effectively unless we track it
    link: Optional[str] = None
