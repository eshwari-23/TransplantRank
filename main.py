# main.py — TransplantRank API
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
import joblib, numpy as np, pandas as pd
from pathlib import Path

# ---------- Load model artifacts ----------
BASE = Path(__file__).parent
MODEL     = joblib.load(BASE / "model/survival_model.pkl")
FEATURES  = joblib.load(BASE / "model/features.pkl")

# ---------- Blood-type compatibility ----------
BLOOD_COMPAT = {
    "O":  ["O", "A", "B", "AB"],   # universal donor
    "A":  ["A", "AB"],
    "B":  ["B", "AB"],
    "AB": ["AB"],                  # universal recipient
}

URGENCY_MAP = {"CKD Stage 4": 1, "CKD Stage 5": 2, "ESRD": 3}
URGENCY_SCORE = {"CKD Stage 4": 0.4, "CKD Stage 5": 0.7, "ESRD": 1.0}

# ---------- Schemas ----------
class Patient(BaseModel):
    patient_id: str
    age: int = Field(..., ge=0, le=120)
    weight: float
    bmi: float
    blood_type: Literal["A", "B", "AB", "O"]
    diagnosis: Literal["CKD Stage 4", "CKD Stage 5", "ESRD"]
    biomarkers: float = Field(..., ge=0, le=10)

class Donor(BaseModel):
    donor_id: str
    age: int = Field(..., ge=0, le=120)
    weight: float
    blood_type: Literal["A", "B", "AB", "O"]
    medical_approval: Literal["Yes", "No"]
    organ_health_score: float = Field(..., ge=0, le=1)
    alert_flag: int = Field(..., ge=0, le=1)

class MatchRequest(BaseModel):
    donor: Donor
    patients: List[Patient]

class MatchResult(BaseModel):
    rank: int
    patient_id: str
    match_score: float
    predicted_survival: float
    final_rank_score: float
    urgency: str
    blood_compatible: bool
    medical_approved: bool

# ---------- Helpers ----------
def build_features(donor: Donor, patient: Patient) -> pd.DataFrame:
    row = {
        "Patient_Age": patient.age,
        "Patient_Weight": patient.weight,
        "Patient_BMI": patient.bmi,
        "Donor_Age": donor.age,
        "Donor_Weight": donor.weight,
        "Biological_Markers": patient.biomarkers,
        "Urgency_Level": URGENCY_MAP[patient.diagnosis],
        "RealTime_Organ_HealthScore": donor.organ_health_score,
        "Alert_Flag": donor.alert_flag,
        "Donor_Medical_Approval_bin": 1 if donor.medical_approval == "Yes" else 0,
        "Age_Gap": abs(donor.age - patient.age),
        "BMI_Marker": patient.bmi * patient.biomarkers,
    }
    for bt in ["A", "B", "AB", "O"]:
        row[f"PB_{bt}"] = 1 if patient.blood_type == bt else 0
        row[f"DB_{bt}"] = 1 if donor.blood_type == bt else 0
    return pd.DataFrame([row])[FEATURES]

def compute_match_score(donor: Donor, patient: Patient) -> float:
    age_gap = abs(donor.age - patient.age)
    score = (
        0.30 * donor.organ_health_score +
        0.30 * URGENCY_SCORE[patient.diagnosis] +
        0.20 * max(0.0, 1 - age_gap / 60) +
        0.20 * max(0.0, 1 - patient.biomarkers / 10)
    )
    return round(float(score), 4)

# ---------- App ----------
app = FastAPI(title="TransplantRank API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "TransplantRank API live", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"model_loaded": MODEL is not None, "n_features": len(FEATURES)}

@app.post("/predict_survival")
def predict_survival(donor: Donor, patient: Patient):
    Xrow = build_features(donor, patient)
    survival = float(MODEL.predict(Xrow)[0])
    return {
        "patient_id": patient.patient_id,
        "donor_id": donor.donor_id,
        "predicted_survival": round(survival, 2),
    }

@app.post("/match", response_model=dict)
def match(req: MatchRequest):
    donor = req.donor
    eligible_ids, rejected = [], []

    for p in req.patients:
        compatible = p.blood_type in BLOOD_COMPAT[donor.blood_type]
        approved = donor.medical_approval == "Yes"
        if not (compatible and approved):
            rejected.append({
                "patient_id": p.patient_id,
                "blood_compatible": compatible,
                "medical_approved": approved,
                "reason": "Blood type incompatible" if not compatible
                          else "Donor not medically approved",
            })
            continue
        eligible_ids.append(p)

    if not eligible_ids:
        return {
            "donor_id": donor.donor_id,
            "ranked_matches": [],
            "rejected": rejected,
            "message": "No eligible recipients for this donor.",
        }

    results = []
    for p in eligible_ids:
        Xrow = build_features(donor, p)
        survival = float(MODEL.predict(Xrow)[0])
        m_score = compute_match_score(donor, p)
        final = 0.6 * m_score + 0.4 * (survival / 100.0)
        results.append({
            "patient_id": p.patient_id,
            "match_score": round(m_score, 4),
            "predicted_survival": round(survival, 2),
            "final_rank_score": round(final, 4),
            "urgency": p.diagnosis,
            "blood_compatible": True,
            "medical_approved": True,
        })

    results.sort(key=lambda r: -r["final_rank_score"])
    for i, r in enumerate(results, 1):
        r["rank"] = i

    return {
        "donor_id": donor.donor_id,
        "ranked_matches": results,
        "rejected": rejected,
    }