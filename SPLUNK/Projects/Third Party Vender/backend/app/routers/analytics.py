from fastapi import APIRouter
from typing import Dict, Any, List
from ..database import db
from ..scoring import get_risk_level

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_metrics():
    vendors = db.get_vendors()
    mitigations = db.get_mitigations()
    
    total_vendors = len(vendors)
    if total_vendors == 0:
        return {
            "total_vendors": 0,
            "risk_distribution": {"Critical": 0, "High": 0, "Medium": 0, "Low": 0},
            "matrix": [],
            "mitigations_summary": {}
        }
        
    risk_dist = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    residual_dist = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    criticality_dist = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    status_dist = {"Assessed": 0, "In Review": 0, "Pending": 0, "Overdue": 0}
    
    inherent_sum = 0
    residual_sum = 0
    
    # 5x5 Grid initialization (Likelihood 1..5, Impact 1..5)
    # rows: Likelihood 5 down to 1 (standard 5x5 risk matrix presentation)
    # cols: Impact 1 up to 5
    matrix_cells = []
    for l in range(5, 0, -1):
        row = []
        for i in range(1, 6):
            cell_score = l * i
            row.append({
                "likelihood": l,
                "impact": i,
                "score": cell_score,
                "risk_level": get_risk_level(cell_score),
                "inherent_count": 0,
                "inherent_vendors": [],
                "residual_count": 0,
                "residual_vendors": []
            })
        matrix_cells.append(row)
        
    for v in vendors:
        in_level = v.get("inherent_risk_level", "Medium")
        res_level = v.get("residual_risk_level", "Low")
        crit = v.get("business_criticality", "Medium")
        stat = v.get("assessment_status", "Pending")
        
        risk_dist[in_level] = risk_dist.get(in_level, 0) + 1
        residual_dist[res_level] = residual_dist.get(res_level, 0) + 1
        criticality_dist[crit] = criticality_dist.get(crit, 0) + 1
        status_dist[stat] = status_dist.get(stat, 0) + 1
        
        in_score = v.get("inherent_risk_score", 9)
        res_score = v.get("residual_risk_score", 4)
        inherent_sum += in_score
        residual_sum += res_score
        
        l_in = min(5, max(1, v.get("inherent_likelihood", 3)))
        i_in = min(5, max(1, v.get("inherent_impact", 3)))
        l_res = min(5, max(1, v.get("residual_likelihood", 2)))
        i_res = min(5, max(1, v.get("residual_impact", 2)))
        
        # Place in 5x5 matrix
        # matrix_cells row index is 5 - l_in, col index is i_in - 1
        r_idx_in = 5 - l_in
        c_idx_in = i_in - 1
        if 0 <= r_idx_in < 5 and 0 <= c_idx_in < 5:
            matrix_cells[r_idx_in][c_idx_in]["inherent_count"] += 1
            matrix_cells[r_idx_in][c_idx_in]["inherent_vendors"].append({
                "id": v.get("id"),
                "name": v.get("name"),
                "criticality": crit,
                "score": in_score,
                "level": in_level
            })
            
        r_idx_res = 5 - l_res
        c_idx_res = i_res - 1
        if 0 <= r_idx_res < 5 and 0 <= c_idx_res < 5:
            matrix_cells[r_idx_res][c_idx_res]["residual_count"] += 1
            matrix_cells[r_idx_res][c_idx_res]["residual_vendors"].append({
                "id": v.get("id"),
                "name": v.get("name"),
                "criticality": crit,
                "score": res_score,
                "level": res_level
            })

    # Mitigations summary
    mit_status = {"Open": 0, "In Progress": 0, "Implemented": 0, "Verified": 0}
    for m in mitigations:
        s = m.get("status", "Open")
        mit_status[s] = mit_status.get(s, 0) + 1
        
    avg_inherent = round(inherent_sum / total_vendors, 1)
    avg_residual = round(residual_sum / total_vendors, 1)
    risk_reduction_pct = round(((inherent_sum - residual_sum) / inherent_sum * 100), 1) if inherent_sum > 0 else 0

    return {
        "total_vendors": total_vendors,
        "inherent_risk_distribution": risk_dist,
        "residual_risk_distribution": residual_dist,
        "criticality_distribution": criticality_dist,
        "assessment_status_distribution": status_dist,
        "average_inherent_score": avg_inherent,
        "average_residual_score": avg_residual,
        "risk_reduction_percentage": risk_reduction_pct,
        "matrix_grid": matrix_cells,
        "mitigations_summary": {
            "total": len(mitigations),
            "by_status": mit_status,
            "completion_rate": round((mit_status.get("Verified", 0) + mit_status.get("Implemented", 0)) / len(mitigations) * 100, 1) if mitigations else 0
        },
        "critical_vendors": [v for v in vendors if v.get("inherent_risk_level") in ["Critical", "High"]]
    }
