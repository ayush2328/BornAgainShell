#!/bin/bash
# Third-Party Vendor Cybersecurity Risk Analyzer (TPV-SRA)
# Startup Script for Backend (FastAPI) and Frontend (Vite + React)

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "=================================================================="
echo "🛡️  Starting TPV-SRA: Third-Party Vendor Security Risk Analyzer"
echo "📚  Academic Project: Security Risk Management and Principles (SRMP)"
echo "🏛️  Framework: NIST CSF 2.0 (GV.SC) & NIST SP 800-161 Rev. 1"
echo "=================================================================="

# Check Python virtual environment
if [ ! -d "$PROJECT_DIR/.venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$PROJECT_DIR/.venv"
    source "$PROJECT_DIR/.venv/bin/activate"
    pip install -r "$PROJECT_DIR/backend/requirements.txt"
else
    source "$PROJECT_DIR/.venv/bin/activate"
fi

# Start FastAPI backend in background
echo "🚀 Starting FastAPI Backend on http://127.0.0.1:8000 ..."
cd "$PROJECT_DIR/backend"
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Ensure backend stops on exit
trap "echo 'Stopping services...'; kill $BACKEND_PID 2>/dev/null || true; exit" SIGINT SIGTERM EXIT

# Start Vite React Frontend
echo "💻 Starting Vite Frontend on http://127.0.0.1:5173 ..."
cd "$PROJECT_DIR/frontend"
npm run dev -- --host 127.0.0.1 --port 5173
