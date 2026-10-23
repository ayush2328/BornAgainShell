from fastapi import APIRouter
from typing import List, Dict, Any
from ..database import db

router = APIRouter(prefix="/api/audit", tags=["Audit"])

@router.get("", response_model=List[Dict[str, Any]])
def get_audit_trail(limit: int = 50):
    return db.get_audit_logs(limit)

@router.post("/reset-demo")
def reset_demo():
    db.reset_demo_data()
    return {"status": "success", "message": "Demo data restored to pristine initial state"}
