const BLOOD_TYPES = ["A", "B", "AB", "O"];

export default function DonorForm({ donor, setDonor }) {
  const update = (k, v) => setDonor({ ...donor, [k]: v });

  return (
    <div style={{
      background: "white", padding: 20, borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    }}>
      <h3 style={{ marginTop: 0 }}>Donor</h3>

      <label style={labelStyle}>Donor ID</label>
      <input value={donor.donor_id}
             onChange={(e) => update("donor_id", e.target.value)} />

      <div style={grid2}>
        <div>
          <label style={labelStyle}>Age</label>
          <input type="number" value={donor.age}
                 onChange={(e) => update("age", +e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Weight (kg)</label>
          <input type="number" value={donor.weight}
                 onChange={(e) => update("weight", +e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <label style={labelStyle}>Blood Type</label>
        <select value={donor.blood_type}
                onChange={(e) => update("blood_type", e.target.value)}>
          {BLOOD_TYPES.map((bt) => <option key={bt}>{bt}</option>)}
        </select>
      </div>

      <div style={grid2}>
        <div>
          <label style={labelStyle}>Medical Approval</label>
          <select value={donor.medical_approval}
                  onChange={(e) => update("medical_approval", e.target.value)}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Organ Condition</label>
          <select value={donor.alert_flag}
                  onChange={(e) => update("alert_flag", +e.target.value)}>
            <option value={0}>Normal</option>
            <option value={1}>Critical</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>
          Organ Health Score: <strong>{donor.organ_health_score.toFixed(2)}</strong>
        </label>
        <input
          type="range" min="0" max="1" step="0.01"
          value={donor.organ_health_score}
          onChange={(e) => update("organ_health_score", +e.target.value)}
          style={{ padding: 0, border: "none", width: "100%" }}
        />
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 13, color: "#4a5568", display: "block", marginBottom: 4 };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 };