from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class Criticality(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class RiskBand(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class DecisionStatus(str, Enum):
    APPROVE = "Approve"
    APPROVE_WITH_CONDITIONS = "Approve with Conditions"
    REQUIRE_REMEDIATION = "Require Remediation"
    REJECT_ESCALATE = "Reject/Escalate"

class AssessmentAnswer(BaseModel):
    question_id: str
    category: str
    question: str
    nist_ref: str
    weight: int = 1
    response: str  # "yes", "partial", "no", "na"
    evidence: str = ""
    gap_notes: str = ""

class QuestionDef(BaseModel):
    id: str
    category: str
    question: str
    nist_ref: str
    weight: int = 1
    guidance: str
    control_type: str  # Preventive, Detective, Corrective

class MitigationAction(BaseModel):
    id: str
    vendor_id: str
    vendor_name: str
    title: str
    description: str
    control_type: str = "Preventive"  # Preventive, Detective, Corrective, Directive
    associated_gap: str = ""
    owner: str = "Security Team"
    target_date: str
    status: str = "Open"  # Open, In Progress, Implemented, Verified
    evidence: str = ""
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class Vendor(BaseModel):
    id: str
    name: str
    service_type: str
    description: str
    contact_name: str
    contact_email: str
    contact_phone: str = ""
    website: str = ""
    business_criticality: str = "Medium"  # Critical, High, Medium, Low
    data_handled: List[str] = []
    systems_accessed: List[str] = []
    contract_start: str = ""
    contract_end: str = ""
    owner_department: str = "IT & Security"
    assessment_status: str = "Pending"  # Assessed, In Review, Pending, Overdue
    last_assessment_date: Optional[str] = None
    next_assessment_date: Optional[str] = None
    
    # 5x5 Inherent Risk
    inherent_likelihood: int = 3
    inherent_impact: int = 3
    inherent_risk_score: int = 9
    inherent_risk_level: str = "Medium"
    
    # 5x5 Residual Risk (after controls)
    residual_likelihood: int = 2
    residual_impact: int = 2
    residual_risk_score: int = 4
    residual_risk_level: str = "Low"
    
    decision: str = "Approve with Conditions"
    identified_gaps: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class SecurityAssessment(BaseModel):
    id: str
    vendor_id: str
    assessor_name: str
    assessment_date: str
    answers: List[AssessmentAnswer]
    inherent_likelihood: int
    inherent_impact: int
    inherent_risk_score: int
    inherent_risk_level: str
    identified_gaps: List[str]
    recommended_actions: List[str]
    decision: str
    assessor_notes: str = ""

class AuditLog(BaseModel):
    id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    user: str = "SecOps Risk Officer"
    action: str
    entity_type: str  # Vendor, Assessment, Mitigation, System
    entity_id: str
    details: str

class RiskCalculationRequest(BaseModel):
    business_criticality: str
    data_handled: List[str]
    systems_accessed: List[str]
    answers: List[AssessmentAnswer]
