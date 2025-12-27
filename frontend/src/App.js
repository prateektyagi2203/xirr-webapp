/* src/App.js */
import { useState } from "react";
import "./App.css"; // Ensure the CSS is imported

function App() {
  const [rows, setRows] = useState([
    { date: "", amount: "" },
    { date: "", amount: "" } // Start with 2 rows for convenience
  ]);
  const [xirr, setXirr] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Add a new cashflow row
  const addRow = () => {
    setRows([...rows, { date: "", amount: "" }]);
  };

  // Update date or amount
  const updateRow = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // Call backend to calculate XIRR
  const calculate = async () => {
    setError("");
    setXirr(null);
    setLoading(true);

    try {
      // REPLACE with your actual Render Backend URL if different
      const response = await fetch(
        "https://xirr-backend.onrender.com/xirr", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cashflows: rows.map((r) => ({
              date: r.date,
              amount: Number(r.amount),
            })),
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Backend returned an error");
      }

      const data = await response.json();
      setXirr(data.xirr);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to calculate XIRR. Please verify inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <div className="header">
          <h1>XIRR Calculator</h1>
          <p>Track your investment returns accurately</p>
        </div>

        <div className="form-container">
          {rows.map((row, index) => (
            <div key={index} className="input-group">
              <input
                type="date"
                className="input-field"
                value={row.date}
                onChange={(e) => updateRow(index, "date", e.target.value)}
                aria-label="Date"
              />
              <input
                type="number"
                className="input-field"
                placeholder="Amount (e.g. -5000)"
                value={row.amount}
                onChange={(e) => updateRow(index, "amount", e.target.value)}
                aria-label="Amount"
              />
            </div>
          ))}

          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={addRow}>
              + Add Row
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={calculate}
              disabled={loading}
            >
              {loading ? "Calculating..." : "Calculate XIRR"}
            </button>
          </div>
        </div>

        {xirr !== null && (
          <div className="result-card">
            <span>Annualized Return</span>
            <span className="result-value">{xirr.toFixed(2)}%</span>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}
      </div>
    </div>
  );
}

export default App;
