import { useState } from "react";

function App() {
  const [rows, setRows] = useState([
    { date: "", amount: "" }
  ]);
  const [xirr, setXirr] = useState(null);
  const [error, setError] = useState("");

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

    try {
      const response = await fetch(
        "https://xirr-backend.onrender.com/xirr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            cashflows: rows.map(r => ({
              date: r.date,
              amount: Number(r.amount)
            }))
          })
        }
      );

      if (!response.ok) {
        throw new Error("Backend returned an error");
      }

      const data = await response.json();
      setXirr(data.xirr);
    } catch (err) {
      console.error(err);
      setError("Unable to calculate XIRR. Please try again.");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>XIRR Calculator</h1>

      {rows.map((row, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <input
            type="date"
            value={row.date}
            onChange={(e) =>
              updateRow(index, "date", e.target.value)
            }
          />
          <input
            type="number"
            placeholder="Amount"
            value={row.amount}
            onChange={(e) =>
              updateRow(index, "amount", e.target.value)
            }
            style={{ marginLeft: "10px" }}
          />
        </div>
      ))}

      <div style={{ marginTop: "15px" }}>
        <button type="button" onClick={addRow}>
          Add
        </button>

        <button
          type="button"
          onClick={calculate}
          style={{ marginLeft: "10px" }}
        >
          Calculate
        </button>
      </div>

      {xirr !== null && (
        <h3 style={{ marginTop: "20px" }}>
          XIRR: {xirr.toFixed(2)} %
        </h3>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default App;

