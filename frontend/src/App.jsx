import { useState } from "react";
import axios from "axios";
import DonorForm from "./components/DonorForm";
import PatientList from "./components/PatientList";
import ResultsTable from "./components/ResultsTable";

const API = import.meta.env.VITE_API_URL;

const DEFAULT_DONOR = {
  donor_id: "D7614",
  age: 23,
  weight: 74,
  blood_type: "AB",
  medical_approval: "Yes",
  organ_health_score: 0.92,
  alert_flag: 1,
};

const DEFAULT_PATIENTS = [
  { patient_id: "P5501", age: 37, weight: 70, bmi: 25.6,
    blood_type: "AB", diagnosis: "CKD Stage 4", biomarkers: 1.44 },
  { patient_id: "P5030", age: 56, weight: 63, bmi: 18.2,
    blood_type: "AB", diagnosis: "CKD Stage 5", biomarkers: 6.86 },
  { patient_id: "P9740", age: 37, weight: 87, bmi: 24.2,
    blood_type: "AB", diagnosis: "ESRD", biomarkers: 5.95 },
];

export default function App() {
  const [donor, setDonor]       = useState(DEFAULT_DONOR);
  const [patients, setPatients] = useState(DEFAULT_PATIENTS);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const runMatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/match`, { donor, patients });
      setResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: "#2b6cb0" }}>🫀 TransplantRank</h1>
        <p style={{ margin: "4px 0 0", color: "#4a5568" }}>
          AI-assisted kidney donor–recipient matching
        </p>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: 20,
        marginBottom: 20,
      }}>
        <DonorForm donor={donor} setDonor={setDonor} />
        <PatientList
          patients={patients}
          setPatients={setPatients}
          onMatch={runMatch}
          loading={loading}
        />
      </div>

      {error && (
        <div style={{
          background: "#fed7d7", color: "#822727",
          padding: 12, borderRadius: 6, marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      {result && <ResultsTable result={result} />}
    </div>
  );
}