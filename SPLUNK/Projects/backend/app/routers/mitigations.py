from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
from datetime import datetime

from ..models import MitigationAction
from ..database import db
from ..scoring import calculate_residual_risk

router = APIRouter(prefix="/api/mitigations", tags=["Mitigations"])

def _sync_vendor_residual_risk(vendor_id: str):
    vendor = db.get_vendor(vendor_id)
    if not vendor:
        return
    mitigations = db.get_mitigations(vendor_id)
    verified_count = sum(1 for m in mitigations if m.get("status") == "Verified")
    in_progress_count = sum(1 for m in mitigations if m.get("status") == "In Progress")
    
    res_l, res_i, res_score, res_level = calculate_residual_risk(
        vendor.get("inherent_likelihood", 3),
        vendor.get("inherent_impact", 3),
        verified_count,
        in_progress_count
    )
    
    db.update_vendor(vendor_id, {
        "residual_likelihood": res_l,
        "residual_impact": res_i,
        "residual_risk_score": res_score,
        "residual_risk_level": res_level,
        "updated_at": datetime.utcnow().isoformat()
    })

@router.get("", response_model=List[MitigationAction])
def list_mitigations(vendor_id: Optional[str] = None, status: Optional[str] = None):
    items = db.get_mitigations(vendor_id)
    if status:
        items = [m for m in items if m.get("status") == status]
    return items

@router.post("", response_model=MitigationAction)
def create_mitigation(action: MitigationAction):
    if not action.id:
        action.id = f"ACT-{uuid.uuid4().hex[:6].upper()}"
        
    vendor = db.get_vendor(action.vendor_id)
    if vendor:
        action.vendor_name = vendor.get("name", "Unknown Vendor")
        
    created = db.create_mitigation(action.model_dump())
    _sync_vendor_residual_risk(action.vendor_id)
    
    db.add_audit_log({
        "id": f"LOG-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.utcnow().isoformat(),
        "user": "Security Treatment Lead",
        "action": "Mitigation Action Logged",
        "entity_type": "Mitigation",
        "entity_id": action.id,
        "details": f"Created action '{action.title}' for {action.vendor_name} ({action.control_type})."
    })
    
    return created

@router.put("/{action_id}", response_model=MitigationAction)
def update_mitigation(action_id: str, updates: dict):
    existing = None
    for m in db.get_mitigations():
        if m.get("id") == action_id:
            existing = m
            break
            
    if not existing:
        raise HTTPException(status_code=404, detail="Mitigation action not found")
        
    updated = db.update_mitigation(action_id, updates)
    vendor_id = existing.get("vendor_id")
    if vendor_id:
        _sync_vendor_residual_risk(vendor_id)
        
    # Check if verified with evidence
    new_status = updates.get("status", existing.get("status"))
    if new_status == "Verified" and existing.get("status") != "Verified":
        db.add_audit_log({
            "id": f"LOG-{uuid.uuid4().hex[:6].upper()}",
            "timestamp": datetime.utcnow().isoformat(),
            "user": "Lead Auditor",
            "action": "Security Control Verified",
            "entity_type": "Mitigation",
            "entity_id": action_id,
            "details": f"Verified control '{existing.get('title')}' with evidence. Residual risk updated for {existing.get('vendor_name')}."
        })
    else:
        db.add_audit_log({
            "id": f"LOG-{uuid.uuid4().hex[:6].upper()}",
            "timestamp": datetime.utcnow().isoformat(),
            "user": "SecOps Engineer",
            "action": "Mitigation Action Updated",
            "entity_type": "Mitigation",
            "entity_id": action_id,
            "details": f"Updated action status to {new_status} for {existing.get('vendor_name')}."
        })
        
    return updated

@router.delete("/{action_id}")
def delete_mitigation(action_id: str):
    existing = None
    for m in db.get_mitigations():
        if m.get("id") == action_id:
            existing = m
            break
    if not existing:
        raise HTTPException(status_code=404, detail="Mitigation action not found")
        
    db.delete_mitigation(action_id)
    if existing.get("vendor_id"):
        _sync_vendor_residual_risk(existing.get("vendor_id"))
        
    db.add_audit_log({
        "id": f"LOG-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.utcnow().isoformat(),
        "user": "SecOps Admin",
        "action": "Mitigation Action Removed",
        "entity_type": "Mitigation",
        "entity_id": action_id,
        "details": f"Removed action '{existing.get('title')}'."
    })
    return {"status": "success", "message": f"Action {action_id} deleted"}
