import functools
import inspect
from app.services.audit_service import AuditService
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

def audit_log(action: str, table_name: str):
    """
    Decorator to automatically log service actions.
    Assumes the first argument is 'self' (Service instance) which has 'self.db'.
    Assumes the return value is the record (model instance) or the ID.
    
    Tries to find 'current_user_id' in args/kwargs for actor_id.
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(self, *args, **kwargs):
            # 1. Execute the actual function
            try:
                result = await func(self, *args, **kwargs)
            except Exception as e:
                # We do not log failures here (or we could log ERROR actions)
                raise e

            try:
                # 2. Extract Metadata for Logging
                
                # Get DB Session from Service instance
                db = getattr(self, 'db', None)
                if not db or not isinstance(db, AsyncSession):
                    # Fail silently or log error? Silently to avoid breaking flow
                    print(f"AuditLog Error: Could not find db session in {self}")
                    return result

                # Extract Actor ID
                # We inspect signature to bind args
                sig = inspect.signature(func)
                bound_args = sig.bind(self, *args, **kwargs)
                bound_args.apply_defaults()
                
                actor_id = bound_args.arguments.get('current_user_id')
                
                # If not found, maybe in kwargs directly (already checked by bind?)
                # Maybe 'current_user' object?
                if not actor_id:
                    current_user = bound_args.arguments.get('current_user')
                    if current_user and hasattr(current_user, 'id'):
                        actor_id = str(current_user.id)

                # Extract Record ID and New Data
                record_id = None
                new_data = None
                condo_id = None
                
                if result:
                    if hasattr(result, 'id'):
                        record_id = str(result.id)
                        # Try to serialize?
                        try:
                            # Crude way to dict
                            new_data = {c.name: str(getattr(result, c.name)) for c in result.__table__.columns}
                        except:
                            new_data = str(result)
                            
                    if hasattr(result, 'condominium_id'):
                        condo_id = str(result.condominium_id)
                
                # If we couldn't get record_id from result (e.g. function returns None or bool),
                # maybe from args (e.g. delete_user(user_id...))
                if not record_id:
                    record_id = bound_args.arguments.get('user_id') or bound_args.arguments.get('id')

                # Log it
                await AuditService.log(
                    db=db,
                    action=action,
                    table_name=table_name,
                    record_id=record_id or "UNKNOWN",
                    actor_id=actor_id,
                    new_data=new_data, # For UPDATE/INSERT
                    condominium_id=condo_id
                    # old_data is hard to get in generic decorator without pre-hook
                )
                
            except Exception as e:
                # Never block main flow due to logging error
                print(f"Audit Logging Failed: {e}")
            
            return result
        return wrapper
    return decorator
