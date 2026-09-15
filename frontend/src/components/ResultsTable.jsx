const urgencyColor = (u) =>
  u === "ESRD" ? "#c53030"
  : u === "CKD Stage 5" ? "#dd6b20"
  : "#3182ce";

const scoreColor = (s) =>
  s > 0.8 ? "#38a169" : s > 0.6 ? "#dd6b20" : "#c53030";

export default function ResultsTable({ result }) {
  const { donor_id, ranked_matches = [], rejected = [], message } = result;

  return (
    <div style={{
      background: "white", padding: 20, borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    }}>
      <h3 style={{ marginTop: 0 }}>
        🏆 Ranked Matches for Donor{" "}
        <span style={{ color: "#2b6cb0" }}>{donor_id}</span>
      </h3>

      {message && (
        <div style={{
          background: "#fefcbf", color: "#744210",
          padding: 12, borderRadius: 6, marginBottom: 16,
        }}>
          {message}
        </div>
      )}

      {ranked_matches.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Patient</th>
              <th>Urgency</th>
              <th>Match Score</th>
              <th>Survival %</th>
              <th>Final Score</th>
            </tr>
          </thead>
          <tbody>
            {ranked_matches.map((r) => (
              <tr key={r.patient_id}>
                <td><strong>#{r.rank}</strong></td>
                <td>{r.patient_id}</td>
                <td>
                  <span style={{
                    background: urgencyColor(r.urgency),
                    color: "white", padding: "2px 8px",
                    borderRadius: 4, fontSize: 12,
                  }}>
                    {r.urgency}
                  </span>
                </td>
                <td>{(r.match_score * 100).toFixed(1)}%</td>
                <td>
                  <strong style={{ color: scoreColor(r.predicted_survival / 100) }}>
                    {r.predicted_survival}%
                  </strong>
                </td>
                <td>{(r.final_rank_score * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {rejected.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4 style={{ color: "#c53030", marginBottom: 8 }}>
            Rejected ({rejected.length})
          </h4>
          <table>
            <thead>
              <tr><th>Patient</th><th>Reason</th></tr>
            </thead>
            <tbody>
              {rejected.map((r) => (
                <tr key={r.patient_id}>
                  <td>{r.patient_id}</td>
                  <td style={{ color: "#c53030" }}>{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}