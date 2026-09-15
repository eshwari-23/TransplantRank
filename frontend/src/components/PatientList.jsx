const BLOOD_TYPES = ["A", "B", "AB", "O"];
const DIAGNOSES = ["CKD Stage 4", "CKD Stage 5", "ESRD"];

export default function PatientList({ patients, setPatients, onMatch, loading }) {
  const update = (idx, k, v) => {
    const next = [...patients];
    next[idx] = { ...next[idx], [k]: v };
    setPatients(next);
  };

  const addPatient = () => {
    setPatients([
      ...patients,
      {
        patient_id: `P${Math.floor(Math.random() * 9000 + 1000)}`,
        age: 40, weight: 70, bmi: 24,
        blood_type: "AB", diagnosis: "CKD Stage 5", biomarkers: 5.0,
      },
    ]);
  };

  const removePatient = (idx) =>
    setPatients(patients.filter((_, i) => i !== idx));

  return (
    <div style={{
      background: "white", padding: 20, borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
      }}>
        <h3 style={{ margin: 0 }}>Recipients ({patients.length})</h3>
        <button className="ghost" onClick={addPatient}>+ Add</button>
      </div>

      <div style={{ maxHeight: 380, overflowY: "auto" }}>
        {patients.map((p, i) => (
          <div key={i} style={{
            border: "1px solid #e2e8f0", borderRadius: 8,
            padding: 12, marginBottom: 10, background: "#fafafa",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <input
                style={{ width: "60%", fontWeight: 600 }}
                value={p.patient_id}
                onChange={(e) => update(i, "patient_id", e.target.value)}
              />
              <button
                className="ghost"
                onClick={() => removePatient(i)}
                style={{ padding: "4px 10px", fontSize: 12 }}
              >
                ✕
              </button>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8, marginTop: 8,
            }}>
              <input type="number" placeholder="Age" value={p.age}
                     onChange={(e) => update(i, "age", +e.target.value)} />
              <input type="number" placeholder="Weight" value={p.weight}
                     onChange={(e) => update(i, "weight", +e.target.value)} />
              <input type="number" placeholder="BMI" value={p.bmi}
                     onChange={(e) => update(i, "bmi", +e.target.value)} />
              <select value={p.blood_type}
                      onChange={(e) => update(i, "blood_type", e.target.value)}>
                {BLOOD_TYPES.map((bt) => <option key={bt}>{bt}</option>)}
              </select>
              <select value={p.diagnosis}
                      onChange={(e) => update(i, "diagnosis", e.target.value)}>
                {DIAGNOSES.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Biomarkers"
                     value={p.biomarkers}
                     onChange={(e) => update(i, "biomarkers", +e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <button
        className="primary"
        onClick={onMatch}
        disabled={loading || patients.length === 0}
        style={{ width: "100%", marginTop: 12, padding: 12, fontSize: 15 }}
      >
        {loading ? "⏳ Ranking..." : "🔍 Find Best Matches"}
      </button>
    </div>
  );
}