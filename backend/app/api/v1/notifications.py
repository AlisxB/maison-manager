from fastapi import APIRouter, Depends
from typing import List, Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core import deps
from app.announcements.models import Announcement
from app.violations.models import Violation
from app.users.models import User
from app.schemas.notification import NotificationItem
from datetime import datetime, timezone

router = APIRouter()

@router.get("/", response_model=List[NotificationItem])
async def get_notifications(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """
    Agrega notificações de múltiplas fontes:
    1. Avisos (Announcements) do condomínio
    2. Infrações/Multas (Violations) do usuário
    
    Estado de leitura baseado em 'last_notification_check' do usuário.
    """
    
    # Check user's last read timestamp
    user_stmt = select(User.last_notification_check).where(User.id == current_user.user_id)
    last_check = (await db.execute(user_stmt)).scalar()
    
    notifications = []
    
    # 1. Fetch recent Announcements (last 5)
    ann_stmt = select(Announcement).where(
        Announcement.condominium_id == current_user.condo_id
    ).order_by(desc(Announcement.created_at)).limit(5)
    
    announcements = (await db.execute(ann_stmt)).scalars().all()
    
    for ann in announcements:
        is_read = False
        if last_check and ann.created_at <= last_check:
            is_read = True

        # Determine link based on role
        target_link = '/resident/announcements'
        if current_user.role in ['ADMIN', 'SINDICO', 'SUBSINDICO', 'CONSELHO', 'PORTEIRO', 'FINANCEIRO']:
            target_link = '/admin/announcements'
            
        notifications.append(NotificationItem(
            id=str(ann.id),
            title=f"Novo Aviso: {ann.title}",
            description=ann.description[:50] + "..." if ann.description else "",
            type='ANNOUNCEMENT',
            created_at=ann.created_at,
            read=is_read,
            link=target_link
        ))
        
    # 2. Fetch recent Violations (last 5) if Resident
    if current_user.role == 'RESIDENT':
        vio_stmt = select(Violation).where(
            Violation.resident_id == current_user.user_id
        ).order_by(desc(Violation.created_at)).limit(5)
        
        violations = (await db.execute(vio_stmt)).scalars().all()
        
        for vio in violations:
            is_read = False
            if last_check and vio.created_at <= last_check:
                is_read = True

            notifications.append(NotificationItem(
                id=str(vio.id),
                title=f"Nova Notificação/Multa: {vio.type}",
                description=vio.description[:50] + "..." if vio.description else "",
                type='VIOLATION',
                created_at=vio.created_at,
                read=is_read,
                link='/resident/issues'
            ))
            
    # Sort combined list by date desc
    notifications.sort(key=lambda x: x.created_at, reverse=True)
    
    return notifications[:10]

@router.post("/read-all")
async def mark_all_read(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    stmt = select(User).where(User.id == current_user.user_id)
    user = (await db.execute(stmt)).scalar_one()
    # Using simple utcnow to match DB timezone=True behavior which stores as UTC usually
    user.last_notification_check = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "success"}
