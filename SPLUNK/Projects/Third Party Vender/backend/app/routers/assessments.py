from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import uuid
from datetime import datetime

from ..models import SecurityAssessment, AssessmentAnswer, RiskCalculationRequest
from ..database import db
from ..scoring import (
    STANDARD_QUESTIONS, 
    calculate_impact, 
    calculate_likelihood, 
    get_risk_level, 
    determine_decision,
    calculate_residual_risk
)

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.get("/questions")
def get_standard_questions():
    return STANDARD_QUESTIONS

@router.post("/calculate")
def preview_risk_score(request: RiskCalculationRequest):
    impact = calculate_impact(request.business_criticality, request.data_handled, request.systems_accessed)
    likelihood, gaps, recommendations = calculate_likelihood(request.answers)
    score = likelihood * impact
    risk_level = get_risk_level(score)
    decision = determine_decision(risk_level)
    
    return {
        "likelihood": likelihood,
        "impact": impact,
        "inherent_risk_score": score,
        "risk_level": risk_level,
        "decision": decision,
        "identified_gaps": gaps,
        "recommended_actions": recommendations
    }

@router.post("", response_model=SecurityAssessment)
def submit_assessment(assessment: SecurityAssessment):
    vendor = db.get_vendor(assessment.vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    if not assessment.id:
        assessment.id = f"ASM-{uuid.uuid4().hex[:6].upper()}"
        
    assessment.assessment_date = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Calculate scores
    impact = calculate_impact(vendor.get("business_criticality", "Medium"), vendor.get("data_handled", []), vendor.get("systems_accessed", []))
    likelihood, gaps, recommendations = calculate_likelihood(assessment.answers)
    score = likelihood * impact
    level = get_risk_level(score)
    decision = determine_decision(level)
    
    assessment.inherent_likelihood = likelihood
    assessment.inherent_impact = impact
    assessment.inherent_risk_score = score
    assessment.inherent_risk_level = level
    assessment.identified_gaps = gaps
    assessment.recommended_actions = recommendations
    assessment.decision = decision
    
    # Save assessment record
    db.save_assessment(assessment.model_dump())
    
    # Update vendor record
    mitigations = db.get_mitigations(assessment.vendor_id)
    verified_count = sum(1 for m in mitigations if m.get("status") == "Verified")
    in_progress_count = sum(1 for m in mitigations if m.get("status") == "In Progress")
    
    res_l, res_i, res_score, res_level = calculate_residual_risk(
        likelihood, impact, verified_count, in_progress_count
    )
    
    db.update_vendor(assessment.vendor_id, {
        "assessment_status": "Assessed",
        "last_assessment_date": assessment.assessment_date,
        "inherent_likelihood": likelihood,
        "inherent_impact": impact,
        "inherent_risk_score": score,
        "inherent_risk_level": level,
        "residual_likelihood": res_l,
        "residual_impact": res_i,
        "residual_risk_score": res_score,
        "residual_risk_level": res_level,
        "decision": decision,
        "identified_gaps": gaps,
        "updated_at": datetime.utcnow().isoformat()
    })
    
    # Automatically generate open mitigation actions for any critical/high gaps
    for gap in gaps:
        action_id = f"ACT-{uuid.uuid4().hex[:6].upper()}"
        title = f"Remediate: {gap[:60]}..."
        db.create_mitigation({
            "id": action_id,
            "vendor_id": assessment.vendor_id,
            "vendor_name": vendor.get("name", "Unknown Vendor"),
            "title": title,
            "description": f"Mandate security improvement addressing gap: {gap}",
            "control_type": "Preventive",
            "associated_gap": gap,
            "owner": "Security Engineering & Vendor Owner",
            "target_date": (datetime.utcnow()).strftime("%Y-%m-%d"),
            "status": "Open",
            "evidence": "",
            "created_at": datetime.utcnow().isoformat()
        })
    
    # Add audit log
    db.add_audit_log({
        "id": f"LOG-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.utcnow().isoformat(),
        "user": assessment.assessor_name or "Lead Security Assessor",
        "action": "Cybersecurity Assessment Executed",
        "entity_type": "Assessment",
        "entity_id": assessment.id,
        "details": f"Completed NIST CSF 2.0 evaluation for {vendor.get('name')}. Inherent Score={score} ({level}), Decision={decision}."
    })
    
    return assessment

@router.get("/history/{vendor_id}")
def get_vendor_assessment_history(vendor_id: str):
    return db.get_assessments(vendor_id)
