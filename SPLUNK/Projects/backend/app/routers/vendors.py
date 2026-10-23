from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
from datetime import datetime

from ..models import Vendor, AuditLog
from ..database import db
from ..scoring import calculate_impact, calculate_residual_risk, get_risk_level, determine_decision

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])

@router.get("", response_model=List[Vendor])
def list_vendors(criticality: Optional[str] = None, risk_level: Optional[str] = None):
    vendors = db.get_vendors()
    if criticality:
        vendors = [v for v in vendors if v.get("business_criticality") == criticality]
    if risk_level:
        vendors = [v for v in vendors if v.get("inherent_risk_level") == risk_level]
    return vendors

@router.get("/{vendor_id}", response_model=Vendor)
def get_vendor(vendor_id: str):
    vendor = db.get_vendor(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail=f"Vendor {vendor_id} not found")
    return vendor

@router.post("", response_model=Vendor)
def create_vendor(vendor: Vendor):
    if not vendor.id:
        vendor.id = f"VND-{uuid.uuid4().hex[:6].upper()}"
    
    # Calculate baseline impact from criticality and data/systems
    impact = calculate_impact(vendor.business_criticality, vendor.data_handled, vendor.systems_accessed)
    vendor.inherent_impact = impact
    vendor.inherent_risk_score = vendor.inherent_likelihood * vendor.inherent_impact
    vendor.inherent_risk_level = get_risk_level(vendor.inherent_risk_score)
    vendor.decision = determine_decision(vendor.inherent_risk_level)
    
    vendor.residual_likelihood = vendor.inherent_likelihood
    vendor.residual_impact = vendor.inherent_impact
    vendor.residual_risk_score = vendor.inherent_risk_score
    vendor.residual_risk_level = vendor.inherent_risk_level
    
    vendor_dict = vendor.model_dump()
    created = db.create_vendor(vendor_dict)
    
    db.add_audit_log({
        "id": f"LOG-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.utcnow().isoformat(),
        "user": "Risk Assessor",
        "action": "Vendor Registered",
        "entity_type": "Vendor",
        "entity_id": vendor.id,
        "details": f"Registered vendor {vendor.name} ({vendor.service_type}) with Criticality={vendor.business_criticality}."
    })
    
    return created

@router.put("/{vendor_id}", response_model=Vendor)
def update_vendor(vendor_id: str, updates: dict):
    existing = db.get_vendor(vendor_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    updates["updated_at"] = datetime.utcnow().isoformat()
    updated = db.update_vendor(vendor_id, updates)
    
    db.add_audit_log({
        "id": f"LOG-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.utcnow().isoformat(),
        "user": "Risk Assessor",
        "action": "Vendor Profile Updated",
        "entity_type": "Vendor",
        "entity_id": vendor_id,
        "details": f"Updated metadata for vendor {existing.get('name')}."
    })
    
    return updated

@router.delete("/{vendor_id}")
def delete_vendor(vendor_id: str):
    existing = db.get_vendor(vendor_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    db.delete_vendor(vendor_id)
    db.add_audit_log({
        "id": f"LOG-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.utcnow().isoformat(),
        "user": "SecOps Admin",
        "action": "Vendor Deprovisioned/Archived",
        "entity_type": "Vendor",
        "entity_id": vendor_id,
        "details": f"Decommissioned vendor profile {existing.get('name')}."
    })
    return {"status": "success", "message": f"Vendor {vendor_id} deleted"}

@router.post("/{vendor_id}/recalculate", response_model=Vendor)
def recalculate_vendor_risk(vendor_id: str):
    vendor = db.get_vendor(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    mitigations = db.get_mitigations(vendor_id)
    verified_count = sum(1 for m in mitigations if m.get("status") == "Verified")
    in_progress_count = sum(1 for m in mitigations if m.get("status") == "In Progress")
    
    res_l, res_i, res_score, res_level = calculate_residual_risk(
        vendor.get("inherent_likelihood", 3),
        vendor.get("inherent_impact", 3),
        verified_count,
        in_progress_count
    )
    
    updates = {
        "residual_likelihood": res_l,
        "residual_impact": res_i,
        "residual_risk_score": res_score,
        "residual_risk_level": res_level,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    updated = db.update_vendor(vendor_id, updates)
    return updated
