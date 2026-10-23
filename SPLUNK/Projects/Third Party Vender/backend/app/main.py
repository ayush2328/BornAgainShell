from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .routers import vendors, assessments, mitigations, analytics, audit, srmp

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TPV-SRA")

app = FastAPI(
    title="Third-Party Vendor Cybersecurity Risk Analyzer (TPV-SRA)",
    description="Academic and Enterprise Security Risk Management System aligned with NIST CSF 2.0 GV.SC and NIST SP 800-161",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(vendors.router)
app.include_router(assessments.router)
app.include_router(mitigations.router)
app.include_router(analytics.router)
app.include_router(audit.router)
app.include_router(srmp.router)

@app.get("/")
def root():
    return {
        "system": "Third-Party Vendor Security Risk Analyzer (TPV-SRA)",
        "subject": "Security Risk Management and Principles (SRMP)",
        "status": "healthy",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
