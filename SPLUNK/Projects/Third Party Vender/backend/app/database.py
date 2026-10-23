import os
import json
import logging
from typing import Dict, List, Any, Optional
from pymongo import MongoClient
from .initial_data import get_demo_vendors, get_demo_mitigations, get_demo_audit_logs, get_demo_assessments

logger = logging.getLogger("TPV-SRA.DB")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
STORE_FILE = os.path.join(DATA_DIR, "store.json")

class Database:
    def __init__(self):
        self.use_mongo = False
        self.mongo_client: Optional[MongoClient] = None
        self.db = None
        self.store: Dict[str, List[Dict[str, Any]]] = {
            "vendors": [],
            "assessments": [],
            "mitigations": [],
            "audit_logs": []
        }
        self.init_db()

    def init_db(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        # Try connecting to local MongoDB first
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
            client.admin.command('ping')
            self.mongo_client = client
            self.db = client["vendor_risk_analyzer"]
            self.use_mongo = True
            logger.info("Connected successfully to MongoDB: vendor_risk_analyzer")
            self._bootstrap_mongo()
        except Exception as e:
            logger.warning(f"MongoDB not available ({e}). Using file-backed JSON store: {STORE_FILE}")
            self.use_mongo = False
            self._bootstrap_local_file()

    def _bootstrap_mongo(self):
        if self.db["vendors"].count_documents({}) == 0:
            logger.info("Seeding initial demo vendors into MongoDB...")
            self.db["vendors"].insert_many(get_demo_vendors())
            self.db["assessments"].insert_many(get_demo_assessments())
            self.db["mitigations"].insert_many(get_demo_mitigations())
            self.db["audit_logs"].insert_many(get_demo_audit_logs())

    def _bootstrap_local_file(self):
        if os.path.exists(STORE_FILE):
            try:
                with open(STORE_FILE, "r", encoding="utf-8") as f:
                    self.store = json.load(f)
            except Exception as e:
                logger.error(f"Error loading {STORE_FILE}: {e}")
                self._seed_default_store()
        else:
            self._seed_default_store()

    def _seed_default_store(self):
        self.store = {
            "vendors": get_demo_vendors(),
            "assessments": get_demo_assessments(),
            "mitigations": get_demo_mitigations(),
            "audit_logs": get_demo_audit_logs()
        }
        self._save_local_file()

    def _save_local_file(self):
        try:
            with open(STORE_FILE, "w", encoding="utf-8") as f:
                json.dump(self.store, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to write local store: {e}")

    # --- Vendor CRUD ---
    def get_vendors(self) -> List[Dict[str, Any]]:
        if self.use_mongo:
            docs = list(self.db["vendors"].find({}, {"_id": 0}))
            return docs
        return self.store["vendors"]

    def get_vendor(self, vendor_id: str) -> Optional[Dict[str, Any]]:
        if self.use_mongo:
            return self.db["vendors"].find_one({"id": vendor_id}, {"_id": 0})
        for v in self.store["vendors"]:
            if v["id"] == vendor_id:
                return v
        return None

    def create_vendor(self, vendor_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.use_mongo:
            self.db["vendors"].insert_one(vendor_data.copy())
            return self.get_vendor(vendor_data["id"])
        self.store["vendors"].append(vendor_data)
        self._save_local_file()
        return vendor_data

    def update_vendor(self, vendor_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.use_mongo:
            self.db["vendors"].update_one({"id": vendor_id}, {"$set": updates})
            return self.get_vendor(vendor_id)
        for i, v in enumerate(self.store["vendors"]):
            if v["id"] == vendor_id:
                self.store["vendors"][i].update(updates)
                self._save_local_file()
                return self.store["vendors"][i]
        return None

    def delete_vendor(self, vendor_id: str) -> bool:
        if self.use_mongo:
            res = self.db["vendors"].delete_one({"id": vendor_id})
            return res.deleted_count > 0
        initial_len = len(self.store["vendors"])
        self.store["vendors"] = [v for v in self.store["vendors"] if v["id"] != vendor_id]
        if len(self.store["vendors"]) < initial_len:
            self._save_local_file()
            return True
        return False

    # --- Mitigation CRUD ---
    def get_mitigations(self, vendor_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.use_mongo:
            query = {"vendor_id": vendor_id} if vendor_id else {}
            return list(self.db["mitigations"].find(query, {"_id": 0}))
        if vendor_id:
            return [m for m in self.store["mitigations"] if m.get("vendor_id") == vendor_id]
        return self.store["mitigations"]

    def create_mitigation(self, mitigation_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.use_mongo:
            self.db["mitigations"].insert_one(mitigation_data.copy())
            return self.db["mitigations"].find_one({"id": mitigation_data["id"]}, {"_id": 0})
        self.store["mitigations"].append(mitigation_data)
        self._save_local_file()
        return mitigation_data

    def update_mitigation(self, action_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.use_mongo:
            self.db["mitigations"].update_one({"id": action_id}, {"$set": updates})
            return self.db["mitigations"].find_one({"id": action_id}, {"_id": 0})
        for i, m in enumerate(self.store["mitigations"]):
            if m["id"] == action_id:
                self.store["mitigations"][i].update(updates)
                self._save_local_file()
                return self.store["mitigations"][i]
        return None

    def delete_mitigation(self, action_id: str) -> bool:
        if self.use_mongo:
            res = self.db["mitigations"].delete_one({"id": action_id})
            return res.deleted_count > 0
        initial_len = len(self.store["mitigations"])
        self.store["mitigations"] = [m for m in self.store["mitigations"] if m["id"] != action_id]
        if len(self.store["mitigations"]) < initial_len:
            self._save_local_file()
            return True
        return False

    # --- Assessments ---
    def save_assessment(self, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.use_mongo:
            self.db["assessments"].insert_one(assessment_data.copy())
            return assessment_data
        self.store["assessments"].append(assessment_data)
        self._save_local_file()
        return assessment_data

    def get_assessments(self, vendor_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.use_mongo:
            query = {"vendor_id": vendor_id} if vendor_id else {}
            return list(self.db["assessments"].find(query, {"_id": 0}))
        if vendor_id:
            return [a for a in self.store["assessments"] if a.get("vendor_id") == vendor_id]
        return self.store["assessments"]

    # --- Audit Logs ---
    def add_audit_log(self, log_data: Dict[str, Any]):
        if self.use_mongo:
            self.db["audit_logs"].insert_one(log_data.copy())
        else:
            self.store["audit_logs"].insert(0, log_data)
            self._save_local_file()

    def get_audit_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        if self.use_mongo:
            return list(self.db["audit_logs"].find({}, {"_id": 0}).sort("timestamp", -1).limit(limit))
        return self.store["audit_logs"][:limit]

    def reset_demo_data(self):
        """Reset demo data to pristine state for presentations and testing."""
        if self.use_mongo:
            self.db["vendors"].delete_many({})
            self.db["mitigations"].delete_many({})
            self.db["audit_logs"].delete_many({})
            self.db["assessments"].delete_many({})
            self.db["vendors"].insert_many(get_demo_vendors())
            self.db["assessments"].insert_many(get_demo_assessments())
            self.db["mitigations"].insert_many(get_demo_mitigations())
            self.db["audit_logs"].insert_many(get_demo_audit_logs())
        self._seed_default_store()

db = Database()
